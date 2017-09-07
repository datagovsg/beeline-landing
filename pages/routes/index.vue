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
        <transition-group name="flip-list">
          <route v-for="route in filteredRoutes.public.slice((page) * PAGE_SIZE, (page + 1) * PAGE_SIZE)"
              :route="route" :key="route.id">
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
        </transition-group>
      </template>

      <h2>
        Crowdstart Routes
        <template v-if="filteredRoutes.crowdstart && searchFilter">
          ({{filteredRoutes.crowdstart.length}})
        </template>
      </h2>
      <template v-if="filteredRoutes.crowdstart">
        <transition-group name="flip-list">
          <route v-for="route in filteredRoutes.crowdstart" :route="route"
            :key="route.id">
            <a :href="`crowdstartRoutes/${route.id}`">
              Details
            </a>
            <div slot="link">
              <a :href="`https://app.beeline.sg/#/tabs/crowdstart/${route.id}/detail`">
                Crowdstart Now!
              </a>
            </div>
          </route>
        </transition-group>
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
        this.page = p - 1
      }
    }
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
    Route, UibPagination
  },
  methods: {
    ...mapActions('shared', ['fetch']),

    dateformat,
    updateFilters: throttle(function () {
      this.searchFilter = this.searchBuffer
      this.page = 0
    }, 200, {leading: false, trailing: true}),
    goToPage (p) {
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
