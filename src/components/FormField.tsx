import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

import styles from './FormField.module.css';

interface BaseProps {
  label: string;
  error?: string;
}

interface SingleLineFieldProps extends BaseProps, InputHTMLAttributes<HTMLInputElement> {
  multiline?: false;
}

interface MultiLineFieldProps extends BaseProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
  multiline: true;
  rows?: number;
}

type FormFieldProps = SingleLineFieldProps | MultiLineFieldProps;

export function FormField(props: FormFieldProps) {
  const generatedId = useId();
  const inputId = props.id ?? generatedId;
  const errorId = `${inputId}-error`;
  const counter =
    typeof props.maxLength === 'number' && typeof props.value === 'string'
      ? `${props.value.length}/${props.maxLength}`
      : null;

  const header = (
    <div className={styles.labelRow}>
      <label htmlFor={inputId} className={styles.label}>
        {props.label}
      </label>
      {counter && <span className={styles.counter}>{counter}</span>}
    </div>
  );

  const footer = (
    <p id={errorId} className={styles.error} role={props.error ? 'alert' : undefined}>
      {props.error}
    </p>
  );

  if (props.multiline) {
    const { label, error, id, multiline, rows, ...rest } = props as MultiLineFieldProps;
    return (
      <div className={styles.field}>
        {header}
        <textarea
          id={inputId}
          className={styles.input}
          rows={rows ?? 4}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          {...rest}
        />
        {footer}
      </div>
    );
  }

  const { label, error, id, multiline, ...rest } = props as SingleLineFieldProps;
  return (
    <div className={styles.field}>
      {header}
      <input
        id={inputId}
        className={styles.input}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...rest}
      />
      {footer}
    </div>
  );
}
