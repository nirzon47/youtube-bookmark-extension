chrome.tabs.onUpdated.addListener((tabId, tab) => {
	if (tab.url && tab.url.includes('youtube.com/watch')) {
		const params = tab.url.split('?')[1]
		const urlParams = new URLSearchParams(params)

		chrome.tabs.sendMessage(tabId, {
			type: 'newVideo',
			videoId: urlParams.get('v'),
		})
	}
})
