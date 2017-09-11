<template>
  <div v-if="nearbyRoutes === null">
    Loading...
  </div>
  <div v-else-if="!nearbyRoutes">
    There was an error fetching the routes
  </div>
  <div v-else-if="nearbyRoutes.length > 0">
    <p class="small" v-for="route in nearbyRoutes">
      <slot name="route-link" :route="route">
        ({{departureTimeFor(route)}}) {{route.from}}<br/>
        ({{arrivalTimeFor(route)}}) {{route.to}}<br/>
      </slot>
    </p>
  </div>
  <div v-else>
    <slot name="if-empty" />
  </div>
</template>

<script>
import axios from 'axios'
import dateformat from 'dateformat'
import querystring from 'querystring'
import {sortBy} from 'lodash'

export default {
  props: ['start', 'end', 'options'],

  data () {
    return {
      nearbyRoutes: null,
    }
  },

  computed: {
    fetchPromise () {
      return axios.get('https://api.beeline.sg/routes/search_by_latlon?' + querystring.stringify({
        startTime: Date.now(),
        startLat: this.start.lat,
        startLng: this.start.lng,
        endLat: this.end.lat,
        endLng: this.end.lng,
        maxDistance: 2000,
        ...this.options,
      }))
    }
  },

  watch: {
    fetchPromise: {
      immediate: true,
      handler (p) {
        p
        .then(r => {
          this.nearbyRoutes = r.data
        })
        .catch(err => {
          console.error(err)
          this.nearbyRoutes = false
        })
      }
    }
  },

  methods: {
    departureTimeFor(route) {
      var tripStops = sortBy(route.trips[0].tripStops, ts => ts.time)
      return dateformat(new Date(tripStops[0].time).getTime() - 8 * 3600e3, 'h:MM TT', true)
    },
    arrivalTimeFor(route) {
      var tripStops = sortBy(route.trips[0].tripStops, ts => ts.time)
      return dateformat(new Date(tripStops[tripStops.length - 1].time).getTime() - 8 * 3600e3, 'h:MM TT', true)
    },
  }
}
</script>
