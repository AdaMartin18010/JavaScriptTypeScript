/**
 * Card 组件单元测试
 * 使用 @testing-library/react-native 进行组件行为验证
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Card } from '../Card';

describe('Card 组件', () => {
  const defaultProps = {
    title: 'React',
    description: '用于构建用户界面的 JavaScript 库',
    category: '前端框架',
    rating: 4.8,
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应正确渲染标题和描述', () => {
    render(<Card {...defaultProps} />);

    expect(screen.getByText('React')).toBeTruthy();
    expect(
      screen.getByText('用于构建用户界面的 JavaScript 库')
    ).toBeTruthy();
  });

  it('应渲染分类标签和评分', () => {
    render(<Card {...defaultProps} />);

    expect(screen.getByText('前端框架')).toBeTruthy();
    expect(screen.getByText('⭐ 4.8')).toBeTruthy();
  });

  it('点击卡片时应触发 onPress 回调', () => {
    render(<Card {...defaultProps} />);

    // 使用 accessibilityLabel 定位可点击区域
    const card = screen.getByLabelText('查看 React 详情');
    fireEvent.press(card);

    expect(defaultProps.onPress).toHaveBeenCalledTimes(1);
  });

  it('无评分时不应渲染评分文本', () => {
    render(<Card {...defaultProps} rating={undefined} />);

    expect(screen.queryByText(/⭐/)).toBeNull();
  });

  it('无描述时不应渲染描述区域', () => {
    render(<Card {...defaultProps} description={undefined} />);

    expect(
      screen.queryByText('用于构建用户界面的 JavaScript 库')
    ).toBeNull();
  });
});
