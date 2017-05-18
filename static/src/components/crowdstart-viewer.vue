<template>
  <div>
    <h4>{{index}}. {{crowdstart.name}}</h4>
    <div class="r">
      <div class="stops-list">
        <ol>
          <li v-for="stop in crowdstart.userSuggestedRouteStops" :key="stop.stop.description">
            <b>{{stop.arriveAt - 8 * 3600 * 1000 | formatTime}}</b>
            {{stop.stop.description}}
          </li>
        </ol>
      </div>

      <gmap-map class="gmap" :center="{lat: centerLat, lng: centerLng}" :zoom="12">
        <gmap-marker v-for="stop in crowdstart.userSuggestedRouteStops"
          :position="{lat: stop.stop.coordinates.coordinates[1], lng: stop.stop.coordinates.coordinates[0]}">
        </gmap-marker>
        <gmap-polyline :path="pathCoordinates">
        </gmap-polyline>
      </gmap-map>
    </div>
  </div>
</template>

<script>
export default {
  props: ['crowdstart', 'index'],
  filters: require('../utils/filters').default,
  computed: {
    centerLat() {
      var numStops = this.crowdstart.userSuggestedRouteStops.length
      if (numStops === 0) {
        return 1.38;
      }
      var firstStop = this.crowdstart.userSuggestedRouteStops[0]
      var lastStop = this.crowdstart.userSuggestedRouteStops[numStops - 1]
      return (firstStop.stop.coordinates.coordinates[1]
        + lastStop.stop.coordinates.coordinates[1]) / 2;
    },
    centerLng() {
      var numStops = this.crowdstart.userSuggestedRouteStops.length
      if (numStops === 0) {
        return 103.8;
      }
      var firstStop = this.crowdstart.userSuggestedRouteStops[0]
      var lastStop = this.crowdstart.userSuggestedRouteStops[numStops - 1]
      return (firstStop.stop.coordinates.coordinates[0]
        + lastStop.stop.coordinates.coordinates[0]) / 2;
    },
    pathCoordinates() {
      return (this.crowdstart.path) ? this.crowdstart.path.coordinates.map(c => ({lat: c[0], lng: c[1]})) : []
    }
  },
}
</script>

<style scoped lang="scss">
.r {
  display: flex;
  flex-direction: row;

  .stops-list {
    flex: 0 0 400px;
  }
  .gmap.vue-map-container {
    flex: 0 1 600px;
    width: auto;
    height: auto;
    min-height: 400px;
  }
}
</style>
