<template>
  <div class="proposed-route">
    <div class="description">
      <h4>Stops</h4>
      <ol>
        <li v-for="stop in route.stops">
          {{stop.description}}
        </li>
      </ol>
      <b>{{numRequests}} people expressed interest
        in this stop</b>
    </div>
    <gmap-map class="gmap" :center="{lat: 1.38, lng: 103.8}" :zoom="12"
      ref="proposed-route-map">
      <gmap-marker v-for="stop in route.stops"
        :position="{lat: stop.lat, lng: stop.lng}">
      </gmap-marker>
      <gmap-polyline :path="polylinePath">
      </gmap-polyline>
    </gmap-map>
  </div>
</template>

<style scoped lang="scss">
.proposed-route {
  display: flex;
  flex-direction: row;

  .description {
    flex: 0 0 300px;
  }
  .gmap.vue-map-container {
    flex: 0 1 800px;
    width: auto;
    height: auto;
    min-height: 250px;
  }
}
</style>

<script>
import Vue from 'vue';
import _ from 'lodash';

export default {
  props: ['route'],
  computed: {
    polylinePath() {
      return this.route.stops.map(s => _.pick(s, ['lat', 'lng']))
    },
    numRequests() {
      return _.sum(this.route.requests.map(r => r.weight))
    }
  },
  created() {
    this.$watch('route.stops', _.throttle(function (stops) {
        this.refit();
      }, 100, {leading: false, trailing: true}))
  },
  mounted() {
    this.$refs['proposed-route-map'].$deferredReadyPromise.then(() => {
      this.refit();
    })
  },
  methods: {
    refit() {
      var bounds = new google.maps.LatLngBounds();
      for (let stop of this.route.stops) {
        bounds.extend(_.pick(stop, ['lat', 'lng']))
      }
      this.$refs['proposed-route-map'].resize();
      this.$refs['proposed-route-map'].$mapObject.fitBounds(bounds);
    }
  }
}
</script>
