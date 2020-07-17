import {Action, Dispatch, Middleware} from "redux";

interface NewAction extends Action {
    playload: any
}

type ICallbackFn = (action: any) => any;

interface IEventMaps {
    [key: string]: ICallbackFn[];
}

class StoreEvent {

    public eventMaps: IEventMaps;

    constructor() {
        this.eventMaps   = {};
        this.subscribe   = this.subscribe.bind(this);
        this.unSubscribe = this.unSubscribe.bind(this);
    }

    // 触发事件
    public triggerEvent(action: NewAction) {
        if (this.eventMaps[action.type]) {
            this.eventMaps[action.type].map((item: any, index: number) => {
                this.eventMaps[action.type][index](action);
            });
        }
    }

    // 订阅事件
    public subscribe(actionType: string, callback: any, once: boolean = false): boolean | void {

        if (!this.eventMaps[actionType]) {
            this.eventMaps[actionType] = [];
        }

        if (once) {
            const index = this.eventMaps[actionType].findIndex((item) => item.name === callback.name);
            if (index >= 0) {
                return false
            }
        }

        this.eventMaps[actionType].push(callback);

    }

    // 解绑事件
    public unSubscribe(actionType: string, target: any) {
        const eventList = this.eventMaps[actionType];
        if (eventList) {
            eventList.forEach((item, index) => {
                if (item.name === target.name) {
                    eventList.splice(index, 1);
                }
            });
        }
    }
}

const storeEvent     = new StoreEvent();
const storeSubscribe = storeEvent.subscribe;
const unSubscribe    = storeEvent.unSubscribe;

// 中间件
const storeActionEventMiddleware: Middleware = () => (
    next: Dispatch
) => (action: NewAction) => {
    // 触发事件
    storeEvent.triggerEvent(action);
    return next(action);
};

export {storeActionEventMiddleware, storeSubscribe, unSubscribe}

