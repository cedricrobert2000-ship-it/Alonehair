import {forwardRef, useId} from 'react';

/**
 * Champs de formulaire accessibles :
 * - label toujours relié (htmlFor/id générés) ;
 * - aide et erreur reliées par aria-describedby, erreur annoncée (role="alert") ;
 * - aria-invalid quand il y a une erreur ;
 * - mention « facultatif » plutôt qu'astérisques ;
 * - police 16 px (pas de zoom automatique sur iPhone).
 */

type FieldShellProps = {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  hideLabel?: boolean;
  id?: string;
};

function useFieldIds(id?: string) {
  const auto = useId();
  const base = id ?? `f${auto.replace(/:/g, '')}`;
  return {id: base, hintId: `${base}-hint`, errorId: `${base}-error`};
}

function describedBy(ids: ReturnType<typeof useFieldIds>, p: FieldShellProps) {
  return (
    [p.hint && ids.hintId, p.error && ids.errorId].filter(Boolean).join(' ') ||
    undefined
  );
}

function Shell({
  ids,
  props,
  children,
}: {
  ids: ReturnType<typeof useFieldIds>;
  props: FieldShellProps;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label
        className={props.hideLabel ? 'sr-only' : 'field__label'}
        htmlFor={ids.id}
      >
        {props.label}
        {props.optional && <span className="field__optional">(facultatif)</span>}
      </label>
      {children}
      {props.hint && (
        <p className="field__hint" id={ids.hintId}>
          {props.hint}
        </p>
      )}
      {props.error && (
        <p className="field__error" id={ids.errorId} role="alert">
          {props.error}
        </p>
      )}
    </div>
  );
}

type InputProps = FieldShellProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'>;

export const TextField = forwardRef<HTMLInputElement, InputProps>(
  function TextField(
    {label, hint, error, optional, hideLabel, id, className, ...rest},
    ref,
  ) {
    const shell = {label, hint, error, optional, hideLabel};
    const ids = useFieldIds(id);
    return (
      <Shell ids={ids} props={shell}>
        <input
          ref={ref}
          id={ids.id}
          className={['input', className].filter(Boolean).join(' ')}
          required={!optional}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(ids, shell)}
          {...rest}
        />
      </Shell>
    );
  },
);

type TextAreaProps = FieldShellProps &
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'>;

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextAreaField(
    {label, hint, error, optional, hideLabel, id, className, ...rest},
    ref,
  ) {
    const shell = {label, hint, error, optional, hideLabel};
    const ids = useFieldIds(id);
    return (
      <Shell ids={ids} props={shell}>
        <textarea
          ref={ref}
          id={ids.id}
          className={['textarea', className].filter(Boolean).join(' ')}
          required={!optional}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(ids, shell)}
          {...rest}
        />
      </Shell>
    );
  },
);

type SelectProps = FieldShellProps &
  Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'id'> & {
    options: Array<{value: string; label: string; disabled?: boolean}>;
  };

export const SelectField = forwardRef<HTMLSelectElement, SelectProps>(
  function SelectField(
    {label, hint, error, optional, hideLabel, id, className, options, ...rest},
    ref,
  ) {
    const shell = {label, hint, error, optional, hideLabel};
    const ids = useFieldIds(id);
    return (
      <Shell ids={ids} props={shell}>
        <select
          ref={ref}
          id={ids.id}
          className={['select', className].filter(Boolean).join(' ')}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(ids, shell)}
          {...rest}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
      </Shell>
    );
  },
);
