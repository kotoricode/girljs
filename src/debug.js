import * as $ from "./const";
import { gl } from "./dom";
import { getBuffer } from "./gl/buffer";

const buffer = getBuffer($.BUFFER_DEBUG);

gl.bindBuffer($.ARRAY_BUFFER, buffer);

gl.bufferData($.ARRAY_BUFFER, new Float32Array([
    0.0, 0.0,
    100.0, 100.0
]), $.STATIC_DRAW);

gl.bindBuffer($.ARRAY_BUFFER, null);

console.log("hello world");
