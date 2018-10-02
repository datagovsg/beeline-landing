<template>
  <div class="container">
    <h1>Route Experimentation</h1>

    <div style="display: flex">
      <div style="flex-basis: 50%">
        <h4>From:</h4>
        <div v-if="activeSelector === 'from'">
          Click anywhere on the map...
        </div>
        <div @click="activeSelector = 'from'">
        {{ selector.from || 'Click me' }}
        </div>
      </div>

      <div style="flex-basis: 50%">
        <h4>To:</h4>

        <div v-if="activeSelector === 'to'">
          Click anywhere on the map...
        </div>
        <div @click="activeSelector = 'to'">
        {{ selector.to || 'Click me' }}
        </div>
      </div>
    </div>

    <div style="display: flex">
      <div style="flex-basis: 50%">
        <h3>Settings</h3>
        <div>
          <label>
            Start Walking Distance
            <input type="text" v-model.number.lazy="settings.startWalkingDistance" />
          </label>
        </div>
        <div>
          <label>
            End Walking Distance
            <input type="text" v-model.number.lazy="settings.endWalkingDistance" />
          </label>
        </div>
        <div>
          <label>
            Start Cluster Radius
            <input type="text" v-model.number.lazy="settings.startClusterRadius" />
          </label>
        </div>
        <div>
          <label>
            End Cluster Radius
            <input type="text" v-model.number.lazy="settings.endClusterRadius" />
          </label>
        </div>
        <div>
          <label>
            Max Detour Minutes
            <input type="text" v-model.number.lazy="settings.maxDetourMinutes" />
          </label>
        </div>
        <div>
          <label>
            Created Since
            <input type="text" :value="new Date(settings.createdSince).toISOString()"
              @change="settings.createdSince = new Date($event.target.value).getTime()" />
          </label>
        </div>
        <div>
          <label>
            Imputed Dwell Time
            <input type="text" v-model.number.lazy="settings.imputedDwellTime" />
          </label>
        </div>
      </div>
      <textarea  style="flex-basis: 50%" v-html="JSON.stringify(this.settings, null, 2)" />
    </div>

    <div>
      <button @click="sendRequest()">
        Route!
      </button>
    </div>

    <p>
      Arriving by

      <select v-model="this.time">
        <option :value="i / 4 * 3600e3"
          :key="i"
          v-for="i in 96">
          {{Math.floor(i / 4)}}:{{((i % 4) * 15).toString().padStart(2, '0')}}
        </option>
      </select>
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
              <div v-if="selectedRoute === route && route.matchingRequests.length >= 15" class="share-tip">
                <p>
                  <i class="glyphicon glyphicon-bell" />
                  There are at least 15 people with similar suggestions!
                  Share this route with us at <a href="mailto:feedback@beeline.sg">feedback@beeline.sg</a>
                  and we can crowdstart it!
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
          :center="{lat: 1.38, lng: 103.8}" :zoom="11"
          :options="{gestureHandling: 'greedy', styles:[{featureType:'poi', stylers:[{visibility: 'off'}]}]}"
          @click="updateSelector"
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
      routes: false,
      selectedRoute: null,
      polylinePath: null,
      mapSettings,
      fromDescription: '',
      toDescription: '',

      activeSelector: 'from',
      time: 8.5 * 3600e3,
      selector: {
        from: null,
        to: null,
      },

      settings: {
        maxDetourMinutes: 10,
        startClusterRadius: 3000,
        endClusterRadius: 3000,
        startWalkingDistance: 400,
        endWalkingDistance: 400,
        imputedDwellTime: 60000,
        createdSince: new Date(2017, 0, 1).getTime(),
        dataSource: 'suggestions'
      }
    }
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
      return this.selector.from && {
        lat: this.selector.from[1],
        lng: this.selector.from[0],
      }
    },
    endLatLng () {
      return this.selector.to && {
        lat: this.selector.to[1],
        lng: this.selector.to[0],
      }
    },
    dateformat: () => dateformat
  },

  methods: {

    updateSelector(event) {
      const lat = event.latLng.lat()
      const lng = event.latLng.lng()

      this.selector[this.activeSelector] = [lng, lat]
      this.activeSelector =
        this.activeSelector === 'from' ? 'to' : 'from'
    },

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
      return route.matchingRequests.length
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
        startLat: this.selector.from && this.selector.from[1],
        startLng: this.selector.from && this.selector.from[0],
        endLat: this.selector.to && this.selector.to[1],
        endLng: this.selector.to && this.selector.to[0],
        time: this.time,
        settings: JSON.stringify(this.settings)
      })
      .then((r) => {
        this.routes = r.map(route => ({
          ...route,
          matchingRequests: route.requests.filter(req => Math.abs(req.time - this.time) <= 1800e3),
          stops: fixWrongTime(route.stops, this.time)
        }))

        if (r.length >= 1) {
          this.panToRoute(r[0])
        }
      })
      .catch((err) => {
        console.error(err)
        this.routes = false
      })
    }
  }
}

import _ from 'lodash'

let latestRoute = null

async function route(options) {
  const resultToken = await axios.get(`${process.env.beelineRoutingServer}/routing/begin?` + querystring.stringify(options))
    .then((r) => r.data)

  latestRoute = options

  while (latestRoute === options) { // eslint-disable-line
    const pollResult = await axios.get(`${process.env.beelineRoutingServer}/routing/poll?` + querystring.stringify({
      uuid: resultToken
    }))

    if (pollResult.status === 200) {
      return _.sortBy(
        pollResult.data,
        r => -_.sumBy(r.stops, s => s.numBoard),
      )
    } else if (pollResult.status === 202) {
      await new Promise(resolve => setTimeout(resolve, 5000))
    } else {
      throw new Error('Unknown response')
    }
  }
}

function fixWrongTime(stops, finalTime) {
  const travelTimes = stops.map((stop, index, array) => {
    if (index === 0) {
      return null
    } else {
      return stop.maxTime - array[index - 1].maxTime
    }
  }).slice(1) // Drop the initial null value

  const correctTimes = travelTimes.reverse().reduce(
    (times, travelTime) => {
      times.push(times[times.length - 1] - travelTime)
      return times
    },
    [finalTime]
  ).reverse()

  return stops.map((stop, index) => {
    return {
      ...stop,
      maxTime: correctTimes[index],
    }
  })
}

</script>
