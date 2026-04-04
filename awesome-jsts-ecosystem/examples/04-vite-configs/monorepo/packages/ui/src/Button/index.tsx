import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮尺寸 */
  size?: 'small' | 'medium' | 'large';
  /** 按钮变体 */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** 是否加载中 */
  loading?: boolean;
  /** 子元素 */
  children: ReactNode;
}

/**
 * Button 组件
 */
export function Button({
  size = 'medium',
  variant = 'primary',
  loading = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const classes = [
    'myorg-button',
    `myorg-button--${size}`,
    `myorg-button--${variant}`,
    loading && 'myorg-button--loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="myorg-button__spinner" />}
      <span className="myorg-button__content">{children}</span>
    </button>
  );
}
