import * as $ from "./const";
import { gl } from "./dom";
import { bindBuffer, unbindBuffer } from "./gl/buffer";

bindBuffer($.BUFFER_DEBUG);

gl.bufferData($.ARRAY_BUFFER, new Float32Array([
    0.0, 0.0,
    100.0, 100.0
]), $.STATIC_DRAW);

unbindBuffer();

console.log("hello world");
