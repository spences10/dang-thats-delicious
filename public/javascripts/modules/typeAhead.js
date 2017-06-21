import axios from 'axios'
import dompurify from 'dompurify'

function searchResultsHTML(stores) {
  return stores.map(store => {
    return `
      <a href="/store/${store.slug}" class="search__result">
        <strong>${store.name}</strong>
      </a>
    `
  }).join('')
}

function typeAhead(search) {
  if (!search) return

  const searchInput = search.querySelector('input[name="search"]')
  const searchResults = search.querySelector('.search__results')

  // '.on' is 'addEventListener' in blingJS$
  searchInput.on('input', function() {
    // if no value the exit
    if (!this.value) {
      searchResults.style.display = 'none'
      return
    }

    // show results
    searchResults.style.display = 'block'
    // searchResults.innerHTML = ''

    axios
      .get(`/api/search?q=${this.value}`)
      .then(res => {
        if (res.data.length) {
          // results html
          searchResults.innerHTML = dompurify.sanitize(searchResultsHTML(res.data))
          return
        } 
        // tell use nothing came back
        searchResults.innerHTML = dompurify.sanitize(`<div class="search__result">No results for <strong>${this.value}</strong> found!</div>`)
      })
      .catch(err => {
        console.log('ERROR: ', err)
      })
  })

  // handle keyboard inputs
  searchInput.on('keyup', (e) => {
    // only capture up, down or enter
    if (![38, 40, 13].includes(e.keyCode)) {
      return // nothing!
    }
    // need active class in variable
    const activeClass = 'search__result--active'
    const current = search.querySelector(`.${activeClass}`)
    // list all items
    const items = search.querySelectorAll('.search__result')
    let next
    if (e.keyCode === 40 && current) {
      next = current.nextElementSibling || items[0]
    } else if (e.keyCode === 40) {
      next = items[0]
    } else if (e.keyCode === 38 && current) {
      next = current.previousElementSibling || items[items.length - 1]
    } else if (e.keyCode === 38) {
      next = items[items.length - 1]
    } else if (e.keyCode === 13 && current.href) {
      window.location = current.href
      return
    }
    // add active class to next
    if (current) {
      current.classList.remove(activeClass)
    }
    next.classList.add(activeClass)
  })
}

export default typeAhead
