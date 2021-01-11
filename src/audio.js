import * as $ from "./const";
import { clamp } from "./math/math-helper";
import { getPref, setPref } from "./save";

const createGain = (gainId, parent) =>
{
    const gainObj = context.createGain();
    gainObj.connect(parent);
    gains.set(gainId, gainObj);

    const volume = getPref(gainId);
    setGain(gainId, volume, false);

    return gainObj;
};

export const initAudio = () =>
{
    context = new AudioContext();
    const gainMaster = createGain($.PREF_MASTER, context.destination);
    const gainMusic = createGain($.PREF_MUSIC, gainMaster);
    context.createMediaElementSource(music).connect(gainMusic);
    createGain($.PREF_SOUND, gainMaster);

    playMusic();
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

export const setGain = (gainId, value, isSetPref=true) =>
{
    const clamped = clamp(value, 0, 1);

    if (clamped !== value)
    {
        console.warn(value);
        console.warn(clamped);
    }

    if (context)
    {
        gains.get(gainId).gain.value = clamped;
    }

    if (isSetPref)
    {
        setPref(gainId, value);
    }
};

export const setMusic = (audioId) =>
{
    nowPlaying = audioId;
    playMusic();
};

const music = new Audio();
music.loop = true;
music.addEventListener("canplaythrough", music.play);

const gains = new Map();

let context;
let nowPlaying = $.AUDIO_OMOIDE;
