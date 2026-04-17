export type Point = { x: number; y: number };

export type Curve = {
  id: string;
  type: "bezier" | "quadratic" | "line";
  name: string;
  mirrored: boolean;
  p0: Point;
  p1: Point;
  cp1?: Point;
  cp2?: Point;
};

export type Stroke = {
  points: Point[];
  size: number;
  isEraser: boolean;
};

export type FreehandLayer = {
  id: string;
  name: string;
  mirrored: boolean;
  strokes: Stroke[];
};
