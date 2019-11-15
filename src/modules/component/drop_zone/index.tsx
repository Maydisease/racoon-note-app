import * as React from 'react';
import * as path  from "path";

// import {Service}  from '../../../lib/master.electron.lib';

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

    public onDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
        event.stopPropagation();
        event.preventDefault();
    };

    public onFileDrop = (event: React.DragEvent<HTMLLabelElement>) => {
        console.log(event);
        event.stopPropagation();

        const newFiles: FileList[] = [];
        if (!event.dataTransfer) {
            return;
        }
        const files: FileList = event.dataTransfer.files;
        const filesKeys       = Object.keys(files);
        if (files && files.length > 0) {
            filesKeys.map((key: string) => {
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

            this.props.dropFiles(newFiles);
        }
    };

    public componentDidMount(): void {
        // const el: any = document.getElementById('xxxx1');
        //
        // el.addEventListener('drop', (e: any) => {
        //     e.stopPropagation();
        //     e.preventDefault();
        //     const url = e.dataTransfer.getData('url');
        //
        //     console.log(url);
        //
        //     if (url) {
        //         new Service.GetUrlHeader(url).send();
        //     }
        // });
    }

    public render() {
        return (
            <label
                id="xxxx1"
                onDragOver={this.onDragOver}
                onDrop={this.onFileDrop}
            >
                {this.props.children}
            </label>
        )
    }
}

export default DropZone;
