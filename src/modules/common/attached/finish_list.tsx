import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import * as React        from "react";

class FinishList extends React.Component {

    constructor(props: any) {
        super(props);
    }

    public render() {
        return (
            <div className="file-list finishList">
                <ul className="sort">
                    <li>
                        <span className="name">name</span>
                        <span className="type">type</span>
                        <span className="size">size</span>
                        <span className="action"/>
                    </li>
                </ul>
                <ul className="list">
                    <li>
                        <span className="name">md5wrwr323w23213dmasasd.png</span>
                        <span className="type">JPEG</span>
                        <span className="size">32.54kb</span>
                        <span className="action">
                            <label><FontAwesomeIcon className="fa-icon left" icon="trash"/></label>
                        </span>
                    </li>
                </ul>
            </div>
        )
    }
}

export default FinishList;