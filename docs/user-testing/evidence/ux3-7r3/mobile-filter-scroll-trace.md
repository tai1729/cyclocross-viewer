# UX3-7R3 mobile filter scroll trace

Production browser verification used exact viewports and real filter controls.

| Viewport | Action | Before `scrollY` | After `scrollY` | Result |
|---|---|---:|---:|---|
| 390x844 | Season changed to `2025-26` | 500 | 500 | PASS |
| 390x844 | Series changed to `関西` | 500 | 500 | PASS |
| 320x568 | Season changed to `2025-26` | 300 | 300 | PASS |
| 320x568 | Series changed to `関西` | 300 | 300 | PASS |

The 390px flow also verified that the combined URL remained
`/?season=2025-26&series=%E9%96%A2%E8%A5%BF`, and clearing each filter removed only
its own URL parameter. Browser back/forward restored the corresponding filter URL
states without resetting the scroll position.
