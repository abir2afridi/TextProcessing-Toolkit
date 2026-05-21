import { wordlist as en } from "@scure/bip39/wordlists/english.js";
import { wordlist as cs } from "@scure/bip39/wordlists/czech.js";
import { wordlist as fr } from "@scure/bip39/wordlists/french.js";
import { wordlist as it } from "@scure/bip39/wordlists/italian.js";
import { wordlist as ja } from "@scure/bip39/wordlists/japanese.js";
import { wordlist as ko } from "@scure/bip39/wordlists/korean.js";
import { wordlist as pt } from "@scure/bip39/wordlists/portuguese.js";
import { wordlist as zh_cn } from "@scure/bip39/wordlists/simplified-chinese.js";
import { wordlist as es } from "@scure/bip39/wordlists/spanish.js";
import { wordlist as zh_tw } from "@scure/bip39/wordlists/traditional-chinese.js";

export const languageMap: Record<string, readonly string[]> = {
  English: en,
  "Chinese simplified": zh_cn,
  "Chinese traditional": zh_tw,
  Czech: cs,
  French: fr,
  Italian: it,
  Japanese: ja,
  Korean: ko,
  Portuguese: pt,
  Spanish: es,
};

export const languageLabels = Object.keys(languageMap);
export type Language = keyof typeof languageMap;
