export function parseFont(font: string) {
  const [, fontSizePtStr, lineHeightStr, fontFamily = "Helvetica"] =
    /^(\d+(?:\.\d+)?)pt\/(\d+(?:\.\d+)?) "([^"]+)"$/.exec(font) ?? [];
  let fontSizePt = Number(fontSizePtStr);
  if (isNaN(fontSizePt)) {
    fontSizePt = 12;
  }
  let lineHeight = Number(lineHeightStr);
  if (isNaN(lineHeight)) {
    lineHeight = 1.2;
  }
  return { fontSizePt, lineHeight, fontFamily };
}
