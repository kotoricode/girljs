import * as $ from "./const";
import { clamp } from "./math/math-helper";
import { Prefs } from "./save";
import { SafeMap } from "./utils/safe-builtins";

export const AudioPlayer = {
    init()
    {
        context = new AudioContext();
        const master = createGain($.PREF_MASTER, context.destination);

        for (const [audioId, audioObj] of audio)
        {
            const gain = createGain(audioObj.gainId, master);
            context.createMediaElementSource(audioObj.element).connect(gain);

            if (audioObj.fileName)
            {
                play(audioId);
            }
        }
    },
    setFile(soundId, fileName)
    {
        const audioObj = audio.get(soundId);
        audioObj.fileName = fileName;
    },
    setGain(gainId, value, isSetPref=true)
    {
        const clamped = clamp(value, 0, 1);

        if (context)
        {
            gains.get(gainId).gain.value = clamped;
        }

        if (isSetPref)
        {
            Prefs.set(gainId, value);
        }
    }
};

const createGain = (gainId, parent) =>
{
    const gainObj = context.createGain();
    gainObj.connect(parent);
    gains.set(gainId, gainObj);

    const volume = Prefs.get(gainId);
    AudioPlayer.setGain(gainId, volume, false);

    return gainObj;
};

const play = (soundId) =>
{
    const { fileName, element } = audio.get(soundId);

    if (!fileName)
    {
        throw Error;
    }

    if (context)
    {
        element.src = $.PATH_SND + fileName;
    }
};

const audio = new SafeMap([
    [$.AUDIO_MUSIC, {
        element: null,
        fileName: $.FILE_OMOIDE,
        gainId: $.PREF_MUSIC,
        isLoop: true,
    }],
    [$.AUDIO_SOUND, {
        element: null,
        fileName: null,
        gainId: $.PREF_SOUND,
        isLoop: false,
    }],
    [$.AUDIO_SOUND_LOOP, {
        element: null,
        fileName: null,
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

const gains = new SafeMap();

let context;
