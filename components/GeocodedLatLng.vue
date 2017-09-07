<template>
  <span v-if="geocodedResult">
    {{geocodedResult.BLOCK}}
    {{geocodedResult.ROAD}}
    {{geocodedResult.BUILDINGNAME}}
    {{geocodedResult.POSTALCODE}}
  </span>
  <span v-else-if="value">
    {{value.lat.toFixed(5)}},
    {{value.lng.toFixed(5)}}
  </span>
  <span v-else>
    <slot />
  </span>
</template>
<script>
import querystring from 'querystring'
import axios from 'axios'

export default {
  props: ['value'],

  data () {
    return {
      geocodedResult: null,
    }
  },

  computed: {
    geocodedResultPromise () {
      if (this.value && this.value.lat && this.value.lng) {
        return axios.get('https://api.beeline.sg/onemap/revgeocode?' + querystring.stringify({
          location: `${this.value.lng},${this.value.lat}`
        }))
      }
    }
  },

  watch: {
    geocodedResultPromise: {
      immediate: true,
      handler (p) {
        p.then((r) => {
          if (r.data.GeocodeInfo && r.data.GeocodeInfo[0].ErrorMessage) {
            throw new Error(r.data.GeocodeInfo[0].ErrorMessage)
          }
          this.geocodedResult = r.data.GeocodeInfo && r.data.GeocodeInfo[0]
        })
        .catch(() => {})
      }
    }
  }
}
</script>
