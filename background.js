chrome.tabs.onUpdated.addListener((tabId, tab) => {
	if (tab.url && tab.url.includes('youtube.com/watch')) {
		const videoId = tab.url.split('?v=')[1]

		chrome.tabs.sendMessage(tabId, {
			type: 'newVideo',
			videoId,
		})
	}
})
