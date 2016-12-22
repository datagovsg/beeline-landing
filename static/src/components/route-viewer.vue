<template>
  <div>
    <gmap-polyline :path="computedPath">
    </gmap-polyline>

    <gmap-marker v-for="tripStop in route.trips[0].tripStops"
      :icon="iconFor(tripStop)"
      :position="positionFor(tripStop)"
      @mouseover="mouseover(tripStop)"
      @mouseout="mouseout(tripStop)"
    >
    </gmap-marker>

    <!-- <gmap-info-window v-if="hoveredTripStop"
      :position="{lat: hoveredTripStop.stop.coordinates.coordinates[1],
        lng: hoveredTripStop.stop.coordinates.coordinates[0]}"
      :opened="hoveredWindowOpen"
      @closeclick="hoveredWindowOpen = false">
      {{hoveredTripStop.time | formatTime}} at
      {{hoveredTripStop.stop.description}}
    </gmap-info-window> -->
  </div>
</template>

<script>
import filters from '../utils/filters';

export default {
  props: ['route', 'statusBus'],
  data() {
    return {
      hoveredTripStop: null,
      hoveredWindowOpen: true,
    }
  },
  computed: {
    computedPath() {
      if (!this.route.path) {
        return [];
      } else if (typeof this.route.path === 'string') {
        return google.maps.geometry.encoding.decodePath(this.route.path);
      } else {
        return this.route.path
      }
    }
  },
  methods: {
    iconFor(tripStop) {
      return tripStop.canBoard ? {
        url: '/static/img/boardStop.png',
        anchor: new google.maps.Point(13, 12)
      } : {
        url: '/static/img/alightStop.png',
        anchor: new google.maps.Point(13, 12)
      }
    },
    positionFor(tripStop) {
      return {
        lat: tripStop.stop.coordinates.coordinates[1],
        lng: tripStop.stop.coordinates.coordinates[0],
      }
    },
    mouseover(tripStop) {
      this.statusBus.$emit('status',
      `${filters.formatTime(tripStop.time)} at
      ${tripStop.stop.description}`)
      // this.hoveredTripStop = tripStop;
      // this.hoveredWindowOpen = true;
    },
    mouseout(tripStop) {
      this.statusBus.$emit('status', null)
    }
  },
  filters: require('../utils/filters').default
}
</script>
