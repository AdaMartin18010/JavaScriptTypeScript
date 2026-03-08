/**
 * @file 状态管理实现
 * @category Frontend Frameworks → State Management
 * @difficulty medium
 * @tags state-management, store, redux-pattern, flux
 * 
 * @description
 * 前端状态管理实现：
 * - 类 Redux 架构
 * - 中间件系统
 * - 派生状态 (Selectors)
 * - 时间旅行调试
 */

// ============================================================================
// 1. 基础类型定义
// ============================================================================

export type Action<T = string, P = unknown> = {
  type: T;
  payload?: P;
  meta?: Record<string, unknown>;
};

export type Reducer<S, A extends Action> = (state: S, action: A) => S;

export type Listener<S> = (state: S, prevState: S) => void;

export type Middleware<S, A extends Action> = (
  store: Store<S, A>
) => (next: (action: A) => A) => (action: A) => A;

// ============================================================================
// 2. Store 实现
// ============================================================================

export class Store<S, A extends Action = Action> {
  private state: S;
  private reducer: Reducer<S, A>;
  private listeners: Set<Listener<S>> = new Set();
  private middlewares: Middleware<S, A>[] = [];
  private isDispatching = false;
  
  // 时间旅行调试
  private history: S[] = [];
  private historyIndex = -1;
  private maxHistory = 50;

  constructor(reducer: Reducer<S, A>, initialState: S) {
    this.reducer = reducer;
    this.state = initialState;
    this.saveToHistory(initialState);
  }

  // 获取当前状态
  getState(): S {
    return this.state;
  }

  // 订阅状态变化
  subscribe(listener: Listener<S>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // 分发 Action
  dispatch(action: A): A {
    if (this.isDispatching) {
      throw new Error('Reducers may not dispatch actions.');
    }

    try {
      this.isDispatching = true;
      const prevState = this.state;
      this.state = this.reducer(this.state, action);
      
      // 保存历史
      this.saveToHistory(this.state);
      
      // 通知监听器
      this.listeners.forEach(listener => listener(this.state, prevState));
    } finally {
      this.isDispatching = false;
    }

    return action;
  }

  // 应用中间件
  applyMiddleware(...middlewares: Middleware<S, A>[]): void {
    this.middlewares = middlewares;
    
    // 构建中间件链
    const dispatch = (action: A): A => this.dispatch(action);
    const store = this;
    
    const chain = middlewares.map(middleware => middleware(store));
    const composed = chain.reduceRight(
      (next, middleware) => middleware(next),
      dispatch
    );
    
    // 重写 dispatch
    this.dispatch = composed.bind(this);
  }

  // 替换 Reducer（用于热重载）
  replaceReducer(newReducer: Reducer<S, A>): void {
    this.reducer = newReducer;
    this.dispatch({ type: '@@redux/INIT' } as A);
  }

  // ============================================================================
  // 3. 时间旅行调试
  // ============================================================================

  private saveToHistory(state: S): void {
    // 如果在历史中间，截断后面的历史
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    
    this.history.push(state);
    
    // 限制历史长度
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
  }

  // 撤销
  undo(): void {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.state = this.history[this.historyIndex];
      this.notifyListeners();
    }
  }

  // 重做
  redo(): void {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.state = this.history[this.historyIndex];
      this.notifyListeners();
    }
  }

  // 跳转到指定历史点
  jumpTo(index: number): void {
    if (index >= 0 && index < this.history.length) {
      this.historyIndex = index;
      this.state = this.history[index];
      this.notifyListeners();
    }
  }

  // 获取历史
  getHistory(): readonly S[] {
    return Object.freeze([...this.history]);
  }

  private notifyListeners(): void {
    const prevIndex = Math.max(0, this.historyIndex - 1);
    this.listeners.forEach(listener => 
      listener(this.state, this.history[prevIndex])
    );
  }

  // ============================================================================
  // 4. 派生状态 (Selectors)
  // ============================================================================

  select<R>(selector: (state: S) => R): R {
    return selector(this.state);
  }

  // 创建记忆化 Selector
  createSelector<T, R>(
    inputSelectors: ((state: S) => T)[],
    resultFn: (...args: T[]) => R
  ): (state: S) => R {
    let lastArgs: T[] = [];
    let lastResult: R;

    return (state: S): R => {
      const args = inputSelectors.map(sel => sel(state));
      
      if (!this.shallowEqual(args, lastArgs)) {
        lastResult = resultFn(...args);
        lastArgs = args;
      }
      
      return lastResult;
    };
  }

  private shallowEqual(a: unknown[], b: unknown[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((val, i) => val === b[i]);
  }
}

// ============================================================================
// 5. 常用中间件
// ============================================================================

// 日志中间件
export const loggerMiddleware = <S, A extends Action>(store: Store<S, A>) => 
  (next: (action: A) => A) => 
  (action: A): A => {
    console.group(`Action: ${action.type}`);
    console.log('Prev State:', store.getState());
    console.log('Action:', action);
    const result = next(action);
    console.log('Next State:', store.getState());
    console.groupEnd();
    return result;
  };

// 异步中间件
export const thunkMiddleware = <S, A extends Action>(store: Store<S, A>) =>
  (next: (action: A | ((dispatch: (a: A) => A, getState: () => S) => Promise<A>)) => A) =>
  (action: A | ((dispatch: (a: A) => A, getState: () => S) => Promise<A>)): A => {
    if (typeof action === 'function') {
      return action(store.dispatch.bind(store), store.getState.bind(store)) as A;
    }
    return next(action);
  };

// 持久化中间件
export const persistMiddleware = <S, A extends Action>(key: string) =>
  (store: Store<S, A>) =>
  (next: (action: A) => A) =>
  (action: A): A => {
    const result = next(action);
    localStorage.setItem(key, JSON.stringify(store.getState()));
    return result;
  };

// ============================================================================
// 6. 组合 Reducers
// ============================================================================

export function combineReducers<S extends Record<string, unknown>, A extends Action>(
  reducers: { [K in keyof S]: Reducer<S[K], A> }
): Reducer<S, A> {
  return (state: S, action: A): S => {
    const nextState = {} as S;
    let hasChanged = false;

    for (const key in reducers) {
      const reducer = reducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);
      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }

    return hasChanged ? nextState : state;
  };
}

// ============================================================================
// 7. 使用示例
// ============================================================================

interface TodoState {
  todos: Array<{ id: number; text: string; completed: boolean }>;
  filter: 'all' | 'active' | 'completed';
}

type TodoAction =
  | Action<'ADD_TODO', { id: number; text: string }>
  | Action<'TOGGLE_TODO', { id: number }>
  | Action<'SET_FILTER', { filter: 'all' | 'active' | 'completed' }>;

const initialState: TodoState = {
  todos: [],
  filter: 'all'
};

const todoReducer: Reducer<TodoState, TodoAction> = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, { ...action.payload!, completed: false }]
      };
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload!.id
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      };
    case 'SET_FILTER':
      return { ...state, filter: action.payload!.filter };
    default:
      return state;
  }
};

export function demo(): void {
  console.log('=== 状态管理实现 ===\n');

  // 创建 Store
  const store = new Store<TodoState, TodoAction>(todoReducer, initialState);

  // 订阅状态变化
  const unsubscribe = store.subscribe((state, prevState) => {
    console.log(`  State changed: ${prevState.todos.length} → ${state.todos.length} todos`);
  });

  console.log('1. 初始状态');
  console.log('   Todos:', store.getState().todos.length);

  console.log('\n2. 添加任务');
  store.dispatch({ type: 'ADD_TODO', payload: { id: 1, text: 'Learn TypeScript' } });
  store.dispatch({ type: 'ADD_TODO', payload: { id: 2, text: 'Build App' } });

  console.log('\n3. 切换任务状态');
  store.dispatch({ type: 'TOGGLE_TODO', payload: { id: 1 } });

  console.log('\n4. 设置过滤器');
  store.dispatch({ type: 'SET_FILTER', payload: { filter: 'active' } });

  console.log('\n5. 使用 Selector');
  const activeTodosSelector = store.createSelector(
    [(state: TodoState) => state.todos, (state: TodoState) => state.filter],
    (todos, filter) => {
      if (filter === 'active') return todos.filter(t => !t.completed);
      if (filter === 'completed') return todos.filter(t => t.completed);
      return todos;
    }
  );
  console.log('   Active todos:', activeTodosSelector(store.getState()).length);

  console.log('\n6. 时间旅行调试');
  console.log('   History length:', store.getHistory().length);
  store.undo();
  console.log('   After undo - Filter:', store.getState().filter);
  store.redo();
  console.log('   After redo - Filter:', store.getState().filter);

  console.log('\n7. 取消订阅');
  unsubscribe();

  console.log('\n状态管理要点:');
  console.log('- 单一数据源：所有状态存储在唯一的 Store 中');
  console.log('- 状态只读：只能通过 dispatch action 改变状态');
  console.log('- 纯函数更新：Reducer 必须是纯函数');
  console.log('- 中间件扩展：日志、异步、持久化等');
  console.log('- 时间旅行：记录状态历史，支持撤销/重做');
}

// ============================================================================
// 导出
// ============================================================================

export {
  Store,
  combineReducers,
  loggerMiddleware,
  thunkMiddleware,
  persistMiddleware
};
