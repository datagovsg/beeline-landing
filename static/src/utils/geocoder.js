
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
