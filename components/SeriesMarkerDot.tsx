import type { DotItemDotProps } from "recharts";
import type { RiderSeriesMarker } from "@/lib/chartSeriesStyles";

export interface SeriesMarkerDotProps
  extends Partial<
    Pick<DotItemDotProps, "cx" | "cy" | "r" | "fill" | "stroke" | "strokeWidth">
  > {
  marker: RiderSeriesMarker;
  size?: number;
}

export function SeriesMarkerDot({
  marker,
  size,
  cx,
  cy,
  r,
  fill = "none",
  stroke = "none",
  strokeWidth = 1,
}: SeriesMarkerDotProps) {
  if (
    typeof cx !== "number" ||
    !Number.isFinite(cx) ||
    typeof cy !== "number" ||
    !Number.isFinite(cy)
  ) {
    return null;
  }

  const radius = resolveRadius(size, r);
  const commonProps = {
    fill,
    stroke,
    strokeWidth,
    strokeLinejoin: "round" as const,
  };

  switch (marker) {
    case "circle":
      return <circle {...commonProps} cx={cx} cy={cy} r={radius} />;
    case "ring":
      return (
        <path
          {...commonProps}
          fillRule="evenodd"
          d={`${circlePath(cx, cy, radius)} ${circlePath(cx, cy, radius * 0.45)}`}
        />
      );
    case "square":
      return (
        <rect
          {...commonProps}
          x={cx - radius}
          y={cy - radius}
          width={radius * 2}
          height={radius * 2}
        />
      );
    case "diamond":
      return <polygon {...commonProps} points={polygonPoints(cx, cy, radius, 4, 0)} />;
    case "triangle":
      return (
        <polygon {...commonProps} points={polygonPoints(cx, cy, radius, 3, -Math.PI / 2)} />
      );
    case "pentagon":
      return (
        <polygon {...commonProps} points={polygonPoints(cx, cy, radius, 5, -Math.PI / 2)} />
      );
    case "hexagon":
      return (
        <polygon {...commonProps} points={polygonPoints(cx, cy, radius, 6, 0)} />
      );
    case "octagon":
      return (
        <polygon
          {...commonProps}
          points={polygonPoints(cx, cy, radius, 8, Math.PI / 8)}
        />
      );
    case "plus":
      return (
        <path
          {...commonProps}
          d={`M ${cx - radius * 0.35} ${cy - radius} H ${cx + radius * 0.35} V ${cy - radius * 0.35} H ${cx + radius} V ${cy + radius * 0.35} H ${cx + radius * 0.35} V ${cy + radius} H ${cx - radius * 0.35} V ${cy + radius * 0.35} H ${cx - radius} V ${cy - radius * 0.35} H ${cx - radius * 0.35} Z`}
        />
      );
    case "cross":
      return (
        <path
          {...commonProps}
          d={`M ${cx - radius * 0.7} ${cy - radius * 0.7} L ${cx + radius * 0.7} ${cy + radius * 0.7} M ${cx + radius * 0.7} ${cy - radius * 0.7} L ${cx - radius * 0.7} ${cy + radius * 0.7}`}
        />
      );
    case "star":
      return <polygon {...commonProps} points={starPoints(cx, cy, radius)} />;
  }
}

function resolveRadius(size: number | undefined, r: number | string | undefined) {
  const candidate = size ?? (typeof r === "number" ? r : Number(r));
  return Number.isFinite(candidate) && candidate > 0 ? candidate : 3;
}

function polygonPoints(
  cx: number,
  cy: number,
  radius: number,
  sides: number,
  rotation: number,
) {
  return Array.from({ length: sides }, (_, index) => {
    const angle = rotation + (index * Math.PI * 2) / sides;
    return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`;
  }).join(" ");
}

function starPoints(cx: number, cy: number, radius: number) {
  return Array.from({ length: 10 }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;
    const pointRadius = index % 2 === 0 ? radius : radius * 0.45;
    return `${cx + Math.cos(angle) * pointRadius},${cy + Math.sin(angle) * pointRadius}`;
  }).join(" ");
}

function circlePath(cx: number, cy: number, radius: number) {
  return `M ${cx - radius},${cy} a ${radius},${radius} 0 1,0 ${radius * 2},0 a ${radius},${radius} 0 1,0 ${-radius * 2},0`;
}
