/**
 * 力导向图示例 - Force-Directed Graph
 * 
 * 展示如何使用 D3.js 创建交互式力导向图
 * 包含节点拖拽、缩放、高亮和物理模拟
 */

import * as d3 from 'd3';

/**
 * 节点数据接口
 */
export interface ForceNode extends d3.SimulationNodeDatum {
  /** 节点唯一标识 */
  id: string;
  /** 节点名称 */
  name: string;
  /** 节点分组（用于颜色） */
  group?: string | number;
  /** 节点大小 */
  size?: number;
  /** 节点颜色 */
  color?: string;
  /** 节点描述 */
  description?: string;
}

/**
 * 连接数据接口
 */
export interface ForceLink extends d3.SimulationLinkDatum<ForceNode> {
  /** 源节点ID */
  source: string | ForceNode;
  /** 目标节点ID */
  target: string | ForceNode;
  /** 连接权重（影响线粗细） */
  value?: number;
  /** 连接类型 */
  type?: string;
}

/**
 * 力导向图数据接口
 */
export interface ForceGraphData {
  nodes: ForceNode[];
  links: ForceLink[];
}

/**
 * 力导向图配置选项
 */
export interface ForceGraphOptions {
  /** 图表宽度 */
  width?: number;
  /** 图表高度 */
  height?: number;
  /** 颜色方案 */
  colorScheme?: string[];
  /** 节点默认大小 */
  nodeSize?: number;
  /** 连接线默认粗细 */
  linkWidth?: number;
  /** 是否显示节点标签 */
  showLabels?: boolean;
  /** 是否启用缩放 */
  enableZoom?: boolean;
  /** 是否启用物理模拟 */
  enableSimulation?: boolean;
  /** 连接力强度 */
  linkDistance?: number;
  /** 电荷力强度（负值表示排斥） */
  chargeStrength?: number;
  /** 中心力强度 */
  centerStrength?: number;
  /** 碰撞检测半径 */
  collisionRadius?: number;
  /** 节点点击回调 */
  onNodeClick?: (node: ForceNode) => void;
  /** 连接点击回调 */
  onLinkClick?: (link: ForceLink) => void;
}

/**
 * 创建力导向图
 * 
 * @param container - 容器选择器
 * @param data - 图数据（节点和连接）
 * @param options - 配置选项
 * @returns 包含 SVG 和模拟器的对象
 * 
 * @example
 * ```typescript
 * const data: ForceGraphData = {
 *   nodes: [
 *     { id: '1', name: '节点1', group: 1 },
 *     { id: '2', name: '节点2', group: 2 }
 *   ],
 *   links: [
 *     { source: '1', target: '2', value: 1 }
 *   ]
 * };
 * 
 * createForceGraph('#force-graph', data, {
 *   width: 800,
 *   height: 600,
 *   enableZoom: true
 * });
 * ```
 */
export function createForceGraph(
  container: string,
  data: ForceGraphData,
  options: ForceGraphOptions = {}
): { svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>; simulation: d3.Simulation<ForceNode, ForceLink> } {
  // 默认配置
  const {
    width = 800,
    height = 600,
    colorScheme = d3.schemeCategory10,
    nodeSize = 20,
    linkWidth = 1.5,
    showLabels = true,
    enableZoom = true,
    enableSimulation = true,
    linkDistance = 100,
    chargeStrength = -300,
    centerStrength = 0.05,
    collisionRadius = 30,
    onNodeClick,
    onLinkClick
  } = options;

  // 深拷贝数据，避免修改原始数据
  const nodes: ForceNode[] = data.nodes.map(n => ({ ...n }));
  const links: ForceLink[] = data.links.map(l => ({ ...l }));

  // 清除已存在的图表
  d3.select(container).selectAll('*').remove();

  // 创建 SVG
  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('max-width', '100%')
    .style('height', 'auto')
    .style('background', '#f8f9fa')
    .style('border-radius', '8px');

  // 添加箭头标记定义
  const defs = svg.append('defs');
  
  defs.append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', nodeSize + 8)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#999');

  // 创建发光滤镜
  const filter = defs.append('filter')
    .attr('id', 'glow')
    .attr('x', '-50%')
    .attr('y', '-50%')
    .attr('width', '200%')
    .attr('height', '200%');

  filter.append('feGaussianBlur')
    .attr('stdDeviation', '3')
    .attr('result', 'coloredBlur');

  const feMerge = filter.append('feMerge');
  feMerge.append('feMergeNode').attr('in', 'coloredBlur');
  feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

  // 创建缩放行为
  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
    });

  if (enableZoom) {
    svg.call(zoom as any);
  }

  // 主绘图组
  const g = svg.append('g');

  // 创建颜色比例尺
  const colorScale = d3.scaleOrdinal<string | number, string>(colorScheme);

  // 创建提示框
  const tooltip = d3.select('body').append('div')
    .attr('class', 'force-tooltip')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background', 'rgba(0, 0, 0, 0.85)')
    .style('color', '#fff')
    .style('padding', '10px 14px')
    .style('border-radius', '6px')
    .style('font-size', '13px')
    .style('pointer-events', 'none')
    .style('z-index', '1000')
    .style('box-shadow', '0 4px 12px rgba(0,0,0,0.2)')
    .style('max-width', '250px');

  // 创建力导向模拟器
  const simulation = d3.forceSimulation<ForceNode>(nodes)
    .force('link', d3.forceLink<ForceNode, ForceLink>(links)
      .id(d => d.id)
      .distance(linkDistance)
      .strength(d => (d.value || 1) * 0.5)
    )
    .force('charge', d3.forceManyBody().strength(chargeStrength))
    .force('center', d3.forceCenter(width / 2, height / 2).strength(centerStrength))
    .force('collision', d3.forceCollide().radius((d: any) => (d.size || nodeSize) + collisionRadius));

  // 绘制连接线
  const link = g.append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(links)
    .enter()
    .append('line')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', d => Math.sqrt(d.value || 1) * linkWidth)
    .attr('marker-end', 'url(#arrow)')
    .style('cursor', 'pointer');

  // 连接交互
  link
    .on('mouseenter', function() {
      const d = d3.select(this).datum() as ForceLink;
      d3.select(this)
        .attr('stroke', '#333')
        .attr('stroke-opacity', 1)
        .attr('stroke-width', (Math.sqrt(d.value || 1) * linkWidth) + 1);

      const sourceName = typeof d.source === 'object' ? d.source.name : d.source;
      const targetName = typeof d.target === 'object' ? (d.target as ForceNode).name : d.target;

      tooltip
        .style('visibility', 'visible')
        .html(`
          <div style="font-weight: bold; margin-bottom: 4px;">连接</div>
          <div>${sourceName} → ${targetName}</div>
          ${d.type ? `<div style="margin-top: 4px; color: #aaa;">类型: ${d.type}</div>` : ''}
          ${d.value ? `<div style="color: #aaa;">权重: ${d.value}</div>` : ''}
        `);
    })
    .on('mousemove', function(event: MouseEvent) {
      tooltip
        .style('top', `${event.pageY - 10}px`)
        .style('left', `${event.pageX + 10}px`);
    })
    .on('mouseleave', function() {
      const linkData = d3.select(this).datum() as ForceLink;
      d3.select(this)
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', Math.sqrt(linkData.value || 1) * linkWidth);

      tooltip.style('visibility', 'hidden');
    })
    .on('click', function(event: MouseEvent, d: ForceLink) {
      event.stopPropagation();
      if (onLinkClick) {
        onLinkClick(d);
      }
    });

  // 绘制节点组
  const nodeGroup = g.append('g')
    .attr('class', 'nodes')
    .selectAll('g')
    .data(nodes)
    .enter()
    .append('g')
    .attr('class', 'node-group')
    .style('cursor', 'pointer')
    .call(d3.drag<SVGGElement, ForceNode>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended)
    );

  // 绘制节点圆形
  nodeGroup.append('circle')
    .attr('r', d => d.size || nodeSize)
    .attr('fill', d => d.color || colorScale(d.group || 0))
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)
    .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))');

  // 添加节点标签（可选）
  if (showLabels) {
    nodeGroup.append('text')
      .attr('dy', d => (d.size || nodeSize) + 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('font-weight', '500')
      .style('fill', '#333')
      .style('pointer-events', 'none')
      .style('text-shadow', '0 1px 2px rgba(255,255,255,0.8)')
      .text(d => d.name);
  }

  // 节点交互
  nodeGroup
    .on('mouseenter', function() {
      const d = d3.select(this).datum() as ForceNode;
      // 高亮当前节点
      d3.select(this).select('circle')
        .transition()
        .duration(200)
        .attr('r', (d.size || nodeSize) * 1.2)
        .style('filter', 'url(#glow)');

      // 高亮相连的连接线
      link
        .transition()
        .duration(200)
        .style('stroke-opacity', (l: ForceLink) => {
          const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
          const targetId = typeof l.target === 'object' ? (l.target as ForceNode).id : l.target;
          return (sourceId === d.id || targetId === d.id) ? 1 : 0.1;
        })
        .attr('stroke', (l: ForceLink) => {
          const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
          const targetId = typeof l.target === 'object' ? (l.target as ForceNode).id : l.target;
          return (sourceId === d.id || targetId === d.id) ? '#333' : '#999';
        });

      // 显示提示框
      tooltip
        .style('visibility', 'visible')
        .html(`
          <div style="font-weight: bold; margin-bottom: 4px;">${d.name}</div>
          ${d.group ? `<div style="color: #aaa;">分组: ${d.group}</div>` : ''}
          ${d.description ? `<div style="margin-top: 6px; font-size: 12px;">${d.description}</div>` : ''}
        `);
    })
    .on('mousemove', function(event: MouseEvent) {
      tooltip
        .style('top', `${event.pageY - 10}px`)
        .style('left', `${event.pageX + 10}px`);
    })
    .on('mouseleave', function() {
      const nodeData = d3.select(this).datum() as ForceNode;
      void nodeData;
      // 恢复节点样式
      d3.select(this).select('circle')
        .transition()
        .duration(200)
        .attr('r', nodeData.size || nodeSize)
        .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))');

      // 恢复连接线样式
      link
        .transition()
        .duration(200)
        .style('stroke-opacity', 0.6)
        .attr('stroke', '#999');

      tooltip.style('visibility', 'hidden');
    })
    .on('click', function(event: MouseEvent) {
      const d = d3.select(this).datum() as ForceNode;
      event.stopPropagation();
      void d;
      
      // 切换选中状态
      const isSelected = d3.select(this).classed('selected');
      
      nodeGroup.classed('selected', false)
        .select('circle')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);

      if (!isSelected) {
        d3.select(this)
          .classed('selected', true)
          .select('circle')
          .attr('stroke', '#333')
          .attr('stroke-width', 3);

        if (onNodeClick) {
          onNodeClick(d);
        }
      }
    });

  // 点击空白处取消选择
  svg.on('click', function() {
    nodeGroup.classed('selected', false)
      .select('circle')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);
  });

  // 模拟器tick更新
  simulation.on('tick', () => {
    link
      .attr('x1', d => (d.source as ForceNode).x || 0)
      .attr('y1', d => (d.source as ForceNode).y || 0)
      .attr('x2', d => (d.target as ForceNode).x || 0)
      .attr('y2', d => (d.target as ForceNode).y || 0);

    nodeGroup
      .attr('transform', d => `translate(${d.x || 0},${d.y || 0})`);
  });

  // 如果没有启用模拟，立即加热
  if (!enableSimulation) {
    simulation.stop();
  }

  // 拖拽函数
  function dragstarted(event: d3.D3DragEvent<SVGGElement, ForceNode, ForceNode>, d: ForceNode) {
    if (!event.active && enableSimulation) {
      simulation.alphaTarget(0.3).restart();
    }
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event: d3.D3DragEvent<SVGGElement, ForceNode, ForceNode>, d: ForceNode) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event: d3.D3DragEvent<SVGGElement, ForceNode, ForceNode>, d: ForceNode) {
    if (!event.active && enableSimulation) {
      simulation.alphaTarget(0);
    }
    d.fx = null;
    d.fy = null;
  }

  // 控制按钮组
  const controls = svg.append('g')
    .attr('class', 'controls')
    .attr('transform', `translate(${width - 120}, 20)`);

  // 重置视图按钮
  const resetBtn = controls.append('g')
    .attr('class', 'control-btn')
    .style('cursor', 'pointer')
    .on('click', () => {
      svg.transition()
        .duration(750)
        .call(zoom.transform as any, d3.zoomIdentity);
    });

  resetBtn.append('rect')
    .attr('width', 100)
    .attr('height', 30)
    .attr('rx', 4)
    .attr('fill', '#fff')
    .attr('stroke', '#ddd')
    .style('filter', 'drop-shadow(0 1px 3px rgba(0,0,0,0.1))');

  resetBtn.append('text')
    .attr('x', 50)
    .attr('y', 20)
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    .style('fill', '#333')
    .text('重置视图');

  // 暂停/继续模拟按钮
  if (enableSimulation) {
    let isRunning = true;
    
    const toggleBtn = controls.append('g')
      .attr('class', 'control-btn')
      .attr('transform', 'translate(0, 40)')
      .style('cursor', 'pointer')
      .on('click', function() {
        if (isRunning) {
          simulation.stop();
        } else {
          simulation.restart();
        }
        isRunning = !isRunning;
        
        d3.select(this).select('text')
          .text(isRunning ? '暂停模拟' : '继续模拟');
      });

    toggleBtn.append('rect')
      .attr('width', 100)
      .attr('height', 30)
      .attr('rx', 4)
      .attr('fill', '#fff')
      .attr('stroke', '#ddd')
      .style('filter', 'drop-shadow(0 1px 3px rgba(0,0,0,0.1))');

    toggleBtn.append('text')
      .attr('x', 50)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#333')
      .text('暂停模拟');
  }

  // 添加标题
  svg.append('text')
    .attr('x', 20)
    .attr('y', 30)
    .style('font-size', '16px')
    .style('font-weight', 'bold')
    .style('fill', '#333')
    .text('力导向图示例');

  return { svg, simulation };
}

/**
 * 更新力导向图
 */
export function updateForceGraph(
  container: string,
  newData: ForceGraphData,
  options: ForceGraphOptions = {}
): { svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>; simulation: d3.Simulation<ForceNode, ForceLink> } {
  return createForceGraph(container, newData, options);
}

/**
 * 销毁力导向图
 */
export function destroyForceGraph(container: string): void {
  d3.select(container).selectAll('*').remove();
  d3.select('body').selectAll('.force-tooltip').remove();
}

/**
 * 生成示例数据
 */
export function generateSampleData(): ForceGraphData {
  const nodes: ForceNode[] = [
    { id: '1', name: '中心节点', group: 1, size: 30, description: '网络的核心节点' },
    { id: '2', name: '节点 A', group: 2, size: 20 },
    { id: '3', name: '节点 B', group: 2, size: 20 },
    { id: '4', name: '节点 C', group: 2, size: 20 },
    { id: '5', name: '节点 D', group: 3, size: 18 },
    { id: '6', name: '节点 E', group: 3, size: 18 },
    { id: '7', name: '节点 F', group: 3, size: 18 },
    { id: '8', name: '节点 G', group: 4, size: 15 },
    { id: '9', name: '节点 H', group: 4, size: 15 },
    { id: '10', name: '节点 I', group: 4, size: 15 },
  ];

  const links: ForceLink[] = [
    { source: '1', target: '2', value: 3, type: '强连接' },
    { source: '1', target: '3', value: 3, type: '强连接' },
    { source: '1', target: '4', value: 3, type: '强连接' },
    { source: '2', target: '5', value: 2, type: '普通连接' },
    { source: '2', target: '6', value: 2, type: '普通连接' },
    { source: '3', target: '7', value: 2, type: '普通连接' },
    { source: '4', target: '8', value: 1, type: '弱连接' },
    { source: '5', target: '9', value: 1, type: '弱连接' },
    { source: '6', target: '10', value: 1, type: '弱连接' },
    { source: '7', target: '8', value: 2, type: '普通连接' },
    { source: '9', target: '10', value: 2, type: '普通连接' },
    { source: '3', target: '4', value: 2, type: '普通连接' },
  ];

  return { nodes, links };
}
