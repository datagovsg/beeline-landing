<template>
  <div style="width: 300px; height: 300px; display: inline-block">
    <gmap-map :center="center || {lat:1.38, lng:103.8}"
          :zoom="center ? 15 : 10"
          @click="updateCenter">
      <gmap-marker :position="center" v-if="center">
      </gmap-marker>
    </gmap-map>
  </div>
</template>

<script>
export default {
  props: ['center'],
  methods: {
    updateCenter(event) {
      this.$emit('position-updated', {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      })
    }
  }
}
</script>
