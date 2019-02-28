import {ArticleReducer}     from './article.reducer';
import {ArticleTempReducer} from './articleTemp.reducer';
import {FrameStateReducer}  from './frameState.reducer';

export const note = (modelName: string) => {
    return {
        'STORE_NOTE$FRAME': new FrameStateReducer(modelName).Action,
        'STORE_NOTE$ARTICLE': new ArticleReducer(modelName).Action,
        'STORE_NOTE$ARTICLE_TEMP': new ArticleTempReducer(modelName).Action,
    };
};