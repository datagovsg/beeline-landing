<template>
  <div>
    <gmap-marker v-for="request in requests"
      :key="'origin' + request.id"
      :position="{lat: request.board.coordinates[1], lng: request.board.coordinates[0]}"
      :icon="mapSettings.manWavingArmDarkIcon"
      @mouseover="hoveredRequest = request, hoverAt='board'"
      @mouseout="hoveredRequest = null"
    >
    </gmap-marker>

    <gmap-marker v-for="request in requests"
      :key="'destination' + request.id"
      :position="{lat: request.alight.coordinates[1], lng: request.alight.coordinates[0]}"
      :icon="mapSettings.manWavingArmDarkIcon"
      @mouseover="hoveredRequest = request, hoverAt='alight'"
      @mouseout="hoveredRequest = null"
      >
    </gmap-marker>
  </div>
</template>

<script>
/* eslint-disable */
import Vue from 'vue';
import _ from 'lodash';
import MapSettings from './MapSettings';

export default {
  props: ['requests'],
  data() {
    return {
      hoveredRequest: null,
      hoverAt: 'board',
      mapSettings: MapSettings
    };
  },
  watch: {
    hoveredRequest(v) {
      this.$emit('hovered-on', v);
    }
  },
}
</script>
