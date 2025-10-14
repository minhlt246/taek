"use client";

import { useEffect } from "react";
import "@/locales/i18n";

interface I18nProviderProps {
  children: React.ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  useEffect(() => {
    // i18n is initialized in the import above
  }, []);

  return <>{children}</>;
};
