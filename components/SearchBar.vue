<template>
  <nav class="search-bar">
    <div class="search-fields">
      <label>From:</label>
      <span class="address-input"><AddressInput :value="origin" @input="updateSearch('origin', $event)" /></span>

      <label>To:</label>
      <span class="address-input"><AddressInput :value="destination" @input="updateSearch('destination', $event)" /></span>

      <label>Time at Destination:</label>
      <span><TimeRange :value="arrivalTime" @input="updateSearch('arrivalTime', $event)" /></span>

      <button @click="showMap = !showMap">
        <i class="mdi mdi-google-maps"></i>
      </button>
    </div>
    <div class="map-view" v-show="showMap">
      (show map here)
    </div>
  </nav>
</template>
<style lang="scss">
.search-bar {
  background-color: rgb(80, 54, 100);
  color: rgb(255, 231, 109);
  .search-fields {
    display: flex;
    flex-direction: row;

    & > span.address-input {
      flex: 1 1 auto;
    }
  }
}
</style>

<script>
import {mapState} from 'vuex'

export default {
  data () {
    return {
      showMap: false,
    }
  },
  computed: {
    ...mapState('search', ['origin', 'destination', 'arrivalTime'])
  },
  methods: {
    updateSearch(field, value) {
      this.$store.commit('search/updateSearch', {field, value})
    }
  }
}
</script>
