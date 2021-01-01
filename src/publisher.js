export class Publisher
{
    constructor()
    {
        this.topic = {};
    }

    subTopic(topic, sub, isInstant=true)
    {
        if (!(topic in this.topic))
        {
            this.topic[topic] = new Set();
        }

        this.topic[topic].add(sub);

        if (isInstant)
        {
            sub();
        }
    }

    fire(topic)
    {
        const subs = this.topic[topic];

        if (subs)
        {
            for (const sub of subs)
            {
                sub();
            }
        }
    }

    unsubTopic(topic, sub)
    {
        const subs = this.topic[topic];

        if (subs)
        {
            subs.delete(sub);
        }
    }
}
