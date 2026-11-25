import {createContext, type ReactNode, useCallback, useContext, useMemo, useState} from 'react';
import {Drawer} from '~/components/ui/Drawer';

type AsideType = 'search' | 'cart' | 'mobile' | 'closed';
type AsideContextValue = {
  type: AsideType;
  open: (mode: AsideType) => void;
  close: () => void;
};

/**
 * Tiroirs du site (panier, recherche, menu mobile), basés sur <Drawer> :
 * Échap, focus piégé, défilement bloqué. Un seul ouvert à la fois.
 */
export function Aside({
  children,
  heading,
  type,
  footer,
}: {
  children?: React.ReactNode;
  type: AsideType;
  heading: string;
  footer?: React.ReactNode;
}) {
  const {type: activeType, close} = useAside();
  return (
    <Drawer
      open={type === activeType}
      onClose={close}
      title={heading}
      side={type === 'mobile' ? 'left' : 'right'}
      footer={footer}
    >
      {children}
    </Drawer>
  );
}

const AsideContext = createContext<AsideContextValue | null>(null);

Aside.Provider = function AsideProvider({children}: {children: ReactNode}) {
  const [type, setType] = useState<AsideType>('closed');
  const close = useCallback(() => setType('closed'), []);
  const value = useMemo(() => ({type, open: setType, close}), [type, close]);
  return <AsideContext.Provider value={value}>{children}</AsideContext.Provider>;
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}
