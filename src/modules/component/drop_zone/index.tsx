import * as React from 'react';
import * as path  from "path";

class DropZone extends React.Component {

    public props: any = {
        dropFiles: '',
        children : ''
    };

    constructor(props: any) {
        super(props);
        this.props      = props;
        this.onDragOver = this.onDragOver.bind(this);
        this.onFileDrop = this.onFileDrop.bind(this);
    }

    public onDragOver = (e: any) => {
        const event = e as Event;
        event.stopPropagation();
        event.preventDefault();
    };

    public onFileDrop = (e: any) => {
        const event = e as any;
        event.stopPropagation();

        const newFiles: any = [];
        const files         = event.dataTransfer.files;
        const filesKeys     = Object.keys(files);

        filesKeys.map((key: any) => {
            const file = files[key];
            if (file.type.indexOf('image/') === 0) {
                newFiles[key] = {
                    name: file.name,
                    type: path.extname(file.name),
                    path: file.path,
                    size: file.size
                }
            }
        });

        this.props.dropFiles(newFiles)
    };

    public render() {
        return (
            <label
                onDragOver={this.onDragOver}
                onDrop={this.onFileDrop}
            >
                {this.props.children}
            </label>
        )
    }
}

export default DropZone;