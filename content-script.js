let youtubePlayer, youtubeControls
let currentVideo = ''
let bookmarks = []

const init = async () => {
	bookmarks = await fetchBookmarks()
	const timestampButtonExists =
		document.getElementsByClassName('add-timestamp-btn').length > 0

	if (timestampButtonExists || !window.location.href.includes('watch')) {
		return
	}

	const timestampButton = document.createElement('button')
	const buttonImage = document.createElement('img')
	buttonImage.src = chrome.runtime.getURL('assets/add.svg')

	timestampButton.className = 'add-timestamp-btn'
	timestampButton.title = 'Add timestamp to bookmarks'
	timestampButton.appendChild(buttonImage)

	timestampButton.setAttribute(
		'style',
		'background-color: transparent; border: none; cursor: pointer; margin-left: 4px;'
	)
	timestampButton.addEventListener('mouseover', () => {
		timestampButton.style.opacity = 0.8
		timestampButton.style.transition = 'ease 0.3s'
	})

	timestampButton.addEventListener('mouseout', () => {
		timestampButton.style.opacity = 1
	})

	youtubeControls = document.getElementsByClassName('ytp-left-controls')[0]
	youtubePlayer = document.getElementsByClassName('video-stream')[0]

	timestampButton.addEventListener('click', () => {
		addBookmark()
	})

	youtubeControls.appendChild(timestampButton)
}

const fetchBookmarks = () => {
	return new Promise((resolve) => {
		chrome.storage.sync.get([currentVideo], (data) => {
			resolve(data[currentVideo] ? JSON.parse(data[currentVideo]) : [])
		})
	})
}

init()

const addBookmark = async () => {
	const currentTime = youtubePlayer.currentTime
	const bookmark = {
		time: currentTime,
		desc: `Bookmark at ${getDescTime(currentTime)}`,
	}

	bookmarks = await fetchBookmarks()

	if (!currentVideo) {
		currentVideo = window.location.href.split('?v=')[1]
	}

	if (bookmarks.some((b) => b.time === bookmark.time)) {
		return
	}

	bookmarks.push(bookmark)
	bookmarks.sort((o1, o2) => o1.time - o2.time)

	chrome.storage.sync.set({
		[currentVideo]: JSON.stringify(bookmarks),
	})
}

const getDescTime = (time) => {
	let minutes = Math.floor(time / 60)
	let seconds = Math.floor(time - minutes * 60)

	return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

chrome.runtime.onMessage.addListener((obj, sender, response) => {
	const { type, videoId, time } = obj

	if (type === 'newVideo') {
		currentVideo = videoId
		init()
	} else if (type === 'gotoTimestamp') {
		youtubePlayer.currentTime = time
	} else if (type === 'removeBookmark') {
		bookmarks = bookmarks.filter((b) => b.time !== time)
		chrome.storage.sync.set({
			[currentVideo]: JSON.stringify(bookmarks),
		})
	}
})
