import { TUNE } from './tune';
import { zzfx, DESTROYCONE, DESTROYPLANT, PLANTFLOWER, PLANTVINE } from './fx';
// Generate a sound
declare var zzfxG: (...data: any) => any[];

// Play tune (from ZzFX)
declare var zzfxP: (...parameters: any[]) => AudioBufferSourceNode;

// Generate audio data for a song (from ZzFXM)
// https://keithclark.github.io/ZzFXM/
declare var zzfxM: Function;

export const renderSong = (): any => {
  return zzfxM(...TUNE);
};

export const playSong = (song: any): void => {
  const node = zzfxP(...song);
  node.loop = true;
};
