<template>
  <section class="suggestion-page container" v-if="suggestion && similarSuggestions && from && to" >
    <h1>{{from}} to {{to}}</h1>
    <h2>Suggestion by {{suggestion.email}}</h2>

    <p>
      This suggestion was made on
      {{dateformat(suggestion.createdAt, 'dddd, dd mmmm yyyy h:MM TT')}}
    </p>

    <p>
      There are {{similarSuggestions.length - 1}} other suggestions
      near this suggestion.
    </p>

    <GmapMap class="stops-map" :center="mapCenter" :zoom="mapZoom">
      <!-- similar suggestions -->
      <GmapCluster>
      <GmapMarker v-for="suggestion in similarSuggestions"
        :key="suggestion.id"
        :position="{
          lat: suggestion.board.coordinates[1],
          lng: suggestion.board.coordinates[0],
          }"
        :icon="mapSettings.manWavingArmDarkIcon"
        :zIndex="1"
        />
      </GmapCluster>
      <GmapCluster>
      <GmapMarker v-for="suggestion in similarSuggestions"
        :key="suggestion.id"
        :position="{
          lat: suggestion.alight.coordinates[1],
          lng: suggestion.alight.coordinates[0],
          }"
        :icon="mapSettings.manWavingArmDarkIcon"
        :zIndex="1"
        />
      </GmapCluster>

      <!-- user's suggestion -->
      <GmapMarker
        :position="{
          lat: suggestion.board.coordinates[1],
          lng: suggestion.board.coordinates[0],
          }"
        :icon="mapSettings.manWavingArmIcon"
        :zIndex="10"
        />
      <GmapMarker
        :position="{
          lat: suggestion.alight.coordinates[1],
          lng: suggestion.alight.coordinates[0],
          }"
        :icon="mapSettings.manWavingArmIcon"
        :zIndex="10"
        />

      <CurvedOD
        :start="{lat: suggestion.board.coordinates[1], lng: suggestion.board.coordinates[0]}"
        :end="{lat: suggestion.alight.coordinates[1], lng: suggestion.alight.coordinates[0]}"
        :options="{
          icons: mapSettings.chevronIcons('#FF3863', 2.5),
          strokeColor: '#FF3863',
          strokeOpacity: 0.0,
          strokeWeight: 5,
          }"
        :zIndex="11"
        />
    </GmapMap>

    <PageDisqusThread />

  </section>
</template>

<style lang="scss">
.suggestion-page {
  .stops-map {
    width: 100%;
    height: 500px;
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
import axios from 'axios'
import dateformat from 'dateformat'
import PageDisqusThread from '~/components/PageDisqusThread'
import {getReverseGeocodeString} from '~/util/ReverseGeocoder'
import MapSettings from '~/components/suggest/MapSettings'
import CurvedOD from '~/components/suggest/CurvedOD'

export default {
  layout: 'landing',
  props: ['id'],
  head () {
// https://moz.com/blog/meta-data-templates-123
    return {
      meta: [
        {property: 'og:title', content: `Beeline Suggest - Find people going from ${this.from} to ${this.to}`},
        {property: 'og:type', content: 'article'},
        {property: 'og:url', content: `https://www.beeline.sg${this.$route.fullPath}`},
        {property: 'og:image', content: 'https://www.beeline.sg/images/feature_sgCrowdsource.png'},
        {property: 'og:description', content: `Join me and ${this.similarSuggestions && this.similarSuggestions.length}
          others on a Beeline! Together we can launch a shuttle bus!`},
      ]
    }
  },
  async asyncData ({params, error}) {
    // Here we do a dirty trick. For SEO purposes, we fetch the suggestion unauthenticated,
    // and display it first, along with all the similar suggestions
    // const suggestion = (await axios.get(`https://beeline-server-dev.herokuapp.com/suggestions/web/${params.id}`)).data
    const suggestion = (await axios.get(`https://api.beeline.sg/suggestions/${params.id}`, {
      headers: {authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiRGFuaWVsIFNpbSIsImVtYWlsIjoiZGFuaWVsX3NpbUBkYXRhLmdvdi5zZyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhcHBfbWV0YWRhdGEiOnsicm9sZXMiOlsic3VwZXJhZG1pbiJdfSwidXNlcl9pZCI6Imdvb2dsZS1vYXV0aDJ8MTA2NjgxNjE3MDc1ODI3NTU1NTk0IiwiaXNzIjoiaHR0cHM6Ly9iZWVsaW5lLmF1LmF1dGgwLmNvbS8iLCJzdWIiOiJnb29nbGUtb2F1dGgyfDEwNjY4MTYxNzA3NTgyNzU1NTU5NCIsImF1ZCI6IkJzbHNmbnJkS01lZHNtcjlHWWtUdjdlakpQUmVNZ2NFIiwiZXhwIjoxNTA0ODc2MTM3LCJpYXQiOjE1MDQ4NDAxMzcsImF6cCI6IkJzbHNmbnJkS01lZHNtcjlHWWtUdjdlakpQUmVNZ2NFIn0.aELT002aRjXVHwS6xfJ91-sXKGptBgzzbYny5h5ML-0`}
    })).data
    const [similarSuggestions, from, to] = (await Promise.all([
      axios.get(`https://api.beeline.sg/suggestions/web/similar?` + querystring.stringify({
        startLat: suggestion.board.coordinates[1],
        startLng: suggestion.board.coordinates[0],
        endLat: suggestion.alight.coordinates[1],
        endLng: suggestion.alight.coordinates[0],
        startDistance: 2000,
        endDistance: 2000,
      })).then(r => r.data),
      getReverseGeocodeString({
        lat: suggestion.board.coordinates[1],
        lng: suggestion.board.coordinates[0],
      }),
      getReverseGeocodeString({
        lat: suggestion.alight.coordinates[1],
        lng: suggestion.alight.coordinates[0],
      })
    ]))

    return {
      suggestion,
      similarSuggestions,
      from,
      to,
    }
  },
  data () {
    return {
      suggestion: null,
      similarSuggestions: null,
      from: null,
      to: null,
      mapCenter: {lat: 1.38, lng: 103.8},
      mapZoom: 11,
    }
  },
  computed: {
    mapSettings: () => MapSettings,
  },
  components: {
    PageDisqusThread, CurvedOD
  },
  methods: {
    dateformat
  }
}
</script>

<style>
</style>
