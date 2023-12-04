let youtubePlayer, youtubeControls
let currentVideo = ''
let bookmarks = []

const init = async () => {
	bookmarks = await fetchBookmarks()
}

const fetchBookmarks = () => {
	return new Promise((resolve, reject) => {
		chrome.storage.sync.get([currentVideo], (data) => {
			resolve(data[currentVideo] ? JSON.parse(data[currentVideo]) : [])
		})
	})
}

init()

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

youtubeControls.appendChild(timestampButton)

timestampButton.addEventListener('click', () => {
	addBookmark()
})

const addBookmark = async () => {
	const currentTime = youtubePlayer.currentTime
	const bookmark = {
		time: currentTime,
		desc: `Bookmark at ${getDescTime(currentTime)}`,
	}

	bookmarks = await fetchBookmarks()

	if (bookmarks.includes(bookmark)) {
		return
	}

	bookmarks.push(bookmark)
	bookmarks.sort((o1, o2) => o1.time - o2.time)
	chrome.storage.sync.set({
		currentVideo: JSON.stringify(bookmarks),
	})

	console.log(chrome.storage.sync.get(currentVideo))
}

const getDescTime = (time) => {
	let minutes = Math.floor(time / 60)
	let seconds = Math.floor(time - minutes * 60)

	return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
