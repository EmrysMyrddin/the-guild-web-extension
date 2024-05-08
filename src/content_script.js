let retry = 0
async function onUrlChanged() {
  if (
    location.pathname.includes('/issues/') ||
    location.pathname.includes('/pull/')
  ) {
    // We can check the cache in case the list of tracked libraries is available
    const { trackedLibrariesURLs } = await chrome.storage.session.get(
      'trackedLibrariesURLs',
    )
    if (trackedLibrariesURLs) {
      if (trackedLibrariesURLs.some((url) => location.href.startsWith(url))) {
        console.debug(
          'Tracked repository, we can display a nice loading indicator',
        )
        const div = document.createElement('div')
        div.className = 'mb-2 ml-2 text-bold d-flex flex-items-center'
        div.style.height = '2em'
        div.append(loadingIndicator)
        insertLogo(div)
        setContent(div)
      } else {
        console.debug('Not a tracked repository, skipping')
        return
      }
    }

    const { notionURL, error, status } = await chrome.runtime.sendMessage({
      type: 'searchTaskFromGithubURL',
      url: location.href,
    })

    if (status === 'not_tracked') {
      // We are not in a tracked repository, so we don't want to alter the page
      console.debug('Not a tracked repository, skipping')
      return
    }

    if (status === 'found') {
      const notionButton = document.createElement('a')
      notionButton.textContent = 'Open in Notion'
      notionButton.className =
        'the-guild__open-in-notion Button--primary Button--small Button mb-2 ml-2'
      notionButton.target = '_blank'
      notionButton.href = notionURL
      insertLogo(notionButton)
      setContent(notionButton)
      return
    }

    const errorElement = document.createElement('div')
    errorElement.className = 'mb-2 ml-2 text-bold d-flex flex-items-center'
    errorElement.style.height = '2em'

    if (status === 'not_found') {
      errorElement.textContent = 'Notion task not found'
      errorElement.style.color = 'var(--fgColor-severe)'
      if (retry < 5) {
        retry++
        console.log(
          `Notion task not found, retrying in 5s (${retry} retries) ...`,
        )
        errorElement.appendChild(loadingIndicator)
        setTimeout(() => onUrlChanged().catch(console.error), 5000)
      } else {
        console.warn('Notion task not found, Max retries reached')
      }
    } else {
      errorElement.textContent = error
      errorElement.style.color = 'var(--fgColor-danger)'
    }

    insertLogo(errorElement)
    setContent(errorElement)
  }
}

/**
 * Set the content for the Notion button inside all containers
 * @param {HTMLElement} content
 */
function setContent(content) {
  for (const container of ensureContainers()) {
    container.textContent = ''
    container.appendChild(content.cloneNode(true))
  }
}

/**
 * Adds the Notion logo to the start of the element
 * @param {HTMLElement} element
 */
function insertLogo(element) {
  element.insertBefore(logo, element.firstChild)
}
const logo = document.createElement('img')
logo.style.height = '100%'
logo.src =
  'https://brandlogos.net/wp-content/uploads/2022/07/notion-logo_brandlogos.net_uiish.png'

const loadingIndicator = document.createElement('div')
loadingIndicator.style.display = 'contents'
loadingIndicator.innerHTML = `
  <svg style="box-sizing: content-box; color: var(--color-icon-primary);" width="16" height="16" viewBox="0 0 16 16" fill="none" class="ml-2 d-block anim-rotate">
    <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-opacity="0.25" stroke-width="2" vector-effect="non-scaling-stroke" fill="none"></circle>
    <path d="M15 8a7.002 7.002 0 00-7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" vector-effect="non-scaling-stroke"></path>
  </svg>
`
/**
 * Create or select the containers where the Notion button will be placed
 *
 * @returns {Node[]} The containers where the Notion button will be placed
 */
function ensureContainers() {
  let domContainers = [
    ...document.querySelectorAll('.the-guild__open-in-notion'),
  ]
  if (domContainers.length > 0) {
    return domContainers
  }

  const container = document.createElement('div')
  container.className = 'the-guild__open-in-notion'
  container.style.display = 'contents'
  const containers = [container, container.cloneNode()]

  document
    .querySelector('#partial-discussion-header .gh-header-meta')
    .appendChild(containers[0])
  document
    .querySelector('#partial-discussion-header .sticky-content > div > div')
    .appendChild(containers[1])

  return containers
}

console.debug('Content script loaded')
let oldHref = document.location.href
new MutationObserver(() => {
  if (oldHref !== document.location.href) {
    console.debug('URL changed', document.location.href)
    oldHref = document.location.href
    onUrlChanged().catch(console.error)
  }
}).observe(document.querySelector('body'), { childList: true, subtree: true })
onUrlChanged().catch(console.error)
