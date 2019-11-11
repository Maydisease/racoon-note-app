type ObserverCallback = (event: ObserverEvent) => void

interface EventMaps {
    [key: string]: any[];
}

export interface ObserverEvent {
    name: string
    data?: any
}

export class ObserverService {

    public eventMaps: EventMaps;

    constructor() {
        this.eventMaps = {};
        this.publish   = this.publish.bind(this);
        this.subscribe = this.subscribe.bind(this);
    }

    public subscribe(name: string, callback: ObserverCallback) {
        if (!this.eventMaps[name]) {
            this.eventMaps[name] = [];
        }

        this.eventMaps[name].push((event: ObserverEvent) => {
            return callback(event)
        });
    }

    public publish(event: ObserverEvent) {
        if (this.eventMaps && this.eventMaps[event.name]) {
            this.eventMaps[event.name].map((item: ObserverEvent, index: number) => {
                this.eventMaps[event.name][index](event);
            });
        }
    }
}
