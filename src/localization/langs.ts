import type { Language } from "./language";

export default [
  {
    key: "en",
    nativeName: "English",
    prefix: "EN",
  },
  {
    key: "fr",
    nativeName: "Français",
    prefix: "FR",
  },
] as const satisfies Language[];
