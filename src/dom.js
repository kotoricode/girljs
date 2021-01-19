import * as $ from "./const";
import { LISTENER_ONCE } from "./utils/helper";
import { Publisher } from "./utils/publisher";

const getElement = (elementId) => window.document.getElementById(elementId);

const onResize = () =>
{
    const width = Math.min(
        window.innerWidth,
        window.innerHeight * $.SCREEN_ASPECT,
        $.SCREEN_WIDTH
    );

    if (width !== canvas.width)
    {
        const height = width / $.SCREEN_ASPECT;

        if (height !== canvas.height)
        {
            canvas.width = width;
            canvas.height = height;

            gl.viewport(0, 0, width, height);
            Publisher.publish($.EVENT_RESIZED);
        }
    }
};

const canvas = getElement("canvas");
export const gl = canvas.getContext("webgl2", { alpha: false });

for (const loadEvent of ["DOMContentLoaded", "load"])
{
    window.addEventListener(loadEvent, onResize, LISTENER_ONCE);
}

window.addEventListener("resize", onResize);
