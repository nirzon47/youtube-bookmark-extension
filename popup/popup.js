const getTab = async () => {
	let tab = await chrome.tabs.query({ active: true, currentWindow: true })

	return tab
}

const renderBookmarks = (bookmarks = []) => {
	const bookmarkListElement = document.getElementById('bookmark-list')

	bookmarkListElement.innerHTML = ''

	if (bookmarks.length === 0) {
		const p = document.createElement('p')
		p.style.fontSize = '18px'
		p.style.fontWeight = 'bold'
		p.style.color = 'red'
		p.style.textAlign = 'center'
		p.textContent = 'No bookmarks'

		bookmarkListElement.appendChild(p)
	} else {
		for (const bookmark of bookmarks) {
			const li = document.createElement('li')
			li.classList.add('item')

			const h2 = document.createElement('h2')
			h2.textContent = bookmark.desc

			li.appendChild(h2)

			const gotoBtn = document.createElement('button')
			gotoBtn.classList.add('goto-btn')
			gotoBtn.innerHTML = '<img src="assets/goto.svg" alt="Go to timestamp">'

			const delBtn = document.createElement('button')
			delBtn.classList.add('del-btn')
			delBtn.innerHTML = '<img src="assets/delete.svg" alt="Delete bookmark">'

			li.appendChild(gotoBtn, delBtn)
		}
	}
}

document.addEventListener('DOMContentLoaded', async () => {
	const activeTab = await getTab()
	const videoId = activeTab[0].url.split('?v=')[1]

	if (
		activeTab[0].url &&
		activeTab[0].url.includes('youtube.com/watch') &&
		videoId
	) {
		chrome.storage.sync.get([videoId], (data) => {
			const bookmarks = data[videoId] ? JSON.parse(data[videoId]) : []

			renderBookmarks(bookmarks)
		})
	} else {
		const bookmarkListElement = document.getElementById('bookmark-list')
		const p = document.createElement('p')
		p.style.fontSize = '18px'
		p.style.fontWeight = 'bold'
		p.style.color = 'red'
		p.style.textAlign = 'center'
		p.textContent = 'Not a YouTube video page'

		bookmarkListElement.appendChild(p)
	}
})
