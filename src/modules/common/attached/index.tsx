import * as React        from "react";
import './attached.scss';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

class Attached extends React.Component {
    constructor(props: any) {
        super(props);
    }

    public render() {
        return (
            <div id="attached-window">
                <div className="tabs-bar">
                    <div className="area-left">
                        <span>ready</span>
                        <span className="current">finish</span>
                    </div>
                    <div className="area-right">
                        <button className="select">select</button>
                        <button className="upload disable">upload</button>
                    </div>
                </div>
                <div className="file-container">
                    <div className="file-list ready">
                        <ul className="sort">
                            <li>
                                <span className="name">name</span>
                                <span className="type">type</span>
                                <span className="size">size</span>
                                <span className="status">status</span>
                                <span className="action" />
                            </li>
                        </ul>
                        <ul className="list">
                            <li>
                                <span className="name">md5wrwr323w23213dmasasd.png</span>
                                <span className="type">JPEG</span>
                                <span className="size">32.54kb</span>
                                <span className="status">uploading ...</span>
                                <span className="action">
                                    <label>
                                        <FontAwesomeIcon className="fa-icon left" icon="times-circle"/>
                                    </label>
                                </span>
                            </li>
                            <li>
                                <span className="name">md5wrwr323w23213dmasasd.png</span>
                                <span className="type">JPEG</span>
                                <span className="size">32.54kb</span>
                                <span className="status">uploading ...</span>
                                <span className="action">
                                    <label>
                                        <FontAwesomeIcon className="fa-icon left" icon="times-circle"/>
                                    </label>
                                </span>
                            </li>
                            <li>
                                <span className="name">md5wrwr323w23213dmasasd.png</span>
                                <span className="type">JPEG</span>
                                <span className="size">32.54kb</span>
                                <span className="status">uploading ...</span>
                                <span className="action">
                                    <label>
                                        <FontAwesomeIcon className="fa-icon left" icon="times-circle"/>
                                    </label>
                                </span>
                            </li>
                            <li>
                                <span className="name">md5wrwr323w23213dmasasd.png</span>
                                <span className="type">JPEG</span>
                                <span className="size">32.54kb</span>
                                <span className="status">uploading ...</span>
                                <span className="action">
                                    <label>
                                        <FontAwesomeIcon className="fa-icon left" icon="times-circle"/>
                                    </label>
                                </span>
                            </li>
                            <li>
                                <span className="name">md5wrwr323w23213dmasasd.png</span>
                                <span className="type">JPEG</span>
                                <span className="size">32.54kb</span>
                                <span className="status">uploading ...</span>
                                <span className="action">
                                    <label>
                                        <FontAwesomeIcon className="fa-icon left" icon="times-circle"/>
                                    </label>
                                </span>
                            </li>
                        </ul>
                    </div>
                    <div className="file-list finish">2</div>
                </div>
                <div className="status-bar"/>
            </div>
        )
    }
}

export default Attached;