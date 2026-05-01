import type { InputHTMLAttributes, ReactNode } from 'react';
import './Input.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** 标签 */
  label?: ReactNode;
  /** 错误信息 */
  error?: string;
  /** 前缀 */
  prefix?: ReactNode;
  /** 后缀 */
  suffix?: ReactNode;
  /** 尺寸 */
  size?: 'small' | 'medium' | 'large';
}

/**
 * Input 组件
 */
export function Input({
  label,
  error,
  prefix,
  suffix,
  size = 'medium',
  className = '',
  ...props
}: InputProps) {
  const wrapperClasses = [
    'myorg-input-wrapper',
    error && 'myorg-input-wrapper--error',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const inputClasses = [
    'myorg-input',
    `myorg-input--${size}`,
    prefix && 'myorg-input--with-prefix',
    suffix && 'myorg-input--with-suffix',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClasses}>
      {label && <label className="myorg-input__label">{label}</label>}
      <div className="myorg-input__inner">
        {prefix && <span className="myorg-input__prefix">{prefix}</span>}
        <input className={inputClasses} {...props} />
        {suffix && <span className="myorg-input__suffix">{suffix}</span>}
      </div>
      {error && <span className="myorg-input__error">{error}</span>}
    </div>
  );
}
