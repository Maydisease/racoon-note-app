import * as React        from 'react';
import {friendlyDate}    from "../../../../../utils/friendlyDate.utils";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

class ArticleItems extends React.Component {

    public props: any;


    constructor(props: any) {
        super(props);
        this.handleItemClick       = this.handleItemClick.bind(this);
        this.handleItemContextMenu = this.handleItemContextMenu.bind(this);
    }

    public shouldComponentUpdate(nextProps: Readonly<any>): boolean {

        console.log(this.props.articleObj === nextProps.articleObj);

        if (this.props.articleList !== nextProps.articleList) {
            return true;
        }

        if (this.props.articleObj.id === 0 && nextProps.articleObj.id === 0) {
            return true;
        } else if (this.props.articleObj.id === nextProps.articleObj.id) {
            return false;
        }
        return true;
    }

    public handleItemClick(item: any) {
        this.props.handleItemClick(item);
    }

    public handleItemContextMenu(item: any) {
        this.props.handleItemContextMenu(item);
    }

    public componentDidMount(): void {
        //
    }

    public render() {
        return (
            this.props.articleList && this.props.articleList.length > 0 ?
                this.props.articleList.map((item: any, index: number) => {
                    return (
                        <div
                            className={`item ${item.selected === true && 'current'}`}
                            key={item.id}
                            id={`list_element_${item.id}`}
                            onClick={this.handleItemClick.bind(this, item, false)}
                            onContextMenu={this.handleItemContextMenu.bind(this, item)}
                        >
                            <div className="subscript">
                                <span>{friendlyDate(item.updateTime)}</span>
                                {
                                    item.on_share &&
									<span className='share-icon'>
                                            <FontAwesomeIcon className="fa-icon" icon="share-alt"/>
                                        </span> || null
                                }
                            </div>
                            <div className="context">
                                <h2
                                    data-cid={item.cid}
                                    data-id={item.id}
                                    data-lock={item.lock}
                                    dangerouslySetInnerHTML={{__html: item.title}}
                                    onDragStart={this.props.dragStartHandle}
                                    onDragEnd={this.props.dragEndHandle}
                                    draggable={true}
                                />
                                <div className="description">
                                    {item.lock === 0 &&
									<dl>{item.description}</dl>
                                    }
                                    {item.lock === 1 &&
									<dl><p/><p/><p/></dl>
                                    }
                                </div>
                            </div>
                        </div>
                    )
                })
                :
                <div className="not-data">No notes ...</div>
        );
    }
}

export default ArticleItems;
