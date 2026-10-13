import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Input';

const meta = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Текстовое поле. Поддерживает controlled/uncontrolled сценарии, label, ошибку (с `aria-invalid` и `role="alert"`) и подсказку.',
      },
    },
  },
  args: {
    label: 'Email',
    placeholder: 'user@example.com',
  },
  argTypes: {
    label: { control: 'text' },
    error: { control: 'text' },
    hint: { control: 'text' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHint: Story = {
  args: {
    hint: 'Мы не передаём email третьим лицам',
  },
};

export const WithError: Story = {
  args: {
    error: 'Введите корректный email',
    defaultValue: 'not-an-email',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'readonly@example.com',
  },
};

export const Required: Story = {
  args: {
    required: true,
  },
};

export const WithoutLabel: Story = {
  args: {
    label: undefined,
    placeholder: 'Поиск…',
    'aria-label': 'Поиск' as never,
  },
};

export const Controlled: Story = {
  render: function ControlledExample() {
    const [value, setValue] = useState('');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 320 }}>
        <Input
          label="Имя"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Введите имя"
        />
        <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Значение: {value || '—'}</p>
      </div>
    );
  },
};

export const ErrorAndHint: Story = {
  args: {
    hint: 'Подсказка',
    error: 'Ошибка приоритетнее hint и скрывает его',
  },
  parameters: {
    docs: {
      description: {
        story: 'Граничный случай: при наличии `error` подсказка `hint` не показывается.',
      },
    },
  },
};

export const SpecialCharacters: Story = {
  args: {
    label: 'Имя с <html> & "спецсимволами"',
    defaultValue: `<script>alert('xss')</script>`,
    hint: 'Значение экранируется React',
  },
  parameters: {
    docs: {
      description: {
        story: 'Граничный случай: спецсимволы и HTML-подобный текст отображаются как текст.',
      },
    },
  },
};

export const WithAriaLabelOnly: Story = {
  args: {
    label: undefined,
    hint: undefined,
    error: undefined,
    'aria-label': 'Поиск по сайту' as never,
    placeholder: 'Введите запрос…',
  },
  parameters: {
    docs: {
      description: {
        story: 'Граничный случай: без label — обязательно `aria-label` для доступности.',
      },
    },
  },
};
