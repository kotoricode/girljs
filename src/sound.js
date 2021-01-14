import * as $ from "./const";
import { clamp } from "./math/math-helper";
import { Prefs } from "./save";

export const Sound = {
    init()
    {
        context = new AudioContext();
        const gainMaster = createGain($.PREF_MASTER, context.destination);
        const gainMusic = createGain($.PREF_MUSIC, gainMaster);
        context.createMediaElementSource(music).connect(gainMusic);
        createGain($.PREF_SOUND, gainMaster);

        playMusic();
    },
    setGain(gainId, value, isSetPref=true)
    {
        const clamped = clamp(value, 0, 1);

        if (context)
        {
            if (!gains.has(gainId))
            {
                throw gainId;
            }

            gains.get(gainId).gain.value = clamped;
        }

        if (isSetPref)
        {
            Prefs.set(gainId, value);
        }
    },
    setMusic(audioId)
    {
        nowPlaying = audioId;
        playMusic();
    }
};

const createGain = (gainId, parent) =>
{
    const gainObj = context.createGain();
    gainObj.connect(parent);
    gains.set(gainId, gainObj);

    const volume = Prefs.get(gainId);
    Sound.setGain(gainId, volume, false);

    return gainObj;
};

const playMusic = () =>
{
    if (!nowPlaying)
    {
        throw Error;
    }

    if (context)
    {
        music.src = $.PATH_SND + nowPlaying;
    }
};

const music = new Audio();
music.loop = true;
music.addEventListener("canplaythrough", music.play);

const gains = new Map();

let context;
let nowPlaying = $.AUDIO_OMOIDE;
