/**
 * # 低代码平台 Schema 定义系统
 *
 * 低代码平台的核心是「通过配置而非代码」构建应用。
 * 本文件实现一个类型安全的 Schema 定义系统。
 */

// ============================================
// 基础类型系统
// ============================================

/** 组件属性类型 */
export type PropertyType =
  | "string"
  | "number"
  | "boolean"
  | "select"
  | "multiselect"
  | "color"
  | "date"
  | "json"
  | "expression"; // 动态表达式

/** 组件属性定义 */
export interface PropertySchema {
  name: string;
  type: PropertyType;
  label: string;
  description?: string;
  defaultValue?: any;
  required?: boolean;
  /** select/multiselect 的选项 */
  options?: Array<{ label: string; value: any }>;
  /** 验证规则 */
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: string; // 表达式
  };
  /** 条件显示：当某个表达式为 true 时显示 */
  visibleWhen?: string;
}

// ============================================
// 组件定义
// ============================================

/** 组件插槽定义 */
export interface SlotSchema {
  name: string;
  label: string;
  allowMultiple: boolean;
  allowedComponents?: string[]; // 允许放入的组件类型
}

/** 组件事件定义 */
export interface EventSchema {
  name: string;
  label: string;
  description?: string;
  parameters?: PropertySchema[];
}

/** 组件 Schema */
export interface ComponentSchema {
  /** 唯一标识 */
  id: string;
  /** 显示名称 */
  name: string;
  /** 组件分类 */
  category: "layout" | "basic" | "form" | "data" | "feedback" | "navigation";
  /** 属性列表 */
  properties: PropertySchema[];
  /** 插槽列表 */
  slots?: SlotSchema[];
  /** 事件列表 */
  events?: EventSchema[];
  /** 图标 */
  icon?: string;
  /** 预览图 */
  preview?: string;
}

// ============================================
// 预置组件库
// ============================================

export const builtinComponents: ComponentSchema[] = [
  {
    id: "button",
    name: "按钮",
    category: "basic",
    properties: [
      {
        name: "text",
        type: "string",
        label: "按钮文本",
        defaultValue: "按钮",
        required: true,
      },
      {
        name: "type",
        type: "select",
        label: "按钮类型",
        defaultValue: "default",
        options: [
          { label: "默认", value: "default" },
          { label: "主要", value: "primary" },
          { label: "危险", value: "danger" },
          { label: "链接", value: "link" },
        ],
      },
      {
        name: "disabled",
        type: "boolean",
        label: "禁用",
        defaultValue: false,
      },
      {
        name: "loading",
        type: "boolean",
        label: "加载中",
        defaultValue: false,
      },
      {
        name: "onClick",
        type: "expression",
        label: "点击事件",
        description: "点击按钮时执行的逻辑",
      },
    ],
    events: [
      {
        name: "onClick",
        label: "点击",
        description: "点击按钮时触发",
      },
    ],
  },
  {
    id: "input",
    name: "输入框",
    category: "form",
    properties: [
      {
        name: "label",
        type: "string",
        label: "标签",
        defaultValue: "",
      },
      {
        name: "placeholder",
        type: "string",
        label: "占位符",
        defaultValue: "请输入",
      },
      {
        name: "type",
        type: "select",
        label: "输入类型",
        defaultValue: "text",
        options: [
          { label: "文本", value: "text" },
          { label: "密码", value: "password" },
          { label: "数字", value: "number" },
          { label: "邮箱", value: "email" },
        ],
      },
      {
        name: "required",
        type: "boolean",
        label: "必填",
        defaultValue: false,
      },
      {
        name: "value",
        type: "expression",
        label: "绑定值",
        description: "绑定的数据字段",
      },
    ],
    events: [
      {
        name: "onChange",
        label: "值变化",
        parameters: [{ name: "value", type: "string", label: "当前值" }],
      },
      {
        name: "onBlur",
        label: "失去焦点",
      },
    ],
  },
  {
    id: "container",
    name: "容器",
    category: "layout",
    properties: [
      {
        name: "direction",
        type: "select",
        label: "布局方向",
        defaultValue: "vertical",
        options: [
          { label: "垂直", value: "vertical" },
          { label: "水平", value: "horizontal" },
        ],
      },
      {
        name: "gap",
        type: "number",
        label: "间距",
        defaultValue: 16,
        validation: { min: 0, max: 100 },
      },
      {
        name: "padding",
        type: "number",
        label: "内边距",
        defaultValue: 16,
      },
      {
        name: "backgroundColor",
        type: "color",
        label: "背景色",
        defaultValue: "#ffffff",
      },
    ],
    slots: [
      {
        name: "children",
        label: "子元素",
        allowMultiple: true,
      },
    ],
  },
];

// ============================================
// 页面/应用定义
// ============================================

/** 页面定义 */
export interface PageSchema {
  id: string;
  name: string;
  path: string;
  /** 页面根组件 */
  root: ComponentInstance;
  /** 页面级数据 */
  data?: Record<string, any>;
  /** 页面级方法 */
  methods?: Record<string, string>; // 表达式
}

/** 组件实例 */
export interface ComponentInstance {
  /** 引用的组件 ID */
  componentId: string;
  /** 实例唯一 ID */
  instanceId: string;
  /** 属性值 */
  props: Record<string, any>;
  /** 插槽内容 */
  slots?: Record<string, ComponentInstance[]>;
  /** 事件绑定 */
  events?: Record<string, string>; // 表达式
}

// ============================================
// Schema 验证
// ============================================

/**
 * 验证组件实例是否符合 Schema。
 */
export function validateComponentInstance(
  instance: ComponentInstance,
  componentLibrary: ComponentSchema[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const schema = componentLibrary.find((c) => c.id === instance.componentId);

  if (!schema) {
    return { valid: false, errors: [`组件 ${instance.componentId} 不存在`] };
  }

  // 验证必填属性
  for (const prop of schema.properties) {
    if (prop.required && instance.props[prop.name] === undefined) {
      errors.push(`属性 ${prop.name} 是必填的`);
    }
  }

  // 验证未知属性
  for (const key of Object.keys(instance.props)) {
    if (!schema.properties.find((p) => p.name === key)) {
      errors.push(`未知属性 ${key}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// ============================================
// 代码生成
// ============================================

/**
 * 将组件实例转换为 React 代码（简化版）。
 */
export function generateReactCode(instance: ComponentInstance, library: ComponentSchema[]): string {
  const schema = library.find((c) => c.id === instance.componentId);
  if (!schema) return `<!-- 未知组件: ${instance.componentId} -->`;

  const props = Object.entries(instance.props)
    .map(([key, value]) => {
      if (typeof value === "string") return `${key}="${value}"`;
      if (typeof value === "boolean") return value ? key : "";
      return `${key}={${JSON.stringify(value)}}`;
    })
    .filter(Boolean)
    .join(" ");

  const children = instance.slots?.children
    ?.map((child) => generateReactCode(child, library))
    .join("\n") ?? "";

  const ComponentName = schema.id.charAt(0).toUpperCase() + schema.id.slice(1);

  if (children) {
    return `<${ComponentName} ${props}>\n${children}\n</${ComponentName}>`;
  }
  return `<${ComponentName} ${props} />`;
}
