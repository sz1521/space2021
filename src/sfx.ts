import { TUNE } from './tune';

// Play tune (from ZzFX)
declare var zzfxP: Function;

// Generate audio data for a song (from ZzFXM)
declare var zzfxM: Function;

export const playSong = (): void => {
  const buffer = zzfxM(...TUNE);
  zzfxP(...buffer);
};
