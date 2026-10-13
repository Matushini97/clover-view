import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Чекбокс на нативном `<input type="checkbox">`. Поддерживает промежуточное состояние `indeterminate` (`aria-checked="mixed"`).',
      },
    },
  },
  args: {
    label: 'Согласен с условиями',
  },
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
};

export const Indeterminate: Story = {
  args: {
    indeterminate: true,
  },
};

export const WithoutLabel: Story = {
  args: {
    label: undefined,
    'aria-label': 'Уведомления' as never,
  },
};

export const Group: Story = {
  render: function GroupExample() {
    const options = ['Уведомления', 'Дайджест', 'Новости'] as const;
    const [selected, setSelected] = useState<string[]>(['Уведомления']);

    const toggle = (option: string, checked: boolean) => {
      setSelected((prev) => (checked ? [...prev, option] : prev.filter((item) => item !== option)));
    };

    return (
      <fieldset
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          border: 'none',
          margin: 0,
          padding: 0,
        }}
      >
        <legend style={{ marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Подписки</legend>
        {options.map((option) => (
          <Checkbox
            key={option}
            label={option}
            checked={selected.includes(option)}
            onChange={(event) => toggle(option, event.target.checked)}
          />
        ))}
        <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
          Выбрано: {selected.length ? selected.join(', ') : '—'}
        </p>
      </fieldset>
    );
  },
};

export const LongLabel: Story = {
  args: {
    label:
      'Я прочитал и согласен с условиями использования сервиса, политикой конфиденциальности и обработкой персональных данных',
  },
  parameters: {
    docs: {
      description: {
        story: 'Граничный случай: длинный label переносится и не разъезжает чекбокс.',
      },
    },
  },
};

export const ControlledIndeterminate: Story = {
  render: function ControlledIndeterminateExample() {
    const [checked, setChecked] = useState(false);
    return (
      <Checkbox
        label="Отметить всё"
        checked={checked}
        indeterminate={!checked}
        onChange={(event) => setChecked(event.target.checked)}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Граничный случай: `indeterminate` переключается кодом при изменении состояния.',
      },
    },
  },
};
