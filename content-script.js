// Variables
let youtubePlayer, youtubeControls
let currentVideo = ''
let bookmarks = []

/**
 * Initializes the function by fetching bookmarks and adding a timestamp button
 * to the YouTube video player.
 *
 * @return {Promise<void>} A promise that resolves when the initialization is complete.
 */
const init = async () => {
	// Gets all the bookmarks of the current video, this code has to run every initialization
	bookmarks = await fetchBookmarks()

	// Adds a timestamp button to the video player if it does not already exist
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

/**
 * Fetches bookmarks from the Chrome storage.
 *
 * @return {Promise<Array>} A Promise that resolves with an array of bookmarks.
 */
const fetchBookmarks = () => {
	return new Promise((resolve) => {
		chrome.storage.sync.get([currentVideo], (data) => {
			resolve(data[currentVideo] ? JSON.parse(data[currentVideo]) : [])
		})
	})
}

init()

/**
 * Adds a bookmark to the list of bookmarks.
 *
 * @return {void}
 */
const addBookmark = async () => {
	const currentTime = youtubePlayer.currentTime // Gets the current timestamp of the video

	// Making new bookmark object
	const bookmark = {
		time: currentTime,
		desc: `${getDescTime(currentTime)}`,
	}

	// Gets all the bookmarks of the current video
	bookmarks = await fetchBookmarks()

	getCurrentVideoIfNotExist()

	// If the bookmark already exists, return
	if (bookmarks.some((b) => b.time === bookmark.time)) {
		return
	}

	// Adds the new bookmark and sorts the list
	bookmarks.push(bookmark)
	bookmarks.sort((o1, o2) => o1.time - o2.time)

	// Saves the new list of bookmarks in sync storage
	chrome.storage.sync.set({
		[currentVideo]: JSON.stringify(bookmarks),
	})
}

/**
 * Converts a given time in seconds to minutes and seconds format.
 *
 * @param {number} time - The time to be converted in seconds.
 * @return {string} The time in minutes and seconds format.
 */
const getDescTime = (time) => {
	let minutes = Math.floor(time / 60)
	let seconds = Math.floor(time - minutes * 60)

	return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Retrieves the current video if it does not already exist.
 *
 * @return {undefined} This function does not return a value.
 */
const getCurrentVideoIfNotExist = () => {
	if (!currentVideo) {
		currentVideo = window.location.href.split('?v=')[1]

		if (currentVideo.includes('&t=')) {
			currentVideo = currentVideo.split('&t=')[0]
		}
	}
}

chrome.runtime.onMessage.addListener((obj, sender, response) => {
	// Destructuring the object received
	const { type, videoId, time } = obj

	getCurrentVideoIfNotExist()

	if (type === 'newVideo') {
		// Replacing the current video with the new one sent by service worker and recalling init
		currentVideo = videoId
		init()
	} else if (type === 'gotoTimestamp') {
		// Goes to the timestamp sent in the runtime messages
		youtubePlayer.currentTime = time
	} else if (type === 'removeBookmark') {
		// Removes the bookmark sent in the runtime messages
		const index = bookmarks.findIndex((b) => b.time === time)
		if (index !== -1) {
			bookmarks.splice(index, 1)
		}

		// Saves the updated bookmarks in sync storage
		chrome.storage.sync.set({
			[currentVideo]: JSON.stringify(bookmarks),
		})
	}
})
