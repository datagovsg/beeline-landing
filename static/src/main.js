import Vue from 'vue'
import VueResource from 'vue-resource';
import App from './App.vue'
import * as VueGoogleMaps from 'vue2-google-maps'

require('bootstrap/dist/css/bootstrap.css')

Vue.use(VueResource);
Vue.use(VueGoogleMaps, {
  load: {
    client: 'gme-infocommunications',
    libraries: 'places',
  }
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  components: { App }
})
