/// <reference types="node" />

declare module 'gc-watch' {
  export function on(e: 'beforeGC', f: () => void): void
  export function on(e: 'afterGC', f: () => void): void
}