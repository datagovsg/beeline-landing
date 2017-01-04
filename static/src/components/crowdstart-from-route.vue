<template>
  <div>
    <template v-if="!route || !route.trips || !route.trips[0]">
      Please <router-link to="/search">search</router-link> for a route first.
    </template>
    <template v-else>
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
    </template>
  </div>
</template>

<script>
import vue from 'vue';
import moment from 'moment';
import _ from 'lodash';
import TimeSelector from './time-selector.vue';

export default {
  props: ['route'],
  data() {
    return {
      arrivalTime: '',
    }
  },
  components: {
    TimeSelector
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
