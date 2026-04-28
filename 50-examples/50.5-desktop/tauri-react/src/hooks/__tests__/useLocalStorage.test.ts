/**
 * useLocalStorage Hook 单元测试
 */
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "../useLocalStorage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    // 每次测试前清空 localStorage
    localStorage.clear();
  });

  it("应返回默认值（localStorage 为空时）", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "default"));
    expect(result.current[0]).toBe("default");
  });

  it("应读取 localStorage 中已存在的值", () => {
    localStorage.setItem("existing-key", JSON.stringify("stored-value"));
    const { result } = renderHook(() => useLocalStorage("existing-key", "default"));
    expect(result.current[0]).toBe("stored-value");
  });

  it("应正确设置新值到 localStorage", () => {
    const { result } = renderHook(() => useLocalStorage("set-key", 0));

    act(() => {
      result.current[1](42);
    });

    expect(result.current[0]).toBe(42);
    expect(JSON.parse(localStorage.getItem("set-key")!)).toBe(42);
  });

  it("应支持函数式更新", () => {
    const { result } = renderHook(() => useLocalStorage("func-key", 10));

    act(() => {
      result.current[1]((prev) => prev + 5);
    });

    expect(result.current[0]).toBe(15);
  });

  it("应正确删除值并恢复默认值", () => {
    const { result } = renderHook(() => useLocalStorage("remove-key", "default"));

    act(() => {
      result.current[1]("changed");
    });
    expect(result.current[0]).toBe("changed");

    act(() => {
      result.current[2]();
    });
    expect(result.current[0]).toBe("default");
    expect(localStorage.getItem("remove-key")).toBeNull();
  });

  it("应支持复杂对象类型", () => {
    interface User {
      name: string;
      age: number;
    }

    const defaultUser: User = { name: "Alice", age: 30 };
    const { result } = renderHook(() => useLocalStorage<User>("user-key", defaultUser));

    expect(result.current[0]).toEqual(defaultUser);

    act(() => {
      result.current[1]({ name: "Bob", age: 25 });
    });

    expect(result.current[0]).toEqual({ name: "Bob", age: 25 });
    expect(JSON.parse(localStorage.getItem("user-key")!)).toEqual({ name: "Bob", age: 25 });
  });
});
