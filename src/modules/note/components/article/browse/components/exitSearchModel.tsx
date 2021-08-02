import * as React from 'react';
import './style.scss';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {storeSubscribe} from '../../../../../../store/middleware/storeActionEvent.middleware';
import {store} from '../../../../../../store'

interface IState {
	isSearchModel: boolean;
}

class ExitSearchModel extends React.Component<any, IState> {

	public state = {
		isSearchModel: false
	}

	public componentDidMount() {

		// 订阅快速搜索
		storeSubscribe('NOTE$QUICK_SEARCH_RESULT', (action: any) => {
			const state = this.state;
			state.isSearchModel = true;
			this.setState(state);
		});

		// 订阅搜索高亮标签销毁
		storeSubscribe('NOTE$UN_SEARCH_TAG', () => {
			const state = this.state;
			state.isSearchModel = false;
			this.setState(state);
		});
	}

	public exitSearch() {
		store.dispatch({type: 'NOTE$UN_SEARCH_TAG'});
	}

	public render() {
		return (
			<div className={`search-state-tip ${this.state.isSearchModel ? 'open' : ''}`} onClick={this.exitSearch}>
				<FontAwesomeIcon className="fa-icon" icon="times"/>
				Exit Search
			</div>
		)
	}
}

export default ExitSearchModel;
