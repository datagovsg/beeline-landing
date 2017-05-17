<template>
  <tr>
    <td>{{index}}</td>
    <td>{{board}}</td>
    <td>{{alight}}</td>
    <td>{{suggestion.time - 480 * 60000 | formatTime}}</td>
    <td>{{suggestion.createdAt | formatDateTime}}</td>
    <td><button class="btn btn-danger" @click="destroy">Delete</button></td>
    <td><button class="btn btn-default" @click="view">View</button></td>
  </tr>
</template>

<script>
import querystring from 'querystring';
import Vue from 'vue';

function geocode(coords) {
  return Vue.resource(process.env.BEELINE_API + '/onemap/revgeocode?' + querystring.stringify({
    location: `${coords[0]},${coords[1]}`
  })).get()
  .then(r => r.json())
  .then(r => {
    if (r.GeocodeInfo[0].ErrorMessage) {
      throw new Error(r.GeocodeInfo[0].ErrorMessage)
    } else {
      return [r.GeocodeInfo[0].BUILDINGNAME, r.GeocodeInfo[0].ROAD]
            .filter(x => x)
            .join(', ');
    }
  })
}

export default {
  props: ['suggestion', 'index'],
  data() {
    return {
      geocodedBoard: null,
      geocodedAlight: null,
    }
  },
  computed: {
    board() {
      return this.geocodedBoard ||
        `${this.suggestion.board.coordinates[1]},${this.suggestion.board.coordinates[0]}`
    },
    alight() {
      return this.geocodedAlight ||
        `${this.suggestion.alight.coordinates[1]},${this.suggestion.alight.coordinates[0]}`
    }
  },
  watch: {
    'suggestion.board': {
      immediate: true,
      handler(v) {
        if (!v) return;
        geocode(v.coordinates)
        .then(r => this.geocodedBoard = r)
        .catch(() => {})
      }
    },
    'suggestion.alight': {
      immediate: true,
      handler(v) {
        if (!v) return;
        geocode(v.coordinates)
        .then(r => this.geocodedAlight = r)
        .catch(() => {})
      }
    }
  },
  methods: {
    view() {
      this.$emit('view');
    },
    destroy() {
      this.$emit('destroy');
    }
  },
  filters: require('../utils/filters').default
}
</script>
