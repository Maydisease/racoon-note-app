export const undoable = (reducer: any) => {
    
    // 以一个空的 action 调用 reducer 来产生初始的 state
    const initialState = {
        past   : [],
        present: reducer(undefined, {}),
        future : []
    };

    // 返回一个可以执行撤销和重做的新的reducer
    return (state: any = initialState, action: any) => {
        const {past, present, future} = state;

        switch (action.type) {
            case 'UNDO':
                const previous = past[past.length - 1];
                const newPast  = past.slice(0, past.length - 1);
                return {
                    past   : newPast,
                    present: previous,
                    future : [present, ...future]
                };
            case 'REDO':
                const next      = future[0];
                const newFuture = future.slice(1);
                return {
                    past   : [...past, present],
                    present: next,
                    future : newFuture
                };
            case 'CLEAR':
                return initialState;
            default:
                // 将其他 action 委托给原始的 reducer 处理
                const newPresent = reducer(present, action);
                if (present === newPresent) {
                    return state
                }
                return {
                    past   : [...past, present],
                    present: newPresent,
                    future : []
                }
        }
    }
};