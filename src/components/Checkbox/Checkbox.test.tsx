import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createRef } from 'react';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('рендерит чекбокс с label', () => {
    render(<Checkbox label="Согласен" />);
    expect(screen.getByRole('checkbox', { name: 'Согласен' })).toBeInTheDocument();
  });

  it('клик по label переключает состояние', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox label="Согласен" onChange={onChange} />);

    await user.click(screen.getByText('Согласен'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('клик по самому чекбоксу работает', async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Согласен" />);

    await user.click(screen.getByRole('checkbox'));
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('defaultChecked задаёт начальное состояние', () => {
    render(<Checkbox label="Согласен" defaultChecked />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('indeterminate выставляет DOM-свойство и aria-checked="mixed"', () => {
    render(<Checkbox label="Частично" indeterminate />);
    const checkbox = screen.getByRole('checkbox');

    expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
    expect((checkbox as HTMLInputElement).indeterminate).toBe(true);
  });

  it('indeterminate сбрасывается при выключении', () => {
    const { rerender } = render(<Checkbox label="Частично" indeterminate />);
    rerender(<Checkbox label="Частично" indeterminate={false} />);

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.indeterminate).toBe(false);
    expect(checkbox).not.toHaveAttribute('aria-checked', 'mixed');
  });

  it('disabled блокирует изменение', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox label="Согласен" disabled onChange={onChange} />);

    await user.click(screen.getByRole('checkbox'));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('вызывает onChange с checked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox label="Согласен" onChange={onChange} />);

    await user.click(screen.getByRole('checkbox'));
    expect(onChange.mock.calls[0][0].target.checked).toBe(true);
  });

  it('forwardRef пробрасывает нативный реф', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox label="Согласен" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('без label использует aria-label', () => {
    render(<Checkbox aria-label="Уведомления" />);
    expect(screen.getByRole('checkbox', { name: 'Уведомления' })).toBeInTheDocument();
  });
});
