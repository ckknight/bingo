export const SIZE_OPTIONS = ["3x3", "4x4", "5x5", "6x6", "7x7"] as const;
export type SizeOption = (typeof SIZE_OPTIONS)[number];
export function parseSizeOption(option: SizeOption) {
  const [columns, rows] = option.split("x").map((str) => parseInt(str, 10));
  return { columns, rows, total: columns * rows };
}
