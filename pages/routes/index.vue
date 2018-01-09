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

      <vue-tabs>
        <v-tab title="Running Routes">
          <template v-if="filteredRoutes.public && filteredRoutes.public.length > 0">
            <transition-group name="flip-list">
              <route v-for="route in filteredRoutes.public.slice((page) * PAGE_SIZE, (page + 1) * PAGE_SIZE)"
                  :route="route" :key="route.id">
                <div slot="link">
                  <a :href="`https://app.beeline.sg/tabs/route/${route.id}`" slot="link"
                    class="price">
                    ${{route.trips[0].price}}
                    »
                    <span style="font-size: 12px">
                      <br/>
                      Book now
                    </span>
                  </a>
                </div>
              </route>
            </transition-group>

            <UibPagination :value="page" :itemsPerPage="PAGE_SIZE"
              :totalItems="filteredRoutes.public && filteredRoutes.public.length"
              @input="goToPage($event)"
              />
          </template>
          <h4 v-else-if="filteredRoutes.public">No routes to display</h4>
          <h4 v-else>Obtaining routes...</h4>

        </v-tab>

        <v-tab title="Crowdstart Routes">
          <template v-if="filteredRoutes.crowdstart && filteredRoutes.crowdstart.length > 0">
            <transition-group name="flip-list">
              <route v-for="route in filteredRoutes.crowdstart" :route="route"
                :key="route.id">
                <a :href="`crowdstartRoutes/${route.id}`">
                  Details
                </a>
                <div slot="link">
                  <a :href="`https://app.beeline.sg/tabs/crowdstart/${route.id}/detail`">
                    Crowdstart Now!
                  </a>
                </div>
              </route>
            </transition-group>
          </template>
          <h4 v-else>No routes to display</h4>
        </v-tab>

    </vue-tabs>

      <!-- <h2>Tracking Routes</h2>
      <template v-for="(routes, label) in liteRoutes">
        <h3 :id="routes[0].id">{{label}}</h3>
        <route v-for="route in routes" :route="route" :key="route.id">
          <a :href="`lite/${route.id}`">
            Details
          </a>
          <a :href="`https://app.beeline.sg/tabs/lite/summary/${encodeURIComponent(label)}`">
            Track this bus!
          </a>
        </route>
      </template> -->
    </div>
  </section>
</template>

<style lang="scss">
.search-area {
  margin-bottom: 20px;

  input {
    width: 100%;
    display: block;
  }
}

.flip-list-enter-active, .flip-list-leave-active {
  transition: all 0.3s;
}

.flip-list-enter, .flip-list-leave-to {
  opacity: 0;
  transform: scaleY(0);
}
.flip-list-enter-to, .flip-list-leave {
  opacity: 1.0;
  transform: scaleY(1.0);
}

</style>

<script>
import Route from '~/components/Route.vue'
import {throttle} from 'lodash'
import {filter} from 'lodash/fp'
import dateformat from 'dateformat'
import {mapState, mapActions} from 'vuex'
import {VueTabs, VTab} from 'vue-nav-tabs'

import UibPagination from '~/components/UibPagination'

export default {
  layout: 'landing',
  data () {
    return {
      now: new Date(),
      page: null,
      searchBuffer: '',
      searchFilter: '',
      PAGE_SIZE: 10,
    }
  },
  created () {
    this.fetch(['publicRoutes', 'crowdstartRoutes', 'crowdstartStatus'])
  },
  watch: {
    '$route.query.search': {
      immediate: true,
      handler () {
        this.searchBuffer = this.searchFilter = this.$route.query.search || ''
      }
    },
    '$route.query.page': {
      immediate: true,
      handler (p) {
        this.page = p - 1 || 0
      }
    },
  },
  computed: {
    ...mapState('shared', ['publicRoutes', 'crowdstartRoutes', 'crowdstartStatus']),
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
  },
  components: {
    Route, UibPagination, VueTabs, VTab
  },
  methods: {
    ...mapActions('shared', ['fetch']),

    dateformat,
    updateFilters: throttle(function () {
      this.searchFilter = this.searchBuffer
      this.page = 0
    }, 200, {leading: false, trailing: true}),
    goToPage (p) {
      // TODO:
      // router.push causes a page reload
      // This isn't a big problem now but it actually recomputes filteredRoutes
      // on page change, which is unnecessary.
      // Possible fixes:
      // 1. Use #s for page numbers
      // 2. Change <nuxt/> in default.vue to <router-view/>
      //    Change <nuxt/> in landing.vue to <nuxt :nuxtChildKey="$route.path" />
      //    This is because the page component is keyed by this.$route.fullPath.split('#')[0]
      //    See https://github.com/nuxt/nuxt.js/commit/a963b566c16666e61560047dd94dd34dd7b60103#diff-6cd8a621f6b66ce6ef05f6b9df7a040c
      this.$router.push({
        ...this.$route,
        query: {
          ...this.$route.query,
          page: p + 1,
          search: this.searchFilter
        }
      })
    }
  },
}
</script>
