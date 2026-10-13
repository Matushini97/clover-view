import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createRef } from 'react';
import { Button } from './Button';

describe('Button', () => {
  it('рендерит children', () => {
    render(<Button>Отправить</Button>);
    expect(screen.getByRole('button', { name: 'Отправить' })).toBeInTheDocument();
  });

  it('по умолчанию type="button" и не submit', () => {
    render(<Button>Кнопка</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('прокидывает type="submit"', () => {
    render(<Button type="submit">Отправить</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('вызывает onClick по клику', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Кнопка</Button>);

    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disabled блокирует клик', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Кнопка
      </Button>,
    );

    await user.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('loading: aria-busy, disabled и клик заблокирован', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Сохранение
      </Button>,
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('disabled + loading вместе остаются disabled', () => {
    render(
      <Button disabled loading>
        Обработка
      </Button>,
    );
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('forwardRef пробрасывает нативный реф', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Кнопка</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('переопределяет дефолтный type через проброс атрибутов', () => {
    render(<Button type="reset">Сброс</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');
  });
});
