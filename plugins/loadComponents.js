import Vue from 'vue'
import 'mdi/css/materialdesignicons.min.css'

// FIXME: load only in each page for optimization
Vue.component('AddressInput', require('~/components/AddressInput.vue'))
Vue.component('Dropdown', require('~/components/Dropdown.vue'))
Vue.component('Header', require('~/components/Header.vue'))
Vue.component('SearchBar', require('~/components/SearchBar.vue'))
Vue.component('RouteDisplay', require('~/components/RouteDisplay.vue'))
Vue.component('CompanyLogo', require('~/components/CompanyLogo.vue'))
Vue.component('Spinner', require('~/components/Spinner.vue'))
