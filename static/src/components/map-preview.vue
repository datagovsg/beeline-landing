<template>
  <div>
    <gmap-map :center="center || {lat:1.38, lng:103.8}"
          :zoom="center ? 15 : 10"
          @click="updateCenter"
          ref="map"
          :options="mapSettings.defaultMapOptions">
      <slot></slot>

      <gmap-marker :position="center" v-if="center"
        :icon="mapSettings.manWavingArmIcon">
      </gmap-marker>
    </gmap-map>
  </div>
</template>

<script>
import mapSettingsInst from './mapSettings';

export default {
  props: ['center'],
  data() {
    return {
      mapSettings: mapSettingsInst
    }
  },
  methods: {
    updateCenter(event) {
      this.$emit('position-updated', {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      })
    },
    resize() {
      this.$refs.map.resizePreserveCenter()
    }
  }
}
</script>
