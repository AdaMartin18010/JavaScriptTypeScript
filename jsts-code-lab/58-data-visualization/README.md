# 58-data-visualization

Data visualization primitives and chart generators implemented in TypeScript.

## Topics

| Topic | File | Description |
|---|---|---|
| Chart Architecture | `chart-architecture.ts` | Base chart renderer, SVG/Canvas factories |
| Bar Chart SVG | `bar-chart-svg.ts` | Grouped, stacked, horizontal/vertical bar chart generator |
| Line Chart Path | `line-chart-path.ts` | SVG path generation for lines, smooth curves, areas, steps |
| Pie Chart Angles | `pie-chart-angles.ts` | Pie/donut slice calculation and SVG generation |
| Scales | `scales.ts` | Linear, ordinal, band, threshold, log scales |
| Data Binning | `data-binning.ts` | Histogram, equal-width, quantile, and 2D grid binning |
| Canvas Renderer | `canvas-renderer.ts` | DPR-aware Canvas 2D abstraction layer |
| Chart Animation | `chart-animation.ts` | Easing functions, interpolation, chart data animation |

## Running Tests

```bash
npx vitest run 58-data-visualization
```
