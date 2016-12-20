<template>
  <div>
    <form class="search-form">
      <h1>Search for a Ride!</h1>
      <div>
        <gmap-place-input
          label="Origin"
          placeholder="e.g. Pasir Ris"
          class-name="form-input"
          :default-place="search.origin"
          :bounds="disp.Singapore"
          @place_changed="updatePlace('origin', latLngFromPlace($event))"></gmap-place-input>
      </div>

      <div>
        <gmap-place-input
          label="Destination"
          placeholder="e.g. Sandcrawler Building"
          class-name="form-input"
          :default-place="search.destination"
          :bounds="disp.Singapore"
          @place_changed="updatePlace('destination', latLngFromPlace($event))"></gmap-place-input>
      </div>

      <div>
        <map-preview :center="origin"  @position-updated="updateLatLng('origin', $event)"></map-preview>
        <map-preview :center="destination"  @position-updated="updateLatLng('destination', $event)"></map-preview>
      </div>
    </form>

    <div class="search-results" v-show="showSearch">
      <template v-if="liveRoutes && liveRoutes.length > 0">
        <h2>Book a ride now!</h2>
        <live-route-viewer v-for="(route, index) in liveRoutes" :route="route"
          :index="index"  @derive="deriveFromRoute(route)">
        </live-route-viewer>
      </template>

      <h2>Bid for these Routes!</h2>
      <template v-if="!lelongRoutes">
        ... loading ...
      </template>
      <template v-else-if="lelongRoutes.length == 0">
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
      <template v-else>
        <crowdstart-route-viewer v-for="(route, index) in lelongRoutes" :route="route"
          :index="index" @derive="deriveFromRoute(route)">
        </crowdstart-route-viewer>
      </template>

      <template v-if="crowdstarting.derived">
        <h3>Timing not Suitable? Propose something else!</h3>
        <crowdstart-from-route :route="crowdstarting.derived"
          ref="routeEditor">
        </crowdstart-from-route>
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
import LiveRouteViewer from './components/live-route-viewer.vue';
import CrowdstartRouteViewer from './components/crowdstart-route-viewer.vue';
import ProposedRouteViewer from './components/proposed-route-viewer.vue';
import CrowdstartFromRoute from './components/crowdstart-from-route.vue';
import MapPreview from './components/map-preview.vue';
import querystring from 'querystring';
import geocode from './utils/geocoder';
import scrollTo from './utils/scrollTo';

export default {
  name: 'app',
  components: {
    LiveRouteViewer,
    CrowdstartRouteViewer,
    MapPreview,
    ProposedRouteViewer,
    CrowdstartFromRoute
  },
  data() {
    return {
      origin: null,
      destination: null,

      search: {
        origin: '',
        destination: '',
      },

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
      },

      crowdstarting: {
        derived: null,
      },

      allLelongRoutes: [],
      // lelongRoutes: null,
      liveRoutes: null,

      maxDistance: 300,
    }
  },
  created() {
    this.$http.get('https://api.beeline.sg/custom/lelong/status')
    .then(r => r.json())
    .then(rs => this.allLelongRoutes = rs);
  },
  computed: {
    showSearch() {
      return this.origin && this.destination
    },
    lelongRoutes() {
      if (this.origin && this.destination) {
        return this.allLelongRoutes.filter(route =>
          _.some(route.trips[0].tripStops, ts => ts.canBoard &&
              latlngDistance([ts.stop.coordinates.coordinates[1], ts.stop.coordinates.coordinates[0]],
                             [this.origin.lat, this.origin.lng]) < this.maxDistance) &&
              _.some(route.trips[0].tripStops, ts => ts.canAlight &&
              latlngDistance([ts.stop.coordinates.coordinates[1], ts.stop.coordinates.coordinates[0]],
                             [this.destination.lat, this.destination.lng]) < this.maxDistance)

        )
      } else {
        return null;
      }
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
        this.updateProposedRoutes();
        this.updateLiveRoutes();
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
    updateLiveRoutes() {
      if (this.origin && this.destination) {
        this.$http.get('https://api.beeline.sg/routes/search_by_latlon?' + querystring.stringify({
          startLat: this.origin.lat,
          startLng: this.origin.lng,
          endLat: this.destination.lat,
          endLng: this.destination.lng,
          maxDistance: 500,
          tags: JSON.stringify(['public']),
        }))
        .then(r => r.json())
        .then(rs => {
          this.liveRoutes = rs;
        });
      }
    },
    updateLatLng(which, what) {
      this.updatePlace(which, what);

      // additionally reverse geocode
      geocode(what)
      .then(r => {
        this.$set(this.search, which, r[0].formatted_address)
      })
    },
    deriveFromRoute(route) {
      this.crowdstarting.derived = route;
      this.$nextTick(() => {
        scrollTo(this.$refs.routeEditor.$el)
      })
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

function latlngDistance(ll1, ll2) {
  var rr1 = [ll1[0] / 180 * Math.PI, ll1[1] / 180 * Math.PI]
  var rr2 = [ll2[0] / 180 * Math.PI, ll2[1] / 180 * Math.PI]

  var dx = (rr1[1] - rr2[1]) * Math.cos(0.5 * (rr1[0] + rr2[0]))
  var dy = rr1[0] - rr2[0]

  var dist = Math.sqrt(dx * dx + dy * dy) * 6371000
  return dist
}


</script>

<style lang="sass">
</style>
