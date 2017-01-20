<template>
  <div>
    <template v-if="!route || !route.trips || !route.trips[0]">
      Please <router-link to="search">search</router-link> for a route first.
    </template>
    <template v-else>
      <div class="r">
        <div class="stops-list">
          <ol v-if="arrivalTime">
            <li v-for="stop in computedStops">
              <b>{{stop.time | formatTime}}</b>

              {{stop.stop.description}}
            </li>
          </ol>
          <ol v-else>
            <li v-for="stop in computedStops">
              <b>??:??</b>

              {{stop.stop.description}}
            </li>
          </ol>

          <label>
            Arrive at
            <time-selector v-model="arrivalTime" />
          </label>
        </div>
        <div class="new-crowdstart-map">
          <gmap-map :center="{lat:1.38, lng:103.8}" :zoom="12">
            <similar-requests
              :requests="similarRequests"
            ></similar-requests>

            <gmap-marker v-for="(stop, stopIndex) in route.trips[0].tripStops"
              :icon="filters.stopIcon(stopIndex)"
              :position="{lat: stop.stop.coordinates.coordinates[1], lng: stop.stop.coordinates.coordinates[0]}">
            </gmap-marker>

            <gmap-polyline :path="polylinePath">
            </gmap-polyline>
          </gmap-map>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import vue from 'vue';
import moment from 'moment';
import leftPad from 'left-pad';
import _ from 'lodash';
import TimeSelector from './time-selector.vue';
import SimilarRequests from '../components/similar-requests.vue';

export default {
  props: ['route'],
  data() {
    return {
      arrivalTime: '',
      filters: {
        stopIcon(stopIndex) {
          stopIndex = parseInt(stopIndex);
          return {
            url: `https://admin.beeline.sg/img/stopBoard${leftPad(stopIndex + 1, 3, '0')}.png`,
            scaledSize: window.google && new google.maps.Size(48, 48),
	          anchor: window.google && new google.maps.Point(24, 24)
          }
        }
      }
    }
  },
  components: {
    TimeSelector,
    SimilarRequests,
  },
  computed: {
    crowdstartUrl() {
      return `https://app.beeline.sg/#/tabs/crowdstart/${this.route.id}/detail`
    },
    originalArrivalTime() {
      var tripStops = _.sortBy(this.route.trips[0].tripStops, ts => ts.time);
      return moment(tripStops[tripStops.length-1].time).utcOffset(480).format('hh:mm');
    },
    computedStops() {
      var currentStops = _.sortBy(this.route.trips[0].tripStops, 'time');
      var currentTimes = currentStops.map(s => moment(s.time).utcOffset(480))
      var today = moment();
      var [hours, minutes] = this.arrivalTime ? this.arrivalTime.split(':') : [0, 0];

      var newTimes = currentTimes.map(ct => {
        var timeDifference = currentTimes[currentTimes.length - 1].valueOf() - ct.valueOf()
        return today.clone().hour(hours).minute(minutes)
          .subtract(timeDifference, 'milliseconds').valueOf();
      })

      return _.zip(currentStops, newTimes).map(([st, tm]) => ({
        ...st,
        time: tm
      }))
    },
    polylinePath() {
      return this.route.trips[0].tripStops.map(tripStop => {
        return {
          lat: tripStop.stop.coordinates.coordinates[1],
          lng: tripStop.stop.coordinates.coordinates[0]
        }
      })
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
  }
}
</style>
