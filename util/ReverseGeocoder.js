import axios from 'axios'
import querystring from 'querystring'

export default function ReverseGeocoder (latlng, multiple = false) {
  return axios.get('https://api.beeline.sg/onemap/revgeocode?' + querystring.stringify({
    location: `${latlng.lat},${latlng.lng}`
  }))
  .then((r) => {
    if (!r.data.GeocodeInfo || r.data.GeocodeInfo[0].ErrorMessage) {
      throw new Error(r.data.GeocodeInfo[0].ErrorMessage)
    }
    return r.data.GeocodeInfo
  })
  .then((geocodedResult) => {
    return multiple ? geocodedResult : geocodedResult[0]
  })
}

export function getReverseGeocodeString (latlng) {
  return ReverseGeocoder(latlng)
    .then((r) => {
      if (!r) throw new Error(`Geocode result is empty`)
      /* Looks silly, but happens at 1.3765917840991782, 103.95240782992914 */
      if (!r.BLOCK && !r.BUILDINGNAME && !r.ROAD && !r.POSTALCODE) throw new Error(`Geocode result data is empty`)

      return `${r.BLOCK || ''} ${r.ROAD || ''} ${r.BUILDINGNAME || ''} ${r.POSTALCODE || ''}`.trim()
    })
    .catch((e) => `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`)
}
