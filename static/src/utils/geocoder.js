import Vue from 'vue';
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
  return Vue.resource(`http://www.onemap.sg/API/services.svc/revgeocode?token=4M0Dqj90WIXft/TJZ4nklA2NVJtrtO3OzDd7VExVYVFKu3b6Y5hj5jHazJqUMc/EFlG7wV/W/ivw0KKmcj8p5pY2ASN0QxluqV9DoJ/wWlpfOah/IJhFL3UdI5a3ZR9qZ6GDgf+3Bd8=|mv73ZvjFcSo=&location=${latlng.lng},${latlng.lat}`)
  .get()
  .then(r => r.json())
  .then(r => {
    if (r.GeocodeInfo[0].ErrorMessage) {
      throw new Error(r.GeocodeInfo[0].ErrorMessage)
    } else {
      return [{
        formatted_address:
          r.GeocodeInfo[0].BUILDINGNAME + r.GeocodeInfo[0].ROAD
      }]
    }
  })
}
