# @matushini97/clover-view-ui

Библиотека React-компонентов с TypeScript, CSS Modules и готовой документацией в Storybook.

## Установка

```bash
npm install @matushini97/clover-view-ui
```

Требования: React 19 (peer-зависимость).

## Быстрый старт

```tsx
import { Button, Input, Checkbox } from '@matushini97/clover-view-ui';
import '@matushini97/clover-view-ui/styles.css';

export function Example() {
  return (
    <form>
      <Input label="Email" type="email" placeholder="user@example.com" required />
      <Checkbox label="Согласен с условиями" />
      <Button variant="primary" type="submit">
        Отправить
      </Button>
    </form>
  );
}
```

> Стили компонентов подключаются один раз на приложение: `import '@matushini97/clover-view-ui/styles.css'`.

## Компоненты

### Button

Кнопка действий. Нативный `<button>`, работает с клавиатуры (Tab, Enter, Space).

| Prop       | Тип                                               | По умолчанию | Описание                              |
| ---------- | ------------------------------------------------- | ------------ | ------------------------------------- |
| `variant`  | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'`  | Визуальный вариант                    |
| `size`     | `'sm' \| 'md' \| 'lg'`                            | `'md'`       | Размер                                |
| `loading`  | `boolean`                                         | `false`      | Спиннер, блокирует клики, `aria-busy` |
| `disabled` | `boolean`                                         | `false`      | Отключена                             |
| остальные  | `ButtonHTMLAttributes`                            | —            | Прокидываются в `<button>`            |

```tsx
<Button variant="danger" size="sm" onClick={handleDelete}>
  Удалить
</Button>

<Button loading>Сохранение…</Button>
```

### Input

Текстовое поле. Поддерживает controlled (`value` + `onChange`) и uncontrolled (`defaultValue`) сценарии.

| Prop       | Тип                   | По умолчанию | Описание                                      |
| ---------- | --------------------- | ------------ | --------------------------------------------- |
| `label`    | `string`              | —            | Label над полем (связан через `htmlFor`)      |
| `error`    | `string`              | —            | Текст ошибки; `aria-invalid` + `role="alert"` |
| `hint`     | `string`              | —            | Подсказка под полем (скрывается при error)    |
| `required` | `boolean`             | `false`      | Обязательное поле                             |
| остальные  | `InputHTMLAttributes` | —            | Прокидываются в `<input>`                     |

```tsx
// controlled
const [email, setEmail] = useState('');
<Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

// error
<Input label="Пароль" type="password" error="Минимум 8 символов" />
```

### Checkbox

Чекбокс на нативном `<input type="checkbox">`.

| Prop                         | Тип                   | По умолчанию | Описание                                         |
| ---------------------------- | --------------------- | ------------ | ------------------------------------------------ |
| `label`                      | `ReactNode`           | —            | Текст рядом (связан через `htmlFor`)             |
| `indeterminate`              | `boolean`             | `false`      | Промежуточное состояние (`aria-checked="mixed"`) |
| `checked` / `defaultChecked` | `boolean`             | —            | Controlled / uncontrolled                        |
| `disabled`                   | `boolean`             | `false`      | Отключен                                         |
| остальные                    | `InputHTMLAttributes` | —            | Прокидываются в `<input>`                        |

```tsx
<Checkbox label="Уведомления" checked={on} onChange={(e) => setOn(e.target.checked)} />
<Checkbox label="Частично" indeterminate />
```

## Доступность

- семантические нативные элементы (`button`, `input`, `label`) — фокус и клавиатура из коробки;
- ARIA добавляется только там, где это нужно (`aria-busy`, `aria-invalid`, `aria-describedby`, `aria-checked="mixed"`);
- видимый фокус (`:focus-visible`) и учтён `prefers-reduced-motion`.

## Разработка

```bash
npm install          # установка зависимостей (подключает git-хуки)
npm run storybook    # Storybook на http://localhost:6006
npm run build        # сборка библиотеки в dist/
npm run test         # unit-тесты (Vitest)
npm run typecheck    # проверка типов
npm run lint         # ESLint
npm run format       # Prettier
```

## Релизы

Версионирование — SemVer через [Changesets](https://github.com/changesets/changesets):

1. `npm run changeset` — описать изменение (patch / minor / major);
2. закоммитить файл из `.changeset/`;
3. после merge в `main` версии и changelog обновляются автоматически.

Подробная схема CI/CD — в [docs/cicd-theory.md](docs/cicd-theory.md).
