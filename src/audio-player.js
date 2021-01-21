import * as $ from "./const";
import { Prefs } from "./save";
import { clamp, SafeMap, LISTENER_ONCE } from "./utility";

export const AudioPlayer = {
    play(audioId, fileId)
    {
        if (!fileId) throw Error;

        const audioObj = audio.get(audioId);
        audioObj.fileId = fileId;

        if (ctx)
        {
            audioObj.element.src = $.PATH_SND + fileId;
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

const audio = new SafeMap([
    [$.AUDIO_MUSIC, {
        element: null,
        fileId: $.URL_AUD_OMOIDE,
        gainId: $.PREF_MUSIC,
        isLoop: true,
    }],
    [$.AUDIO_SOUND, {
        element: null,
        fileId: null,
        gainId: $.PREF_SOUND,
        isLoop: false,
    }],
    [$.AUDIO_SOUND_LOOP, {
        element: null,
        fileId: null,
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

        if (audioObj.fileId)
        {
            AudioPlayer.play(audioId, audioObj.fileId);
        }
    }
}, LISTENER_ONCE);

const gains = new SafeMap();
let ctx;
