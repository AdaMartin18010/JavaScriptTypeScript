/**
 * @file 简单反馈控制器（PID 简化版）
 * @category Autonomous Systems → Feedback Control
 * @difficulty medium
 * @tags pid-controller, feedback-control, autonomous-navigation, regulation
 *
 * @description
 * 实现经典的反馈控制算法：
 * - 比例-积分-微分（PID）控制器
 * -  bang-bang 控制器（开关控制）
 * - 死区与非线性补偿
 * - 输出限幅与积分抗饱和（anti-windup）
 */

/** PID 配置 */
export interface PIDOptions {
  /** 比例增益 */
  kp: number;
  /** 积分增益 */
  ki: number;
  /** 微分增益 */
  kd: number;
  /** 输出下限 */
  outputMin?: number;
  /** 输出上限 */
  outputMax?: number;
  /** 积分限幅（抗饱和） */
  integralLimit?: number;
  /** 微分滤波系数 0~1（越大滤波越强） */
  derivativeFilter?: number;
  /** 设定值权重（用于微分先行） */
  setpointWeight?: number;
}

/** PID 计算结果 */
export interface PIDOutput {
  /** 控制器输出 */
  output: number;
  /** 误差 */
  error: number;
  /** 比例项 */
  pTerm: number;
  /** 积分项 */
  iTerm: number;
  /** 微分项 */
  dTerm: number;
}

/**
 * PID 控制器
 *
 * 连续时间 PID 的离散化实现（位置式），支持输出限幅和积分抗饱和。
 * 广泛用于温度控制、电机调速、自动驾驶横向控制等场景。
 */
export class PIDController {
  private integral = 0;
  private lastError = 0;
  private lastMeasurement = 0;
  private readonly outputMin: number;
  private readonly outputMax: number;
  private readonly integralLimit: number;
  private readonly derivativeFilter: number;
  private readonly setpointWeight: number;

  constructor(private options: PIDOptions) {
    this.outputMin = options.outputMin ?? -Infinity;
    this.outputMax = options.outputMax ?? Infinity;
    this.integralLimit = options.integralLimit ?? Infinity;
    this.derivativeFilter = options.derivativeFilter ?? 0;
    this.setpointWeight = options.setpointWeight ?? 1.0;
  }

  /**
   * 计算控制输出
   * @param setpoint - 设定值（目标值）
   * @param measurement - 当前测量值
   * @param dt - 采样时间间隔（秒）
   * @returns PID 输出
   */
  compute(setpoint: number, measurement: number, dt: number): PIDOutput {
    if (dt <= 0) {
      throw new Error('dt must be greater than 0');
    }

    const error = setpoint - measurement;

    // 比例项
    const pTerm = this.options.kp * error;

    // 积分项（带限幅）
    this.integral += error * dt;
    this.integral = this.clamp(this.integral, -this.integralLimit, this.integralLimit);
    const iTerm = this.options.ki * this.integral;

    // 微分项（测量值微分先行，避免设定值突变引起微分冲击）
    const dMeasurement = (measurement - this.lastMeasurement) / dt;
    const rawDTerm = -this.options.kd * dMeasurement;
    const dTerm = this.derivativeFilter > 0
      ? this.lastDTerm * this.derivativeFilter + rawDTerm * (1 - this.derivativeFilter)
      : rawDTerm;

    // 计算原始输出
    let output = pTerm + iTerm + dTerm;

    // 输出限幅
    const clampedOutput = this.clamp(output, this.outputMin, this.outputMax);

    // 积分抗饱和：如果输出被限幅，不累积该方向的积分
    if (output !== clampedOutput) {
      this.integral -= error * dt; // 回退本次积分
    }

    // 更新状态
    this.lastError = error;
    this.lastMeasurement = measurement;
    this.lastDTerm = dTerm;

    return {
      output: clampedOutput,
      error,
      pTerm,
      iTerm,
      dTerm,
    };
  }

  /**
   * 重置控制器内部状态
   */
  reset(): void {
    this.integral = 0;
    this.lastError = 0;
    this.lastMeasurement = 0;
    this.lastDTerm = 0;
  }

  /**
   * 更新 PID 参数（不重置状态）
   */
  tune(kp: number, ki: number, kd: number): void {
    this.options = { ...this.options, kp, ki, kd };
  }

  private lastDTerm = 0;

  private clamp(value: number, min: number, max: number): number {
    if (!Number.isFinite(min) && !Number.isFinite(max)) return value;
    return Math.max(min, Math.min(max, value));
  }
}

/**
 * Bang-Bang 控制器（开关控制）
 *
 * 最简单的反馈控制，输出只有两种状态（开/关）。
 * 适用于加热器、制冷器等执行器。
 */
export class BangBangController {
  private state: boolean = false;

  constructor(
    private onThreshold: number,
    private offThreshold: number,
    private hysteresis = 0.5
  ) {
    if (onThreshold <= offThreshold) {
      throw new Error('onThreshold must be greater than offThreshold');
    }
  }

  /**
   * 计算控制输出
   * @param setpoint - 设定值
   * @param measurement - 当前测量值
   * @returns true = 开, false = 关
   */
  compute(setpoint: number, measurement: number): boolean {
    const error = setpoint - measurement;

    if (error > this.onThreshold + this.hysteresis) {
      this.state = true;
    } else if (error < this.offThreshold - this.hysteresis) {
      this.state = false;
    }

    return this.state;
  }

  getState(): boolean {
    return this.state;
  }
}

/**
 * 带死区的控制器
 *
 * 在误差较小时输出为零，避免执行器频繁微调和震荡。
 */
export class DeadZoneController {
  constructor(
    private innerController: PIDController | BangBangController,
    private deadZone: number
  ) {}

  compute(setpoint: number, measurement: number, dt?: number): number | boolean {
    const error = Math.abs(setpoint - measurement);
    if (error < this.deadZone) {
      if (this.innerController instanceof PIDController) {
        return 0;
      }
      return false;
    }

    if (this.innerController instanceof PIDController) {
      return this.innerController.compute(setpoint, measurement, dt ?? 0.1).output;
    }
    return this.innerController.compute(setpoint, measurement);
  }
}

/**
 * 控制系统仿真器
 *
 * 用于测试和演示控制器的阶跃响应。
 */
export class ControlSystemSimulator {
  /**
   * 模拟一阶惯性系统
   * @param controller - 控制器
   * @param setpoint - 设定值
   * @param initialValue - 初始值
   * @param timeConstant - 系统时间常数
   * @param dt - 步长
   * @param steps - 步数
   * @returns 每次迭代的 { time, output, measurement, error }
   */
  static simulateFirstOrder(
    controller: PIDController,
    setpoint: number,
    initialValue: number,
    timeConstant: number,
    dt: number,
    steps: number
  ): { time: number; controllerOutput: number; measurement: number; error: number }[] {
    const results: { time: number; controllerOutput: number; measurement: number; error: number }[] = [];
    let measurement = initialValue;

    // 记录初始状态
    results.push({
      time: 0,
      controllerOutput: controller.compute(setpoint, measurement, dt).output,
      measurement,
      error: setpoint - measurement,
    });

    for (let i = 1; i < steps; i++) {
      const time = i * dt;
      const pidResult = controller.compute(setpoint, measurement, dt);
      const controllerOutput = pidResult.output;

      // 一阶惯性系统: dY/dt = (U - Y) / T
      measurement += (controllerOutput - measurement) * (dt / timeConstant);

      results.push({
        time,
        controllerOutput,
        measurement,
        error: pidResult.error,
      });
    }

    return results;
  }
}

export function demo(): void {
  console.log('=== 反馈控制器（PID 简化版）===\n');

  // PID 控制器演示
  const pid = new PIDController({
    kp: 2.0,
    ki: 0.5,
    kd: 0.1,
    outputMin: 0,
    outputMax: 100,
    integralLimit: 50,
  });

  const setpoint = 50;
  const results = ControlSystemSimulator.simulateFirstOrder(pid, setpoint, 0, 2.0, 0.1, 50);

  console.log('PID 阶跃响应（目标=50）:');
  console.log('  时间\t输出\t测量值\t误差');
  for (let i = 0; i < results.length; i += 10) {
    const r = results[i];
    console.log(`  ${r.time.toFixed(1)}s\t${r.controllerOutput.toFixed(1)}\t${r.measurement.toFixed(1)}\t${r.error.toFixed(1)}`);
  }

  // Bang-Bang 控制器演示
  console.log('\n--- Bang-Bang 控制器 ---');
  const bangBang = new BangBangController(5, -5);
  const temps = [18, 19, 20, 21, 22, 23];
  const targetTemp = 22;

  for (const temp of temps) {
    const state = bangBang.compute(targetTemp, temp);
    console.log(`  当前温度 ${temp}°C: ${state ? '加热开启' : '加热关闭'}`);
  }
}
