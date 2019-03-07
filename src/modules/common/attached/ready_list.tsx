import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import * as React        from "react";

interface DefaultProps {
    readyUploadList: any;
}

class ReadyList extends React.Component {

    public props: DefaultProps = {
        readyUploadList: []
    };

    constructor(props: any) {
        super(props);
    }

    public render() {

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
                    {this.props.readyUploadList.map((item: any, index: number) => {
                        return (
                            <li key={index}>
                                <span className="name">{item.name}</span>
                                <span className="type">{item.type}</span>
                                <span className="size">{item.size}</span>
                                <span className="status">uploading ...</span>
                                <span className="action"><label><FontAwesomeIcon className="fa-icon left" icon="times-circle"/></label></span>
                            </li>
                        )
                    })}
                </ul>
            </div>
        )
    }
}

export default ReadyList;