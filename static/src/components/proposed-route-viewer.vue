<template>
  <div class="proposed-route">
    <div class="description">
      <h4>Stops</h4>
      <ol>
        <li v-for="stop in route.stops">
          {{stop.description}}
        </li>
      </ol>
      <b>{{numRequests}} people will be served by this route.</b>
      <div>
        <b>Preferred timings of other users:</b>
        <requests-time-histogram :requests="actualTimes"
          :height="150" :width="250" />
      </div>
      <button @click="startRoute(route)" class="btn btn-default">
        Crowdstart this route!
      </button>
    </div>
    <gmap-map class="gmap" :center="{lat: 1.38, lng: 103.8}" :zoom="12"
      ref="proposed-route-map">
      <similar-requests
        :requests="similarRequests"
      ></similar-requests>

      <gmap-marker v-for="stop in route.stops"
        :position="{lat: stop.lat, lng: stop.lng}">
      </gmap-marker>
      <gmap-polyline v-if="polylinePath" :path="polylinePath">
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
    min-height: 400px;
  }
}
</style>

<script>
import Vue from 'vue';
import _ from 'lodash';
import mapBus from '../utils/mapBus';
import RequestsTimeHistogram from '../components/requests-time-histogram.vue';
import SimilarRequests from '../components/similar-requests.vue';
import querystring from 'querystring';
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex'

export default {
  props: ['route'],
  components: {
    RequestsTimeHistogram,
    SimilarRequests,
  },
  data() {
    return {
      polylinePath: null
    }
  },
  watch: {
    polylinePathPromise: {
      handler(promise) {
        promise.then((path) => this.polylinePath = path)
      },
      immediate: true,
    }
  },
  computed: {
    ...mapState(['similarRequests']),
     polylinePathPromise() {
      var indices = this.route.stops.map(stop => stop.index)
      var data = Vue.resource('/paths/' + indices.join('/')).get()
        .then(r => r.json())
        .then(rs => {
          if (rs.status === 'success') {
            return _.flatten(rs.payload).map(s => _.pick(s, ['lat', 'lng']))
          } else {
            throw new Error(rs.payload);
          }
        })
      return data
    },
    numRequests() {
      return _.sum(this.route.requests.map(r => r.weight))
    },
    actualTimes() {
      return this.route.requests.map(r => ({time: r.time}))
    }
  },
  created() {
    this.$watch('route.stops', _.throttle(function (stops) {
        this.refit();
      }, 100, {leading: false, trailing: true}))

    mapBus.$on('resize', () => {
      if (this.$refs['proposed-route-map']) {
        this.$refs['proposed-route-map'].resizePreserveCenter();
      }
    });
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
    },
    startRoute(route) {
      var simulatedRoute = {
        from: route.stops[0].description,
        to: route.stops[route.stops.length - 1].description,
        trips: [{
          tripStops: route.stops.map((s, i) => ({
            stop: {
              description: s.description,
              coordinates: {
                type: 'Point',
                coordinates: [s.lng, s.lat],
              },
              index: s.index
            },
            time: 5 * 60 * 1000 * i // will be populated from the Directions API
          }))
        }],
        path: this.polylinePath
      };

      this.$store.commit('crowdstartRoute', simulatedRoute);
      this.$store.dispatch('recomputeTimings')
      .then(() => {
        this.$router.push('new')
      })
    }
  }
}
</script>
