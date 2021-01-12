export const clamp = (val, min=0, max=1) => Math.min(max, Math.max(min, val));

export const lerp = (start, end, amount) => start*(1-amount) + end*amount;

export const DEG_TO_RAD = Math.PI / 180;
