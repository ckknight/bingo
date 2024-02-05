import { SizeOption, parseSizeOption } from "./sizes";
import { shuffleArray } from "./shuffleArray";

export function shufflePhrases(phrases: string[], size: SizeOption): string[] {
  const { total } = parseSizeOption(size);
  const centerIndex = total % 2 === 1 ? Math.floor(total / 2) : -1;
  const indices = Array.from({ length: total }, (_, i) => i);
  if (centerIndex !== -1) {
    indices.splice(centerIndex, 1);
  }
  const shuffledIndices = shuffleArray(indices);
  if (centerIndex !== -1) {
    shuffledIndices.splice(centerIndex, 0, centerIndex);
  }
  return [
    ...shuffledIndices.map((index) => phrases[index]),
    ...phrases.slice(total),
  ];
}
