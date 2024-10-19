export type AspectRatio = "tall" | "wide" | "square";

export function getImageDimensions(aspectRatio: AspectRatio, height: number) {
  let width = height;
  let objectPosition: string | undefined;

  switch (aspectRatio) {
    case "tall":
      width = Math.floor(height * (9 / 16));
      break;
    case "wide":
      width = Math.round(height * 1.75);
      objectPosition = "50% 0";
      break;
    case "square":
      objectPosition = "50% 0";
      break;
  }

  return { width, height, objectPosition };
}
