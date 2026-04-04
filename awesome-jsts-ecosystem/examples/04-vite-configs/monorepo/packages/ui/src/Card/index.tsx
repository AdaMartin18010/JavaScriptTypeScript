import type { ReactNode, CSSProperties } from 'react';
import './Card.css';

export interface CardProps {
  /** 标题 */
  title?: ReactNode;
  /** 副标题 */
  subtitle?: ReactNode;
  /** 内容 */
  children: ReactNode;
  /** 额外内容（右上角） */
  extra?: ReactNode;
  /** 底部内容 */
  footer?: ReactNode;
  /** 阴影 */
  shadow?: 'none' | 'small' | 'medium' | 'large';
  /** 边框 */
  bordered?: boolean;
  /** 自定义样式 */
  style?: CSSProperties;
  /** 自定义类名 */
  className?: string;
}

/**
 * Card 组件
 */
export function Card({
  title,
  subtitle,
  children,
  extra,
  footer,
  shadow = 'small',
  bordered = true,
  style,
  className = '',
}: CardProps) {
  const classes = [
    'myorg-card',
    `myorg-card--shadow-${shadow}`,
    bordered && 'myorg-card--bordered',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={style}>
      {(title || extra) && (
        <div className="myorg-card__header">
          <div className="myorg-card__header-left">
            {title && <div className="myorg-card__title">{title}</div>}
            {subtitle && <div className="myorg-card__subtitle">{subtitle}</div>}
          </div>
          {extra && <div className="myorg-card__extra">{extra}</div>}
        </div>
      )}
      <div className="myorg-card__body">{children}</div>
      {footer && <div className="myorg-card__footer">{footer}</div>}
    </div>
  );
}
