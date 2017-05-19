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
        <gmap-marker v-for="(stop, stopIndex) in crowdstart.userSuggestedRouteStops"
          :icon="filters.stopIcon(stopIndex)"
          :position="{lat: stop.stop.coordinates.coordinates[1], lng: stop.stop.coordinates.coordinates[0]}"
          @click="selectedCurrentStop = stop">
        </gmap-marker>
        <gmap-info-window @closeclick="selectedCurrentStop = null"
          :position="{lat:selectedCurrentStop.stop.coordinates.coordinates[1], lng:selectedCurrentStop.stop.coordinates.coordinates[0]}"
          :opened="!!selectedCurrentStop"
          v-if="selectedCurrentStop">
          {{selectedCurrentStop.stop.description}}<br/>
        </gmap-info-window>

        <gmap-polyline :path="pathCoordinates">
        </gmap-polyline>
      </gmap-map>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import leftPad from 'left-pad';

export default {
  props: ['crowdstart', 'index'],
  filters: require('../utils/filters').default,
  data() {
    return {
      selectedCurrentStop: null,
      filters: {
        stopIcon(stopIndex) {
          stopIndex = parseInt(stopIndex);
          return {
            url: `https://admin.beeline.sg/img/stopBoard${leftPad(stopIndex + 1, 3, '0')}.png`,
            scaledSize: window.google && new google.maps.Size(36, 36),
            anchor: window.google && new google.maps.Point(18, 18)
          }
        }
      },
    }
  },
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
