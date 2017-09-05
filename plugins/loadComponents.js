import Vue from 'vue'
import 'mdi/css/materialdesignicons.min.css'

// FIXME: load only in each page for optimization
Vue.component('AddressInput', require('~/components/AddressInput.vue').default)
Vue.component('Dropdown', require('~/components/Dropdown.vue').default)
Vue.component('Header', require('~/components/Header.vue').default)
Vue.component('SearchBar', require('~/components/SearchBar.vue').default)
Vue.component('RouteDisplay', require('~/components/RouteDisplay.vue').default)
Vue.component('CompanyLogo', require('~/components/CompanyLogo.vue').default)
Vue.component('Spinner', require('~/components/Spinner.vue').default)
