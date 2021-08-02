import {Service} from '../../lib/master.electron.lib'
import {request} from '../note/services/requst.service'

class BookMarkCacheService {

	public searchTimer = 0;

	public async getRemoteAllTag() {
		//
	}

	// 更新本地标签缓存
	public async updateLocalTagCache() {
		const response = await request('links', 'getAllTag');
		await this.removeAllLocalTagCache();
		return await Service.ClientCache('/book_mark/linkTag').updateBookMarkTag(response.data);
	}

	// 移除本地标签缓存
	public async removeAllLocalTagCache() {
		return await Service.ClientCache('/book_mark/linkTag').removeAllBookMarkTag();
	}

	// 搜索本地标签缓存
	public async searchLocalTagCache(keys: string) {

		if (this.searchTimer) {
			clearTimeout(this.searchTimer);
		}

		return new Promise((resolve) => {
			this.searchTimer = window.setTimeout(async () => {
				resolve(Service.ClientCache('/book_mark/linkTag').searchTag(keys));
			}, 200)
		})
	}
}

export {BookMarkCacheService}
