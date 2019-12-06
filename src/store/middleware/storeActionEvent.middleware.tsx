import {Action, Dispatch, Middleware} from "redux";

interface NewAction extends Action {
    playload: any
}

class StoreEvent {

    public eventMaps: any;

    constructor() {
        this.eventMaps = {};
        this.subscribe = this.subscribe.bind(this);
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
    public subscribe(actionType: string, callback: any) {

        if (!this.eventMaps[actionType]) {
            this.eventMaps[actionType] = [];
        }

        this.eventMaps[actionType].push((action: any) => {
            return callback(action)
        });

    }
}

const storeEvent     = new StoreEvent();
const storeSubscribe = storeEvent.subscribe;

// 中间件
const storeActionEventMiddleware: Middleware = () => (
    next: Dispatch
) => (action: NewAction) => {
    // 触发事件
    storeEvent.triggerEvent(action);
    return next(action);
};

export {storeActionEventMiddleware, storeSubscribe}

