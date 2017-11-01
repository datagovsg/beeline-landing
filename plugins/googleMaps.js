import * as VueGoogleMaps from '~/node_modules/vue2-google-maps'
import Vue from 'vue'

Vue.use(VueGoogleMaps, {
  load: {
    libraries: 'geometry,places',
    key: 'AIzaSyBtzoUVqHMufTzowtIw4nkH0aRolN87y7Y'
  }
})
