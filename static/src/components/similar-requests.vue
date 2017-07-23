<template>
  <div>
    <gmap-marker v-for="request in requests"
      :position="{lat: request.board.coordinates[1], lng: request.board.coordinates[0]}"
      :icon="mapSettings.manWavingArmDarkIcon"
      @mouseover="hoveredRequest = request, hoverAt='board'"
      @mouseout="hoveredRequest = null"
    >
    </gmap-marker>

    <gmap-marker v-for="request in requests"
      :position="{lat: request.alight.coordinates[1], lng: request.alight.coordinates[0]}"
      :icon="mapSettings.manWavingArmDarkIcon"
      @mouseover="hoveredRequest = request, hoverAt='alight'"
      @mouseout="hoveredRequest = null"
      >
    </gmap-marker>
    <!-- <gmap-info-window
      v-if="hoveredRequest"
      @closeclick="hoveredRequest = false"
      :opened="!!hoveredRequest"
      :position="{lat: hoveredRequest[hoverAt].coordinates[1], lng: hoveredRequest[hoverAt].coordinates[0]}"
      :options="mapSettings.defaultInfoWindowOptions"
      >
      {{hoveredRequest.email}},
      {{-8*60*60*1000 + hoveredRequest.time | formatTime}}
    </gmap-info-window> -->
  </div>
</template>

<script>
import Vue from 'vue';
import _ from 'lodash';
import mapSettings from './mapSettings.js';
import filters from '../utils/filters';

export default {
  props: ['requests', 'statusBus'],
  data() {
    return {
      hoveredRequest: null,
      hoverAt: 'board',
      mapSettings
    };
  },
  watch: {
    hoveredRequest(v) {
      if (this.statusBus) {
        if (v) {
          this.statusBus.$emit('status',
          `${v.email} ${filters.formatTime(-8*60*60*1000 + v.time)}`)
        } else {
          this.statusBus.$emit('status', null);
        }
      }
    }
  },
  filters,
}
</script>
