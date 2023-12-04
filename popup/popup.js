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
			li.setAttribute('timestamp', bookmark.time)

			const h2 = document.createElement('h2')
			h2.textContent = bookmark.desc

			li.appendChild(h2)

			const gotoBtn = document.createElement('button')
			gotoBtn.classList.add('goto-btn')
			gotoBtn.innerHTML =
				'<img style="pointer-events: none" src="/assets/redirect.svg" alt="Go to timestamp">'

			gotoBtn.addEventListener('click', (event) => {
				gotoTimestamp(event)
			})

			const delBtn = document.createElement('button')
			delBtn.classList.add('del-btn')
			delBtn.innerHTML =
				'<img style="pointer-events: none" src="/assets/delete.svg" alt="Delete bookmark">'

			delBtn.addEventListener('click', (event) => {
				deleteBookmark(event)
			})

			const div = document.createElement('div')
			div.classList.add('btn-group')

			div.appendChild(gotoBtn)
			div.appendChild(delBtn)

			li.appendChild(div)

			bookmarkListElement.appendChild(li)
		}
	}
}

const gotoTimestamp = async (event) => {
	const timestamp =
		event.target.parentElement.parentElement.getAttribute('timestamp')
	const tab = await getTab()

	chrome.tabs.sendMessage(tab[0].id, {
		type: 'gotoTimestamp',
		time: parseFloat(timestamp),
	})
}

const deleteBookmark = async (event) => {
	const timestamp =
		event.target.parentElement.parentElement.getAttribute('timestamp')
	const tab = await getTab()

	event.target.parentElement.parentElement.remove()

	chrome.tabs.sendMessage(tab[0].id, {
		type: 'removeBookmark',
		time: parseFloat(timestamp),
	})
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
			let bookmarks = data[videoId] ? JSON.parse(data[videoId]) : []

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
