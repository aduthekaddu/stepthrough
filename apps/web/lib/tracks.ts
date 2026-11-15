const TRACK_TITLES: Record<string, string> = {
  foundations: 'Foundations',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  react: 'React',
  node: 'Node.js',
};

/** Display name for a track folder; a folder without an entry shows its own name. */
export const trackTitle = (track: string) => TRACK_TITLES[track] ?? track;
