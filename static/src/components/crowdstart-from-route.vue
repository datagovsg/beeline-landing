<template>
  <div>
    <template v-if="!route || !route.trips || !route.trips[0]">
      Please <router-link to="search">search</router-link> for a route first.
    </template>
    <template v-else>
      <div class="r">
        <div class="stops-list">
          <label>
            Arrive at
            <select v-model="arrivalPlace" @input="updateStop">
              <option v-for="stop in computedStops" :value="stop.stop.description">
                {{stop.stop.description}}
              </option>
            </select>
            by
            <hour-selector v-model="arrivalTimeHour" />
            :
            <minute-selector v-model="arrivalTimeMinute" />
          </label>

          <ol>
            <li v-for="stop in computedStops" :key="stop.stop.description">
              <button class="btn btn-xs" @click="moveUp(stop)">Up</button>
              <button class="btn btn-xs" @click="moveDown(stop)">Down</button>
              <b>{{stop.time | formatTime}}</b>

              {{stop.stop.description}}
            </li>
          </ol>
        </div>
        <div class="new-crowdstart-map">
          <gmap-map :center="{lat:1.38, lng:103.8}" :zoom="12"
            ref="new-crowdstart-route-map">
            <similar-requests
              :requests="similarRequests"
            ></similar-requests>

            <!-- current stops -->
            <gmap-marker v-for="(stop, stopIndex) in route.trips[0].tripStops"
              :icon="filters.stopIcon(stopIndex)"
              :position="{lat: stop.stop.coordinates.coordinates[1], lng: stop.stop.coordinates.coordinates[0]}"
              @click="selectedCurrentStop = stop">
            </gmap-marker>
            <gmap-info-window @closeclick="selectedCurrentStop = null"
              :position="{lat:selectedCurrentStop.stop.coordinates.coordinates[1], lng:selectedCurrentStop.stop.coordinates.coordinates[0]}"
              :opened="!!selectedCurrentStop"
              v-if="selectedCurrentStop">
              {{selectedCurrentStop.stop.description}}<br/>
              <button @click="removeStop(selectedCurrentStop); selectedCurrentStop = null" class="btn btn-danger">
                Remove
              </button>
            </gmap-info-window>

            <!-- Stops to add -->
            <gmap-cluster :max-zoom="15">
              <gmap-marker v-for="stop in nearbyPublicStops"
                v-if="tripBusStopIndices.indexOf(stop.index) === -1"
                :key="stop.index"
                :position="{lat:stop.coordinates.coordinates[1], lng:stop.coordinates.coordinates[0]}"
                @click="selectedNewStop = stop">
              </gmap-marker>
            </gmap-cluster>
            <gmap-info-window @closeclick="selectedNewStop = null"
              :position="{lat:selectedNewStop.coordinates.coordinates[1], lng:selectedNewStop.coordinates.coordinates[0]}"
              :opened="!!selectedNewStop"
              v-if="selectedNewStop">
              {{selectedNewStop.description}}<br/>
              <button @click="addStop(selectedNewStop)" class="btn btn-primary">
                Add to stops
              </button>
            </gmap-info-window>

            <gmap-polyline v-if="route.path" :path="route.path">
            </gmap-polyline>
          </gmap-map>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import assert from 'assert';
import vue from 'vue';
import moment from 'moment';
import leftPad from 'left-pad';
import _ from 'lodash';
import HourSelector from './hour-selector.vue';
import MinuteSelector from './minute-selector.vue';
import SimilarRequests from '../components/similar-requests.vue';
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex'
import {latlngDistance} from '../utils/latlngDistance';

export default {
  props: ['route'],
  data() {
    return {
      arrivalTimeHour: '08',
      arrivalTimeMinute: '00',
      arrivalPlace: '',
      filters: {
        stopIcon(stopIndex) {
          stopIndex = parseInt(stopIndex);
          return {
            url: `https://admin.beeline.sg/img/stopBoard${leftPad(stopIndex + 1, 3, '0')}.png`,
            scaledSize: window.google && new google.maps.Size(48, 48),
            anchor: window.google && new google.maps.Point(24, 24)
          }
        }
      },
      stops: [],
      selectedNewStop: null,
      selectedCurrentStop: null,
    }
  },
  components: {
    HourSelector,
    MinuteSelector,
    SimilarRequests,
  },
  computed: {
    ...mapState(['similarRequests', 'origin', 'destination']),
    crowdstartUrl() {
      return `https://app.beeline.sg/#/tabs/crowdstart/${this.route.id}/detail`
    },
    stopsCoordinates() {
      return (this.route && this.route.trips && this.route.trips[0].tripStops) ?
        this.route.trips[0].tripStops
          .map(stop => stop.stop.coordinates.coordinates)
          .map(c => ({lat: c[1], lng: c[0]}))
        : []
    },
    tripBusStopIndices() {
      return this.route.trips[0].tripStops.map(ts => ts.stop.index)
    },
    originalArrivalTime() {
      var tripStops = _.sortBy(this.route.trips[0].tripStops, ts => ts.time);
      return moment(tripStops[tripStops.length-1].time).utcOffset(480).format('hh:mm');
    },
    computedStops() {
      if (!_.get(this.route, 'trips.0')) {
        return [];
      }
      var currentStops = this.route.trips[0].tripStops;

      var arrivalStopIndex = currentStops
        .map(cs => cs.stop.description)
        .indexOf(this.arrivalPlace)
      if (arrivalStopIndex == -1) {
        arrivalStopIndex = currentStops.length - 1 // Default to follow last bus stop
      }
      var arrivalStop = currentStops[arrivalStopIndex]
      var arrivalStopTime = moment(arrivalStop.time).utcOffset(480).valueOf()
      var currentTimes = currentStops.map(s => moment(s.time).utcOffset(480))
      var today = moment()
      assert(this.arrivalTimeHour)
      assert(this.arrivalTimeMinute)

      var newTimes = currentTimes.map(ct => {
        var timeDifference = arrivalStopTime - ct.valueOf()
        return today.clone().hour(this.arrivalTimeHour).minute(this.arrivalTimeMinute)
          .subtract(timeDifference, 'milliseconds').valueOf();
      })

      return _.zip(currentStops, newTimes).map(([st, tm]) => ({
        ...st,
        time: tm,
        _original: st
      }))
    },
    nearbyPublicStops() {
      if (!this.origin || !this.destination) return [];

      return this.stops.filter(s =>
        latlngDistance(
          [s.coordinates.coordinates[1], s.coordinates.coordinates[0]],
          [this.origin.lat, this.origin.lng]
        ) < 5000 ||
        latlngDistance(
          [s.coordinates.coordinates[1], s.coordinates.coordinates[0]],
          [this.destination.lat, this.destination.lng]
        ) < 5000
      )
    }
  },
  watch: {
    computedStops(v) {
      this.$emit('proposed-route-changed', {
        ...this.route,
        trips: [{
          ...this.route.trips[0],
          tripStops: v
        }]
      })
      this.$store.commit('updateCrowdstartRouteStartTime', v[0].time)
    },
  },
  created() {
    vue.resource('/bus_stops').get()
    .then(r => r.json())
    .then(ss => {
      this.stops = ss.payload.busStops
    })
  },
  mounted() {
    if (this.$refs['new-crowdstart-route-map']) {
      this.$refs['new-crowdstart-route-map'].$deferredReadyPromise.then(() => {
        this.refit();
      })
    }
  },
  methods: {
    refit() {
      var bounds = new google.maps.LatLngBounds();
      for (let c of this.stopsCoordinates) {
        bounds.extend(c)
      }
      this.$refs['new-crowdstart-route-map'].resize();
      this.$refs['new-crowdstart-route-map'].$mapObject.fitBounds(bounds);
    },
    addStop(stop) {
      var stopIndex = this.tripBusStopIndices.indexOf(stop.index);
      if (stopIndex != -1) return; // Don't add existing trip stop.
      var nearest = _(this.route.trips[0].tripStops)
        .map((ts, key) => [ts, key, latlngDistance(
          [stop.coordinates.coordinates[1], stop.coordinates.coordinates[0]],
          [ts.stop.coordinates.coordinates[1], ts.stop.coordinates.coordinates[0]]
        )])
        .minBy(r => r[2])

      var tss = this.route.trips[0].tripStops;

      this.$emit('crowdstart-route-changed', {
        ...this.route,
        trips: [{
          ...this.route.trips[0],
          tripStops: tss.slice(0, nearest[1])
            .concat([{
              stop,
              time: nearest[0].time,
            }])
            .concat(tss.slice(nearest[1]))
        }]
      })

      this.selectedNewStop = null;
    },
    removeStop(stop) {
      var stopIndex = this.route.trips[0].tripStops.indexOf(stop);
      if (stopIndex === -1) return; // Don't remove non-existing trip stop.
      var tss = this.route.trips[0].tripStops;

      this.$emit('crowdstart-route-changed', {
        ...this.route,
        trips: [{
          ...this.route.trips[0],
          tripStops: tss.slice(0, stopIndex)
            .concat(tss.slice(stopIndex + 1))
        }]
      })
    },
    moveUp(stop) {
      var stopIndex = this.route.trips[0].tripStops.findIndex(ts => ts == stop._original);
      var tss = this.route.trips[0].tripStops;

      assert(stopIndex !== -1)
      if (stopIndex == 0) {
        return;
      }

      this.$emit('crowdstart-route-changed', {
        ...this.route,
        trips: [{
          ...this.route.trips[0],
          tripStops: tss.slice(0, stopIndex - 1)
            .concat(tss.slice(stopIndex, stopIndex + 1))
            .concat(tss.slice(stopIndex - 1, stopIndex))
            .concat(tss.slice(stopIndex + 1))
        }]
      })
    },
    moveDown(stop) {
      var stopIndex = this.route.trips[0].tripStops.findIndex(ts => ts == stop._original);
      var tss = this.route.trips[0].tripStops;

      assert(stopIndex !== -1)
      if (stopIndex == this.route.trips[0].tripStops.length - 1) {
        return;
      }

      this.$emit('crowdstart-route-changed', {
        ...this.route,
        trips: [{
          ...this.route.trips[0],
          tripStops: tss.slice(0, stopIndex)
            .concat(tss.slice(stopIndex + 1, stopIndex + 2))
            .concat(tss.slice(stopIndex, stopIndex + 1))
            .concat(tss.slice(stopIndex + 2))
        }]
      })
    },
    updateStop(event) {
      this.$emit('input', event.target.value)
    }
  },
  filters: require('../utils/filters').default
}
</script>

<style scoped lang="scss">
.r {
  display: flex;

  .stops-list {
    flex: 1 0 auto;
  }
  .new-crowdstart-map {
    flex: 2 0 auto;
    min-height: 400px;
  }
}
</style>
