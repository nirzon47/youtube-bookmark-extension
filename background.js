chrome.tabs.onUpdated.addListener((tabId, tab) => {
	if (tab.url && tab.url.includes('youtube.com/watch')) {
		let videoId = tab.url.split('?v=')[1]

		if (videoId.includes('&t=')) {
			videoId = videoId.split('&t=')[0]
		}

		chrome.tabs.sendMessage(tabId, {
			type: 'newVideo',
			videoId,
		})
	}
})
