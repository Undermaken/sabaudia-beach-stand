import { atom } from "jotai";
import { atomWithReset } from "jotai/utils";

export const SETTINGS = [
  "beach_stand_cover_area",
  "beach_stand_label"
] as const;
export type Setting = (typeof SETTINGS)[number];

export const activeSettingsAtom = atomWithReset<Setting[]>([]);

export const toggleSettingAtom = atom(null, (get, set, setting: Setting) => {
  const current = get(activeSettingsAtom);
  set(
    activeSettingsAtom,
    current.includes(setting)
      ? current.filter(s => s !== setting)
      : [...current, setting]
  );
});
