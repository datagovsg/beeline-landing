<template>
  <GmapPolyline :path="curvedPath" :options="options" :zIndex="zIndex"/>
</template>

<script>
import {range} from 'lodash'

/* Reference: http://xkjyeah.github.io/vue-google-maps/index-app.html#/03CurvedLine */
export default {
  props: ['start', 'end', 'options', 'zIndex'],
  computed: {
    curvedPath () {
      /*
        FIXME: This formula will work for short distances away from
          the poles. It will not work once the curvature of the earth is
          too great
      */
      if (this.start && this.end) {
        return range(100)
          .map(i => {
            const tick = i / 99

            /* Bezier curve -- set up the control points */
            const dlat = this.end.lat - this.start.lat
            const dlng = this.end.lng - this.start.lng

            const cp1 = {
              lat: this.start.lat + 0.33 * dlat + 0.33 * dlng,
              lng: this.start.lng - 0.33 * dlat + 0.33 * dlng,
            }

            const cp2 = {
              lat: this.end.lat - 0.33 * dlat + 0.33 * dlng,
              lng: this.end.lng - 0.33 * dlat - 0.33 * dlng,
            }

            /* Bezier curve formula */
            return {
              lat:
                (tick * tick * tick) * this.start.lat +
                3 * ((1 - tick) * tick * tick) * cp1.lat +
                3 * ((1 - tick) * (1 - tick) * tick) * cp2.lat +
                ((1 - tick) * (1 - tick) * (1 - tick)) * this.end.lat,
              lng:
                (tick * tick * tick) * this.start.lng +
                3 * ((1 - tick) * tick * tick) * cp1.lng +
                3 * ((1 - tick) * (1 - tick) * tick) * cp2.lng +
                ((1 - tick) * (1 - tick) * (1 - tick)) * this.end.lng,
            }
          })
      }
    }
  },
}
</script>
