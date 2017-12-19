<template>
  <div class="container">
    <h1>Suggest a Bus Route</h1>

    <p>
      <strong>From:</strong>
      {{fromDescription}}
    </p>

    <p>
      <strong>To:</strong>
      {{toDescription}}
    </p>

    <p v-if="this.time !== null">
      Arriving by
      <strong>
        {{dateformat(this.time, 'h:MM TT', true)}}
      </strong>.
    </p>

    <div class="results-container">
      <div class="routes">
        <template v-if="routes === null">
          Loading... (This will take a while, please be patient!)
          <LoadingSpinner />
        </template>
        <template v-else-if="routes === false">
          There was an error generating the routes
        </template>
        <template v-else-if="routes.length === 0">
          Sorry! There are no routes found.
        </template>
        <template v-else>
          <h3>Route suggestions:</h3>

          <div v-for="(route, index) in routes" :key="index"
               @click.prevent="viewRoute(route)"
               :class="{active: selectedRoute === route}"
                class="route">
            <p>
              <a href="#" @click.prevent class="block-a">
                <strong>
                  Proposed Route #{{index + 1}} (serves {{countPeople(route)}} people)
                </strong>
              </a>
            </p>

            <ol v-if="route.stops.length < 5" :class="{active: selectedRoute === route}">
              <li v-for="(stop, stopIndex) in route.stops" :key="`${index}, ${stopIndex}`">
                <a href="#" @click.prevent="viewStop(stop)">
                  ({{dateformat(stop.maxTime, 'h:MM TT', true)}})
                  {{stop.description}}
                </a>
              </li>
            </ol>
            <ol v-else :class="{active: selectedRoute === route}">
              <li v-for="(stop, stopIndex) in route.stops.slice(0, 2)" :key="`${index}, ${stopIndex}`">
                ({{dateformat(stop.maxTime, 'h:MM TT', true)}})
                {{stop.description}}
              </li>
              <li style="list-style-type: none;">...</li>
              <li v-for="(stop, stopIndex) in route.stops.slice(route.stops.length - 2)"
                :key="`${index}, -${stopIndex}`"
                :value="route.stops.length - 1 + stopIndex">
                ({{dateformat(stop.maxTime, 'h:MM TT', true)}})
                {{stop.description}}
              </li>
            </ol>

            <transition name="vanish">
              <div v-if="selectedRoute === route && route.requests.length >= 15" class="share-tip">
                <p>
                  <i class="glyphicon glyphicon-bell" />
                  There are at least 15 people with similar suggestions!
                  Share this route with us at <a href="mailto:feedback@beeline.sg">feedback@beeline.sg</a>
                  and we can crowdstart it!
                </p>

                <p>
                  Copy the link below and send it to us
                  <ShareLink :link="generatePermalinkUrl(route)" />
                </p>
              </div>

              <div v-else-if="selectedRoute === route" class="share-tip">
                <p>
                  <i class="glyphicon glyphicon-time" />
                  It seems like there are still very few suggestions in this
                  area. :(
                </p>

                <p>
                  Encourage your colleagues and neighbours to share their
                  suggestions. Once there is a route with 15 people,
                  you can email us to crowdstart it!
                </p>

                <p>
                  Suggestion submission page:
                  <ShareLink link="https://www.beeline.sg/suggest.html" />
                </p>
              </div>
            </transition>
          </div>
        </template>
      </div>

      <GmapMap class="gmap"
          :center="{lat: 1.38, lng: 103.8}" :zoom="12"
          :options="{gestureHandling: 'greedy'}"
          ref="proposed-route-map">
        <template v-if="selectedRoute">
          <RoutePathAndStops :stops="selectedRoute.stops" />

          <SuggestionMarker v-for="(request, index) in selectedRoute.requests"
            :key="'r' + index"
            :position="request.start"
            />
          <SuggestionMarker v-for="(request, index) in selectedRoute.requests"
            :key="'rr' + index"
            :position="request.end"
            />
        </template>
        <template v-else>
          <CurvedOD
            :start="startLatLng"
            :end="endLatLng"
            :options="{
              icons: mapSettings.chevronIcons('#FF3863', 2.5),
              strokeColor: '#4b3863',
              strokeOpacity: 0.0,
              strokeWeight: 5,
              zIndex: 10
              }"
            />
        </template>
        <GmapMarker
          :icon="mapSettings.manWavingArmIcon"
          :position="startLatLng"
          :options="{zIndex: 12}"
          />
        <GmapMarker
          :icon="mapSettings.manWavingArmIcon"
          :position="endLatLng"
          :options="{zIndex: 12}"
          />
      </GmapMap>

    </div>
  </div>
</template>

<style lang="scss" scoped>
  .gmap {
    flex: 1 1 auto;
  }

  .results-container {
    min-width: 800px;
    display: flex;
    align-items: stretch;

    .routes {
      flex: 0.5 1 500px;
      padding: 1em;
      overflow-y: scroll;
    }
    .route.active {
      background-color: #DEF;
      a.block-a { // Make the whole block clickable
        display: block;
      }
    }

    .share-tip {
      font-size: 90%;
    }
  }
</style>

<script>
import axios from 'axios'
import querystring from 'querystring'
import dateformat from 'dateformat'

import mapSettings from '~/components/suggest/MapSettings'
import GeocodedLatLng from '~/components/GeocodedLatLng'
import LoadingSpinner from '~/components/LoadingSpinner'
import ExpandingTriangle from '~/components/ExpandingTriangle'
import CurvedOD from '~/components/suggest/CurvedOD'
import RoutePathAndStops from '~/components/autogenerated/RoutePathAndStops'
import SuggestionMarker from '~/components/autogenerated/SuggestionMarker'
import ShareLink from '~/components/autogenerated/ShareLink'
import VanishOnDelete from '~/components/VanishOnDelete'
import {getReverseGeocodeString} from '~/util/ReverseGeocoder'
// http://localhost:8080/routing/begin?startLat=1.4431762307345994&startLng=103.79058837890625&endLat=1.3003949349844803&endLng=103.79264831542969&time=0&settings=%7B%22maxDetourMinutes%22%3A2%2C%22startClusterRadius%22%3A3000%2C%22endClusterRadius%22%3A3000%2C%22startWalkingDistance%22%3A300%2C%22endWalkingDistance%22%3A300%2C%22dataSource%22%3A%22suggestions%22%7D%22

export default {
  layout: 'landing',

  async asyncData (params) {
    const v1 = {
      lat: parseFloat(params.query.startLat),
      lng: parseFloat(params.query.startLng),
    }
    const v2 = {
      lat: parseFloat(params.query.endLat),
      lng: parseFloat(params.query.endLng),
    }

    const [fromDescription, toDescription] = await Promise.all([
      getReverseGeocodeString(v1),
      getReverseGeocodeString(v2)
    ])

    return {fromDescription, toDescription}
  },

  data () {
    return {
      routes: null,
      selectedRoute: null,
      polylinePath: null,
      mapSettings,
      fromDescription: '',
      toDescription: '',
    }
  },

  mounted () {
    this.sendRequest()
  },

  components: {
    GeocodedLatLng,
    LoadingSpinner,
    ExpandingTriangle,
    CurvedOD,
    RoutePathAndStops,
    SuggestionMarker,
    ShareLink,
    VanishOnDelete
  },

  computed: {
    startLatLng () {
      return {
        lat: parseFloat(this.$route.query.startLat),
        lng: parseFloat(this.$route.query.startLng),
      }
    },
    endLatLng () {
      return {
        lat: parseFloat(this.$route.query.endLat),
        lng: parseFloat(this.$route.query.endLng),
      }
    },
    time () {
      if (this.$route.query.time) {
        return parseInt(this.$route.query.time)
      } else {
        return null
      }
    },
    dateformat: () => dateformat
  },

  methods: {
    viewRoute (route) {
      this.selectedRoute = route
    },
    viewStop (stop) {
      const {lat, lng} = stop
      this.$refs['proposed-route-map'].panTo({lat, lng})
      if (this.$refs['proposed-route-map'].$mapObject.getZoom() < 15) {
        this.$refs['proposed-route-map'].$mapObject.setZoom(17)
      }
    },
    countPeople (route) {
      return route.requests.length
    },
    panToRoute(route) {
      // pan to the stops lat lng
      const latLngBounds = new google.maps.LatLngBounds()
      for (let stop of route.stops) {
        const {lat, lng} = stop
        latLngBounds.extend({lat, lng})
      }
      this.$refs['proposed-route-map'].fitBounds(latLngBounds)
    },
    sendRequest () {
      this.routes = null

      route({
        startLat: this.$route.query.startLat,
        startLng: this.$route.query.startLng,
        endLat: this.$route.query.endLat,
        endLng: this.$route.query.endLng,
        time: 0,
        settings: JSON.stringify({
          maxDetourMinutes: 2.5,
          startClusterRadius: 3000,
          endClusterRadius: 3000,
          startWalkingDistance: 400,
          endWalkingDistance: 400,
          dataSource: 'suggestions'
        })
      })
      .then((r) => {
        this.routes = r

        if (r.length >= 1) {
          this.panToRoute(r[0])
        }
      })
      .catch((err) => {
        console.error(err)
        this.routes = false
      })
    },

    generatePermalinkUrl (route) {
      return `https://www.beeline.sg/autogenerated/details?` +
          querystring.stringify({
            stops: route.stops.map(s => s.index).join(','),
            time: this.time,
          })
    },

    generateMailtoLink (route) {
      const permalinkUrl = `https://www.beeline.sg/autogenerated/details?` +
        querystring.stringify({stops: route.stops.map(s => s.index).join(',')})

      return `mailto:feedback@beeline.sg?` + querystring.stringify({
        subject: 'Crowdstart Route Request',
        body: `Hi Beeline Team!

I have found a route with at least 15 people. Could you please crowdstart it?

${permalinkUrl}`
      })
    }
  }
}

async function route(options) {
  const resultToken = await axios.get(`${process.env.beelineRoutingServer}/routing/begin?` + querystring.stringify(options))
    .then((r) => r.data)

  while (true) {
    const pollResult = await axios.get(`${process.env.beelineRoutingServer}/routing/poll?` + querystring.stringify({
      uuid: resultToken
    }))

    if (pollResult.status === 200) {
      return pollResult.data
    } else if (pollResult.status === 202) {
      await new Promise(resolve => setTimeout(resolve, 5000))
    } else {
      throw new Error('Unknown response')
    }
  }
}

</script>
