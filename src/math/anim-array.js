import { lerp } from "./math-helper";

export class AnimArray
{
    constructor(keyValues, times)
    {
        this.curValue = [0, 0, 0];
        this.keyValues = keyValues;
        this.times = times;

        this.curTime = 0;
        this.maxTime = this.times[this.times.length - 1];
    }

    tick(dt)
    {
        this.setValue(this.curTime + dt);
    }

    getNextTimeIndex(x)
    {
        return x > this.curTime;
    }

    setValue(newTime)
    {
        this.curTime = newTime % this.maxTime;
        const index = this.times.findIndex(this.getNextTimeIndex, this);

        if (index !== this.oldIndex)
        {
            this.oldIndex = index;
            const baseIdx = index - 1;

            this.baseValue = this.keyValues[baseIdx];
            this.nextValue = this.keyValues[index];

            this.baseTime = this.times[baseIdx];
            this.iSegLen = 1 / (this.times[index] - this.baseTime);
        }

        const progress = (this.curTime - this.baseTime) * this.iSegLen;

        for (let i = 0; i < this.curValue.length; i++)
        {
            this.curValue[i] = lerp(
                this.baseValue[i],
                this.nextValue[i],
                progress
            );
        }
    }
}
