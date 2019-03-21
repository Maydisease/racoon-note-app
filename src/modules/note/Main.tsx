import * as React        from 'react';
import ArticleComponent  from './components/article';
import CategoryComponent from './components/category';
import ListComponent     from './components/list';
import './interface/service.interface';

class NoteMain extends React.Component {

    constructor(props: any) {
        super(props);
    }

    public render() {
        return (
            <div id="noteMain">
                <CategoryComponent/>
                <ListComponent/>
                <ArticleComponent/>
            </div>
        );
    }
}

export default NoteMain;
