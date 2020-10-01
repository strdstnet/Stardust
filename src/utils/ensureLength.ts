export function ensureLength(arr: number[], length: number, filler = 0): void {
  if(arr.length === length) return

  if(arr.length > length) {
    arr.splice(0, length)
  }

  for(let i = 0; i < length; i++) {
    const v = arr[i]
    if(typeof v === 'undefined' || v === null) arr[i] = filler
  }
}