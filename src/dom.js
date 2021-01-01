import { Publisher } from "./publisher";

import * as CONST from "./const";

// export const getDom = (id) =>
// {
//     const elem = window.document.getElementById(id);

//     if (!elem)
//     {
//         throw id;
//     }

//     return elem;
// };

export const storage = window.localStorage;

const canvas = window.document.getElementById("canvas");
export const gl = canvas.getContext("webgl2", { alpha: false });

/*------------------------------------------------------------------------------
    Canvas area
------------------------------------------------------------------------------*/
export const canvasMaxWidth = 1280,
             canvasMaxHeight = 720;

export const canvasAspect = canvasMaxWidth / canvasMaxHeight;

let canvasRect;

export const resizePub = new Publisher();

const onResize = () =>
{
    const width = Math.min(
        window.innerWidth,
        window.innerHeight * canvasAspect,
        canvasMaxWidth
    );

    if (width !== canvas.width)
    {
        const height = width / canvasAspect;

        if (height !== canvas.height)
        {
            canvas.width = width;
            canvas.height = height;

            gl.viewport(0, 0, width, height);
            resizePub.emit(CONST.EVENT_RESIZE);
        }
    }

    canvasRect = canvas.getBoundingClientRect();
};

for (const resizeEvent of ["DOMContentLoaded", "load", "resize"])
{
    window.addEventListener(resizeEvent, onResize);
}

/*------------------------------------------------------------------------------
    Mouse
------------------------------------------------------------------------------*/
export const mouse = {
    clipCoords: [0, 0],
    isClick: false
};

const onClick = (e) =>
{
    mouse.clipCoords[0] = 2*(e.clientX-canvasRect.left)/canvas.clientWidth - 1;
    mouse.clipCoords[1] = 1 - 2*(e.clientY-canvasRect.top)/canvas.clientHeight;
    mouse.isClick = true;
};

canvas.addEventListener("click", (e) => onClick(e));
canvas.addEventListener("contextmenu", (e) => e.preventDefault());
