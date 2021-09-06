import { TUNE } from './tune';

// Play tune (from ZzFX)
declare var zzfxP: (...parameters: any[]) => AudioBufferSourceNode;

// Generate audio data for a song (from ZzFXM)
declare var zzfxM: Function;

export const renderSong = (): any => {
  return zzfxM(...TUNE);
};

export const playSong = (song: any): void => {
  const node = zzfxP(...song);
  node.loop = true;
};
