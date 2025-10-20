import React from "react";
import { useI18n } from "../contexts/I18nContext";
export default function LocaleSwitcher() {
  const { locale, setLocale } = useI18n();
  return (
    <select
      value={locale}
      onChange={e => setLocale(e.target.value)}
      style={{margin: "0 1rem"}}
    >
      <option value="en">English</option>
      <option value="es">Español</option>
      <option value="fr">Français</option>
    </select>
  );
}
