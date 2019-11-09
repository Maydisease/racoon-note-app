import './toolbox.scss';
import * as React            from 'react';
import {editor}              from 'monaco-editor';
import NewEditorToolsService from '../../../note/services/newEditorTools.service';
import {AttachedService}     from '../../../note/services/window_manage/attached.server';
import {FontAwesomeIcon}     from "@fortawesome/react-fontawesome";
import {Service}             from "../../../../lib/master.electron.lib";

console.log(editor);

interface Props {
    editorVm: any
}

class Toolbox extends React.Component {

    public props: Props;
    public attachedService: AttachedService;

    constructor(props: Props) {
        super(props);
        this.attachedService    = new AttachedService();
        this.handelEditorTools  = this.handelEditorTools.bind(this);
        this.openAttachedWindow = this.openAttachedWindow.bind(this);
    }

    public componentDidMount() {
        Service.RenderToRender.subject('attached@editorInsertImage', async (event: any, params: any): Promise<boolean | void> => {
            this.handelEditorTools('image', params.data);
        });
    }

    public openAttachedWindow() {
        this.attachedService.open();
    }

    public handelEditorTools(type: string, data?: any) {
        const toolboxService = new NewEditorToolsService(this.props.editorVm);

        switch (type) {
            case 'image':
                toolboxService.image(data);
                break;
            case 'fontItalic':
                toolboxService.fontItalic();
                break;
            case 'fontBold':
                toolboxService.fontBold();
                break;
            case 'fontStrikethrough':
                toolboxService.fontStrikethrough();
                break;
            case 'fontQuoteLeft':
                toolboxService.fontQuoteLeft();
                break;
            case 'superLink':
                toolboxService.superLink();
                break;
        }
    }

    public render() {
        return (
            <div className="toolbox">
                {/*<span><FontAwesomeIcon icon="link"/></span>*/}
                <span onClick={this.handelEditorTools.bind(this, 'fontItalic')}><FontAwesomeIcon icon="italic"/></span>
                <span onClick={this.handelEditorTools.bind(this, 'fontBold')}><FontAwesomeIcon icon="bold"/></span>
                <span onClick={this.handelEditorTools.bind(this, 'fontStrikethrough')}><FontAwesomeIcon icon="strikethrough"/></span>
                <span onClick={this.handelEditorTools.bind(this, 'fontQuoteLeft')}><FontAwesomeIcon icon="quote-left"/></span>
                <span onClick={this.openAttachedWindow}><FontAwesomeIcon icon="image"/></span>
                <span onClick={this.handelEditorTools.bind(this, 'superLink')}><FontAwesomeIcon icon="link"/></span>
            </div>
        )
    }
}

export default Toolbox;
