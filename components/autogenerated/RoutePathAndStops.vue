<template>
  <div>
    <GmapMarker v-for="(stop, index) in stops"
      :key="'s' + index"
      :position="{lat: stop.lat, lng: stop.lng}"
      :icon="iconForStop(stop, index)"
      />
    <GmapPolyline v-if="polylinePath" :path="polylinePath" />
  </div>
</template>

<script>
import axios from 'axios'
import {flatten} from 'lodash'
import mapSettings from '~/components/suggest/MapSettings'

export default {
  props: ['stops'],

  data () {
    return {
      polylinePath: null,
      mapSettings,
    }
  },
  watch: {
    'stops': {
      immediate: true,
      handler (stops) {
        if (stops) {
          this.requestPath(stops)
        }
      }
    }
  },
  methods: {
    iconForStop (stop, index) {
      if (this.mapSettings.apiLoaded) { // reactive dependency on apiLoaded
        const baseFilename = stop.numBoard
          ? '/images/stops/stopBoard' : '/images/stops/stopAlight'

        const stopNumber = (index + 1).toString().padStart(3, '0')

        return {
          url: `${baseFilename}${stopNumber}.png`,
          scaledSize: new google.maps.Size(50, 50),
          anchor: new google.maps.Point(25, 25),
        }
      }
    },

    requestPath (stops) {
      const pathRequest = this.$pathRequest = axios.get(`${process.env.beelineRoutingServer}/paths/` +
        stops.map(s => s.index).join('/'))

      pathRequest.then((r) => {
        if (this.$pathRequest !== pathRequest) return

        this.polylinePath = flatten(r.data)
      })
    },
  }
}
</script>
