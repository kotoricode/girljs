import * as $ from "./const";
import { Prefs } from "./save";
import { SafeMap } from "./utility";

export const AudioPlayer = {
    init()
    {
        ctx = new AudioContext();
        const master = getGain($.PREF_MASTER, ctx.destination);

        for (const [audioId, audioObj] of audio)
        {
            const gain = getGain(audioObj.gainId, master);
            ctx.createMediaElementSource(audioObj.element).connect(gain);

            if (audioObj.src)
            {
                AudioPlayer.play(audioId, audioObj.src);
            }
        }
    },
    play(audioId, src)
    {
        if (!src) throw Error;

        const elem = audio.get(audioId);
        elem.setSrc(src);
    },
    setGain(gainId, value)
    {
        if (value < 0 || 1 < value) throw value;

        Prefs.set(gainId, value);

        if (ctx)
        {
            getGain(gainId).gain.value = value;
        }
    },
    stop(audioId)
    {
        const elem = audio.get(audioId);
        elem.pause();
    }
};

const getGain = (gainId, parent) =>
{
    if (!gains.has(gainId))
    {
        const gain = ctx.createGain();
        gain.connect(parent);
        gains.set(gainId, gain);

        const volume = Prefs.get(gainId);
        AudioPlayer.setGain(gainId, volume);
    }

    return gains.get(gainId);
};

class AudioElement
{
    constructor(gainId, isLoop, src)
    {
        this.element = new Audio();
        this.element.loop = isLoop;
        this.element.addEventListener("canplaythrough", this.element.play);

        this.src = src;
        this.gainId = gainId;
    }

    setSrc(src)
    {
        this.src = src;

        if (ctx)
        {
            this.element.src = "./snd/" + src;
        }
    }
}

const audio = new SafeMap([
    [$.AUD_MUSIC, new AudioElement($.PREF_MUSIC, true, $.AUD_OMOIDE)],
    [$.AUD_SOUND, new AudioElement($.PREF_SOUND, false)],
    [$.AUD_SOUND_LOOP, new AudioElement($.PREF_SOUND, true)],
]);

const gains = new SafeMap();
let ctx;
