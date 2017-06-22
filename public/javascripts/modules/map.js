import axios from 'axios'
import { $ } from './bling'

const mapOptions = {
  center: { lat: 43.2, lng: -79.8 },
  zoom: 2
}

// use day 21 of JavaScript30 to get dynamic location also look into
// console.log(navigator.geolocation.getCurrentPosition())
// london lat = 51.5, lng = -0.0
function loadPlaces(map, lat = 43.2, lng = -79.8) {
  axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`)
    .then(res => {
      const places = res.data
      // console.log(places)
      if (!places.length) {
        // use flash here maybe?
        alert('no places found!' )
        return
      }

      // create a bounds
      const bounds = new google.maps.LatLngBounds()
      const infoWindow = new google.maps.InfoWindow()

      // add pins
      const markers = places.map(place => {
        const [placeLng, placeLat] = place.location.coordinates
        const position = { lat: placeLat, lng: placeLng }
        bounds.extend(position)
        const marker = new google.maps.Marker({ map, position })
        // attach data to marker
        marker.place = place
        return marker
      })

      // when pin is clicked show infoWindow
      markers.forEach(marker => marker.addListener('click', function() {
        const html = `
          <div class="popup">
            <a href="/store/${this.place.slug}">
              <img src="/uploads/${this.place.photo || 'store.png'}" alt="${this.place.name}"
              <p>${this.place.name} - ${this.place.location.address}</p>
            </a>
          </div>
        `
        infoWindow.setContent(html)
        infoWindow.open(map, this)
      }))
      
      // zoon the mao to fit markers
      map.setCenter(bounds.getCenter())
      map.fitBounds(bounds)
    })
}

function makeMap(mapDiv) {
  if (!mapDiv) return
  // make map
  const map = new google.maps.Map(mapDiv, mapOptions)
  loadPlaces(map)

  const input = $('[name="geolocate"]')
  const autocomplete = new google.maps.places.Autocomplete(input)
  // listen for when autocomplet changes
  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace()
    loadPlaces(map, place.geometry.location.lat(), place.geometry.location.lng())
  })

}

export default makeMap
