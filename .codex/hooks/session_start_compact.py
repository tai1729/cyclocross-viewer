"""Restore small, useful amounts of project context after compaction.

This hook is intentionally read-only.  It reads only the project instruction
files and a bounded summary of the repository state; it never executes project
commands, reads environment variables, or writes to the working tree.
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Optional, Sequence


# These are character limits.  Keep the assembled context below the hook's
# 5,000-token Codex additionalContextLimit (characters are deliberately much
# smaller than tokens, with room for labels and recovery directives).
FILE_LIMIT = 2_200
DOCUMENT_CONTEXT_LIMIT = 900
CONTEXT_LIMIT = 5_000
STATUS_LINE_LIMIT = 20
STATUS_CHAR_LIMIT = 1_000
DIFF_LINE_LIMIT = 15
DIFF_CHAR_LIMIT = 800
SUBPROCESS_TIMEOUT_SECONDS = 5

TRUNCATION_MARKER = "\n… [truncated for context budget] …\n"
UNAVAILABLE = "(unavailable)"

# Entire lines containing likely credentials are removed.  This deliberately
# errs on the side of omitting a line rather than exposing a value in context.
SECRET_ASSIGNMENT_RE = re.compile(
    r"\b(?:[a-z0-9_]*"
    r"(?:api[_-]?key|access[_-]?token|auth(?:orization)?|secret|token|"
    r"password|passwd|credential|private[_-]?key)"
    r"[a-z0-9_]*)\s*[:=]\s*(?:\"[^\"]*\"|'[^']*'|\S+)",
    re.IGNORECASE,
)

# A path containing one of these names is not useful to recovery and may
# identify or contain credentials.  Redact the whole line in that case.
SECRET_PATH_RE = re.compile(
    r"(?:^|[\s\\/])(?:\.env(?:[.][^\\/\s]*)?|"
    r"credentials?(?:[._-][^\\/\s]*)?|"
    r"secrets?(?:[._-][^\\/\s]*)?|"
    r"id_rsa(?:[._-][^\\/\s]*)?|"
    r"private[_ -]?key(?:[._-][^\\/\s]*)?)(?:$|[\s\\/])",
    re.IGNORECASE,
)


def _safe_run(args: Sequence[str], cwd: Optional[Path] = None) -> Optional[str]:
    """Run one fixed, read-only command without allowing shell expansion."""

    try:
        completed = subprocess.run(
            list(args),
            cwd=str(cwd) if cwd is not None else None,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding="utf-8",
            errors="replace",
            shell=False,
            timeout=SUBPROCESS_TIMEOUT_SECONDS,
            check=False,
        )
    except Exception:
        return None
    if completed.returncode != 0:
        return None
    return completed.stdout or ""


def _fallback_root() -> Path:
    """Return the template/project root implied by this script's location."""

    try:
        return Path(__file__).resolve().parents[2]
    except Exception:
        try:
            return Path(__file__).absolute().parent.parent.parent
        except Exception:
            return Path.cwd()


def _git_root() -> tuple[Path, bool]:
    fallback = _fallback_root()
    root_output = _safe_run(["git", "rev-parse", "--show-toplevel"])
    if root_output is None or not root_output.strip():
        return fallback, False

    try:
        candidate = Path(root_output.strip())
        if not candidate.is_absolute():
            candidate = Path.cwd() / candidate
        candidate = candidate.resolve()
        if candidate.is_dir():
            return candidate, True
    except Exception:
        pass
    return fallback, False


def _redact_line(line: str) -> str:
    if SECRET_ASSIGNMENT_RE.search(line):
        return "[REDACTED SENSITIVE ASSIGNMENT]"
    if SECRET_PATH_RE.search(line):
        return "[REDACTED SENSITIVE PATH]"
    return line


def _redact_text(text: str) -> str:
    return "\n".join(_redact_line(line) for line in text.splitlines())


def _limit_text(text: str, limit: int) -> str:
    if len(text) <= limit:
        return text
    marker_length = len(TRUNCATION_MARKER)
    available = max(0, limit - marker_length)
    head_length = available // 2
    tail_length = available - head_length
    return text[:head_length] + TRUNCATION_MARKER + text[-tail_length:]


def _read_bounded(path: Path) -> Optional[str]:
    """Read a regular instruction file without following a symlink."""

    try:
        if path.is_symlink() or not path.is_file():
            return None
        size = path.stat().st_size
        # Keep large or malformed files bounded even before decoding them.
        byte_window = FILE_LIMIT * 2
        with path.open("rb") as stream:
            if size <= byte_window * 2:
                raw = stream.read()
            else:
                head = stream.read(byte_window)
                stream.seek(-byte_window, 2)
                tail = stream.read(byte_window)
                raw = head + b"\n... [file truncated] ...\n" + tail
        text = raw.decode("utf-8", errors="replace")
        return _limit_text(_redact_text(text), FILE_LIMIT)
    except Exception:
        return None


def _limit_git_output(value: Optional[str], line_limit: int, char_limit: int) -> str:
    if value is None:
        return UNAVAILABLE
    lines = [_redact_line(line) for line in value.splitlines()]
    if len(lines) > line_limit:
        lines = lines[:line_limit] + ["… [more lines omitted] …"]
    result = "\n".join(lines)
    return _limit_text(result, char_limit) if result else "(none)"


def _build_context() -> str:
    root, is_git_root = _git_root()

    agents = _read_bounded(root / "AGENTS.md")
    recovery = _read_bounded(root / ".codex" / "RECOVERY.md")

    branch = _safe_run(["git", "branch", "--show-current"], cwd=root) if is_git_root else None
    commit = _safe_run(["git", "rev-parse", "--short", "HEAD"], cwd=root) if is_git_root else None
    # Keep this read-only probe from taking Git's optional index lock.
    status = (
        _safe_run(
            [
                "git",
                "--no-optional-locks",
                "-c",
                "core.fsmonitor=false",
                "status",
                "--short",
            ],
            cwd=root,
        )
        if is_git_root
        else None
    )
    diff_stat = (
        _safe_run(
            ["git", "diff", "--no-ext-diff", "--no-textconv", "--stat"], cwd=root
        )
        if is_git_root
        else None
    )

    # Reserve enough room for both instruction documents while retaining each
    # document's head/tail (via _limit_text) and keeping the final payload well
    # below the 5,000-token hook threshold.
    agents_context = (
        _limit_text(agents, DOCUMENT_CONTEXT_LIMIT)
        if agents is not None
        else UNAVAILABLE
    )
    recovery_context = (
        _limit_text(recovery, DOCUMENT_CONTEXT_LIMIT)
        if recovery is not None
        else UNAVAILABLE
    )

    branch_name = _redact_line(branch.strip()) if branch and branch.strip() else "(detached HEAD or unavailable)"
    if (not branch_name.startswith("(") and commit and commit.strip()):
        commit_suffix = f" ({_redact_line(commit.strip())})"
    elif branch_name.startswith("(") and commit and commit.strip():
        branch_name = f"detached HEAD ({_redact_line(commit.strip())})"
        commit_suffix = ""
    else:
        commit_suffix = ""

    parts = [
        "CONTEXT COMPACTION HAS JUST OCCURRED.",
        "THIS IS A CONTINUATION, NOT A NEW TASK.",
        "",
        "Recovery directives:",
        "- Preserve and continue the active /goal; do not replace it with a new task.",
        "- Treat the compact summary as the latest dynamic work state.",
        "- Reconfirm AGENTS.md and .codex/RECOVERY.md before acting.",
        "- Do not redo completed work or reverse decisions made before compaction without evidence.",
        "- Inspect the current git state and reconcile it with the summary.",
        "- Reconstruct the current phase, identify unfinished or blocked work, and choose one exact next action.",
        "- Continue the existing task; ask for approval only where the summary or repository state requires it.",
        "",
        f"Git root: {root if is_git_root else f'{root} (fallback; git root unavailable)'}",
        f"Current branch: {branch_name}{commit_suffix}",
        "Git status --short:",
        _limit_git_output(status, STATUS_LINE_LIMIT, STATUS_CHAR_LIMIT),
        "Git diff --stat:",
        _limit_git_output(diff_stat, DIFF_LINE_LIMIT, DIFF_CHAR_LIMIT),
        "",
        "AGENTS.md (reloaded when present):",
        agents_context,
        "",
        ".codex/RECOVERY.md (reloaded when present):",
        recovery_context,
    ]
    return _limit_text("\n".join(parts), CONTEXT_LIMIT)


def main() -> None:
    try:
        additional_context = _build_context()
    except BaseException:
        # The hook must not prevent the parent Codex session from continuing.
        additional_context = (
            "CONTEXT COMPACTION HAS JUST OCCURRED.\n"
            "THIS IS A CONTINUATION, NOT A NEW TASK.\n\n"
            "Recovery context could not be fully collected; preserve the active /goal "
            "and inspect the repository state before continuing."
        )

    payload = {
        "continue": True,
        "hookSpecificOutput": {
            "hookEventName": "SessionStart",
            "additionalContext": additional_context,
        },
    }
    try:
        # ASCII JSON is valid UTF-8 and also works with legacy Windows consoles.
        sys.stdout.write(json.dumps(payload, ensure_ascii=True, separators=(",", ":")))
        sys.stdout.write("\n")
        sys.stdout.flush()
    except BaseException:
        # There is no safe second output after a failed write; keep exit status 0.
        pass


if __name__ == "__main__":
    main()
