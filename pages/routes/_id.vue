<template>
  <section class="route-page container" v-if="route" >
    <Route :route="route" />

    <GmapMap class="stops-map" :center="mapCenter" :zoom="mapZoom">
      <GmapPolyline :path="pathFromString(route.path)" />
      <GmapMarker v-for="ts in route.trips[0].tripStops"
        :key="ts.id"
        :position="{
          lat: ts.stop.coordinates.coordinates[1],
          lng: ts.stop.coordinates.coordinates[0],
          }"
        />
      <GmapInfoWindow v-if="selectedStop"
        :position="{
          lat: selectedStop.stop.coordinates.coordinates[1],
          lng: selectedStop.stop.coordinates.coordinates[0],
          }"
        >
        {{dateformat(selectedStop.time, 'HH:MM')}}
        {{selectedStop.stop.description}}
      </GmapInfoWindow>
    </GmapMap>

    <table class="table">
      <thead>
        <tr>
          <th>Time</th>
          <th>Stop Description</th>
          <th colspan="2">Stop Type</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="ts in route.trips[0].tripStops"
          :key="ts.id"
          @click="selectStop(ts)"
          :class="{active: selectedStop === ts}">
          <td>{{dateformat(ts.time, 'HH:MM')}}</td>
          <td>{{ts.stop.description}}</td>
          <td>{{ts.canBoard ? "Boarding" : "" }}</td>
          <td>{{ts.canAlight ? "Alighting" : "" }}</td>
        </tr>
      </tbody>
    </table>

    <PageDisqusThread />

  </section>
</template>

<style lang="scss">
.route-page {
  .stops-map {
    width: 100%;
    height: 300px;
  }
}

.table {
  tr.active td {
    background-color: #FED;
  }
}
</style>

<script>
import querystring from 'querystring'
import Route from '~/components/Route.vue'
import axios from 'axios'
import dateformat from 'dateformat'
import PageDisqusThread from '~/components/PageDisqusThread'

export default {
  props: ['id'],
  head () {
// https://moz.com/blog/meta-data-templates-123
    return {
      meta: [
        {property: 'og:title', content: `Beeline Route -- ${this.route.label}`},
        {property: 'og:type', content: 'article'},
        {property: 'og:url', content: `https://www.beeline.sg${this.$route.fullPath}`},
        {property: 'og:image', content: 'https://www.beeline.sg/images/feature_mainBeeline.png'},
        {property: 'og:description', content: `Shuttle bus from ${this.route.from} to ${this.route.to}`},
      ]
    }
  },
  asyncData ({params, error}) {
    const routeFuturePromise = axios.get(`https://api.beeline.sg/routes/${params.id}?` + querystring.stringify({
      start_date: new Date().toISOString(),
      include_trips: true
    }))
    const routePastPromise = axios.get(`https://api.beeline.sg/routes/${params.id}?` + querystring.stringify({
      end_date: new Date().toISOString(),
      include_trips: true
    }))

    return Promise.all([routeFuturePromise, routePastPromise])
    .then(([routeFuture, routePast]) => {
      return {
        route: (routeFuture.data.trips && routeFuture.data.trips.length) ? routeFuture.data : {
          ...routePast.data,
          trips: routePast.data.trips.reverse()
        }
      }
    })
  },
  data () {
    return {
      now: new Date(),
      selectedStop: null,
      mapCenter: {lat: 1.38, lng: 103.8},
      mapZoom: 11,
      route: null,
    }
  },
  components: {
    Route, PageDisqusThread
  },
  methods: {
    pathFromString (s) {
      if (typeof google === 'undefined') {
        return []
      } else {
        return google.maps.geometry.encoding.decodePath(s)
      }
    },
    selectStop (ts) {
      this.selectedStop = ts

      this.mapCenter = {
        lat: ts.stop.coordinates.coordinates[1],
        lng: ts.stop.coordinates.coordinates[0],
      }
      this.mapZoom = 16
    },
    dateformat
  }
}
</script>

<style>
</style>
