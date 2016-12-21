<template>
  <div>
    <p>
      {{index + 1}}. <a :href="urlFunction(route)" target="_blank">
        <b>({{route.trips[0].tripStops[0].time | formatTime }})
          {{route.from}}</b>
          to
        <b>({{route.trips[0].tripStops[route.trips[0].tripStops.length-1].time | formatTime }})
          {{route.to}}</b>
      </a>
    </p>

    <div v-show="moreShown">
      <h4>Stops</h4>
      <div class="route-info">
        <ol>
          <li v-for="tripStop in route.trips[0].tripStops">
            {{tripStop.time | formatTime}}
            {{tripStop.stop.description}}
          </li>
        </ol>
        <map-preview
          ref="mapPreview1"
          :center="origin"
          class="map-preview"
          >
          <route-viewer :route="route">
          </route-viewer>
        </map-preview>
        <map-preview
          ref="mapPreview2"
          :center="destination"
          class="map-preview"
          >
          <route-viewer :route="route">
          </route-viewer>
        </map-preview>
      </div>
      <a href="#" @click.prevent="moreShown = false">Show less...</a>
    </div>
    <div v-show="!moreShown">
      <a href="#" @click.prevent="moreShown = true">Show more...</a>
    </div>

    Arriving at {{arrivalTime}}
    <button class="btn btn-default" @click="derive">Propose a different time</button>
  </div>
</template>
<style lang="scss">
.route-info {
  display: flex;
  flex-direction: row;
  ol {
    flex: 1 1 auto;
  }
  .map-preview {
    height: 300px;
    flex: 0.1 0 350px;
  }
}
</style>
<script>
import vue from 'vue';
import moment from 'moment';
import _ from 'lodash';
import MapPreview from './map-preview.vue';
import RouteViewer from './route-viewer.vue';
import scrollTo from '../utils/scrollTo';

export default {
  props: ['route', 'index', 'urlFunction', 'origin', 'destination',
    'similarRequests'],
  data() {
    return {
      moreShown: false
    }
  },
  components: {MapPreview, RouteViewer},
  computed: {
    crowdstartUrl() {
      return `https://app.beeline.sg/#/tabs/crowdstart/${this.route.id}/detail`
    },
    arrivalTime() {
      var tripStops = _.sortBy(this.route.trips[0].tripStops, ts => ts.time);
      return moment(tripStops[tripStops.length-1].time).utcOffset(480).format('hh:mm');
    }
  },
  watch: {
    moreShown(v) {
      if (v) {
        this.$nextTick(() => {
          this.$refs.mapPreview1.resize();
          this.$refs.mapPreview2.resize();
          scrollTo(this.$el)
        })
      }
    }
  },
  methods: {
    derive() {
      this.$emit('derive', this.route)
    },
    view() {
      this.$emit('view', this.route)
    },
  },
  filters: require('../utils/filters').default
}
</script>
