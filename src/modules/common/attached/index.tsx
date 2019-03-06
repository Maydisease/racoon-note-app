import * as React from "react";
import './attached.scss';

class Attached extends React.Component {
    constructor(props: any) {
        super(props);
    }

    public render() {
        return (
            <div id="attached-window">
                <div className="tabs-bar">
                    <span>ready</span>
                    <span className="current">finish</span>
                    <button>selected</button>
                </div>
                <div className="file-container">
                    <div className="file-list">1</div>
                    <div className="file-list">2</div>
                </div>
            </div>
        )
    }
}

export default Attached;