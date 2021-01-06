import { PathNode } from "./path-node";
import { sqrDist } from "./math";

export class Path
{
    constructor(heapMaxSize)
    {
        this.startNode = new PathNode();
        this.endNode = new PathNode();
        this.nodes = new Set();

        this.heapMaxSize = heapMaxSize;
        this.heap = new Array(heapMaxSize); // head [0]
        this.heapSize = 0;
    }

    createNode(x, y)
    {
        const node = new PathNode(x, y);

        for (const other of this.nodes)
        {
            const dist = sqrDist(node.position, other.position);

            // TODO: check if adjacent
            node.adjacent.set(other, dist);
            other.adjacent.set(node, dist);
        }

        this.nodes.add(node);
    }

    finish()
    {
        for (const node of this.nodes)
        {
            node.isAdjacentToStart = false;
            node.isAdjacentToEnd = false;
        }

        this.heapSize = 0;
    }

    // run()
    // {
    //     // if not, connect START node to directly connected nodes,
    //     // then connect END node to directly connected nodes

    //     // then, generate rough to-end heuristic for every node

    //     // then run a*
    // }

    heapAdd(value)
    {
        if (this.heapSize === this.heapMaxSize)
        {
            throw Error;
        }

        let idx = this.heapSize++;
        this.heap[idx] = value;

        while (idx)
        {
            const parentIdx = (idx - 1) >> 1;
            const parent = this.heap[parentIdx];

            if (parent.score <= value.score)
            {
                break;
            }

            this.heap[parentIdx] = value;
            this.heap[idx] = parent;
            idx = parentIdx;
        }
    }

    heapPop()
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
                const left = this.heap[leftIdx],
                      right = this.heap[rightIdx];

                if (left.score > right.score)
                {
                    if (value.score > right.score)
                    {
                        idx = this.heapSwap(idx, rightIdx, value, right);
                        continue;
                    }
                }
                else if (value.score > left.score)
                {
                    idx = this.heapSwap(idx, leftIdx, value, left);
                    continue;
                }
            }
            else if (leftIdx < this.heapSize)
            {
                const left = this.heap[leftIdx];

                if (value.score > left.score)
                {
                    idx = this.heapSwap(idx, leftIdx, value, left);
                    continue;
                }
            }

            return retVal;
        }
    }

    heapSwap(idx1, idx2, val1, val2)
    {
        this.heap[idx1] = val2;
        this.heap[idx2] = val1;

        return idx2;
    }

    start(start, end)
    {
        const startPos = this.startNode.position,
              endPos = this.endNode.position;

        startPos.copyFrom(start);
        endPos.copyFrom(end);

        // first check if we can go directly from start to end
        // otherwise launch a*

        for (const node of this.nodes)
        {
            // if connected to start
            // const dist = this.startNode.sqrDist(node);
            // this.startAdjacent.set(node, dist);

            // if connected to end
            // const dist = this.endNode.sqrDist(node);
            // this.endAdjacent.set(node, dist);
        }
    }
}
