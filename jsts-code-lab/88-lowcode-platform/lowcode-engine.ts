/**
 * @file 低代码引擎
 * @category Low-code → Engine
 * @difficulty hard
 * @tags low-code, visual-design, code-generation, workflow
 */

// 组件定义
export interface Component {
  id: string;
  type: string;
  name: string;
  properties: Record<string, unknown>;
  children: Component[];
  styles: Record<string, string>;
  events: Record<string, string>; // event -> action
}

// 页面定义
export interface Page {
  id: string;
  name: string;
  route: string;
  components: Component[];
  dataSources: DataSource[];
  variables: Variable[];
}

export interface DataSource {
  id: string;
  name: string;
  type: 'rest' | 'graphql' | 'static';
  config: Record<string, unknown>;
}

export interface Variable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  defaultValue: unknown;
}

// 组件库
export class ComponentLibrary {
  private components: Map<string, ComponentDefinition> = new Map();
  
  register(def: ComponentDefinition): void {
    this.components.set(def.type, def);
  }
  
  get(type: string): ComponentDefinition | undefined {
    return this.components.get(type);
  }
  
  getAll(): ComponentDefinition[] {
    return Array.from(this.components.values());
  }
}

export interface ComponentDefinition {
  type: string;
  name: string;
  icon: string;
  category: 'basic' | 'form' | 'data' | 'layout' | 'advanced';
  properties: PropertyDefinition[];
  defaultProps: Record<string, unknown>;
  allowedChildren?: string[];
}

export interface PropertyDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'color' | 'json';
  label: string;
  defaultValue?: unknown;
  options?: string[];
}

// 页面设计器
export class PageDesigner {
  private page: Page;
  private history: Page[] = [];
  private historyIndex = -1;
  
  constructor(page: Page) {
    this.page = JSON.parse(JSON.stringify(page));
    this.saveHistory();
  }
  
  addComponent(parentId: string | null, component: Component): void {
    if (parentId === null) {
      this.page.components.push(component);
    } else {
      const parent = this.findComponent(parentId);
      if (parent) {
        parent.children.push(component);
      }
    }
    this.saveHistory();
  }
  
  removeComponent(id: string): void {
    this.removeFromTree(this.page.components, id);
    this.saveHistory();
  }
  
  updateComponent(id: string, updates: Partial<Component>): void {
    const component = this.findComponent(id);
    if (component) {
      Object.assign(component, updates);
    }
    this.saveHistory();
  }
  
  moveComponent(id: string, newParentId: string | null, index: number): void {
    const component = this.findComponent(id);
    if (!component) return;
    
    // 从原位置移除
    this.removeFromTree(this.page.components, id);
    
    // 添加到新位置
    if (newParentId === null) {
      this.page.components.splice(index, 0, component);
    } else {
      const parent = this.findComponent(newParentId);
      if (parent) {
        parent.children.splice(index, 0, component);
      }
    }
    this.saveHistory();
  }
  
  findComponent(id: string): Component | null {
    return this.findInTree(this.page.components, id);
  }
  
  private findInTree(components: Component[], id: string): Component | null {
    for (const comp of components) {
      if (comp.id === id) return comp;
      const found = this.findInTree(comp.children, id);
      if (found) return found;
    }
    return null;
  }
  
  private removeFromTree(components: Component[], id: string): boolean {
    const index = components.findIndex(c => c.id === id);
    if (index > -1) {
      components.splice(index, 1);
      return true;
    }
    
    for (const comp of components) {
      if (this.removeFromTree(comp.children, id)) return true;
    }
    return false;
  }
  
  private saveHistory(): void {
    // 截断历史
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(JSON.parse(JSON.stringify(this.page)));
    this.historyIndex++;
    
    // 限制历史大小
    if (this.history.length > 50) {
      this.history.shift();
      this.historyIndex--;
    }
  }
  
  undo(): boolean {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.page = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      return true;
    }
    return false;
  }
  
  redo(): boolean {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.page = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      return true;
    }
    return false;
  }
  
  getPage(): Page {
    return this.page;
  }
  
  exportSchema(): string {
    return JSON.stringify(this.page, null, 2);
  }
}

// 代码生成器
export class CodeGenerator {
  generateReact(page: Page): string {
    const imports = `import React, { useState, useEffect } from 'react';`;
    
    const componentCode = this.generateComponentTree(page.components);
    const dataSourceCode = this.generateDataSources(page.dataSources);
    const variableCode = this.generateVariables(page.variables);
    
    return `${imports}

export default function ${this.toPascalCase(page.name)}() {
${variableCode}
${dataSourceCode}

  return (
    <div className="page">
${componentCode}
    </div>
  );
}`;
  }
  
  private generateComponentTree(components: Component[], indent: number = 6): string {
    return components.map(comp => {
      const props = Object.entries(comp.properties)
        .map(([k, v]) => {
          if (typeof v === 'string') return `${k}="${v}"`;
          return `${k}={${JSON.stringify(v)}}`;
        })
        .join(' ');
      
      const style = Object.entries(comp.styles)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      
      const styleProp = style ? ` style={{${style}}}` : '';
      
      const children = comp.children.length > 0
        ? '\n' + this.generateComponentTree(comp.children, indent + 2) + '\n' + ' '.repeat(indent)
        : '';
      
      const tag = this.mapComponentType(comp.type);
      
      return `${' '.repeat(indent)}<${tag}${props ? ' ' + props : ''}${styleProp}>${children}</${tag}>`;
    }).join('\n');
  }
  
  private mapComponentType(type: string): string {
    const mapping: Record<string, string> = {
      'button': 'button',
      'input': 'input',
      'text': 'span',
      'container': 'div',
      'image': 'img',
      'list': 'ul',
      'list-item': 'li',
      'form': 'form',
      'card': 'div'
    };
    return mapping[type] || type;
  }
  
  private generateDataSources(dataSources: DataSource[]): string {
    if (dataSources.length === 0) return '';
    
    return dataSources.map(ds => {
      return `  const { data: ${ds.name}Data, loading: ${ds.name}Loading } = useFetch('${ds.config.url}');`;
    }).join('\n');
  }
  
  private generateVariables(variables: Variable[]): string {
    if (variables.length === 0) return '';
    
    return variables.map(v => {
      return `  const [${v.name}, set${this.toPascalCase(v.name)}] = useState(${JSON.stringify(v.defaultValue)});`;
    }).join('\n');
  }
  
  private toPascalCase(str: string): string {
    return str.replace(/(?:^|_)([a-z])/g, (_, letter) => letter.toUpperCase());
  }
}

// 工作流引擎
export interface Workflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowNode {
  id: string;
  type: 'start' | 'end' | 'task' | 'condition' | 'parallel';
  name: string;
  config: Record<string, unknown>;
}

export interface WorkflowEdge {
  from: string;
  to: string;
  condition?: string;
}

export class WorkflowEngine {
  private workflows: Map<string, Workflow> = new Map();
  private instances: Map<string, WorkflowInstance> = new Map();
  
  register(workflow: Workflow): void {
    this.workflows.set(workflow.id, workflow);
  }
  
  start(workflowId: string, context: Record<string, unknown> = {}): string {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error('Workflow not found');
    
    const instanceId = `inst-${Date.now()}`;
    const instance: WorkflowInstance = {
      id: instanceId,
      workflowId,
      context,
      currentNodes: workflow.nodes.filter(n => n.type === 'start').map(n => n.id),
      status: 'running',
      history: []
    };
    
    this.instances.set(instanceId, instance);
    this.execute(instance);
    
    return instanceId;
  }
  
  private execute(instance: WorkflowInstance): void {
    const workflow = this.workflows.get(instance.workflowId)!;
    
    while (instance.currentNodes.length > 0 && instance.status === 'running') {
      const nodeId = instance.currentNodes.shift()!;
      const node = workflow.nodes.find(n => n.id === nodeId)!;
      
      instance.history.push({ nodeId, timestamp: Date.now() });
      
      switch (node.type) {
        case 'task':
          console.log(`[Workflow] Executing task: ${node.name}`);
          this.moveToNext(workflow, instance, nodeId);
          break;
          
        case 'condition':
          const condition = node.config.condition as string;
          const result = this.evaluateCondition(condition, instance.context);
          this.moveToNext(workflow, instance, nodeId, result);
          break;
          
        case 'end':
          instance.status = 'completed';
          console.log(`[Workflow] Completed: ${instance.id}`);
          break;
          
        default:
          this.moveToNext(workflow, instance, nodeId);
      }
    }
  }
  
  private moveToNext(workflow: Workflow, instance: WorkflowInstance, currentNodeId: string, conditionResult?: boolean): void {
    const edges = workflow.edges.filter(e => e.from === currentNodeId);
    
    for (const edge of edges) {
      if (edge.condition === undefined || 
          (conditionResult !== undefined && (edge.condition === 'true') === conditionResult)) {
        instance.currentNodes.push(edge.to);
      }
    }
  }
  
  private evaluateCondition(condition: string, context: Record<string, unknown>): boolean {
    // 简化的条件求值
    try {
      return new Function('context', `return ${condition}`)(context);
    } catch {
      return false;
    }
  }
  
  getInstance(instanceId: string): WorkflowInstance | undefined {
    return this.instances.get(instanceId);
  }
}

interface WorkflowInstance {
  id: string;
  workflowId: string;
  context: Record<string, unknown>;
  currentNodes: string[];
  status: 'running' | 'completed' | 'failed' | 'paused';
  history: Array<{ nodeId: string; timestamp: number }>;
}

// 表达式引擎
export class ExpressionEngine {
  evaluate(expression: string, context: Record<string, unknown>): unknown {
    // 简化的表达式求值
    // 支持 {{variable}} 语法
    const templateRegex = /\{\{([^}]+)\}\}/g;
    
    return expression.replace(templateRegex, (match, path) => {
      const value = this.getValueByPath(context, path.trim());
      return String(value ?? '');
    });
  }
  
  private getValueByPath(obj: Record<string, unknown>, path: string): unknown {
    const parts = path.split('.');
    let current: unknown = obj;
    
    for (const part of parts) {
      if (current && typeof current === 'object') {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }
    
    return current;
  }
}

export function demo(): void {
  console.log('=== 低代码平台 ===\n');
  
  // 组件库
  console.log('--- 组件库 ---');
  const library = new ComponentLibrary();
  
  library.register({
    type: 'button',
    name: '按钮',
    icon: 'button',
    category: 'basic',
    properties: [
      { name: 'text', type: 'string', label: '文本', defaultValue: '按钮' },
      { name: 'type', type: 'select', label: '类型', options: ['primary', 'secondary', 'danger'], defaultValue: 'primary' }
    ],
    defaultProps: { text: '按钮' }
  });
  
  library.register({
    type: 'input',
    name: '输入框',
    icon: 'input',
    category: 'form',
    properties: [
      { name: 'placeholder', type: 'string', label: '占位符' },
      { name: 'required', type: 'boolean', label: '必填' }
    ],
    defaultProps: { placeholder: '请输入' }
  });
  
  console.log('已注册组件:', library.getAll().map(c => c.name).join(', '));
  
  // 页面设计
  console.log('\n--- 页面设计 ---');
  const page: Page = {
    id: 'page-1',
    name: 'user_form',
    route: '/users/new',
    components: [],
    dataSources: [],
    variables: [
      { name: 'username', type: 'string', defaultValue: '' },
      { name: 'email', type: 'string', defaultValue: '' }
    ]
  };
  
  const designer = new PageDesigner(page);
  
  designer.addComponent(null, {
    id: 'form-container',
    type: 'container',
    name: '表单容器',
    properties: {},
    children: [],
    styles: { padding: '20px' },
    events: {}
  });
  
  designer.addComponent('form-container', {
    id: 'username-input',
    type: 'input',
    name: '用户名输入',
    properties: { placeholder: '请输入用户名' },
    children: [],
    styles: { marginBottom: '10px' },
    events: {}
  });
  
  designer.addComponent('form-container', {
    id: 'submit-btn',
    type: 'button',
    name: '提交按钮',
    properties: { text: '提交', type: 'primary' },
    children: [],
    styles: {},
    events: { onClick: 'handleSubmit' }
  });
  
  console.log('页面组件数:', designer.getPage().components.length);
  
  // 代码生成
  console.log('\n--- 代码生成 ---');
  const codeGen = new CodeGenerator();
  const generatedCode = codeGen.generateReact(designer.getPage());
  console.log('生成的React代码:');
  console.log(generatedCode.slice(0, 500) + '...');
  
  // 工作流
  console.log('\n--- 工作流引擎 ---');
  const workflowEngine = new WorkflowEngine();
  
  const approvalWorkflow: Workflow = {
    id: 'approval-flow',
    name: '审批流程',
    nodes: [
      { id: 'start', type: 'start', name: '开始', config: {} },
      { id: 'submit', type: 'task', name: '提交申请', config: {} },
      { id: 'check', type: 'condition', name: '金额检查', config: { condition: 'context.amount > 1000' } },
      { id: 'manager', type: 'task', name: '经理审批', config: {} },
      { id: 'auto', type: 'task', name: '自动通过', config: {} },
      { id: 'end', type: 'end', name: '结束', config: {} }
    ],
    edges: [
      { from: 'start', to: 'submit' },
      { from: 'submit', to: 'check' },
      { from: 'check', to: 'manager', condition: 'true' },
      { from: 'check', to: 'auto', condition: 'false' },
      { from: 'manager', to: 'end' },
      { from: 'auto', to: 'end' }
    ]
  };
  
  workflowEngine.register(approvalWorkflow);
  
  console.log('启动高金额审批流程:');
  const instance1 = workflowEngine.start('approval-flow', { amount: 5000 });
  console.log('实例状态:', workflowEngine.getInstance(instance1)?.status);
  
  console.log('\n启动低金额审批流程:');
  const instance2 = workflowEngine.start('approval-flow', { amount: 500 });
  console.log('实例状态:', workflowEngine.getInstance(instance2)?.status);
}
