import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { type DashLang, getDashLang, setDashLang, getDashTranslations, type DashTranslations } from '@/data/dashI18n';

interface DashLangContextType {
  lang: DashLang;
  t: DashTranslations;
  changeLang: (l: DashLang) => void;
}

const DashLangContext = createContext<DashLangContextType>({
  lang: 'en',
  t: getDashTranslations('en'),
  changeLang: () => {},
});

export function DashLangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<DashLang>(getDashLang);

  const changeLang = (l: DashLang) => {
    setLang(l);
    setDashLang(l);
  };

  return (
    <DashLangContext.Provider value={{ lang, t: getDashTranslations(lang), changeLang }}>
      {children}
    </DashLangContext.Provider>
  );
}

export function useDashLang() {
  return useContext(DashLangContext);
}
