let currentVideo = ''
let youtubePlayer, youtubeControls

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
	console.log('click')
})
