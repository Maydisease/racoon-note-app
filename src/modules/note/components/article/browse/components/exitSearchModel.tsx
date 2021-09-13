import * as React from 'react';
import './style.scss';
import {storeSubscribe} from '../../../../../../store/middleware/storeActionEvent.middleware';
import {store} from '../../../../../../store'

interface IState {
	isSearchModel: boolean;
	count: number;
}

class ExitSearchModel extends React.Component<any, IState> {

	public timer = 0;

	public state = {
		isSearchModel: false,
		count: 0
	}

	public componentDidMount() {

		// 订阅快速搜索
		storeSubscribe('NOTE$QUICK_SEARCH_RESULT', (action: any) => {
			clearTimeout(this.timer);
			this.timer = setTimeout(() => {
				const state = this.state;
				state.isSearchModel = true;
				state.count = action.playload.count || 0;
				this.setState(state);
			})
		});

		// 订阅搜索高亮标签销毁
		storeSubscribe('NOTE$UN_SEARCH_TAG', () => {
			const state = this.state;
			state.isSearchModel = false;
			state.count = 0;
			this.setState(state);
		});
	}

	public exitSearch() {
		store.dispatch({type: 'NOTE$UN_SEARCH_TAG'});
	}

	public render() {
		return (
			<div className={`search-state-tip ${this.state.isSearchModel && this.state.count > 0 ? 'open' : ''}`} onClick={this.exitSearch}>
				<span key={this.state.count}>{this.state.count} count</span>
			</div>
		)
	}
}

export default ExitSearchModel;
