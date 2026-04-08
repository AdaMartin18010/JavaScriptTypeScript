/**
 * TypeScript 设计模式实现
 * 使用 TypeScript 特性实现23种GoF设计模式
 */

// ============================================
// 创建型模式 (Creational Patterns)
// ============================================

/**
 * 1. 单例模式 (Singleton Pattern)
 * 使用 private constructor 确保全局只有一个实例
 */
class Singleton {
  private static instance: Singleton;
  private data: string = '';

  // 私有构造函数，防止外部实例化
  private constructor() {}

  // 获取唯一实例的静态方法
  public static getInstance(): Singleton {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton();
    }
    return Singleton.instance;
  }

  public setData(data: string): void {
    this.data = data;
  }

  public getData(): string {
    return this.data;
  }
}

/**
 * 2. 工厂方法模式 (Factory Method Pattern)
 * 使用泛型工厂创建不同类型的对象
 */
// 产品接口
interface Product {
  name: string;
  operation(): string;
}

// 具体产品A
class ConcreteProductA implements Product {
  name = 'ProductA';
  operation(): string {
    return 'ConcreteProductA operation';
  }
}

// 具体产品B
class ConcreteProductB implements Product {
  name = 'ProductB';
  operation(): string {
    return 'ConcreteProductB operation';
  }
}

// 泛型工厂类
class ProductFactory<T extends Product> {
  constructor(private productConstructor: new () => T) {}

  createProduct(): T {
    return new this.productConstructor();
  }
}

// 工厂方法类型
interface IProductFactory {
  createProduct(): Product;
}

class ProductAFactory implements IProductFactory {
  createProduct(): Product {
    return new ConcreteProductA();
  }
}

class ProductBFactory implements IProductFactory {
  createProduct(): Product {
    return new ConcreteProductB();
  }
}

/**
 * 3. 抽象工厂模式 (Abstract Factory Pattern)
 * 使用接口+泛型创建相关对象族
 */
// 抽象产品接口
interface IButton {
  render(): string;
}

interface ICheckbox {
  check(): string;
}

// Windows 风格产品
class WindowsButton implements IButton {
  render(): string {
    return 'Rendering Windows button';
  }
}

class WindowsCheckbox implements ICheckbox {
  check(): string {
    return 'Checking Windows checkbox';
  }
}

// Mac 风格产品
class MacButton implements IButton {
  render(): string {
    return 'Rendering Mac button';
  }
}

class MacCheckbox implements ICheckbox {
  check(): string {
    return 'Checking Mac checkbox';
  }
}

// 抽象工厂接口
interface IGUIFactory {
  createButton(): IButton;
  createCheckbox(): ICheckbox;
}

// Windows 工厂
class WindowsFactory implements IGUIFactory {
  createButton(): IButton {
    return new WindowsButton();
  }
  createCheckbox(): ICheckbox {
    return new WindowsCheckbox();
  }
}

// Mac 工厂
class MacFactory implements IGUIFactory {
  createButton(): IButton {
    return new MacButton();
  }
  createCheckbox(): ICheckbox {
    return new MacCheckbox();
  }
}

// 泛型抽象工厂
abstract class AbstractFactory<T, U> {
  abstract createProductA(): T;
  abstract createProductB(): U;
}

/**
 * 4. 建造者模式 (Builder Pattern)
 * 使用方法链+类型安全构建复杂对象
 */
// 产品类
class House {
  walls: number = 0;
  doors: number = 0;
  windows: number = 0;
  hasGarage: boolean = false;
  hasSwimmingPool: boolean = false;

  toString(): string {
    return `House: ${this.walls} walls, ${this.doors} doors, ${this.windows} windows, ` +
           `Garage: ${this.hasGarage}, Pool: ${this.hasSwimmingPool}`;
  }
}

// 类型安全的建造者
class HouseBuilder {
  private house: House;

  constructor() {
    this.house = new House();
  }

  setWalls(count: number): this {
    this.house.walls = count;
    return this;
  }

  setDoors(count: number): this {
    this.house.doors = count;
    return this;
  }

  setWindows(count: number): this {
    this.house.windows = count;
    return this;
  }

  addGarage(): this {
    this.house.hasGarage = true;
    return this;
  }

  addSwimmingPool(): this {
    this.house.hasSwimmingPool = true;
    return this;
  }

  build(): House {
    return this.house;
  }
}

// 导演类
class HouseDirector {
  constructor(private builder: HouseBuilder) {}

  constructSimpleHouse(): House {
    return this.builder
      .setWalls(4)
      .setDoors(1)
      .setWindows(4)
      .build();
  }

  constructLuxuryHouse(): House {
    return this.builder
      .setWalls(8)
      .setDoors(3)
      .setWindows(12)
      .addGarage()
      .addSwimmingPool()
      .build();
  }
}

/**
 * 5. 原型模式 (Prototype Pattern)
 * 使用结构化克隆创建对象副本
 */
interface Cloneable<T> {
  clone(): T;
}

class Document implements Cloneable<Document> {
  constructor(
    public title: string,
    public content: string,
    public metadata: { author: string; createdAt: Date }
  ) {}

  // 浅拷贝
  clone(): Document {
    // 使用 Object.assign 创建浅拷贝
    const cloned = Object.assign(
      Object.create(Object.getPrototypeOf(this)),
      this
    );
    return cloned;
  }

  // 深拷贝（结构化克隆）
  deepClone(): Document {
    // 使用 JSON 方法进行深拷贝（简单实现）
    const json = JSON.stringify(this);
    const parsed = JSON.parse(json);
    return new Document(parsed.title, parsed.content, {
      author: parsed.metadata.author,
      createdAt: new Date(parsed.metadata.createdAt)
    });
  }

  // 使用结构化克隆 API（现代浏览器）
  structuredClone(): Document {
    return globalThis.structuredClone(this);
  }
}

// ============================================
// 结构型模式 (Structural Patterns)
// ============================================

/**
 * 6. 适配器模式 (Adapter Pattern)
 * 接口适配，将不兼容的接口转换为兼容的接口
 */
// 目标接口
interface IMediaPlayer {
  play(audioType: string, fileName: string): void;
}

// 被适配者接口
interface IAdvancedMediaPlayer {
  playVlc(fileName: string): void;
  playMp4(fileName: string): void;
}

// 具体被适配者 - VLC播放器
class VlcPlayer implements IAdvancedMediaPlayer {
  playVlc(fileName: string): void {
    console.log(`Playing vlc file: ${fileName}`);
  }
  playMp4(fileName: string): void {
    // 什么都不做
  }
}

// 具体被适配者 - MP4播放器
class Mp4Player implements IAdvancedMediaPlayer {
  playVlc(fileName: string): void {
    // 什么都不做
  }
  playMp4(fileName: string): void {
    console.log(`Playing mp4 file: ${fileName}`);
  }
}

// 适配器类
class MediaAdapter implements IMediaPlayer {
  private advancedPlayer: IAdvancedMediaPlayer | null = null;

  constructor(audioType: string) {
    if (audioType === 'vlc') {
      this.advancedPlayer = new VlcPlayer();
    } else if (audioType === 'mp4') {
      this.advancedPlayer = new Mp4Player();
    }
  }

  play(audioType: string, fileName: string): void {
    if (audioType === 'vlc' && this.advancedPlayer) {
      this.advancedPlayer.playVlc(fileName);
    } else if (audioType === 'mp4' && this.advancedPlayer) {
      this.advancedPlayer.playMp4(fileName);
    }
  }
}

// 音频播放器（使用适配器）
class AudioPlayer implements IMediaPlayer {
  private mediaAdapter: MediaAdapter | null = null;

  play(audioType: string, fileName: string): void {
    if (audioType === 'mp3') {
      console.log(`Playing mp3 file: ${fileName}`);
    } else if (audioType === 'vlc' || audioType === 'mp4') {
      this.mediaAdapter = new MediaAdapter(audioType);
      this.mediaAdapter.play(audioType, fileName);
    } else {
      console.log(`Invalid media. ${audioType} format not supported`);
    }
  }
}

/**
 * 7. 桥接模式 (Bridge Pattern)
 * 抽象与实现分离，两者可以独立变化
 */
// 实现接口
interface IDrawAPI {
  drawCircle(radius: number, x: number, y: number): void;
  drawRectangle(width: number, height: number, x: number, y: number): void;
}

// 具体实现 - 红色圆形
class RedCircle implements IDrawAPI {
  drawCircle(radius: number, x: number, y: number): void {
    console.log(`Drawing Circle[ color: red, radius: ${radius}, x: ${x}, y: ${y}]`);
  }
  drawRectangle(width: number, height: number, x: number, y: number): void {
    console.log(`Drawing Rectangle[ color: red, width: ${width}, height: ${height}]`);
  }
}

// 具体实现 - 绿色圆形
class GreenCircle implements IDrawAPI {
  drawCircle(radius: number, x: number, y: number): void {
    console.log(`Drawing Circle[ color: green, radius: ${radius}, x: ${x}, y: ${y}]`);
  }
  drawRectangle(width: number, height: number, x: number, y: number): void {
    console.log(`Drawing Rectangle[ color: green, width: ${width}, height: ${height}]`);
  }
}

// 抽象类
abstract class Shape {
  protected drawAPI: IDrawAPI;

  protected constructor(drawAPI: IDrawAPI) {
    this.drawAPI = drawAPI;
  }

  abstract draw(): void;
}

// 扩展的抽象类
class Circle extends Shape {
  private x: number;
  private y: number;
  private radius: number;

  constructor(x: number, y: number, radius: number, drawAPI: IDrawAPI) {
    super(drawAPI);
    this.x = x;
    this.y = y;
    this.radius = radius;
  }

  draw(): void {
    this.drawAPI.drawCircle(this.radius, this.x, this.y);
  }
}

class Rectangle extends Shape {
  private x: number;
  private y: number;
  private width: number;
  private height: number;

  constructor(x: number, y: number, width: number, height: number, drawAPI: IDrawAPI) {
    super(drawAPI);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  draw(): void {
    this.drawAPI.drawRectangle(this.width, this.height, this.x, this.y);
  }
}

/**
 * 8. 组合模式 (Composite Pattern)
 * 使用递归类型处理树形结构
 */
// 组件接口
interface IEmployee {
  getName(): string;
  getSalary(): number;
  getRole(): string;
  showDetails(indent?: string): void;
}

// 叶子节点 - 开发者
class Developer implements IEmployee {
  constructor(
    private name: string,
    private salary: number
  ) {}

  getName(): string {
    return this.name;
  }

  getSalary(): number {
    return this.salary;
  }

  getRole(): string {
    return 'Developer';
  }

  showDetails(indent: string = ''): void {
    console.log(`${indent}${this.getRole()}: ${this.getName()} ($${this.getSalary()})`);
  }
}

// 叶子节点 - 设计师
class Designer implements IEmployee {
  constructor(
    private name: string,
    private salary: number
  ) {}

  getName(): string {
    return this.name;
  }

  getSalary(): number {
    return this.salary;
  }

  getRole(): string {
    return 'Designer';
  }

  showDetails(indent: string = ''): void {
    console.log(`${indent}${this.getRole()}: ${this.getName()} ($${this.getSalary()})`);
  }
}

// 组合节点 - 经理（递归类型）
class Manager implements IEmployee {
  private subordinates: IEmployee[] = [];

  constructor(
    private name: string,
    private salary: number
  ) {}

  getName(): string {
    return this.name;
  }

  getSalary(): number {
    return this.salary;
  }

  getRole(): string {
    return 'Manager';
  }

  add(employee: IEmployee): void {
    this.subordinates.push(employee);
  }

  remove(employee: IEmployee): void {
    const index = this.subordinates.indexOf(employee);
    if (index !== -1) {
      this.subordinates.splice(index, 1);
    }
  }

  getSubordinates(): IEmployee[] {
    return [...this.subordinates];
  }

  showDetails(indent: string = ''): void {
    console.log(`${indent}${this.getRole()}: ${this.getName()} ($${this.getSalary()})`);
    for (const employee of this.subordinates) {
      employee.showDetails(indent + '  ');
    }
  }

  getTotalSalary(): number {
    let total = this.salary;
    for (const employee of this.subordinates) {
      if (employee instanceof Manager) {
        total += employee.getTotalSalary();
      } else {
        total += employee.getSalary();
      }
    }
    return total;
  }
}

// 递归类型定义示例
type TreeNode<T> = {
  value: T;
  children?: TreeNode<T>[];
};

// 泛型组合类
class GenericComposite<T> {
  private children: GenericComposite<T>[] = [];
  private parent: GenericComposite<T> | null = null;

  constructor(private data: T) {}

  add(child: GenericComposite<T>): void {
    child.parent = this;
    this.children.push(child);
  }

  remove(child: GenericComposite<T>): void {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
    }
  }

  getChildren(): GenericComposite<T>[] {
    return [...this.children];
  }

  getData(): T {
    return this.data;
  }

  traverse(callback: (data: T) => void): void {
    callback(this.data);
    for (const child of this.children) {
      child.traverse(callback);
    }
  }
}

/**
 * 9. 装饰器模式 (Decorator Pattern)
 * 使用 TS 装饰器 + 高阶函数实现
 */
// TypeScript 装饰器示例
function logDecorator(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyKey} with args:`, args);
    const result = originalMethod.apply(this, args);
    console.log(`${propertyKey} returned:`, result);
    return result;
  };
  return descriptor;
}

function measureTime(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = function (...args: any[]) {
    const start = performance.now();
    const result = originalMethod.apply(this, args);
    const end = performance.now();
    console.log(`${propertyKey} took ${end - start} milliseconds`);
    return result;
  };
  return descriptor;
}

// 组件接口
interface ICoffee {
  cost(): number;
  description(): string;
}

// 具体组件
class SimpleCoffee implements ICoffee {
  cost(): number {
    return 10;
  }

  description(): string {
    return 'Simple coffee';
  }
}

// 装饰器基类
abstract class CoffeeDecorator implements ICoffee {
  protected decoratedCoffee: ICoffee;

  constructor(coffee: ICoffee) {
    this.decoratedCoffee = coffee;
  }

  cost(): number {
    return this.decoratedCoffee.cost();
  }

  description(): string {
    return this.decoratedCoffee.description();
  }
}

// 具体装饰器 - 牛奶
class MilkDecorator extends CoffeeDecorator {
  cost(): number {
    return this.decoratedCoffee.cost() + 2;
  }

  description(): string {
    return this.decoratedCoffee.description() + ', milk';
  }
}

// 具体装饰器 - 糖
class SugarDecorator extends CoffeeDecorator {
  cost(): number {
    return this.decoratedCoffee.cost() + 1;
  }

  description(): string {
    return this.decoratedCoffee.description() + ', sugar';
  }
}

// 高阶函数装饰器（函数式编程风格）
function withLogging<T extends (...args: any[]) => any>(fn: T): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    console.log(`Function called with:`, args);
    const result = fn(...args);
    console.log(`Function returned:`, result);
    return result;
  }) as T;
}

function withCache<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      console.log('Cache hit for key:', key);
      return cache.get(key)!;
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * 10. 外观模式 (Facade Pattern)
 * 提供简化的统一接口
 */
// 子系统 - CPU
class CPU {
  freeze(): void {
    console.log('CPU: Freezing processor');
  }

  jump(position: number): void {
    console.log(`CPU: Jumping to position ${position}`);
  }

  execute(): void {
    console.log('CPU: Executing instructions');
  }
}

// 子系统 - 内存
class Memory {
  load(position: number, data: string): void {
    console.log(`Memory: Loading "${data}" at position ${position}`);
  }
}

// 子系统 - 硬盘
class HardDrive {
  read(lba: number, size: number): string {
    console.log(`HardDrive: Reading ${size} bytes from LBA ${lba}`);
    return 'data';
  }
}

// 外观类 - 计算机外观
class ComputerFacade {
  private cpu: CPU;
  private memory: Memory;
  private hardDrive: HardDrive;

  constructor() {
    this.cpu = new CPU();
    this.memory = new Memory();
    this.hardDrive = new HardDrive();
  }

  // 简化启动方法
  start(): void {
    console.log('=== Starting Computer ===');
    this.cpu.freeze();
    const bootData = this.hardDrive.read(0, 1024);
    this.memory.load(0, bootData);
    this.cpu.jump(0);
    this.cpu.execute();
    console.log('=== Computer Started ===\n');
  }

  // 简化关机方法
  shutdown(): void {
    console.log('=== Shutting Down Computer ===');
    console.log('Saving data...');
    console.log('Stopping processes...');
    console.log('Power off');
    console.log('=== Computer Shutdown ===\n');
  }
}

// API 外观示例
class APIFacade {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`);
    return response.json();
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE'
    });
    return response.json();
  }
}

/**
 * 11. 享元模式 (Flyweight Pattern)
 * 使用对象池和享元工厂共享对象
 */
// 享元接口
interface IShape {
  draw(x: number, y: number): void;
}

// 具体享元 - 圆形
class CircleFlyweight implements IShape {
  constructor(private color: string) {}

  draw(x: number, y: number): void {
    console.log(`Drawing ${this.color} circle at (${x}, ${y})`);
  }

  getColor(): string {
    return this.color;
  }
}

// 享元工厂 - 管理对象池
class ShapeFactory {
  private static circleMap: Map<string, CircleFlyweight> = new Map();

  static getCircle(color: string): CircleFlyweight {
    let circle = this.circleMap.get(color);
    if (!circle) {
      circle = new CircleFlyweight(color);
      this.circleMap.set(color, circle);
      console.log(`Creating new ${color} circle`);
    }
    return circle;
  }

  static getCircleCount(): number {
    return this.circleMap.size;
  }

  static clearPool(): void {
    this.circleMap.clear();
  }
}

// 通用对象池实现
class ObjectPool<T> {
  private available: T[] = [];
  private inUse: Set<T> = new Set();
  private factory: () => T;
  private reset: (obj: T) => void;

  constructor(factory: () => T, reset: (obj: T) => void, initialSize: number = 0) {
    this.factory = factory;
    this.reset = reset;
    
    for (let i = 0; i < initialSize; i++) {
      this.available.push(this.factory());
    }
  }

  acquire(): T {
    let obj: T;
    if (this.available.length > 0) {
      obj = this.available.pop()!;
    } else {
      obj = this.factory();
    }
    this.inUse.add(obj);
    return obj;
  }

  release(obj: T): void {
    if (this.inUse.has(obj)) {
      this.inUse.delete(obj);
      this.reset(obj);
      this.available.push(obj);
    }
  }

  getAvailableCount(): number {
    return this.available.length;
  }

  getInUseCount(): number {
    return this.inUse.size;
  }
}

// 连接池示例
class DatabaseConnection {
  id: number;
  isConnected: boolean = false;

  constructor(id: number) {
    this.id = id;
  }

  connect(): void {
    this.isConnected = true;
    console.log(`Connection ${this.id} connected`);
  }

  disconnect(): void {
    this.isConnected = false;
    console.log(`Connection ${this.id} disconnected`);
  }

  query(sql: string): void {
    if (this.isConnected) {
      console.log(`Executing: ${sql}`);
    }
  }
}

class ConnectionPool {
  private static instance: ObjectPool<DatabaseConnection>;
  private static connectionId = 0;

  static getInstance(): ObjectPool<DatabaseConnection> {
    if (!this.instance) {
      this.instance = new ObjectPool<DatabaseConnection>(
        () => new DatabaseConnection(++this.connectionId),
        (conn) => {
          conn.disconnect();
          conn.id = 0;
        },
        5
      );
    }
    return this.instance;
  }
}

/**
 * 12. 代理模式 (Proxy Pattern)
 * 使用 ES6 Proxy 和虚拟代理
 */
// 主题接口
interface IImage {
  display(): void;
  getFileName(): string;
}

// 真实主题
class RealImage implements IImage {
  private fileName: string;

  constructor(fileName: string) {
    this.fileName = fileName;
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    console.log(`Loading ${this.fileName}`);
  }

  display(): void {
    console.log(`Displaying ${this.fileName}`);
  }

  getFileName(): string {
    return this.fileName;
  }
}

// 虚拟代理
class ProxyImage implements IImage {
  private realImage: RealImage | null = null;
  private fileName: string;

  constructor(fileName: string) {
    this.fileName = fileName;
  }

  display(): void {
    if (!this.realImage) {
      this.realImage = new RealImage(this.fileName);
    }
    this.realImage.display();
  }

  getFileName(): string {
    return this.fileName;
  }
}

// 保护代理
interface IUser {
  name: string;
  role: 'admin' | 'user' | 'guest';
}

interface IDocument {
  read(user: IUser): string;
  write(user: IUser, content: string): void;
}

class ProtectedDocument implements IDocument {
  private content: string = '';

  constructor(private documentName: string) {}

  read(user: IUser): string {
    console.log(`${user.name} is reading ${this.documentName}`);
    return this.content;
  }

  write(user: IUser, content: string): void {
    this.content = content;
    console.log(`${user.name} wrote to ${this.documentName}`);
  }
}

class DocumentProxy implements IDocument {
  private document: ProtectedDocument;

  constructor(documentName: string) {
    this.document = new ProtectedDocument(documentName);
  }

  read(user: IUser): string {
    // 所有用户都可以读取
    return this.document.read(user);
  }

  write(user: IUser, content: string): void {
    // 只有管理员可以写入
    if (user.role === 'admin') {
      this.document.write(user, content);
    } else {
      console.log(`Access denied: ${user.name} cannot write to this document`);
    }
  }
}

// ES6 Proxy 示例
function createLoggingProxy<T extends object>(target: T): T {
  return new Proxy(target, {
    get(obj, prop) {
      console.log(`Getting property: ${String(prop)}`);
      return (obj as any)[prop];
    },
    set(obj, prop, value) {
      console.log(`Setting property: ${String(prop)} = ${value}`);
      (obj as any)[prop] = value;
      return true;
    }
  });
}

function createValidationProxy<T extends object>(
  target: T,
  validator: (prop: string | symbol, value: any) => boolean
): T {
  return new Proxy(target, {
    set(obj, prop, value) {
      if (validator(prop, value)) {
        (obj as any)[prop] = value;
        return true;
      }
      throw new Error(`Invalid value for property ${String(prop)}: ${value}`);
    }
  });
}

// ============================================
// 行为型模式 (Behavioral Patterns)
// ============================================

/**
 * 13. 责任链模式 (Chain of Responsibility Pattern)
 * 中间件模式实现
 */
// 处理者接口
type Request = {
  type: string;
  payload: unknown;
};

type Response = {
  status: 'success' | 'error';
  data?: unknown;
  message?: string;
};

type NextFunction = () => void;
type Middleware = (req: Request, res: Response, next: NextFunction) => void;

class MiddlewareChain {
  private middlewares: Middleware[] = [];
  private currentIndex = 0;

  use(middleware: Middleware): this {
    this.middlewares.push(middleware);
    return this;
  }

  execute(req: Request): Response {
    const res: Response = { status: 'success' };
    this.currentIndex = 0;

    const next = (): void => {
      if (this.currentIndex < this.middlewares.length) {
        const middleware = this.middlewares[this.currentIndex++];
        middleware(req, res, next);
      }
    };

    next();
    return res;
  }
}

// 具体处理器示例 - 日志中间件
const loggingMiddleware: Middleware = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.type}`);
  next();
};

// 具体处理器示例 - 认证中间件
const authMiddleware: Middleware = (req, res, next) => {
  if (req.type === 'protected') {
    // 模拟认证检查
    const isAuthenticated = (req.payload as any)?.token === 'valid';
    if (!isAuthenticated) {
      res.status = 'error';
      res.message = 'Unauthorized';
      return;
    }
  }
  next();
};

// 经典责任链实现
abstract class Handler {
  protected nextHandler: Handler | null = null;

  setNext(handler: Handler): Handler {
    this.nextHandler = handler;
    return handler;
  }

  handle(request: number): string | null {
    if (this.nextHandler) {
      return this.nextHandler.handle(request);
    }
    return null;
  }
}

class ConcreteHandlerA extends Handler {
  handle(request: number): string | null {
    if (request < 10) {
      return `HandlerA handled request: ${request}`;
    }
    return super.handle(request);
  }
}

class ConcreteHandlerB extends Handler {
  handle(request: number): string | null {
    if (request >= 10 && request < 20) {
      return `HandlerB handled request: ${request}`;
    }
    return super.handle(request);
  }
}

class ConcreteHandlerC extends Handler {
  handle(request: number): string | null {
    if (request >= 20) {
      return `HandlerC handled request: ${request}`;
    }
    return super.handle(request);
  }
}

/**
 * 14. 命令模式 (Command Pattern)
 * 支持撤销/重做功能
 */
// 命令接口
interface ICommand {
  execute(): void;
  undo(): void;
  getName(): string;
}

// 接收者
class TextEditor {
  private content: string = '';

  write(text: string): void {
    this.content += text;
  }

  delete(length: number): string {
    const deleted = this.content.slice(-length);
    this.content = this.content.slice(0, -length);
    return deleted;
  }

  getContent(): string {
    return this.content;
  }

  insertAt(position: number, text: string): void {
    this.content = this.content.slice(0, position) + text + this.content.slice(position);
  }
}

// 具体命令 - 写入
class WriteCommand implements ICommand {
  constructor(
    private editor: TextEditor,
    private text: string
  ) {}

  execute(): void {
    this.editor.write(this.text);
  }

  undo(): void {
    this.editor.delete(this.text.length);
  }

  getName(): string {
    return `Write "${this.text}"`;
  }
}

// 具体命令 - 删除
class DeleteCommand implements ICommand {
  private deletedText: string = '';

  constructor(
    private editor: TextEditor,
    private length: number
  ) {}

  execute(): void {
    this.deletedText = this.editor.delete(this.length);
  }

  undo(): void {
    this.editor.write(this.deletedText);
  }

  getName(): string {
    return `Delete ${this.length} chars`;
  }
}

// 命令历史管理器（支持撤销/重做）
class CommandHistory {
  private history: ICommand[] = [];
  private currentIndex = -1;
  private maxSize = 100;

  execute(command: ICommand): void {
    // 清除当前位置之后的所有命令（新分支）
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    command.execute();
    this.history.push(command);
    this.currentIndex++;

    // 限制历史大小
    if (this.history.length > this.maxSize) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  undo(): boolean {
    if (this.currentIndex >= 0) {
      const command = this.history[this.currentIndex];
      command.undo();
      this.currentIndex--;
      console.log(`Undone: ${command.getName()}`);
      return true;
    }
    console.log('Nothing to undo');
    return false;
  }

  redo(): boolean {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      const command = this.history[this.currentIndex];
      command.execute();
      console.log(`Redone: ${command.getName()}`);
      return true;
    }
    console.log('Nothing to redo');
    return false;
  }

  getHistory(): string[] {
    return this.history.map((cmd, index) => 
      `${index === this.currentIndex ? '>' : ' '} ${cmd.getName()}`
    );
  }
}

/**
 * 15. 解释器模式 (Interpreter Pattern)
 * DSL（领域特定语言）实现
 */
// 抽象表达式
interface IExpression {
  interpret(context: Map<string, number>): number;
}

// 终结符表达式 - 数字
class NumberExpression implements IExpression {
  constructor(private value: number) {}

  interpret(): number {
    return this.value;
  }
}

// 终结符表达式 - 变量
class VariableExpression implements IExpression {
  constructor(private name: string) {}

  interpret(context: Map<string, number>): number {
    const value = context.get(this.name);
    if (value === undefined) {
      throw new Error(`Variable ${this.name} not found`);
    }
    return value;
  }
}

// 非终结符表达式 - 加法
class AddExpression implements IExpression {
  constructor(
    private left: IExpression,
    private right: IExpression
  ) {}

  interpret(context: Map<string, number>): number {
    return this.left.interpret(context) + this.right.interpret(context);
  }
}

// 非终结符表达式 - 减法
class SubtractExpression implements IExpression {
  constructor(
    private left: IExpression,
    private right: IExpression
  ) {}

  interpret(context: Map<string, number>): number {
    return this.left.interpret(context) - this.right.interpret(context);
  }
}

// 非终结符表达式 - 乘法
class MultiplyExpression implements IExpression {
  constructor(
    private left: IExpression,
    private right: IExpression
  ) {}

  interpret(context: Map<string, number>): number {
    return this.left.interpret(context) * this.right.interpret(context);
  }
}

// 解析器 - 构建表达式树
class ExpressionParser {
  private tokens: string[] = [];
  private position = 0;

  parse(expression: string): IExpression {
    this.tokens = expression.match(/\d+\.?\d*|\w+|[-+*/()]|\s+/g)?.filter(t => t.trim()) || [];
    this.position = 0;
    return this.parseExpression();
  }

  private parseExpression(): IExpression {
    let left = this.parseTerm();

    while (this.currentToken() === '+' || this.currentToken() === '-') {
      const operator = this.consume();
      const right = this.parseTerm();
      if (operator === '+') {
        left = new AddExpression(left, right);
      } else {
        left = new SubtractExpression(left, right);
      }
    }

    return left;
  }

  private parseTerm(): IExpression {
    let left = this.parseFactor();

    while (this.currentToken() === '*') {
      this.consume(); // *
      const right = this.parseFactor();
      left = new MultiplyExpression(left, right);
    }

    return left;
  }

  private parseFactor(): IExpression {
    const token = this.consume();

    if (token === '(') {
      const expr = this.parseExpression();
      this.consume(); // )
      return expr;
    }

    if (/^\d+$/.test(token)) {
      return new NumberExpression(parseFloat(token));
    }

    return new VariableExpression(token);
  }

  private currentToken(): string {
    return this.tokens[this.position] || '';
  }

  private consume(): string {
    return this.tokens[this.position++] || '';
  }
}

// 简单的规则引擎 DSL
class Rule {
  constructor(
    private condition: (context: Record<string, any>) => boolean,
    private action: (context: Record<string, any>) => void
  ) {}

  evaluate(context: Record<string, any>): boolean {
    if (this.condition(context)) {
      this.action(context);
      return true;
    }
    return false;
  }
}

class RuleEngine {
  private rules: Rule[] = [];

  addRule(rule: Rule): void {
    this.rules.push(rule);
  }

  execute(context: Record<string, any>): void {
    for (const rule of this.rules) {
      rule.evaluate(context);
    }
  }
}

/**
 * 16. 迭代器模式 (Iterator Pattern)
 * 使用 Symbol.iterator 实现
 */
// 自定义迭代器
class Book {
  constructor(
    public title: string,
    public author: string
  ) {}
}

class BookCollection implements Iterable<Book> {
  private books: Book[] = [];

  addBook(book: Book): void {
    this.books.push(book);
  }

  // 实现 Symbol.iterator
  [Symbol.iterator](): Iterator<Book> {
    let index = 0;
    const books = this.books;

    return {
      next(): IteratorResult<Book> {
        if (index < books.length) {
          return { value: books[index++], done: false };
        }
        return { value: undefined, done: true };
      }
    };
  }

  // 反向迭代器
  reverseIterator(): Iterator<Book> {
    let index = this.books.length - 1;
    const books = this.books;

    return {
      next(): IteratorResult<Book> {
        if (index >= 0) {
          return { value: books[index--], done: false };
        }
        return { value: undefined, done: true };
      }
    };
  }

  // 过滤迭代器
  *filterIterator(predicate: (book: Book) => boolean): Generator<Book> {
    for (const book of this.books) {
      if (predicate(book)) {
        yield book;
      }
    }
  }
}

// 泛型迭代器
class GenericIterator<T> implements Iterator<T> {
  private index = 0;

  constructor(private items: T[]) {}

  next(): IteratorResult<T> {
    if (this.index < this.items.length) {
      return { value: this.items[this.index++], done: false };
    }
    return { value: undefined, done: true };
  }

  reset(): void {
    this.index = 0;
  }
}

// 分页迭代器
class PaginatedIterator<T> implements Iterator<T[]> {
  private currentPage = 0;

  constructor(
    private items: T[],
    private pageSize: number
  ) {}

  next(): IteratorResult<T[]> {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    
    if (start < this.items.length) {
      this.currentPage++;
      return { value: this.items.slice(start, end), done: false };
    }
    return { value: undefined, done: true };
  }

  hasNext(): boolean {
    const start = (this.currentPage + 1) * this.pageSize;
    return start < this.items.length;
  }

  reset(): void {
    this.currentPage = 0;
  }
}

/**
 * 17. 中介者模式 (Mediator Pattern)
 * 事件总线实现
 */
// 中介者接口
interface IMediator {
  send(message: string, sender: Colleague): void;
  register(colleague: Colleague): void;
}

// 同事类
abstract class Colleague {
  protected mediator: IMediator;
  protected name: string;

  constructor(mediator: IMediator, name: string) {
    this.mediator = mediator;
    this.name = name;
  }

  abstract receive(message: string): void;
  abstract send(message: string): void;

  getName(): string {
    return this.name;
  }
}

// 具体同事 - 用户
class User extends Colleague {
  receive(message: string): void {
    console.log(`${this.name} received: ${message}`);
  }

  send(message: string): void {
    console.log(`${this.name} sends: ${message}`);
    this.mediator.send(message, this);
  }
}

// 具体中介者 - 聊天室
class ChatRoom implements IMediator {
  private users: User[] = [];

  register(colleague: Colleague): void {
    if (colleague instanceof User) {
      this.users.push(colleague);
    }
  }

  send(message: string, sender: Colleague): void {
    for (const user of this.users) {
      if (user !== sender) {
        user.receive(message);
      }
    }
  }
}

// 事件总线实现
type EventHandler<T = any> = (data: T) => void;

class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  on<T>(event: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);

    // 返回取消订阅函数
    return () => this.off(event, handler);
  }

  off<T>(event: string, handler: EventHandler<T>): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit<T>(event: string, data?: T): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  once<T>(event: string, handler: EventHandler<T>): void {
    const onceHandler = (data: T) => {
      handler(data);
      this.off(event, onceHandler);
    };
    this.on(event, onceHandler);
  }

  clear(event?: string): void {
    if (event) {
      this.handlers.delete(event);
    } else {
      this.handlers.clear();
    }
  }
}

/**
 * 18. 备忘录模式 (Memento Pattern)
 * 状态保存与恢复
 */
// 备忘录接口
interface IMemento {
  getState(): string;
  getDate(): string;
}

// 具体备忘录
class EditorMemento implements IMemento {
  constructor(
    private state: string,
    private date: string = new Date().toISOString()
  ) {}

  getState(): string {
    return this.state;
  }

  getDate(): string {
    return this.date;
  }
}

// 原发器 - 编辑器
class TextEditorWithMemento {
  private content: string = '';

  type(words: string): void {
    this.content += words;
  }

  getContent(): string {
    return this.content;
  }

  setContent(content: string): void {
    this.content = content;
  }

  save(): EditorMemento {
    return new EditorMemento(this.content);
  }

  restore(memento: EditorMemento): void {
    this.content = memento.getState();
  }
}

// 管理者 - 历史记录
class History {
  private mementos: EditorMemento[] = [];

  push(memento: EditorMemento): void {
    this.mementos.push(memento);
  }

  pop(): EditorMemento | undefined {
    return this.mementos.pop();
  }

  getHistory(): EditorMemento[] {
    return [...this.mementos];
  }
}

// 通用状态管理器
class StateManager<T> {
  private states: { state: T; timestamp: number }[] = [];
  private currentIndex = -1;
  private maxStates = 50;

  save(state: T): void {
    // 移除当前位置之后的状态
    this.states = this.states.slice(0, this.currentIndex + 1);
    
    this.states.push({
      state: JSON.parse(JSON.stringify(state)), // 深拷贝
      timestamp: Date.now()
    });
    this.currentIndex++;

    // 限制状态数量
    if (this.states.length > this.maxStates) {
      this.states.shift();
      this.currentIndex--;
    }
  }

  undo(): T | null {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.states[this.currentIndex].state;
    }
    return null;
  }

  redo(): T | null {
    if (this.currentIndex < this.states.length - 1) {
      this.currentIndex++;
      return this.states[this.currentIndex].state;
    }
    return null;
  }

  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.states.length - 1;
  }

  getHistory(): { timestamp: number; index: number }[] {
    return this.states.map((s, i) => ({
      timestamp: s.timestamp,
      index: i
    }));
  }
}

/**
 * 19. 观察者模式 (Observer Pattern)
 * EventEmitter 实现
 */
// 观察者接口
interface IObserver {
  update(subject: ISubject): void;
}

// 主题接口
interface ISubject {
  attach(observer: IObserver): void;
  detach(observer: IObserver): void;
  notify(): void;
}

// 具体主题
class WeatherStation implements ISubject {
  private observers: IObserver[] = [];
  private temperature = 0;

  attach(observer: IObserver): void {
    this.observers.push(observer);
  }

  detach(observer: IObserver): void {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }

  notify(): void {
    for (const observer of this.observers) {
      observer.update(this);
    }
  }

  setTemperature(temp: number): void {
    this.temperature = temp;
    console.log(`WeatherStation: Temperature changed to ${temp}`);
    this.notify();
  }

  getTemperature(): number {
    return this.temperature;
  }
}

// 具体观察者
class PhoneDisplay implements IObserver {
  private temperature = 0;

  update(subject: WeatherStation): void {
    this.temperature = subject.getTemperature();
    console.log(`PhoneDisplay: Temperature is now ${this.temperature}`);
  }
}

class WindowDisplay implements IObserver {
  private temperature = 0;

  update(subject: WeatherStation): void {
    this.temperature = subject.getTemperature();
    console.log(`WindowDisplay: Temperature is now ${this.temperature}`);
  }
}

// EventEmitter 实现
class EventEmitter<T extends Record<string, any> = Record<string, any>> {
  private listeners: Map<keyof T, Array<(data: T[keyof T]) => void>> = new Map();

  on<K extends keyof T>(event: K, listener: (data: T[K]) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);

    return () => this.off(event, listener);
  }

  off<K extends keyof T>(event: K, listener: (data: T[K]) => void): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  once<K extends keyof T>(event: K, listener: (data: T[K]) => void): void {
    const onceListener = (data: T[K]) => {
      listener(data);
      this.off(event, onceListener);
    };
    this.on(event, onceListener);
  }

  listenerCount<K extends keyof T>(event: K): number {
    return this.listeners.get(event)?.length || 0;
  }

  removeAllListeners<K extends keyof T>(event?: K): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

// 类型化事件定义示例
interface AppEvents {
  'user:login': { userId: string; timestamp: number };
  'user:logout': { userId: string };
  'data:updated': { entity: string; id: string };
}

class TypedEventEmitter extends EventEmitter<AppEvents> {}

/**
 * 20. 状态模式 (State Pattern)
 * 状态机 + 类型安全
 */
// 状态接口
type DocumentState = 'draft' | 'moderation' | 'published';

interface IDocumentState {
  render(): void;
  publish(): void;
}

// 上下文
class DocumentWithState {
  private state: IDocumentState;
  private _content: string = '';

  constructor() {
    this.state = new DraftState(this);
  }

  changeState(state: IDocumentState): void {
    this.state = state;
  }

  render(): void {
    this.state.render();
  }

  publish(): void {
    this.state.publish();
  }

  set content(value: string) {
    this._content = value;
  }

  get content(): string {
    return this._content;
  }
}

// 具体状态 - 草稿
class DraftState implements IDocumentState {
  constructor(private document: DocumentWithState) {}

  render(): void {
    console.log('Draft document preview:', this.document.content);
  }

  publish(): void {
    console.log('Sending document to moderation...');
    this.document.changeState(new ModerationState(this.document));
  }
}

// 具体状态 - 审核中
class ModerationState implements IDocumentState {
  constructor(private document: DocumentWithState) {}

  render(): void {
    console.log('Document under moderation');
  }

  publish(): void {
    if (this.approveContent()) {
      console.log('Document approved and published!');
      this.document.changeState(new PublishedState(this.document));
    } else {
      console.log('Document rejected, returning to draft');
      this.document.changeState(new DraftState(this.document));
    }
  }

  private approveContent(): boolean {
    // 模拟审核逻辑
    return this.document.content.length > 10;
  }
}

// 具体状态 - 已发布
class PublishedState implements IDocumentState {
  constructor(private document: DocumentWithState) {}

  render(): void {
    console.log('Published document:', this.document.content);
  }

  publish(): void {
    console.log('Document is already published');
  }
}

// 类型安全的状态机
class StateMachine<S extends string, E extends string> {
  private currentState: S;
  private transitions: Map<S, Map<E, S>> = new Map();
  private handlers: Map<S, () => void> = new Map();

  constructor(initialState: S) {
    this.currentState = initialState;
  }

  addTransition(from: S, event: E, to: S): this {
    if (!this.transitions.has(from)) {
      this.transitions.set(from, new Map());
    }
    this.transitions.get(from)!.set(event, to);
    return this;
  }

  onEnter(state: S, handler: () => void): this {
    this.handlers.set(state, handler);
    return this;
  }

  transition(event: E): boolean {
    const stateTransitions = this.transitions.get(this.currentState);
    if (stateTransitions && stateTransitions.has(event)) {
      const newState = stateTransitions.get(event)!;
      console.log(`Transition: ${this.currentState} --${event}--> ${newState}`);
      this.currentState = newState;
      const handler = this.handlers.get(newState);
      if (handler) handler();
      return true;
    }
    console.log(`No transition for ${event} from ${this.currentState}`);
    return false;
  }

  getCurrentState(): S {
    return this.currentState;
  }

  canTransition(event: E): boolean {
    const stateTransitions = this.transitions.get(this.currentState);
    return stateTransitions?.has(event) || false;
  }
}

// 使用示例类型
type TrafficLightState = 'red' | 'yellow' | 'green';
type TrafficLightEvent = 'timer' | 'panic';

/**
 * 21. 策略模式 (Strategy Pattern)
 * 策略接口 + 上下文
 */
// 策略接口
interface IPaymentStrategy {
  pay(amount: number): string;
  validate(): boolean;
}

// 具体策略 - 信用卡支付
class CreditCardPayment implements IPaymentStrategy {
  constructor(
    private cardNumber: string,
    private cvv: string,
    private expiryDate: string
  ) {}

  validate(): boolean {
    return this.cardNumber.length === 16 && this.cvv.length === 3;
  }

  pay(amount: number): string {
    if (!this.validate()) {
      return 'Invalid credit card details';
    }
    return `Paid $${amount} using Credit Card ending in ${this.cardNumber.slice(-4)}`;
  }
}

// 具体策略 - PayPal支付
class PayPalPayment implements IPaymentStrategy {
  constructor(
    private email: string,
    private password: string
  ) {}

  validate(): boolean {
    return this.email.includes('@') && this.password.length >= 8;
  }

  pay(amount: number): string {
    if (!this.validate()) {
      return 'Invalid PayPal credentials';
    }
    return `Paid $${amount} using PayPal account ${this.email}`;
  }
}

// 具体策略 - 比特币支付
class BitcoinPayment implements IPaymentStrategy {
  constructor(private walletAddress: string) {}

  validate(): boolean {
    return this.walletAddress.startsWith('1') || this.walletAddress.startsWith('3');
  }

  pay(amount: number): string {
    if (!this.validate()) {
      return 'Invalid Bitcoin wallet address';
    }
    return `Paid $${amount} using Bitcoin wallet ${this.walletAddress.slice(0, 10)}...`;
  }
}

// 上下文
class ShoppingCart {
  private strategy: IPaymentStrategy | null = null;
  private items: { name: string; price: number }[] = [];

  addItem(name: string, price: number): void {
    this.items.push({ name, price });
  }

  getTotal(): number {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }

  setPaymentStrategy(strategy: IPaymentStrategy): void {
    this.strategy = strategy;
  }

  checkout(): string {
    if (!this.strategy) {
      return 'No payment strategy selected';
    }
    const total = this.getTotal();
    return this.strategy.pay(total);
  }
}

// 泛型策略
interface ISortStrategy<T> {
  sort(data: T[]): T[];
}

class QuickSortStrategy<T> implements ISortStrategy<T> {
  sort(data: T[]): T[] {
    if (data.length <= 1) return [...data];
    
    const pivot = data[Math.floor(data.length / 2)];
    const left = data.filter(x => x < pivot);
    const middle = data.filter(x => x === pivot);
    const right = data.filter(x => x > pivot);
    
    return [...this.sort(left), ...middle, ...this.sort(right)];
  }
}

class MergeSortStrategy<T> implements ISortStrategy<T> {
  sort(data: T[]): T[] {
    if (data.length <= 1) return [...data];
    
    const mid = Math.floor(data.length / 2);
    const left = this.sort(data.slice(0, mid));
    const right = this.sort(data.slice(mid));
    
    return this.merge(left, right);
  }

  private merge(left: T[], right: T[]): T[] {
    const result: T[] = [];
    let i = 0, j = 0;
    
    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) {
        result.push(left[i++]);
      } else {
        result.push(right[j++]);
      }
    }
    
    return result.concat(left.slice(i)).concat(right.slice(j));
  }
}

class Sorter<T> {
  private strategy: ISortStrategy<T>;

  constructor(strategy: ISortStrategy<T>) {
    this.strategy = strategy;
  }

  setStrategy(strategy: ISortStrategy<T>): void {
    this.strategy = strategy;
  }

  sort(data: T[]): T[] {
    return this.strategy.sort(data);
  }
}

/**
 * 22. 模板方法模式 (Template Method Pattern)
 * 抽象类 + 钩子方法
 */
// 抽象类
abstract class DataMiner {
  // 模板方法
  mine(path: string): void {
    const file = this.openFile(path);
    const rawData = this.extractData(file);
    const data = this.parseData(rawData);
    const analysis = this.analyzeData(data);
    this.sendReport(analysis);
    this.closeFile(file);
    this.hook();
  }

  // 具体方法
  analyzeData(data: string[]): string {
    return `Analyzed ${data.length} records`;
  }

  sendReport(analysis: string): void {
    console.log(`Report: ${analysis}`);
  }

  // 钩子方法
  protected hook(): void {
    // 默认空实现，子类可覆盖
  }

  // 抽象方法 - 必须由子类实现
  protected abstract openFile(path: string): unknown;
  protected abstract extractData(file: unknown): string;
  protected abstract parseData(rawData: string): string[];
  protected abstract closeFile(file: unknown): void;
}

// 具体类 - PDF数据挖掘
class PDFDataMiner extends DataMiner {
  protected openFile(path: string): unknown {
    console.log(`Opening PDF file: ${path}`);
    return { type: 'PDF', path };
  }

  protected extractData(file: unknown): string {
    return 'raw PDF data';
  }

  protected parseData(rawData: string): string[] {
    return rawData.split('\n');
  }

  protected closeFile(file: unknown): void {
    console.log('Closing PDF file');
  }
}

// 具体类 - CSV数据挖掘
class CSVDataMiner extends DataMiner {
  protected openFile(path: string): unknown {
    console.log(`Opening CSV file: ${path}`);
    return { type: 'CSV', path };
  }

  protected extractData(file: unknown): string {
    return 'col1,col2,col3\nval1,val2,val3';
  }

  protected parseData(rawData: string): string[] {
    return rawData.split('\n').map(line => line.split(',').join(' | '));
  }

  protected closeFile(file: unknown): void {
    console.log('Closing CSV file');
  }

  // 覆盖钩子方法
  protected hook(): void {
    console.log('CSV mining completed!');
  }
}

// 泛型模板方法
abstract class GameAI {
  // 模板方法
  turn(): void {
    this.collectResources();
    this.buildStructures();
    this.buildUnits();
    this.attack();
  }

  // 具体方法
  private collectResources(): void {
    console.log('Collecting resources...');
  }

  private buildStructures(): void {
    if (this.hasResources()) {
      this.build();
    }
  }

  // 钩子方法
  protected hasResources(): boolean {
    return true;
  }

  // 抽象方法
  protected abstract buildUnits(): void;
  protected abstract attack(): void;
  protected abstract build(): void;
}

class OrcsAI extends GameAI {
  protected build(): void {
    console.log('Building orc structures');
  }

  protected buildUnits(): void {
    console.log('Training orc warriors');
  }

  protected attack(): void {
    console.log('Orcs attacking with brute force!');
  }
}

class ElvesAI extends GameAI {
  protected build(): void {
    console.log('Building elven structures');
  }

  protected buildUnits(): void {
    console.log('Training elven archers');
  }

  protected attack(): void {
    console.log('Elves attacking with precision!');
  }

  // 覆盖钩子
  protected hasResources(): boolean {
    // 精灵更保守
    return Math.random() > 0.3;
  }
}

/**
 * 23. 访问者模式 (Visitor Pattern)
 * 双分派 + Visitor接口
 */
// 元素接口
interface IVisitable {
  accept(visitor: IVisitor): void;
}

// 访问者接口
interface IVisitor {
  visitDot(dot: Dot): void;
  visitCircle(circle: CircleShape): void;
  visitRectangle(rectangle: RectangleShape): void;
  visitCompoundGraphic(cg: CompoundGraphic): void;
}

// 具体元素 - 点
class Dot implements IVisitable {
  constructor(
    public id: number,
    public x: number,
    public y: number
  ) {}

  move(x: number, y: number): void {
    this.x += x;
    this.y += y;
  }

  draw(): void {
    console.log(`Drawing dot ${this.id} at (${this.x}, ${this.y})`);
  }

  accept(visitor: IVisitor): void {
    visitor.visitDot(this);
  }
}

// 具体元素 - 圆形
class CircleShape implements IVisitable {
  constructor(
    public id: number,
    public x: number,
    public y: number,
    public radius: number
  ) {}

  move(x: number, y: number): void {
    this.x += x;
    this.y += y;
  }

  draw(): void {
    console.log(`Drawing circle ${this.id} at (${this.x}, ${this.y}) with radius ${this.radius}`);
  }

  accept(visitor: IVisitor): void {
    visitor.visitCircle(this);
  }
}

// 具体元素 - 矩形
class RectangleShape implements IVisitable {
  constructor(
    public id: number,
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}

  move(x: number, y: number): void {
    this.x += x;
    this.y += y;
  }

  draw(): void {
    console.log(`Drawing rectangle ${this.id} at (${this.x}, ${this.y}) with size ${this.width}x${this.height}`);
  }

  accept(visitor: IVisitor): void {
    visitor.visitRectangle(this);
  }
}

// 组合元素
class CompoundGraphic implements IVisitable {
  private children: IVisitable[] = [];

  add(child: IVisitable): void {
    this.children.push(child);
  }

  remove(child: IVisitable): void {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
    }
  }

  accept(visitor: IVisitor): void {
    visitor.visitCompoundGraphic(this);
  }

  getChildren(): IVisitable[] {
    return [...this.children];
  }
}

// 具体访问者 - 导出为XML
class XMLExportVisitor implements IVisitor {
  private xml = '';

  visitDot(dot: Dot): void {
    this.xml += `  <dot id="${dot.id}" x="${dot.x}" y="${dot.y}"/>\n`;
  }

  visitCircle(circle: CircleShape): void {
    this.xml += `  <circle id="${circle.id}" x="${circle.x}" y="${circle.y}" radius="${circle.radius}"/>\n`;
  }

  visitRectangle(rectangle: RectangleShape): void {
    this.xml += `  <rectangle id="${rectangle.id}" x="${rectangle.x}" y="${rectangle.y}" width="${rectangle.width}" height="${rectangle.height}"/>\n`;
  }

  visitCompoundGraphic(cg: CompoundGraphic): void {
    this.xml += '  <compound_graphic>\n';
    for (const child of cg.getChildren()) {
      child.accept(this);
    }
    this.xml += '  </compound_graphic>\n';
  }

  getXML(): string {
    return `<graphics>\n${this.xml}</graphics>`;
  }
}

// 具体访问者 - 计算面积
class AreaCalculator implements IVisitor {
  private totalArea = 0;

  visitDot(): void {
    // 点没有面积
  }

  visitCircle(circle: CircleShape): void {
    const area = Math.PI * circle.radius * circle.radius;
    this.totalArea += area;
    console.log(`Circle ${circle.id} area: ${area.toFixed(2)}`);
  }

  visitRectangle(rectangle: RectangleShape): void {
    const area = rectangle.width * rectangle.height;
    this.totalArea += area;
    console.log(`Rectangle ${rectangle.id} area: ${area}`);
  }

  visitCompoundGraphic(cg: CompoundGraphic): void {
    for (const child of cg.getChildren()) {
      child.accept(this);
    }
  }

  getTotalArea(): number {
    return this.totalArea;
  }
}

// 具体访问者 - 移动操作
class MoveVisitor implements IVisitor {
  constructor(private dx: number, private dy: number) {}

  visitDot(dot: Dot): void {
    dot.move(this.dx, this.dy);
  }

  visitCircle(circle: CircleShape): void {
    circle.move(this.dx, this.dy);
  }

  visitRectangle(rectangle: RectangleShape): void {
    rectangle.move(this.dx, this.dy);
  }

  visitCompoundGraphic(cg: CompoundGraphic): void {
    for (const child of cg.getChildren()) {
      child.accept(this);
    }
  }
}

// ============================================
// 演示和测试
// ============================================

// 运行所有模式的演示
function runDesignPatternsDemo(): void {
  console.log('=== TypeScript 设计模式演示 ===\n');

  // 1. 单例模式
  console.log('1. Singleton Pattern:');
  const singleton1 = Singleton.getInstance();
  const singleton2 = Singleton.getInstance();
  singleton1.setData('Hello Singleton');
  console.log('singleton1 data:', singleton1.getData());
  console.log('singleton2 data:', singleton2.getData());
  console.log('Same instance?', singleton1 === singleton2);
  console.log();

  // 2. 工厂方法模式
  console.log('2. Factory Method Pattern:');
  const factoryA = new ProductAFactory();
  const productA = factoryA.createProduct();
  console.log('Created:', productA.name);
  console.log();

  // 3. 抽象工厂模式
  console.log('3. Abstract Factory Pattern:');
  const winFactory = new WindowsFactory();
  const winButton = winFactory.createButton();
  console.log(winButton.render());
  console.log();

  // 4. 建造者模式
  console.log('4. Builder Pattern:');
  const house = new HouseBuilder()
    .setWalls(4)
    .setDoors(2)
    .setWindows(6)
    .addGarage()
    .build();
  console.log(house.toString());
  console.log();

  // 5. 原型模式
  console.log('5. Prototype Pattern:');
  const doc1 = new Document('Original', 'Content', { author: 'John', createdAt: new Date() });
  const doc2 = doc1.deepClone();
  doc2.title = 'Clone';
  console.log('Original title:', doc1.title);
  console.log('Clone title:', doc2.title);
  console.log();

  // 6. 适配器模式
  console.log('6. Adapter Pattern:');
  const audioPlayer = new AudioPlayer();
  audioPlayer.play('mp3', 'song.mp3');
  audioPlayer.play('mp4', 'video.mp4');
  console.log();

  // 7. 桥接模式
  console.log('7. Bridge Pattern:');
  const redCircle = new Circle(100, 100, 10, new RedCircle());
  const greenCircle = new Circle(100, 100, 10, new GreenCircle());
  redCircle.draw();
  greenCircle.draw();
  console.log();

  // 8. 组合模式
  console.log('8. Composite Pattern:');
  const ceo = new Manager('CEO', 100000);
  const devManager = new Manager('Dev Manager', 80000);
  const dev1 = new Developer('Dev1', 60000);
  const dev2 = new Developer('Dev2', 65000);
  devManager.add(dev1);
  devManager.add(dev2);
  ceo.add(devManager);
  ceo.showDetails();
  console.log('Total salary:', ceo.getTotalSalary());
  console.log();

  // 9. 装饰器模式
  console.log('9. Decorator Pattern:');
  let coffee: ICoffee = new SimpleCoffee();
  coffee = new MilkDecorator(coffee);
  coffee = new SugarDecorator(coffee);
  console.log('Description:', coffee.description());
  console.log('Cost:', coffee.cost());
  console.log();

  // 10. 外观模式
  console.log('10. Facade Pattern:');
  const computer = new ComputerFacade();
  computer.start();
  computer.shutdown();

  // 11. 享元模式
  console.log('11. Flyweight Pattern:');
  ShapeFactory.clearPool();
  const redCircle1 = ShapeFactory.getCircle('RED');
  const redCircle2 = ShapeFactory.getCircle('RED');
  const blueCircle = ShapeFactory.getCircle('BLUE');
  console.log('Same red circle?', redCircle1 === redCircle2);
  console.log('Circle count:', ShapeFactory.getCircleCount());
  console.log();

  // 12. 代理模式
  console.log('12. Proxy Pattern:');
  const image = new ProxyImage('photo.jpg');
  image.display(); // 首次加载
  image.display(); // 使用缓存
  console.log();

  // 13. 责任链模式
  console.log('13. Chain of Responsibility Pattern:');
  const chain = new MiddlewareChain();
  chain.use(loggingMiddleware).use(authMiddleware);
  const response1 = chain.execute({ type: 'public', payload: {} });
  console.log('Response:', response1);
  console.log();

  // 14. 命令模式
  console.log('14. Command Pattern:');
  const editor = new TextEditor();
  const history = new CommandHistory();
  history.execute(new WriteCommand(editor, 'Hello '));
  history.execute(new WriteCommand(editor, 'World'));
  console.log('Content:', editor.getContent());
  history.undo();
  console.log('After undo:', editor.getContent());
  console.log();

  // 15. 解释器模式
  console.log('15. Interpreter Pattern:');
  const parser = new ExpressionParser();
  const expression = parser.parse('2 + 3 * 4');
  const context = new Map<string, number>();
  console.log('Result of 2 + 3 * 4:', expression.interpret(context));
  console.log();

  // 16. 迭代器模式
  console.log('16. Iterator Pattern:');
  const bookCollection = new BookCollection();
  bookCollection.addBook(new Book('Book A', 'Author A'));
  bookCollection.addBook(new Book('Book B', 'Author B'));
  for (const book of bookCollection) {
    console.log(`  ${book.title} by ${book.author}`);
  }
  console.log();

  // 17. 中介者模式
  console.log('17. Mediator Pattern:');
  const chatRoom = new ChatRoom();
  const user1 = new User(chatRoom, 'Alice');
  const user2 = new User(chatRoom, 'Bob');
  chatRoom.register(user1);
  chatRoom.register(user2);
  user1.send('Hello everyone!');
  console.log();

  // 18. 备忘录模式
  console.log('18. Memento Pattern:');
  const textEditor = new TextEditorWithMemento();
  const mementoHistory = new History();
  textEditor.type('First line');
  mementoHistory.push(textEditor.save());
  textEditor.type('\nSecond line');
  mementoHistory.push(textEditor.save());
  console.log('Current:', textEditor.getContent());
  textEditor.restore(mementoHistory.pop()!);
  console.log('After restore:', textEditor.getContent());
  console.log();

  // 19. 观察者模式
  console.log('19. Observer Pattern:');
  const weatherStation = new WeatherStation();
  const phoneDisplay = new PhoneDisplay();
  const windowDisplay = new WindowDisplay();
  weatherStation.attach(phoneDisplay);
  weatherStation.attach(windowDisplay);
  weatherStation.setTemperature(25);
  console.log();

  // 20. 状态模式
  console.log('20. State Pattern:');
  const doc = new DocumentWithState();
  doc.content = 'This is a draft document that needs to be published';
  doc.render();
  doc.publish(); // draft -> moderation
  doc.publish(); // moderation -> published
  doc.render();
  console.log();

  // 21. 策略模式
  console.log('21. Strategy Pattern:');
  const cart = new ShoppingCart();
  cart.addItem('Laptop', 1000);
  cart.addItem('Mouse', 50);
  cart.setPaymentStrategy(new CreditCardPayment('1234567890123456', '123', '12/25'));
  console.log(cart.checkout());
  console.log();

  // 22. 模板方法模式
  console.log('22. Template Method Pattern:');
  const pdfMiner = new PDFDataMiner();
  pdfMiner.mine('document.pdf');
  console.log();

  // 23. 访问者模式
  console.log('23. Visitor Pattern:');
  const dot = new Dot(1, 10, 20);
  const circle = new CircleShape(2, 30, 40, 15);
  const xmlVisitor = new XMLExportVisitor();
  dot.accept(xmlVisitor);
  circle.accept(xmlVisitor);
  console.log(xmlVisitor.getXML());

  console.log('=== 所有模式演示完成 ===');
}

// 导出所有类供外部使用
export {
  // 创建型
  Singleton,
  ProductFactory,
  ConcreteProductA,
  ConcreteProductB,
  WindowsFactory,
  MacFactory,
  HouseBuilder,
  HouseDirector,
  Document,
  
  // 结构型
  AudioPlayer,
  Circle,
  RedCircle,
  GreenCircle,
  Manager,
  Developer,
  SimpleCoffee,
  MilkDecorator,
  SugarDecorator,
  ComputerFacade,
  ShapeFactory,
  ProxyImage,
  
  // 行为型
  MiddlewareChain,
  CommandHistory,
  WriteCommand,
  ExpressionParser,
  BookCollection,
  ChatRoom,
  User,
  TextEditorWithMemento,
  History,
  WeatherStation,
  PhoneDisplay,
  DocumentWithState,
  ShoppingCart,
  CreditCardPayment,
  PayPalPayment,
  PDFDataMiner,
  CSVDataMiner,
  Dot,
  CircleShape,
  XMLExportVisitor,
  AreaCalculator,
  
  // 通用
  EventBus,
  EventEmitter,
  StateManager,
  ObjectPool,
  GenericComposite,
  
  // 运行演示
  runDesignPatternsDemo
};

// 如果直接运行此文件，执行演示
if (require.main === module) {
  runDesignPatternsDemo();
}
