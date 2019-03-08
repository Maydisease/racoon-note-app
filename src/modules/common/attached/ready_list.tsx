import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import * as React        from "react";
import {utils}           from '../../../utils';

interface DefaultProps {
    readyUploadList: any;
    readyListRemoveEvent: any;
}

class ReadyList extends React.Component {

    public props: DefaultProps = {
        readyUploadList     : [],
        readyListRemoveEvent: ''
    };

    constructor(props: DefaultProps) {
        super(props);
        this.props    = props;
        this.removeLi = this.removeLi.bind(this);
    }

    public removeLi(item: any) {
        this.props.readyListRemoveEvent(item);
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
            <div className="file-list ready">
                <ul className="sort">
                    <li>
                        <span className="name">name</span>
                        <span className="type">type</span>
                        <span className="size">size</span>
                        <span className="status">status</span>
                        <span className="action"/>
                    </li>
                </ul>
                <ul className="list">
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
        )
    }
}

export default ReadyList;