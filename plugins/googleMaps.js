import * as VueGoogleMaps from '~/node_modules/vue2-google-maps'
import Vue from 'vue'

Vue.use(VueGoogleMaps, {
  load: {
    libraries: 'geometry,places',
    key: 'AIzaSyDC38zMc2TIj1-fvtLUdzNsgOQmTBb3N5M'
  }
})
