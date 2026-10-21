// Must match `basePath` in next.config.ts. next/link and next/image add it
// automatically; use withBasePath() for plain URLs such as CSS backgrounds.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function withBasePath(path: string): string {
  return `${BASE_PATH}${path}`;
}
