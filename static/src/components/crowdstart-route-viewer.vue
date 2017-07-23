<template>
  <div>
    <p>
      {{index + 1}}. <a :href="crowdstartUrl" target="_blank">
        <b>{{route.from}}</b> to <b>{{route.to}}</b>
      </a>
    </p>

    <button class="btn btn-default" @click="view">Preview</button>

    Arriving at {{arrivalTime}}
    <button class="btn btn-default" @click="derive">Propose a different time</button>
  </div>
</template>

<script>
import vue from 'vue';
import moment from 'moment';
import _ from 'lodash';

export default {
  props: ['route', 'index'],
  data() {
    return {}
  },
  computed: {
    crowdstartUrl() {
      return `https://app.beeline.sg/#/tabs/crowdstart/${this.route.id}/detail`
    },
    arrivalTime() {
      var tripStops = _.sortBy(this.route.trips[0].tripStops, ts => ts.time);
      return moment(tripStops[tripStops.length-1].time).utcOffset(480).format('hh:mm');
    }
  },
  methods: {
    derive() {
      this.$emit('derive', this.route)
    },
    view() {
      this.$emit('view', this.route)
    },
  }
}
</script>
