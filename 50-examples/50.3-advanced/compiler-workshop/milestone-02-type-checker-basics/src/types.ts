/**
 * @file 内部类型表示
 * @category Advanced Compiler Workshop → Milestone 2
 *
 * 定义类型检查器内部使用的语义类型。
 * 注意：这与 AST 中的 TypeNode 不同，TypeNode 是语法层面的类型注解，
 * 而 Type 是语义层面经过解析和推断后的类型。
 */

export type Type =
  | PrimitiveType
  | ObjectType
  | FunctionType
  | ArrayType
  | UnionType
  | GenericType
  | UnknownType;

/** 原始类型 */
export interface PrimitiveType {
  kind: 'primitive';
  name: 'number' | 'string' | 'boolean' | 'null' | 'undefined' | 'void' | 'never';
}

/** 对象类型（结构子类型的核心） */
export interface ObjectType {
  kind: 'object';
  properties: Map<string, Type>;
  // 可选属性集合
  optionalProperties: Set<string>;
}

/** 函数类型 */
export interface FunctionType {
  kind: 'function';
  params: { name: string; type: Type }[];
  returnType: Type;
  // 泛型参数名称列表
  typeParams: string[];
}

/** 数组类型 */
export interface ArrayType {
  kind: 'array';
  elementType: Type;
}

/** 联合类型（简化版） */
export interface UnionType {
  kind: 'union';
  types: Type[];
}

/** 泛型类型参数（未实例化时） */
export interface GenericType {
  kind: 'generic';
  name: string;
  constraint?: Type; // 约束，如 T extends number
}

/** 未知/错误类型 */
export interface UnknownType {
  kind: 'unknown';
}

// ==================== 类型构造器 ====================

export const tNumber: PrimitiveType = { kind: 'primitive', name: 'number' };
export const tString: PrimitiveType = { kind: 'primitive', name: 'string' };
export const tBoolean: PrimitiveType = { kind: 'primitive', name: 'boolean' };
export const tNull: PrimitiveType = { kind: 'primitive', name: 'null' };
export const tUndefined: PrimitiveType = { kind: 'primitive', name: 'undefined' };
export const tVoid: PrimitiveType = { kind: 'primitive', name: 'void' };
export const tNever: PrimitiveType = { kind: 'primitive', name: 'never' };
export const tUnknown: UnknownType = { kind: 'unknown' };

export function tObject(
  props: Record<string, Type>,
  optional?: string[]
): ObjectType {
  const properties = new Map<string, Type>();
  for (const [k, v] of Object.entries(props)) {
    properties.set(k, v);
  }
  return {
    kind: 'object',
    properties,
    optionalProperties: new Set(optional || []),
  };
}

export function tFunction(
  params: { name: string; type: Type }[],
  returnType: Type,
  typeParams?: string[]
): FunctionType {
  return { kind: 'function', params, returnType, typeParams: typeParams || [] };
}

export function tArray(elementType: Type): ArrayType {
  return { kind: 'array', elementType };
}

export function tUnion(...types: Type[]): UnionType {
  // 扁平化嵌套 union
  const flattened: Type[] = [];
  for (const t of types) {
    if (t.kind === 'union') {
      flattened.push(...t.types);
    } else {
      flattened.push(t);
    }
  }
  // 去重（基于 JSON.stringify 的简单去重）
  const seen = new Set<string>();
  const unique: Type[] = [];
  for (const t of flattened) {
    const key = typeToString(t);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(t);
    }
  }
  return { kind: 'union', types: unique };
}

export function tGeneric(name: string, constraint?: Type): GenericType {
  return { kind: 'generic', name, constraint };
}

// ==================== 类型工具函数 ====================

/**
 * 将类型转换为可读的字符串表示
 */
export function typeToString(type: Type): string {
  switch (type.kind) {
    case 'primitive':
      return type.name;
    case 'generic':
      return type.constraint
        ? `${type.name} extends ${typeToString(type.constraint)}`
        : type.name;
    case 'object': {
      const props: string[] = [];
      for (const [k, v] of type.properties.entries()) {
        const opt = type.optionalProperties.has(k) ? '?' : '';
        props.push(`${k}${opt}: ${typeToString(v)}`);
      }
      return `{ ${props.join('; ')} }`;
    }
    case 'function': {
      const generics = type.typeParams.length > 0 ? `<${type.typeParams.join(', ')}>` : '';
      const params = type.params.map((p) => `${p.name}: ${typeToString(p.type)}`).join(', ');
      return `${generics}(${params}) => ${typeToString(type.returnType)}`;
    }
    case 'array':
      return `${typeToString(type.elementType)}[]`;
    case 'union':
      return type.types.map(typeToString).join(' | ');
    case 'unknown':
      return 'unknown';
  }
}

/**
 * 深度比较两个类型是否相等
 */
export function typesEqual(a: Type, b: Type): boolean {
  if (a.kind !== b.kind) return false;

  switch (a.kind) {
    case 'primitive':
      return a.name === (b as PrimitiveType).name;
    case 'generic':
      return a.name === (b as GenericType).name;
    case 'array':
      return typesEqual(a.elementType, (b as ArrayType).elementType);
    case 'union':
      if (a.types.length !== (b as UnionType).types.length) return false;
      return a.types.every((t, i) => typesEqual(t, (b as UnionType).types[i]));
    case 'object': {
      const bObj = b as ObjectType;
      if (a.properties.size !== bObj.properties.size) return false;
      for (const [k, v] of a.properties.entries()) {
        const bv = bObj.properties.get(k);
        if (!bv || !typesEqual(v, bv)) return false;
      }
      return true;
    }
    case 'function': {
      const bFn = b as FunctionType;
      if (a.params.length !== bFn.params.length) return false;
      if (!typesEqual(a.returnType, bFn.returnType)) return false;
      for (let i = 0; i < a.params.length; i++) {
        if (!typesEqual(a.params[i].type, bFn.params[i].type)) return false;
      }
      return true;
    }
    case 'unknown':
      return true;
  }
}
