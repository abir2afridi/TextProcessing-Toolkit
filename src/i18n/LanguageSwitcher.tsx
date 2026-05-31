import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setLocale } from "@/i18n/config";

const locales: Record<string, string> = {
  en: "English",
  bn: "বাংলা",
  de: "Deutsch",
  es: "Español",
  fr: "Français",
  zh: "中文",
};

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language;

  return (
    <Select value={current} onValueChange={setLocale}>
      <SelectTrigger className="h-8 w-[72px] rounded-sm font-mono text-[11px] px-2 gap-1 border-0 bg-transparent hover:bg-accent focus:ring-0 focus:ring-offset-0 cursor-pointer">
        <Languages className="h-3.5 w-3.5 shrink-0" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(locales).map(([code, label]) => (
          <SelectItem key={code} value={code} className="cursor-pointer font-mono text-xs">
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
