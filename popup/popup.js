/**
 * Retrieves the currently active tab in the Chrome browser.
 *
 * @return {Promise<chrome.tabs.Tab[]>} An array containing the currently active tab.
 */
const getTab = async () => {
	let tab = await chrome.tabs.query({ active: true, currentWindow: true })

	return tab
}

/**
 * Renders the bookmarks on the page.
 *
 * @param {Array} bookmarks - An array of bookmark objects.
 * @return {void} This function does not return any value.
 */
const renderBookmarks = (bookmarks = []) => {
	const bookmarkListElement = document.getElementById('bookmark-list')

	bookmarkListElement.innerHTML = ''

	// If there are no bookmarks, display a message, otherwise display the bookmarks
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

/**
 * Navigates to a specific timestamp in the browser tab.
 *
 * @param {Event} event - The event object triggered by the user action.
 * @return {Promise<void>} - A promise that resolves when the navigation is complete.
 */
const gotoTimestamp = async (event) => {
	// Gets the timestamp from the list element's timestamp attribute
	const timestamp =
		event.target.parentElement.parentElement.getAttribute('timestamp')
	const tab = await getTab()

	// Sends a message to the runtime to navigate to the timestamp
	chrome.tabs.sendMessage(tab[0].id, {
		type: 'gotoTimestamp',
		time: parseFloat(timestamp),
	})
}

/**
 * Deletes a bookmark.
 *
 * @param {Event} event - The event that triggered the deletion.
 * @return {Promise<void>} - A promise that resolves once the bookmark is deleted.
 */
const deleteBookmark = async (event) => {
	const timestamp =
		event.target.parentElement.parentElement.getAttribute('timestamp')
	const tab = await getTab()

	// Removes the bookmark from the DOM
	event.target.parentElement.parentElement.remove()

	// Sends a message to the runtime to delete the bookmark
	chrome.tabs.sendMessage(tab[0].id, {
		type: 'removeBookmark',
		time: parseFloat(timestamp),
	})
}

/**
 * Handles the theme of the webpage based on user preferences.
 *
 * @return {void} This function does not return any value.
 */
const themeHandler = () => {
	if (
		window.matchMedia &&
		window.matchMedia('(prefers-color-scheme: dark)').matches
	) {
		document.documentElement.setAttribute('data-theme', 'dark')
		document.getElementsByClassName('theme-controller')[0].checked = true
	} else {
		document.documentElement.setAttribute('data-theme', 'light')
		document.getElementsByClassName('theme-controller')[0].checked = false
	}
}

//  Event listeners

// Theme controller
document
	.getElementsByClassName('theme-controller')[0]
	.addEventListener('click', () => {
		const theme = document.documentElement.getAttribute('data-theme')
		const themeController =
			document.getElementsByClassName('theme-controller')[0]

		if (theme === 'light') {
			document.documentElement.setAttribute('data-theme', 'dark')
			themeController.checked = true
		} else {
			document.documentElement.setAttribute('data-theme', 'light')
			themeController.checked = false
		}
	})

// Whenever the extension is clicked on
document.addEventListener('DOMContentLoaded', async () => {
	themeHandler()

	const activeTab = await getTab()

	if (activeTab[0].url && activeTab[0].url.includes('youtube.com/watch')) {
		let videoId = activeTab[0].url.split('?v=')[1]

		if (videoId.includes('&t=')) {
			videoId = videoId.split('&t=')[0]
		}

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
