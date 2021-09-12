import { TUNE } from './tune';

// https://github.com/KilledByAPixel/ZzFX
// https://killedbyapixel.github.io/ZzFX/

// Generate a sound
declare var zzfxG: (...data: any) => any[];

// Play tune (from ZzFX)
declare var zzfxP: (...parameters: any[]) => AudioBufferSourceNode;

// Generate audio data for a song (from ZzFXM)
// https://keithclark.github.io/ZzFXM/
declare var zzfxM: Function;

export const DESTROYCONE = zzfxG([,,33,.1,.02,.2,4,2.02,-36,5.9,,,.12,,,,,,.09]);
export const DESTROYPLANT = zzfxG([2.47,,1626,,.01,0,1,2.21,-19,,,,.04,,,.3,.11,.68,.04,.09]);
export const PLANTFLOWER = zzfxG([1.05,,1629,.03,.23,.01,1,2.79,23,6,,,.23,,-2.6,,,.25,.01]);
export const PLANTVINE = zzfxG([2.01,,179,.14,.25,.01,1,1.48,,,,,,.3,,,.16,.11,.21,.1]);

export const playEffect = (effect: any[]): void => {
  zzfxP(effect);
}

export const renderSong = (): any => {
  return zzfxM(...TUNE);
};

export const playSong = (song: any): void => {
  const node = zzfxP(...song);
  node.loop = true;
};
