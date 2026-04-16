/**
 * @file css-layout-models.ts
 * @category Web Rendering → CSS Layout
 * @model CSS Layout Computation
 */

export interface LayoutBox {
  width: number
  height: number
  padding: { top: number; right: number; bottom: number; left: number }
  margin: { top: number; right: number; bottom: number; left: number }
  border: { top: number; right: number; bottom: number; left: number }
}

export function computeContentBox(layout: LayoutBox): { width: number; height: number } {
  const width = layout.width - layout.padding.left - layout.padding.right - layout.border.left - layout.border.right
  const height = layout.height - layout.padding.top - layout.padding.bottom - layout.border.top - layout.border.bottom
  return { width: Math.max(0, width), height: Math.max(0, height) }
}

export function estimateLayoutCost(elementCount: number, styleRecalcPerElement = 1): number {
  return elementCount * styleRecalcPerElement
}

export function shouldPromoteLayer(property: string): boolean {
  const gpuAccelerated = ['transform', 'opacity', 'filter']
  return gpuAccelerated.includes(property)
}
