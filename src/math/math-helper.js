export const clamp = (value, minValue=0, maxValue=1) =>
{
    return Math.min(maxValue, Math.max(minValue, value));
};

export const lerp = (start, end, amount) =>
{
    return start*(1-amount) + end*amount;
};

export const DEG_TO_RAD = Math.PI / 180;
