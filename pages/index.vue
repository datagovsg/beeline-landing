<template>
  <div>
    <template v-if="similarSuggestions">
      <Spinner v-if="similarLoading" />
      <h3>Similar suggestions</h3>
      There are {{similarSuggestions.length}} similar suggestions around you
    </template>

    <h2>Running Routes</h2>
    <Spinner v-if="runningLoading" />
    <div v-for="route in runningRoutes">
      <RouteDisplay :route="route" />
    </div>

    <h2>Crowdstart Routes</h2>
    <Spinner v-if="crowdstartLoading" />
    <div v-for="route in crowdstartRoutes">
      <RouteDisplay :route="route" />
    </div>

    <h2>Suggested by Users</h2>
    <Spinner v-if="crowdstartLoading" />
    <div v-for="route in userRoutes">
      <RouteDisplay :route="route" />
    </div>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import axios from 'axios'
import querystring from 'querystring'

export default {
  data () {
    return {
      runningRoutes: null,
      crowdstartRoutes: null,
      similarSuggestions: null,

      runningLoading: false,
      crowdstartLoading: false,
      similarLoading: false,
    }
  },
  computed: {
    ...mapState('search', ['origin', 'destination', 'arrivalTime']),

    now() {
      return Date.now()
    },

    runningRoutesPromise() {
      if (!this.origin && !this.destination) {
        // FIXME: can return the most popular routes or something
        return Promise.resolve([])
      }
      return axios.get('https://api.beeline.sg/routes/search_by_latlon?' + querystring.stringify({
        ...this.origin
          ? {
            startLat: this.origin.lat,
            startLng: this.origin.lng,
          }
          : {},
        ...this.destination
          ? {
            endLat: this.destination.lat,
            endLng: this.destination.lng,
          }
          : {},
        startTime: this.now,
        maxDistance: 2000,
        tags: JSON.stringify(['public'])
      }))
      .then((response) => response.data)
    },

    similarSuggestionsPromise() {
      if (!this.origin || !this.destination) {
        return Promise.resolve(null)
      }
      return axios.get('https://api.beeline.sg/suggestions/web/similar?' + querystring.stringify({
        startLat: this.origin.lat,
        startLng: this.origin.lng,
        endLat: this.destination.lat,
        endLng: this.destination.lng,
        startDistance: 5000,
        endDistance: 5000,
      }))
      .then((response) => response.data)
    },

    crowdstartRoutesPromise() {
      if (!this.origin && !this.destination) {
        // FIXME: can return the most popular routes or something
        return Promise.resolve([])
      }
      return axios.get('https://api.beeline.sg/routes/search_by_latlon?' + querystring.stringify({
        ...this.origin
          ? {
            startLat: this.origin.lat,
            startLng: this.origin.lng,
          }
          : {},
        ...this.destination
          ? {
            endLat: this.destination.lat,
            endLng: this.destination.lng,
          }
          : {},
        startTime: this.now,
        maxDistance: 2000,
        tags: JSON.stringify(['lelong'])
      }))
      .then((response) => response.data)
    }
  },
  watch: {
    crowdstartRoutesPromise: {
      immediate: true,
      async handler(p) {
        this.crowdstartLoading = true
        try {
          const routes = await p
          this.crowdstartRoutes = routes
        } finally {
          this.crowdstartLoading = false
        }
      }
    },
    runningRoutesPromise: {
      immediate: true,
      async handler(p) {
        this.runningLoading = true
        try {
          const routes = await p
          this.runningRoutes = routes
        } finally {
          this.runningLoading = false
        }
      }
    },
    similarSuggestionsPromise: {
      immediate: true,
      async handler(p) {
        this.similarLoading = true
        try {
          this.similarSuggestions = await p
        } catch (err) {
          this.similarSuggestions = null
        } finally {
          this.similarLoading = false
        }
      }
    }
  },

}
</script>

<style>
</style>
