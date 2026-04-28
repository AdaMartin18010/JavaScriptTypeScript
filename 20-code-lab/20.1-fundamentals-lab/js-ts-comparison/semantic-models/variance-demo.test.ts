import { describe, it, expect } from 'vitest';
import {
  demoWidthSubtyping,
  demoReturnCovariance,
  demoParamContravariance,
  demoOutCovariance,
  demoInContravariance,
  demoInvariance,
  type Box,
  type Sink,
  type Mutable,
  type AnimalFactory,
  type DogFactory,
  type AnimalHandler,
  type DogHandler,
} from './variance-demo.js';

describe('variance-demo', () => {
  it('应展示对象宽度子类型', () => {
    const result = demoWidthSubtyping();
    expect(result.success).toBe(true);
    expect(result.message).toContain('宽度子类型');
  });

  it('应展示函数返回值协变', () => {
    const result = demoReturnCovariance();
    expect(result.success).toBe(true);
    expect(result.message).toContain('协变');

    // 运行时类型验证：DogFactory 可以赋值给 AnimalFactory
    const dogFactory: DogFactory = () => ({ name: 'Buddy', breed: 'Golden' });
    const animalFactory: AnimalFactory = dogFactory;
    expect(animalFactory().name).toBe('Buddy');
  });

  it('应展示函数参数逆变', () => {
    const result = demoParamContravariance();
    expect(result.success).toBe(true);
    expect(result.message).toContain('逆变');

    // 运行时类型验证：AnimalHandler 可以赋值给 DogHandler
    const animalHandler: AnimalHandler = (a) => a.name;
    const dogHandler: DogHandler = animalHandler;
    expect(dogHandler({ name: 'Buddy', breed: 'Golden' })).toBe('Buddy');
  });

  it('应展示 out 标注的协变行为', () => {
    const result = demoOutCovariance();
    expect(result.success).toBe(true);
    expect(result.message).toContain('out');
  });

  it('应展示 in 标注的逆变行为', () => {
    const result = demoInContravariance();
    expect(result.success).toBe(true);
    expect(result.message).toContain('in');
  });

  it('应解释不变性', () => {
    const result = demoInvariance();
    expect(result.explained).toContain('不变');
  });

  it('Box<out T> 在类型层面允许协变赋值（运行时验证等价行为）', () => {
    interface AnimalLike { name: string }
    interface DogLike extends AnimalLike { breed: string }

    const dogBox: Box<DogLike> = {
      getValue: () => ({ name: 'Buddy', breed: 'Golden' })
    };
    // 运行时验证：我们可以将 dogBox 逻辑上视为 Box<AnimalLike>
    const asAnimalBox: Box<AnimalLike> = dogBox;
    expect(asAnimalBox.getValue().name).toBe('Buddy');
  });

  it('Sink<in T> 在类型层面允许逆变赋值（运行时验证等价行为）', () => {
    interface AnimalLike { name: string }
    interface DogLike extends AnimalLike { breed: string }

    const animalSink: Sink<AnimalLike> = {
      consume: (a) => a.name
    };
    // 运行时验证：我们可以将 animalSink 逻辑上视为 Sink<DogLike>
    const asDogSink: Sink<DogLike> = animalSink;
    expect(asDogSink.consume({ name: 'Buddy', breed: 'Golden' })).toBe('Buddy');
  });

  it('Mutable<T> 演示不变性（运行时保持独立引用）', () => {
    interface AnimalLike { name: string }
    interface DogLike extends AnimalLike { breed: string }

    const dogMutable: Mutable<DogLike> = {
      getValue: () => ({ name: 'Buddy', breed: 'Golden' }),
      setValue: () => {}
    };

    // 运行时我们无法直接测试 TS 编译错误，但可以验证引用不被意外替换
    expect(dogMutable.getValue().name).toBe('Buddy');
  });
});
