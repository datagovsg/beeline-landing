<template>
  <div>
    <h2>Book a ride one one of these routes!</h2>

    <div v-if="runningRoutes && runningRoutes.length > 0">
      <existing-route-viewer v-for="(route, index) in runningRoutes"
        :route="route"
        :urlFunction="disp.liveRouteUrlFunction"
        :index="index"
        @derive="deriveFromRoute(route)"
        @mouseover="selectRoute(route)"
        :origin="origin"
        :destination="destination">
      </existing-route-viewer>
    </div>
    <div v-else-if="runningRoutes && runningRoutes.length === 0">
      <p>
        Sorry! No running routes found. Try
        <router-link to="crowdstarted">crowdstarted</router-link> routes?
      </p>
    </div>
    <div v-else>
      <p>
        Please
        <router-link to="search">enter some search terms</router-link>.
      </p>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex'
import ExistingRouteViewer from '../components/existing-route-viewer.vue';
import SimilarRequests from '../components/similar-requests.vue';
import RouteViewer from '../components/route-viewer.vue';
import MapPreview from '../components/map-preview.vue';
import geocode from '../utils/geocoder';

export default {
  components: {
    ExistingRouteViewer,
    MapPreview,
    RouteViewer,
    SimilarRequests
  },
  data() {
    return {
      disp: {
        liveRouteUrlFunction: route => `https://app.beeline.sg/#/tabs/booking/${route.id}/stops`,
      }
    }
  },
  computed: {
    ...mapState(['origin', 'destination', 'runningRoutes'])
  },
  methods: {
    deriveFromRoute(route) {
      this.$store.commit('crowdstartRoute', route)
      this.$router.push('new')
    }
  }
}
</script>
