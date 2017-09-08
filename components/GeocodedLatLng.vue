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
import ReverseGeocoder from '~/util/ReverseGeocoder'

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
        return ReverseGeocoder(this.value)
      }
    }
  },

  watch: {
    geocodedResultPromise: {
      immediate: true,
      handler (p) {
        p.then((r) => {
          this.geocodedResult = r
        })
        .catch(() => {})
      }
    }
  }
}
</script>
