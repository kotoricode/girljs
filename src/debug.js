import { gl } from "./dom";

const lineBuffer = gl.createBuffer();

export const getLineBuffer = () =>
{
    return lineBuffer;
};
