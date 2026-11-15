export const THEME_KEY = 'stepthrough-theme';

/** `system` stores nothing, so the page follows the operating system again. */
export type ThemeChoice = 'system' | 'light' | 'dark';

/** Runs in <head> before first paint so a stored theme never flashes the other one. */
export const themeBootScript = `try{var t=localStorage.getItem(${JSON.stringify(THEME_KEY)});if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
