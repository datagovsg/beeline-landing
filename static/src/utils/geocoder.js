import Vue from 'vue';
import constants from '../utils/constants.js'
var Geocoder = null;

export default function geocode(latlng) {
  if (!Geocoder) {
    if (typeof google !== 'undefined' && google.maps && google.maps.Geocoder) {
      Geocoder = new google.maps.Geocoder;
    } else {
      return Promise.resolve(null);
    }
  }

  return new Promise((resolve, reject) => {
    Geocoder.geocode({'location': latlng}, (results, status) => {
      if (status === 'OK') {
        resolve(results)
      } else {
        reject(new Error(status));
      }
    })
  })
}

export function geocodeOM(latlng) {
  return Vue.resource(constants.BEELINE_API + `/onemap/revgeocode?location=${latlng.lng},${latlng.lat}`)
  .get()
  .then(r => r.json())
  .then(r => {
    if (r.GeocodeInfo[0].ErrorMessage) {
      throw new Error(r.GeocodeInfo[0].ErrorMessage)
    } else {
      return [{
        formatted_address:
          [r.GeocodeInfo[0].BUILDINGNAME, r.GeocodeInfo[0].ROAD]
            .filter(x => x)
            .join(', ')
      }]
    }
  })
}
