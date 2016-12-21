<template>
  <div>
    <gmap-marker v-for="request in requests"
      :position="{lat: request.board.coordinates[1], lng: request.board.coordinates[0]}"
      :icon="mapSettings.manWavingArmDarkIcon"
      @mouseover="hoveredRequest = request, hoverAt='board'"
    >
    </gmap-marker>

    <gmap-marker v-for="request in requests"
      :position="{lat: request.alight.coordinates[1], lng: request.alight.coordinates[0]}"
      :icon="mapSettings.manWavingArmDarkIcon"
      @mouseover="hoveredRequest = request, hoverAt='alight'"
      >
    </gmap-marker>
    <gmap-info-window
      v-if="hoveredRequest"
      @closeclick="hoveredRequest = false"
      :opened="!!hoveredRequest"
      :position="{lat: hoveredRequest[hoverAt].coordinates[1], lng: hoveredRequest[hoverAt].coordinates[0]}"
      :options="mapSettings.defaultInfoWindowOptions"
      >
      {{hoveredRequest.email}},
      {{-8*60*60*1000 + hoveredRequest.time | formatTime}}
    </gmap-info-window>
  </div>
</template>

<script>
import Vue from 'vue';
import _ from 'lodash';
import mapSettings from './mapSettings.js';

export default {
  props: ['requests'],
  data() {
    return {
      hoveredRequest: null,
      hoverAt: 'board',
      mapSettings
    };
  },
  filters: require('../utils/filters').default,
}
</script>
