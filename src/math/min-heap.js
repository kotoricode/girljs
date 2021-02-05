import { isNumber } from "../utility";

export class MinHeap
{
    constructor(heapMaxSize)
    {
        this.heap = new Array(heapMaxSize); // head [0]
        this.heapSize = 0;
        this.heapMaxSize = heapMaxSize;
    }

    push(item)
    {
        if (this.heapSize === this.heapMaxSize) throw Error;
        if (!isNumber(item.value)) throw Error;

        let idx = this.heapSize++;
        this.heap[idx] = item;

        while (idx)
        {
            const parentIdx = (idx - 1) >> 1;
            const parent = this.heap[parentIdx];

            if (parent.value <= item.value)
            {
                break;
            }

            this.heap[parentIdx] = item;
            this.heap[idx] = parent;
            idx = parentIdx;
        }
    }

    pop()
    {
        this.heapSize--;
        const value = this.heap[this.heapSize];

        const retVal = this.heap[0];
        this.heap[0] = value;

        let idx = 0;

        while (true)
        {
            const leftIdx = idx * 2 + 1;
            const rightIdx = leftIdx + 1;

            if (rightIdx < this.heapSize)
            {
                const left = this.heap[leftIdx];
                const right = this.heap[rightIdx];

                if (left.value > right.value)
                {
                    if (value.value > right.value)
                    {
                        idx = this.swap(idx, rightIdx, value, right);
                        continue;
                    }
                }
                else if (value.value > left.value)
                {
                    idx = this.swap(idx, leftIdx, value, left);
                    continue;
                }
            }
            else if (leftIdx < this.heapSize)
            {
                const left = this.heap[leftIdx];

                if (value.value > left.value)
                {
                    idx = this.swap(idx, leftIdx, value, left);
                    continue;
                }
            }

            return retVal;
        }
    }

    swap(idx1, idx2, val1, val2)
    {
        this.heap[idx1] = val2;
        this.heap[idx2] = val1;

        return idx2;
    }
}
