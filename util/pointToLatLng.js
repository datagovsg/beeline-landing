
export default function (point) {
  return {
    lat: point.coordinates[1],
    lng: point.coordinates[0],
  }
}
