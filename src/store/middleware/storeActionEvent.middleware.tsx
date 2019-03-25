import {Action, Dispatch, Middleware} from "redux";

class StoreEvent {

    public eventList: any;

    constructor() {
        this.eventList = [];
        this.subscribe = this.subscribe.bind(this);
    }

    // 触发事件
    public triggerEvent(action: Action) {
        if (this.eventList[action.type]) {
            this.eventList[action.type](action);
        }
    }

    // 订阅事件
    public subscribe(actionType: string, callback: any) {
        this.eventList[actionType] = (action: Action) => {
            callback(action);
        };
    }
}

const storeEvent     = new StoreEvent();
const storeSubscribe = storeEvent.subscribe;

// 中间件
const storeActionEventMiddleware: Middleware = () => (
    next: Dispatch
) => <A extends Action>(action: A) => {

    console.log(action);

    // 触发事件
    storeEvent.triggerEvent(action);
    return next(action);
};

export {storeActionEventMiddleware, storeSubscribe}

