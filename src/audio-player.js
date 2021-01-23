import * as $ from "./const";
import { Prefs } from "./save";
import { clamp, SafeMap, LISTENER_ONCE } from "./utility";

export const AudioPlayer = {
    play(audioId, url)
    {
        if (!url) throw Error;

        const audioObj = audio.get(audioId);
        audioObj.url = url;

        if (ctx)
        {
            audioObj.element.src = PATH + url;
        }
    },
    setGain(gainId, value, isSetPref=true)
    {
        const clamped = clamp(value, 0, 1);

        if (ctx)
        {
            gains.get(gainId).gain.value = clamped;
        }

        if (isSetPref)
        {
            Prefs.set(gainId, value);
        }
    },
    stop(audioId)
    {
        const audioObj = audio.get(audioId);
        audioObj.pause();
    }
};

const getGain = (gainId, parent) =>
{
    if (gains.has(gainId))
    {
        return gains.get(gainId);
    }

    const gain = ctx.createGain();
    gain.connect(parent);
    gains.set(gainId, gain);

    const volume = Prefs.get(gainId);
    AudioPlayer.setGain(gainId, volume, false);

    return gain;
};

const PATH = "./snd/";

const audio = new SafeMap([
    [$.AUDIO_MUSIC, {
        element: null,
        url: $.URL_AUD_OMOIDE,
        gainId: $.PREF_MUSIC,
        isLoop: true,
    }],
    [$.AUDIO_SOUND, {
        element: null,
        url: null,
        gainId: $.PREF_SOUND,
        isLoop: false,
    }],
    [$.AUDIO_SOUND_LOOP, {
        element: null,
        url: null,
        gainId: $.PREF_SOUND,
        isLoop: true,
    }]
]);

for (const audioObj of audio.values())
{
    const element = new Audio();
    element.loop = audioObj.isLoop;
    element.addEventListener("canplaythrough", element.play);
    audioObj.element = element;
}

window.addEventListener("mousedown", () =>
{
    ctx = new AudioContext();
    const master = getGain($.PREF_MASTER, ctx.destination);

    for (const [audioId, audioObj] of audio)
    {
        const gain = getGain(audioObj.gainId, master);
        ctx.createMediaElementSource(audioObj.element).connect(gain);

        if (audioObj.url)
        {
            AudioPlayer.play(audioId, audioObj.url);
        }
    }
}, LISTENER_ONCE);

const gains = new SafeMap();
let ctx;
