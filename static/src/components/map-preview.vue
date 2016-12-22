<template>
  <div :class="{'map-preview-container': true}">
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

    <div class="status" v-if="status">
      {{status}}
    </div>
  </div>
</template>
<style lang="scss">
.status {
  position: absolute;
  bottom: 0;
  left: 0;
  background-color: #00F;
  color: #FFF;
  z-index: 100;
}
.map-preview-container {
  position: relative;
}
</style>
<script>
import mapSettingsInst from './mapSettings';
import Vue from 'vue';
import defaultMapBus from '../utils/mapBus';

export default {
  props: ['center', 'mapBus'],
  data() {
    return {
      mapSettings: mapSettingsInst,
      status: null,
    }
  },
  created() {
    this.$on('status', (message) => {
      this.status = message;
    })
    // Listen for requests to update the map
    ;(this.mapBus || defaultMapBus).$on('resize', () => this.resize());
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
