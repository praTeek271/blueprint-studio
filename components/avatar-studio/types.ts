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

export type Stroke = { points: Point[]; size: number; isEraser: boolean };

export type LayerTransform = {
  x: number;
  y: number;
  scale: number;
  rotation: number;
};

export type FreehandLayer = {
  id: string;
  name: string;
  mirrored: boolean;
  strokes: Stroke[];
  transform?: LayerTransform;
};

export type AppState = {
  avatarData: { curves: Curve[]; freehandLayers: FreehandLayer[] };
  activeAccessories: Record<string, string | null>;
  config: {
    eyeSpacing: number;
    eyeYOffset: number;
    showSclera: boolean;
    mouthXOffset: number;
    mouthYOffset: number;
    mouthWidth: number;
    micGain: number;
    smoothing: number;
    mouthSensitivity: number;
    blinkIntervalMs: number;
    hairColor: string;
    fillHair: boolean;
  };
};

export const getTag = (name: string): string => {
  if (!name) return "head";
  const match = name.match(/--(body|head|hair|glasses|beard|clothes)/i);
  if (match) return match[1].toLowerCase();
  const ln = name.toLowerCase();
  if (
    [
      "neck",
      "shoulder",
      "t-shirt",
      "sleeve",
      "arm",
      "collar",
      "trapezius",
      "deltoid",
      "chest",
      "clothes",
    ].some((kw) => ln.includes(kw))
  )
    return "clothes";
  if (["hair", "bangs", "mullet"].some((kw) => ln.includes(kw))) return "hair";
  if (["glass", "spectacle", "goggle"].some((kw) => ln.includes(kw)))
    return "glasses";
  if (["beard", "stubble", "mustache", "goatee"].some((kw) => ln.includes(kw)))
    return "beard";
  return "head";
};
