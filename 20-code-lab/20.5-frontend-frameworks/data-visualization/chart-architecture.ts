/**
 * @file 图表架构
 * @category Data Visualization → Charts
 * @difficulty medium
 * @tags data-viz, charts, d3, canvas, svg
 */

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

export abstract class ChartRenderer {
  protected container: HTMLElement;
  protected width: number;
  protected height: number;
  
  constructor(container: HTMLElement, width: number, height: number) {
    this.container = container;
    this.width = width;
    this.height = height;
  }
  
  abstract render(data: ChartData): void;
  abstract destroy(): void;
}

// SVG渲染器
export class SVGChartRenderer extends ChartRenderer {
  private svg: SVGElement | null = null;
  
  render(data: ChartData): void {
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', String(this.width));
    this.svg.setAttribute('height', String(this.height));
    
    // 简化的柱状图渲染
    const barWidth = this.width / data.labels.length / 2;
    const maxValue = Math.max(...data.datasets.flatMap(d => d.data));
    
    data.datasets.forEach((dataset, datasetIndex) => {
      dataset.data.forEach((value, index) => {
        const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const barHeight = (value / maxValue) * this.height * 0.8;
        
        bar.setAttribute('x', String(index * barWidth * 2 + datasetIndex * barWidth));
        bar.setAttribute('y', String(this.height - barHeight));
        bar.setAttribute('width', String(barWidth * 0.8));
        bar.setAttribute('height', String(barHeight));
        bar.setAttribute('fill', dataset.color || '#3b82f6');
        
        this.svg?.appendChild(bar);
      });
    });
    
    this.container.appendChild(this.svg);
  }
  
  destroy(): void {
    if (this.svg) {
      this.container.removeChild(this.svg);
    }
  }
}

// Canvas渲染器
export class CanvasChartRenderer extends ChartRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  
  constructor(container: HTMLElement, width: number, height: number) {
    super(container, width, height);
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d')!;
    container.appendChild(this.canvas);
  }
  
  render(data: ChartData): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    const barWidth = this.width / data.labels.length / 2;
    const maxValue = Math.max(...data.datasets.flatMap(d => d.data));
    
    data.datasets.forEach((dataset, datasetIndex) => {
      this.ctx.fillStyle = dataset.color || '#3b82f6';
      
      dataset.data.forEach((value, index) => {
        const barHeight = (value / maxValue) * this.height * 0.8;
        const x = index * barWidth * 2 + datasetIndex * barWidth;
        const y = this.height - barHeight;
        
        this.ctx.fillRect(x, y, barWidth * 0.8, barHeight);
      });
    });
  }
  
  destroy(): void {
    this.container.removeChild(this.canvas);
  }
}

// 图表工厂
export class ChartFactory {
  static create(
    type: 'svg' | 'canvas',
    container: HTMLElement,
    width: number,
    height: number
  ): ChartRenderer {
    switch (type) {
      case 'svg':
        return new SVGChartRenderer(container, width, height);
      case 'canvas':
        return new CanvasChartRenderer(container, width, height);
      default:
        throw new Error(`Unknown chart type: ${type}`);
    }
  }
}

export function demo(): void {
  console.log('=== 数据可视化 ===\n');
  
  const data: ChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Sales',
        data: [65, 59, 80, 81, 56],
        color: '#3b82f6'
      },
      {
        label: 'Revenue',
        data: [28, 48, 40, 19, 86],
        color: '#10b981'
      }
    ]
  };
  
  console.log('图表数据:', data);
  console.log('渲染器类型: SVG, Canvas');
}
