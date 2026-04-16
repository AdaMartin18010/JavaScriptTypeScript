/**
 * @file responsive-design-models.ts
 * @category Web Rendering → Responsive
 * @model Responsive Design
 */

export interface Breakpoint {
  name: string
  minWidth: number
  maxWidth?: number
}

export function selectBreakpoint(width: number, breakpoints: Breakpoint[]): string {
  const sorted = [...breakpoints].sort((a, b) => b.minWidth - a.minWidth)
  for (const bp of sorted) {
    if (width >= bp.minWidth && (bp.maxWidth === undefined || width <= bp.maxWidth)) {
      return bp.name
    }
  }
  return 'default'
}

export function generateSrcset(baseUrl: string, widths: number[]): string {
  return widths.map((w) => `${baseUrl}?w=${w} ${w}w`).join(', ')
}

export function containerQueryWidth(containerWidth: number, columns: number, gap = 16): number {
  return (containerWidth - (columns - 1) * gap) / columns
}
