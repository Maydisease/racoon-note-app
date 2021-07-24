import * as React from 'react';
import './index.scss';
import Draggable from 'react-draggable';
import {BookMarkCacheService} from '../../service';

const md5 = require('blueimp-md5');
import {ObserverEvent} from '../../../../services/observer.service';
import {VMessageService} from '../../../component/message';
import {Service} from '../../../../lib/master.electron.lib';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

interface IProps {
	destroySelf: () => void;
	edit: boolean;
	linkId: number;
	comEvent: (event: ObserverEvent) => void;
	context?: {
		title: string;
		url: string;
		summary: string;
		tags: string[];
	}
}

interface IState {
	tempTag: string;
	currentSelectedTag: string;
	tagUpdateLock: boolean;
	searchTagList: any[];
	form: {
		linkId?: number | null;
		cid?: number | null;
		title: string;
		url: string;
		summary: string;
		tags: string[];
	}
}

class EditLink extends React.Component<IProps, IState> {

	public state: IState = {
		tempTag: '',
		currentSelectedTag: '',
		tagUpdateLock: false,
		searchTagList: [],
		form: {
			linkId: null,
			cid: null,
			title: '',
			url: '',
			summary: '',
			tags: []
		}
	}

	public tagContextMenu: any = undefined;
	public bookMarkCacheService: BookMarkCacheService = new BookMarkCacheService();

	public titleInputElementRef = React.createRef<HTMLInputElement>();
	public urlInputElementRef = React.createRef<HTMLTextAreaElement>();
	public descInputElementRef = React.createRef<HTMLTextAreaElement>();

	public updateKey = '';

	constructor(props: IProps) {
		super(props);
		this.tagContextMenu = new Service.Menu();
		this.close = this.close.bind(this);
		this.cancel = this.cancel.bind(this);
		this.submit = this.submit.bind(this);
		this.updateTags = this.updateTags.bind(this);
		this.tagInputBlurHandel = this.tagInputBlurHandel.bind(this);
		this.tagInputKeyUpHandel = this.tagInputKeyUpHandel.bind(this);
		this.baseFormInputHandles = this.baseFormInputHandles.bind(this);
		this.tempTagInputHandel = this.tempTagInputHandel.bind(this);
		this.useSearchTagResultHandle = this.useSearchTagResultHandle.bind(this);
		this.openTagActionMenuHandel = this.openTagActionMenuHandel.bind(this);
	}

	public componentDidMount() {
		if (this.props.edit && this.props.context) {

			const context = JSON.parse(JSON.stringify(this.props.context));
			const {title, summary, tags, url, cid} = context;

			const tempTags: string[] = [];
			tags.map((item: any) => item && tempTags.push(item.name));

			const state = JSON.parse(JSON.stringify(this.state));

			const form = {
				linkId: this.props.linkId,
				cid,
				url,
				title,
				summary,
				tags: tempTags
			};
			this.updateKey = md5(JSON.stringify(form));
			state.form = form;
			this.setState({...this.state, form: state.form});
		}

		const $this = this;
		this.tagContextMenu.append(new Service.MenuItem({
			enabled: true,
			accelerator: 'D',
			label: 'Delete',
			click() {
				const state = $this.state;
				state.form.tags.splice($this.state.form.tags.indexOf(state.currentSelectedTag), 1);
				$this.setState(state);
			}
		}));
	}

	public close() {
		const state = this.state;
		state.tempTag = '';
		this.setState(state);
		this.props.destroySelf();
	}

	public cancel() {
		const state = this.state;
		state.tempTag = '';
		this.setState(state);
		this.close();
	}

	// 提交link表单.
	public submit() {

		// 表单有误
		if (!this.checkForm()) {
			return;
		}

		const state = this.state;
		state.tempTag = '';
		this.setState(state);

		// 未做任何变更.
		if (this.props.edit && this.updateKey === md5(JSON.stringify(this.state.form))) {
			new VMessageService('not change', 'success', 3000).init();
			this.close();
			return;
		}

		console.log('this.state.form:', this.state.form);

		this.props.comEvent({name: 'submit', data: this.state.form})
		this.close();
	}

	public checkForm(): boolean | void {

		// 必须填写标题
		if (!this.state.form.title) {
			new VMessageService('please enter link title.', 'warning', 3000).init();
			const element = this.titleInputElementRef.current as HTMLInputElement;
			element.focus();
			return;
		}

		// 必须填写url
		if (!this.state.form.url) {
			new VMessageService('please enter link url.', 'warning', 3000).init();
			const element = this.urlInputElementRef.current as HTMLTextAreaElement;
			element.focus();
			return;
		}

		// url格式不对.
		let isUrlFormat;

		try {
			const res = new URL(this.state.form.url);
			isUrlFormat = !!res;
		} catch (err) {
			isUrlFormat = false;
		}

		if (!isUrlFormat) {
			new VMessageService('url format is incorrect.', 'warning', 3000).init();
			const element = this.urlInputElementRef.current as HTMLTextAreaElement;
			element.focus();
			return;
		}

		return true;
	}

	public baseFormInputHandles(event: React.ChangeEvent) {
		const {name, value} = event.target as HTMLInputElement | HTMLTextAreaElement;
		const state = this.state;
		state.form[name] = value;
		this.setState(state);
	}

	// 检测当前添加的tag是否已存在
	public checkTagsIsExist(tempTag: string) {

		// 标签为空
		if (!tempTag) {
			return true;
		}

		// 存在重复标签
		if (this.state.form.tags.includes(tempTag)) {
			new VMessageService('there are duplicate tag', 'warning', 3000).init();
			return true;
		}

		return false;
	}

	// 更新tags
	public updateTags() {
		const state = this.state;
		state.searchTagList = [];
		console.log('updateTags:state.tempTag:::', state.tempTag, state.form.tags);
		if (this.checkTagsIsExist(state.tempTag)) {
			return;
		}
		state.form.tags.push(state.tempTag);
		state.tempTag = '';
		this.setState(state);
	}

	// tag输入框的键盘enter事件.
	public tagInputKeyUpHandel(event: React.KeyboardEvent<HTMLInputElement>) {
		// keyCode enter === 13;
		if (event.keyCode === 13) {
			setTimeout(() => {
				if (this.state.tagUpdateLock) {
					const state = this.state;
					state.tagUpdateLock = false;
					state.tempTag = '';
					this.setState(state);
					console.log('跳过....');
				} else {
					this.updateTags();
				}
			}, 200)
		}
	}

	// tag输入框的光标丢失事件.
	public tagInputBlurHandel(event: React.FocusEvent<HTMLInputElement>) {
		setTimeout(() => {
			console.log('跳过....', this.state.tagUpdateLock);
			if (this.state.tagUpdateLock) {
				const state = this.state;
				state.tagUpdateLock = false;
				state.tempTag = '';
				this.setState(state);
			} else {
				this.updateTags();
			}
		}, 200)
	}

	public useSearchTagResultHandle(item: any) {
		const state = this.state;
		state.tagUpdateLock = true;
		if (!state.form.tags.includes(item.name)) {
			state.form.tags.push(item.name);
		}
		state.tempTag = '';
		state.searchTagList = [];
		this.setState(state);
		console.log(item);
	}

	public async tempTagInputHandel(event: React.ChangeEvent) {
		const element = event.target as HTMLInputElement;
		const {name, value} = element;
		const state = this.state;
		state[name] = value;
		this.setState(state);
		const response = await this.bookMarkCacheService.searchLocalTagCache(value);

		if (!value || value === '') {
			state.searchTagList = [];
			this.setState(state);
			return;
		}

		state.searchTagList = response as any[];
		this.setState(state);
	}

	public openTagActionMenuHandel(tag: string) {
		const state = this.state;
		state.currentSelectedTag = tag;
		this.setState(state);
		this.tagContextMenu.popup({window: Service.getWindow('master')});
	}

	public render() {

		return <div className="edit-link-dynamic-container">
			<div className="mask"/>
			<Draggable
				scale={1.1}
				handle=".drag-handle"
				bounds=".edit-link-dynamic-container"
			>
				<div className="panel-wrap">
					<div className="panel">
						<div className="mode-name drag-handle">{this.props.edit ? 'update link' : 'add a link'}</div>
						<div className={'form-box'}>
							{/*{'链接标题'}*/}
							<input
								name="title"
								ref={this.titleInputElementRef}
								onChange={this.baseFormInputHandles}
								placeholder="Title"
								value={this.state.form.title}
							/>
							{/*{'链接URL'}*/}
							<textarea
								name="url"
								ref={this.urlInputElementRef}
								onChange={this.baseFormInputHandles}
								placeholder="Link"
								value={this.state.form.url}
							/>
							{/*{'链接摘要'}*/}
							<textarea
								name="summary"
								ref={this.descInputElementRef}
								onChange={this.baseFormInputHandles}
								placeholder="Summary"
								value={this.state.form.summary}
							/>
							{/*{'链接标签'}*/}
							<div className="tag-container">
								{
									this.state.form.tags.map((item, index) => {
										return (<span onClick={this.openTagActionMenuHandel.bind(this, item)} key={`${item}`}>{item}</span>);
									})
								}
								<label>
									<FontAwesomeIcon className="fa-icon tags" icon="tags"/>
									<input
										name="tempTag"
										className="block"
										placeholder="tag..."
										onChange={this.tempTagInputHandel}
										onKeyUp={this.tagInputKeyUpHandel}
										onBlur={this.tagInputBlurHandel}
										value={this.state.tempTag}
									/>
								</label>
							</div>
							<div className="tag-search-result-container">
								{
									this.state.searchTagList.map((item) => {
										return <span onClick={this.useSearchTagResultHandle.bind(this, item)} key={item.id}>{item.name}</span>
									})
								}
							</div>
						</div>
						<div className="action-bar">
							<button onClick={this.cancel}>cancel</button>
							<button onClick={this.submit}>submit</button>
						</div>
					</div>
				</div>
			</Draggable>
		</div>;
	}
}

export default EditLink;
