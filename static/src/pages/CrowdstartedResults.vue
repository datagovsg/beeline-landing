<template>
  <div>
    <h2>Bid for these Routes!</h2>
    <template v-if="!crowdstartedRoutes">
      <p>
        Please
        <router-link to="search">enter some search terms</router-link>.
      </p>
    </template>
    <template v-else-if="crowdstartedRoutes.length == 0">
      No suitable routes found. Here's what you can do next:
      <div class="card">
        <button class="btn btn-primary">Start a Route!</button>
        We will suggest some possible routes, and you can commit
        some money to the route for a month.
        An interested bus operator may offer to start the route.
      </div>
      <div class="card">
        <button class="btn btn-secondary">Express Interest</button>
        We will use your suggestion to improve our route suggestions.
        Keep yourself subscribed by email when someone else
        commits money to a route near you.
        </button>
      </div>
    </template>
    <template v-else>
      <existing-route-viewer v-for="(route, index) in crowdstartedRoutes"
        :route="route"
        :urlFunction="crowdstartRouteUrlFunction"
        :index="index"
        :origin="origin"
        :destination="destination"
        @derive="deriveFromRoute(route)"
        @mouseover="selectRoute(route)">
        >
      </existing-route-viewer>
    </template>
  </div>
</template>
<script>
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex'
import ExistingRouteViewer from '../components/existing-route-viewer.vue';
import SimilarRequests from '../components/similar-requests.vue';
import RouteViewer from '../components/route-viewer.vue';
import MapPreview from '../components/map-preview.vue';

export default {
  components: {
    ExistingRouteViewer,
    MapPreview,
    RouteViewer,
    SimilarRequests
  },
  computed: {
    ...mapState(['origin', 'destination', 'crowdstartedRoutes'])
  },
  data() {
    return {
      crowdstartRouteUrlFunction: route => `https://app.beeline.sg/#/tabs/crowdstart/${route.id}/detail`
    }
  },
  methods: {
    deriveFromRoute(route) {
      this.$store.commit('crowdstartRoute', route)
      this.$router.push('new')
    }
  }
}
</script>
