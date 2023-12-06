// Adds a listener for when a tab is updated
chrome.tabs.onUpdated.addListener((tabId, tab) => {
	// If the tab is a youtube video, send a message to the chrome runtime
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
