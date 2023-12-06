let videoIDs = []

chrome.storage.sync.get((res) => {
	for (const key of Object.keys(res)) {
		if (key === '' || key === 'theme' || res[key].length === 2) {
			continue
		}

		videoIDs.push(key)
	}

	const videoGridElement = document.getElementById('video-grid')

	videoIDs.forEach((videoID) => {
		const bookmarks = JSON.parse(res[videoID])

		const iframe = document.createElement('iframe')
		iframe.src = `https://youtube.com/embed/${videoID}`
		iframe.allow = 'clipboard-read; clipboard-write'
		iframe.allowFullscreen = true

		iframe.classList.add('video-frame')

		const videoItem = document.createElement('div')
		videoItem.classList.add('video-item')

		videoItem.appendChild(iframe)

		const h2 = document.createElement('h2')
		h2.textContent = 'Bookmarks at'
		h2.classList.add('video-title')

		videoItem.appendChild(h2)

		const linkDiv = document.createElement('div')
		linkDiv.classList.add('link-list')

		bookmarks.forEach((bookmark) => {
			const a = document.createElement('a')
			a.href = `https://youtube.com/watch?v=${videoID}&t=${Math.floor(
				bookmark.time
			)}s`
			a.target = '_blank'
			a.textContent = bookmark.desc
			a.classList.add('link-item')

			linkDiv.appendChild(a)
		})

		videoItem.appendChild(linkDiv)
		videoGridElement.appendChild(videoItem)
	})
})
