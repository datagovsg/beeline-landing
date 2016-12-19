<template>
  <div>
    <form class="search-form">
      <div>
        <gmap-place-input
          label="Origin"
          placeholder="e.g. Pasir Ris"
          class-name="form-input"
          :bounds="disp.Singapore"
          @place_changed="updatePlace('origin', latLngFromPlace($event))"></gmap-place-input>
      </div>

      <div>
        <gmap-place-input
          label="Destination"
          placeholder="e.g. Sandcrawler Building"
          class-name="form-input"
          :bounds="disp.Singapore"
          @place_changed="updatePlace('destination', latLngFromPlace($event))"></gmap-place-input>
      </div>

      <div>
        <map-preview :center="origin"  @position-updated="updatePlace('origin', $event)"></map-preview>
        <map-preview :center="destination"  @position-updated="updatePlace('destination', $event)"></map-preview>
      </div>
    </form>
    <div class="search-results" v-show="showSearch">
      <h2>Bid for these Routes!</h2>
      <template v-if="!routes">
        ... loading ...
      </template>
      <template v-else-if="routes.length == 0">
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
      </template>
      <template v-else="routes.length == 0">
        <route-viewer v-for="route in routes"
          :route="route">
        </route-viewer>
      </template>

      <hr/>
      <h2>Start a route</h2>
      Routes are generated from other users' submissions.

      <div class="search-settings">
        <div>
          <label>
            Walking distance at start
            <input type="number" v-model="searchSettings.startWalkingDistance"
              step="10"/>
          </label>
        </div>
        <div>
          <label>
            Walking distance at end
            <input type="number" v-model="searchSettings.endWalkingDistance"
              step="10"/>
          </label>
        </div>
        <div>
          <label>
            Cluster radius at start
            <input type="number" v-model="searchSettings.startClusterRadius"
              step="10"/>
          </label>
        </div>
        <div>
          <label>
            Cluster radius at end
            <input type="number" v-model="searchSettings.endClusterRadius"
              step="10"/>
          </label>
        </div>
        <div>
          <label>
            Detour minutes
            <input type="number" v-model="searchSettings.maxDetourMinutes"
              step="1">
          </label>
        </div>
        <div>
          Data Source
          <label>
            <input type="radio" value="ezlink" v-model="searchSettings.dataSource" />
            EZ Link
          </label>
          <label>
            <input type="radio" value="suggestions" v-model="searchSettings.dataSource" />
            Beeline Suggestions
          </label>
        </div>
        <button class="btn btn-default"
          @click="updateProposedRoutes">Suggest something else!</button>
      </div>

      <template v-if="proposedRoutes">
        Start with one of these routes!
        <proposed-route-viewer v-for="route in proposedRoutes"
          :route="route">
        </proposed-route-viewer>
      </template>
      <template v-else>
        ... loading ...
      </template>
    </div>
  </div>
</template>

<script>
import RouteViewer from './components/route-viewer.vue';
import ProposedRouteViewer from './components/proposed-route-viewer.vue';
import MapPreview from './components/map-preview.vue';
import querystring from 'querystring';

export default {
  name: 'app',
  components: {
    RouteViewer,
    MapPreview,
    ProposedRouteViewer
  },
  data() {
    return {
      origin: null,
      destination: null,

      routes: null,
      proposedRoutes: null,

      disp: {
        Singapore: {
          north: 1.516329,
          east: 104.08,
          south: 1.1954,
          west: 103.5814
        }
      },

      searchSettings: {
        maxDetourMinutes: 2,
        startClusterRadius: 4000,
        endClusterRadius: 4000,
        startWalkingDistance: 300,
        endWalkingDistance: 300,
        dataSource: 'suggestions'
      }
    }
  },
  computed: {
    showSearch() {
      return this.origin && this.destination
    }
  },
  methods: {
    updatePlace(which, latLng) {
      if (latLng) {
        this.$set(this, which, latLng)
        this.updateRoutes();
      } else {
        this.$set(this, which, null);
      }
    },
    updateRoutes() {
      if (this.origin && this.destination) {
        this.$http.get('/routes/search?' + querystring.stringify({
          origin_lat: this.origin.lat,
          origin_lng: this.origin.lng,
          destination_lat: this.destination.lat,
          destination_lng: this.destination.lng,
        }))
        .then(r => r.json())
        .then(rs => this.routes = rs);

        this.updateProposedRoutes();
      }
    },
    updateProposedRoutes() {
      if (this.origin && this.destination) {
        this.$http.get('/routes/propose?' + querystring.stringify({
          origin_lat: this.origin.lat,
          origin_lng: this.origin.lng,
          destination_lat: this.destination.lat,
          destination_lng: this.destination.lng,
          settings: JSON.stringify(this.searchSettings)
        }))
        .then(r => r.json())
        .then(rs => {
          if (rs.status === 'success') {
            // Take only the ten routes with the most number of passengers
            this.proposedRoutes = _.sortBy(rs.payload, route => - _.sumBy(route.requests, r => r.weight))
              .slice(0, 10);
          } else {
            throw new Error(rs.payload);
          }
        });
      }
    },
    latLngFromPlace(place) {
      if (place.geometry) {
        return {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        }
      }
    }
  }
}
</script>

<style lang="sass">
</style>
