<template>
  <div>
    <ol v-if="crowdstarted.arrivalTime">
      <li v-for="stop in computedStops">
        <b>{{stop.time | formatTime}}</b>

        {{stop.stop.description}}
      </li>
    </ol>

    <label>
      Arrive at
      <select v-model="crowdstarted.arrivalTime">
        <option value=""></option>
        <option value="07:45">07:45</option>
        <option value="08:00">08:00</option>
        <option value="08:15">08:15</option>
        <option value="08:30">08:30</option>
        <option value="08:45">08:45</option>
        <option value="09:00">09:00</option>
      </select>
    </label>
  </div>
</template>

<script>
import vue from 'vue';
import moment from 'moment';
import _ from 'lodash';

export default {
  props: ['route'],
  data() {
    return {
      crowdstarted: {
        arrivalTime: '',
      }
    }
  },
  computed: {
    crowdstartUrl() {
      return `https://app.beeline.sg/#/tabs/crowdstart/${this.route.id}/detail`
    },
    arrivalTime() {
      var tripStops = _.sortBy(this.route.trips[0].tripStops, ts => ts.time);
      return moment(tripStops[tripStops.length-1].time).utcOffset(480).format('hh:mm');
    },
    computedStops() {
      var currentStops = _.sortBy(this.route.trips[0].tripStops, 'time');
      var currentTimes = currentStops.map(s => moment(s.time).utcOffset(480))
      var today = moment();
      var [hours, minutes] = this.crowdstarted.arrivalTime ? this.crowdstarted.arrivalTime.split(':') : [0, 0];

      var newTimes = currentTimes.map(ct => {
        var timeDifference = currentTimes[currentTimes.length - 1].valueOf() - ct.valueOf()
        return today.clone().hour(hours).minute(minutes)
          .subtract(timeDifference, 'milliseconds').valueOf();
      })

      return _.zip(currentStops, newTimes).map(([st, tm]) => {
        return _.defaults({time: tm}, st)
      })
    }
  },
  filters: {
    formatTime(s) {
      return moment(s).utcOffset(480).format('h:mm a')
    }
  }
}
</script>
