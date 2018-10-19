<template>
<h1>{{numSimilar}}</h1>
</template>
<script>
import querystring from 'querystring'
import axios from 'axios'

export default {
  props: ['settings', 'start', 'end', 'time', 'daysOfWeek'],

  data () {
    return {
      numSimilar: 0,
    }
  },

  computed: {
    query () {
      if (!this.start || !this.end) return
      return {
        startLat: this.start.lat,
        startLng: this.start.lng,
        endLat: this.end.lat,
        endLng: this.end.lng,
        time: this.time,
        // dayOfWeek: this.daysOfWeek,
        // settings: JSON.stringify(this.settings),
        startDistance: this.settings.startClusterRadius,
        endDistance: this.settings.endClusterRadius,
        maxTimeDifference: this.settings.timeAllowance,
        createdSince: this.settings.createdSince,
      }
    }
  },

  watch: {
    query: {
      immediate: true,
      handler (h) {
        if (h) {
          this.runQuery(h)
        }
      }
    }
  },

  methods: {
    runQuery (settings) {
      axios.get(
        `https://api.beeline.sg/suggestions/web/similar?` +
        querystring.stringify(settings)
      )
      .then((response) => {
        this.numSimilar = response.data.length
      })
    }
  }
}
</script>
