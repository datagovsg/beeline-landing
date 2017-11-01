import {loaded} from '~/node_modules/vue2-google-maps'
import Vue from 'vue'

export default new Vue({
  data() {
    return {
      manWavingArmIcon: null,
      chevronIcons: () => null,
      manWavingArmDarkIcon: null,
      manWavingArmBlueIcon: null,
      defaultInfoWindowOptions: null,
      defaultMapOptions: {
        clickableIcons: false,
        streetViewControl: false,
        panControlOptions: false,
        gestureHandling: 'greedy',
      },
      Singapore: {
        north: 1.516329,
        east: 104.08,
        south: 1.1954,
        west: 103.5814
      },
      apiLoaded: false,
    }
  },
  created() {
    loaded.then(() => {
      this.apiLoaded = true
      this.manWavingArmIcon = {
        url: '/images/man-waving-arm.png',
        scaledSize: new google.maps.Size(32, 32),
      }
      this.manWavingArmDarkIcon = {
        url: '/images/man-waving-arm-black.png',
        scaledSize: new google.maps.Size(28, 28),
      }
      this.manWavingArmBlueIcon = {
        url: '/images/man-waving-arm-blue.png',
        scaledSize: new google.maps.Size(28, 28),
      }
      this.defaultInfoWindowOptions = {
        pixelOffset: new google.maps.Size(0, -40)
      }
      this.chevronIcons = (color = '#000000', weight = 2.5) => [{
        icon: {
          strokeOpacity: 1.0,
          strokeColor: color,
          strokeWeight: weight,
          path: 'M -0.5 0 L 0 1 L 0.5 0'
        },
        repeat: `${weight * 4}px`
      }]
    })
  }
})
