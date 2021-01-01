import { optsPub, getOption } from "./options";

import * as CONST from "./const";

const createGain = (id, parent) =>
{
    const gainObj = context.createGain();
    gainObj.connect(parent);
    gains[id] = gainObj;
    optsPub.subTopic(id, () => gainObj.gain.value = getOption(id));

    return gainObj;
};

export const setMusic = (fileId) =>
{
    nowPlaying = CONST.PATH_SND + fileId;

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

    gains[id].gain.value = value;
};

export const audioWaitClick = () =>
{
    window.addEventListener("click", () =>
    {
        context = new AudioContext();

        const gainMaster = createGain(CONST.OPTION_MASTER, context.destination);
        const gainMusic = createGain(CONST.OPTION_MUSIC, gainMaster);
        createGain(CONST.OPTION_SOUND, gainMaster);

        context.createMediaElementSource(music).connect(gainMusic);
        setMusic(CONST.AUDIO_OMOIDE);
    }, { once: true });
};

const music = new Audio();
music.loop = true;
music.addEventListener("canplaythrough", music.play);

const gains = {};

let context;
let nowPlaying;
