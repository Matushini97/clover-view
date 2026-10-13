import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Кнопка действий на нативном `<button>`. Поддерживает 4 варианта, 3 размера и состояние загрузки (спиннер + `aria-busy`, клики блокируются).',
      },
    },
  },
  args: {
    children: 'Кнопка',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Удалить',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const Loading: Story = {
  args: {
    loading: true,
    children: 'Сохранение…',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
};

export const LoadingAndDisabled: Story = {
  args: {
    loading: true,
    disabled: true,
    children: 'Обработка…',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Граничный случай: `loading` уже блокирует кнопку, `disabled` допустим одновременно.',
      },
    },
  },
};

export const LongText: Story = {
  args: {
    children: 'Очень длинный текст кнопки, который не помещается в один экран',
  },
  parameters: {
    docs: {
      description: {
        story: 'Граничный случай: длинный label не ломает раскладку.',
      },
    },
  },
};

export const EmptyChildren: Story = {
  args: {
    children: '',
    'aria-label': 'Закрыть' as never,
  },
  parameters: {
    docs: {
      description: {
        story: 'Граничный случай: без текста — задайте `aria-label` для скринридеров.',
      },
    },
  },
};
