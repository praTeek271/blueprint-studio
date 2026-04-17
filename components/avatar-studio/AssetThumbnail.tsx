import React from "react";
import { FreehandLayer, AppState } from "./types";

interface AssetThumbnailProps {
  layer: FreehandLayer;
  category: string;
  config: AppState["config"];
}

export const AssetThumbnail: React.FC<AssetThumbnailProps> = ({
  layer,
  category,
  config,
}) => {
  let minX = 600,
    minY = 600,
    maxX = 0,
    maxY = 0;
  layer.strokes.forEach((s) =>
    s.points.forEach((p) => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
      if (layer.mirrored) {
        let mx = 600 - p.x;
        if (mx < minX) minX = mx;
        if (mx > maxX) maxX = mx;
      }
    }),
  );
  const pad = 15;
  minX -= pad;
  minY -= pad;
  maxX += pad;
  maxY += pad;
  const w = Math.max(40, maxX - minX);
  const h = Math.max(40, maxY - minY);

  const isHair = category === "hair";
  const strokeColor = isHair && config.fillHair ? config.hairColor : "#1e293b";
  const fillColor =
    isHair && config.fillHair ? config.hairColor : "transparent";

  return (
    <svg
      viewBox={`${minX} ${minY} ${w} ${h}`}
      className="w-full h-12 mb-2 drop-shadow-sm pointer-events-none"
    >
      {config.fillHair && isHair && (
        <path
          d={layer.strokes
            .filter((s) => !s.isEraser)
            .map(
              (s) =>
                `M ${s.points[0].x} ${s.points[0].y} ` +
                s.points
                  .slice(1)
                  .map((p) => `L ${p.x} ${p.y}`)
                  .join(" ") +
                (layer.mirrored
                  ? ` M ${600 - s.points[0].x} ${s.points[0].y} ` +
                    s.points
                      .slice(1)
                      .map((p) => `L ${600 - p.x} ${p.y}`)
                      .join(" ")
                  : ""),
            )
            .join(" ")}
          fill={fillColor}
        />
      )}
      {layer.strokes.map((s, i) => (
        <g key={i}>
          <path
            d={
              `M ${s.points[0].x} ${s.points[0].y} ` +
              s.points
                .slice(1)
                .map((p) => `L ${p.x} ${p.y}`)
                .join(" ")
            }
            fill="none"
            stroke={s.isEraser ? "#f8fafc" : strokeColor}
            strokeWidth={s.size}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {layer.mirrored && (
            <path
              d={
                `M ${600 - s.points[0].x} ${s.points[0].y} ` +
                s.points
                  .slice(1)
                  .map((p) => `L ${600 - p.x} ${p.y}`)
                  .join(" ")
              }
              fill="none"
              stroke={s.isEraser ? "#f8fafc" : strokeColor}
              strokeWidth={s.size}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </g>
      ))}
    </svg>
  );
};
