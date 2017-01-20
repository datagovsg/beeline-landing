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
  computed: {
    ...mapState(['similarRequests']),
    polylinePath() {
      return this.route.stops.map(s => _.pick(s, ['lat', 'lng']))
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
      // Use the Google Maps Distance API to compute the travel time
      // on the next working day
      // FIXME: account for public holidays
      var today = new Date();
      today.setDate(today.getDate() + 1); // Increment by one
      while (today.getDate() == 0 || today.getDate() == 6) { // Don't fall on a weekend
        today.setDate(today.getDate() + 1)
      }
      var peakHourNextWorkingDay = Date.UTC( // Just set it at 8.30
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        (7 - 8),
        (30),
        0
      )

      var directionsAPIParams = {
        origin: _.pick(route.stops[0], ['lat', 'lng']),
        destination: _.pick(route.stops[route.stops.length - 1], ['lat', 'lng']),
        waypoints: route.stops.slice(1, route.stops.length - 1)
          .map(s => ({location: _.pick(s, ['lat', 'lng'])})),
        travelMode: google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(peakHourNextWorkingDay),
        }
      };

      var directionsService = new google.maps.DirectionsService();

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
              }
            },
            // time: 5 * 60 * 1000 * i // will be populated from the Directions API
          }))
        }]
      };

      (new Promise((resolve, reject) =>
        directionsService.route(directionsAPIParams, (result, status) => {
          if (status === 'OK')
            resolve(result)
          else
            reject(status);
        })
      ))
        .then(result => // Map the result to a list of durations
          result.routes[0].legs.map(leg => leg.duration.value * 1000)
        )
        .then(durations => {
          // Update the timings on the simulated route
          var sum = 0;

          simulatedRoute.trips[0].tripStops[0].time = 0;
          durations.forEach((d, i) => {
            sum += d;
            simulatedRoute.trips[0].tripStops[i + 1].time = sum;
          })

          // Let the user deal with it.
          this.$store.commit('crowdstartRoute', simulatedRoute);
          this.$router.push('/new')
        })
    }
  }
}
</script>
