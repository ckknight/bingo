export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    if (i !== j) {
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
  }
  return newArray;
}
