import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import * as React        from "react";
import DropZone          from '../../component/drop_zone';
import {utils}           from '../../../utils';


interface DefaultProps {
    readyUploadList: any;
    readyListRemoveEvent: any;
    dropFilesEvent: any;
}

class ReadyList extends React.Component {

    public props: DefaultProps = {
        readyUploadList     : [],
        readyListRemoveEvent: '',
        dropFilesEvent      : ''
    };

    constructor(props: DefaultProps) {
        super(props);
        this.props           = props;
        this.removeLi        = this.removeLi.bind(this);
        this.handelDropFiles = this.handelDropFiles.bind(this);
    }

    public removeLi(item: any) {
        this.props.readyListRemoveEvent(item);
    }

    // 当文件被拖拽放置在Element上
    public onDragOver = (e: any) => {
        const event = e as Event;
        event.stopPropagation();
        event.preventDefault();
    };

    // 当文件被拖拽放置在Element上
    public onFileDrop = (e: any) => {
        const event = e as any;
        event.stopPropagation();
    };

    public handelDropFiles(files: any) {
        this.props.dropFilesEvent(files);
    }

    public render() {

        const UploadStatus = (props: any) => {
            let text = '';
            switch (props.status) {
                case 0:
                    text = 'ready';
                    break;
                case 1:
                    text = 'upload...';
                    break;
                case 2:
                    text = 'finis';
                    break;
                case 3:
                    text = 'error';
                    break;
            }
            return (<span className="status">{text}</span>)
        };

        return (
            <DropZone
                dropFiles={this.handelDropFiles}
            >
                <div
                    id="drag"
                    className="file-list ready"

                >
                    <ul className="sort">
                        <li>
                            <span className="name">name</span>
                            <span className="type">type</span>
                            <span className="size">size</span>
                            <span className="status">status</span>
                            <span className="action"/>
                        </li>
                    </ul>
                    <ul>
                        {
                            this.props.readyUploadList.map((item: any, index: number) => {
                                return (
                                    <li key={index}>
                                        <span className="name">{item.name}</span>
                                        <span className="type">{item.type}</span>
                                        <span className="size">{utils.bytesToSize(item.size)}</span>
                                        <UploadStatus status={item.status}/>
                                        <span className="action">
                                    <label onClick={this.removeLi.bind(this, item)}><FontAwesomeIcon className="fa-icon left" icon="times-circle"/></label>
                                </span>
                                    </li>
                                );
                            })
                        }
                    </ul>
                </div>
            </DropZone>
        )
    }
}

export default ReadyList;