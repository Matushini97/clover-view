import { forwardRef, useEffect, useId, useRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Текст рядом с чекбоксом */
  label?: ReactNode;
  /** Промежуточное состояние (частично отмечено). Устанавливается только кодом */
  indeterminate?: boolean;
}

/**
 * Чекбокс.
 * Нативный `<input type="checkbox">`: пробел, фокус и группировка с клавиатуры работают из коробки.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, indeterminate = false, id, className, disabled, ...rest },
  ref,
) {
  const autoId = useId();
  const checkboxId = id ?? autoId;
  const innerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (innerRef.current) {
      innerRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      <input
        ref={(node) => {
          innerRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        id={checkboxId}
        type="checkbox"
        disabled={disabled}
        aria-checked={indeterminate ? 'mixed' : undefined}
        className={styles.checkbox}
        {...rest}
      />
      {label && (
        <label
          htmlFor={checkboxId}
          className={[styles.label, disabled ? styles.labelDisabled : null]
            .filter(Boolean)
            .join(' ')}
        >
          {label}
        </label>
      )}
    </div>
  );
});
