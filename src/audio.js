import { getOption } from "./options";
import { subscribe } from "./publisher";

import * as $ from "./const";

const createGain = (id, parent) =>
{
    const gainObj = context.createGain();
    gainObj.connect(parent);
    gains.set(id, gainObj);
    subscribe(id, () => gainObj.gain.value = getOption(id));

    return gainObj;
};

export const setMusic = (fileId) =>
{
    nowPlaying = $.PATH_SND + fileId;

    if (context)
    {
        music.src = nowPlaying;
    }
};

export const setVolume = (id, value) =>
{
    if (!context)
    {
        throw Error;
    }

    gains.get(id).gain.value = value;
};

export const initAudio = () =>
{
    context = new AudioContext();
    const dest = context.destination;

    const gainMaster = createGain($.OPTION_MASTER, dest);
    const gainMusic = createGain($.OPTION_MUSIC, gainMaster);
    createGain($.OPTION_SOUND, gainMaster);

    context.createMediaElementSource(music).connect(gainMusic);
    setMusic($.AUDIO_OMOIDE);
};

const music = new Audio();
music.loop = true;
music.addEventListener("canplaythrough", music.play);

const gains = new Map();

let context;
let nowPlaying;
