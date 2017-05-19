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

      <gmap-map class="gmap" :center="{lat: 1.38, lng: 103.8}" :zoom="12"
        ref="crowdstart-route-map">
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
import _ from 'lodash';

export default {
  props: ['crowdstart', 'index'],
  filters: require('../utils/filters').default,
  computed: {
    pathCoordinates() {
      return (this.crowdstart.path) ? 
        this.crowdstart.path.coordinates.map(c => ({lat: c[0], lng: c[1]})) : []
    },
    stopsCoordinates() {
      return (this.crowdstart.userSuggestedRouteStops) ?
        this.crowdstart.userSuggestedRouteStops
          .map(stop => stop.stop.coordinates.coordinates)
          .map(c => ({lat: c[1], lng: c[0]})) 
        : []
    }
  },
  mounted() {
    this.$refs['crowdstart-route-map'].$deferredReadyPromise.then(() => {
      this.refit();
    })
  },
  methods: {
    refit() {
      var bounds = new google.maps.LatLngBounds();
      for (let c of this.stopsCoordinates) {
        bounds.extend(c)
      }
      this.$refs['crowdstart-route-map'].resize();
      this.$refs['crowdstart-route-map'].$mapObject.fitBounds(bounds);
    },
  }
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
