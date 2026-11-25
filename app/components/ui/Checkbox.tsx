import {forwardRef} from 'react';

/**
 * Case à cocher de la charte (carré noir). La zone cliquable couvre tout le
 * libellé (44 px de haut minimum). `extra` affiche un complément discret,
 * ex. le prix d'une option : « Ajouter des layers · +49 € ».
 */
export const Checkbox = forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
    label: string;
    extra?: string;
  }
>(function Checkbox({label, extra, className, ...rest}, ref) {
  return (
    <label className={['check', className].filter(Boolean).join(' ')}>
      <input ref={ref} type="checkbox" {...rest} />
      <span>{label}</span>
      {extra && <span className="check__extra">{extra}</span>}
    </label>
  );
});
