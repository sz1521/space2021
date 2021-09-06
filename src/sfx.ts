import { TUNE } from './tune';

// Play tune (from ZzFX)
declare var zzfxP: (...parameters: any[]) => AudioBufferSourceNode;

// Generate audio data for a song (from ZzFXM)
declare var zzfxM: Function;

export const playSong = (): void => {
  const buffer = zzfxM(...TUNE);
  const node = zzfxP(...buffer);
  node.loop = true;
};
