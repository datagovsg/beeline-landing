<template>
  <section class="container">
    <div>
      <h1 class="title">
        Beeline Routes
      </h1>

      <h3>Search for a Route</h3>
      <div class="search-area">
        <input class="form-control"
          type="text" v-model="searchBuffer" placeholder="Postcode / Address / Route Name"
          @input="updateFilters"/>
      </div>

      <h2>
        Running Routes
        <template v-if="filteredRoutes.public && searchFilter">
          ({{filteredRoutes.public.length}})
        </template>
      </h2>

      <UibPagination :value="page" :itemsPerPage="PAGE_SIZE"
        :totalItems="filteredRoutes.public && filteredRoutes.public.length"
        @input="goToPage($event)"
        />

      <template v-if="filteredRoutes.public">
        <route v-for="route in filteredRoutes.public.slice((page) * PAGE_SIZE, (page + 1) * PAGE_SIZE)" :route="route" :key="route.id"
          :id="route.id">
          <div slot="link">
            <a :href="`https://app.beeline.sg/#/tabs/booking/${route.id}/stops`" slot="link"
              class="price">
              {{route.trips[0].price}}
              »
              <span style="font-size: 12px">
                <br/>
                Book now
              </span>
            </a>
          </div>
        </route>
      </template>

      <h2>
        Crowdstart Routes
        <template v-if="filteredRoutes.crowdstart && searchFilter">
          ({{filteredRoutes.crowdstart.length}})
        </template>
      </h2>
      <template v-if="filteredRoutes.crowdstart">
        <route v-for="route in filteredRoutes.crowdstart" :route="route" :key="route.id"
          :id="route.id">
          <a :href="`crowdstartRoutes/${route.id}`">
            Details
          </a>
          <div slot="link">
            <a :href="`https://app.beeline.sg/#/tabs/crowdstart/${route.id}/detail`">
              Crowdstart Now!
            </a>
          </div>
        </route>
      </template>

      <!-- <h2>Tracking Routes</h2>
      <template v-for="(routes, label) in liteRoutes">
        <h3 :id="routes[0].id">{{label}}</h3>
        <route v-for="route in routes" :route="route" :key="route.id">
          <a :href="`lite/${route.id}`">
            Details
          </a>
          <a :href="`https://app.beeline.sg/#/tabs/lite/summary/${encodeURIComponent(label)}`">
            Track this bus!
          </a>
        </route>
      </template> -->
    </div>
  </section>
</template>

<style lang="scss">
.search-area {
  input {
    width: 100%;
    display: block;
  }
}
</style>

<script>
import querystring from 'querystring'
import Route from '~/components/Route.vue'
import axios from 'axios'
import {throttle} from 'lodash'
import {filter} from 'lodash/fp'
import dateformat from 'dateformat'

import UibPagination from '~/components/UibPagination'

export default {
  layout: 'landing',
  asyncData () {
    const publicRoutesPromise = axios.get('https://api.beeline.sg/routes?' + querystring.stringify({
      start_date: new Date().toISOString(),
      include_trips: true,
      tags: JSON.stringify(['public']),
    }))
    const crowdstartRoutesPromise = axios.get('https://api.beeline.sg/routes?' + querystring.stringify({
      start_date: new Date().toISOString(),
      include_trips: true,
      tags: JSON.stringify(['crowdstart']),
    }))
    const crowdstartPromise = axios.get('https://api.beeline.sg/crowdstart/status')

    return Promise.all([publicRoutesPromise, crowdstartRoutesPromise, crowdstartPromise])
    .then(([publicRoutesResponse, crowdstartRoutesResponse, crowdstartStatusResponse]) => {
      return {
        publicRoutes: publicRoutesResponse.data,
        crowdstartRoutes: crowdstartRoutesResponse.data,
        // crowdstartStatus: crowdstartStatusResponse.data,
      }
    })
  },
  data () {
    return {
      now: new Date(),
      searchBuffer: '',
      searchFilter: '',
      PAGE_SIZE: 20,
    }
  },
  computed: {
    filteredRoutes () {
      if (!this.searchFilter) {
        return {
          public: this.publicRoutes,
          crowdstart: this.crowdstartRoutes
        }
      } else {
        const ucaseFilter = this.searchFilter.toUpperCase()
        const routeFilter = (route) =>
          route.from.toUpperCase().indexOf(ucaseFilter) !== -1 ||
          route.to.toUpperCase().indexOf(ucaseFilter) !== -1 ||
          route.label.toUpperCase().indexOf(ucaseFilter) !== -1
        return {
          public: filter(routeFilter, this.publicRoutes),
          crowdstart: filter(routeFilter, this.crowdstartRoutes),
        }
      }
    },
    page() {
      return (this.$route.query.page || 1) - 1
    }
  },
  components: {
    Route, UibPagination
  },
  methods: {
    dateformat,
    updateFilters: throttle(function () {
      this.searchFilter = this.searchBuffer
    }, 500, {leading: false, trailing: true}),
    goToPage (p) {
      console.log(p)
      this.$router.push({
        ...this.$route,
        query: {
          ...this.$route.query,
          page: p + 1
        }
      })
    }
  },
}
</script>

<style>
</style>
