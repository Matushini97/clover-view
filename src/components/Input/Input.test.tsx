import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createRef } from 'react';
import { Input } from './Input';

describe('Input', () => {
  it('рендерит label, связанный с полем', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('без label использует aria-label', () => {
    render(<Input aria-label="Поиск" />);
    expect(screen.getByRole('textbox', { name: 'Поиск' })).toBeInTheDocument();
  });

  it('вызывает onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input label="Имя" onChange={onChange} />);

    await user.type(screen.getByLabelText('Имя'), 'a');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('controlled: значение приходит из value', () => {
    render(<Input label="Имя" value="Иван" onChange={() => {}} readOnly />);
    expect(screen.getByLabelText('Имя')).toHaveValue('Иван');
  });

  it('uncontrolled: поддерживает defaultValue', () => {
    render(<Input label="Имя" defaultValue="до" />);
    expect(screen.getByLabelText('Имя')).toHaveValue('до');
  });

  it('error: role alert, aria-invalid и текст ошибки', () => {
    render(<Input label="Email" error="Некорректный email" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Некорректный email');
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('error связана с полем через aria-describedby', () => {
    render(<Input label="Email" error="Ошибка" />);
    const input = screen.getByLabelText('Email');
    const describedBy = input.getAttribute('aria-describedby');

    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)).toHaveTextContent('Ошибка');
  });

  it('hint показывается без ошибки', () => {
    render(<Input label="Email" hint="Не передаём третьим лицам" />);
    expect(screen.getByText('Не передаём третьим лицам')).toBeInTheDocument();
  });

  it('hint скрывается при error', () => {
    render(<Input label="Email" hint="Подсказка" error="Ошибка" />);
    expect(screen.queryByText('Подсказка')).not.toBeInTheDocument();
  });

  it('required проставливает атрибут', () => {
    render(<Input label="Email" required />);
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeRequired();
  });

  it('disabled выключает поле', () => {
    render(<Input label="Email" disabled />);
    expect(screen.getByLabelText('Email')).toBeDisabled();
  });

  it('asterisk required не попадает в accessible name', () => {
    render(<Input label="Email" required />);
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument();
  });

  it('forwardRef пробрасывает нативный реф', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input label="Email" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('два поля получают разные id', () => {
    render(
      <>
        <Input label="A" />
        <Input label="B" />
      </>,
    );
    const [first, second] = screen.getAllByRole('textbox').map((el) => el.id);
    expect(first).not.toBe(second);
  });
});
