export function mtRand(min = 0, max = 2147483647): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}