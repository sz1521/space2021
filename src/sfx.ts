import zzfxM from './zzfxm';
import { zzfxP, zzfxX } from './zzfx';

export class Sfx {

    private buffer:any;
    private node:any;

    // As we're downloading the song as a string, we need to convert it to JSON
    // before we can play it.
    //
    // This step isn't required when embedding a song directly into your
    // production.
    parse = (str: string) => {
        str = str.replace(/\[,/g,'[null,')
        .replace(/,,\]/g,',null]')
        .replace(/,\s*(?=[,\]])/g,',null')
        .replace(/([\[,]-?)(?=\.)/g,'$10')
        .replace(/-\./g,'-0.');

        return JSON.parse(str, (key, value) => {
        if (value === null) {
            return undefined;
        }
        return value;
        });
    };


    // Loads a song
    load = async (name: string) => {
        const res = await fetch(`../songs/${name}.js`);
        const src = await res.text();
        return this.parse(src); // remove parse?
    }

    // Renders the song. ZzFXM blocks the main thread so defer execution for a few
    // ms so that any status message change can be repainted.
    render = (song: any) => {
        return new Promise(resolve => {
            setTimeout(() => resolve(zzfxM(...song)), 50);
        });
    }

    // Sets the current song to the value selected in the UI
    setSong = async () => {

        const isPlaying = !!this.node;

        if (isPlaying) {
            await stop();
        }

        const song = await this.load("tune.js");

        this.buffer = await this.render(song);

        if (isPlaying) {
            await this.playSong();
        }
    }

    // Play the tune
    playSong = async () => {
        if (this.node) {
            return;
        }
        this.node = zzfxP(...this.buffer);
        this.node.loop = true;
        await zzfxX.resume();
    }

    // Stop playing the tune
    stopSong = async () => {
        if (!this.node) {
            return
        }
        await zzfxX.suspend();
        this.node.stop();
        this.node.disconnect();
        this.node = null;
    }
}