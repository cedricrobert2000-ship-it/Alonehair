import {useEffect, useState} from 'react';

/**
 * Sélecteur de quantité.
 * - boutons −/+ (désactivés aux bornes) et saisie directe au clavier ;
 * - la valeur est ramenée entre min et max quand on quitte le champ ;
 * - `name` : la valeur part avec le formulaire (fonctionne sans JS).
 */
export function QuantityInput({
  value,
  defaultValue = 1,
  onChange,
  min = 1,
  max = 99,
  name,
  label = 'Quantité',
  disabled,
}: {
  value?: number;
  defaultValue?: number;
  onChange?: (qty: number) => void;
  min?: number;
  max?: number;
  name?: string;
  label?: string;
  disabled?: boolean;
}) {
  const controlled = value !== undefined;
  const [inner, setInner] = useState(value ?? defaultValue);
  const [draft, setDraft] = useState(String(value ?? defaultValue));
  const current = controlled ? value : inner;

  useEffect(() => {
    setDraft(String(current));
  }, [current]);

  const commit = (next: number) => {
    const clamped = Math.min(max, Math.max(min, Number.isNaN(next) ? min : next));
    if (!controlled) setInner(clamped);
    setDraft(String(clamped));
    if (clamped !== current) onChange?.(clamped);
  };

  return (
    <div className="qty" role="group" aria-label={label}>
      <button
        type="button"
        aria-label="Retirer un"
        disabled={disabled || current <= min}
        onClick={() => commit(current - 1)}
      >
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        name={name}
        min={min}
        max={max}
        value={draft}
        disabled={disabled}
        aria-label={label}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => commit(parseInt(draft, 10))}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit(parseInt(draft, 10));
        }}
      />
      <button
        type="button"
        aria-label="Ajouter un"
        disabled={disabled || current >= max}
        onClick={() => commit(current + 1)}
      >
        +
      </button>
    </div>
  );
}
