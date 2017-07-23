
<template>
  <div>
    <input type="text" :value="text" @input="updateSearch($event.target.value)"
      @keydown.up.prevented="selectedIndex = Math.max(0, selectedIndex - 1)"
      @keydown.down.prevented="selectedIndex = Math.min(searchResults.length - 1, selectedIndex + 1)"
      @keydown.enter="useSearchResult(selectedIndex)"
      >

    <Dropdown ref="dropdown">
      <ul v-if="searchResults.length">
        <li v-for="(searchResult, index) in searchResults"
            :class="{active: index === selectedIndex}"
            @click="selectedIndex = index">
          {{searchResult.SEARCHVAL}}
          {{searchResult.POSTAL}}
        </li>
      </ul>
      <ul v-else>
        <li>No results found</li>
      </ul>
    </Dropdown>
  </div>
</template>

<style>
.dropdown .active {
  background-color: #9CF;
}
</style>

<script>

import axios from 'axios'
import querystring from 'querystring'
import _ from 'lodash'

export default {
  props: ['value'],
  mixins: [
    require('./DropdownMixin')
  ],
  data () {
    return {
      text: null,
      searchResults: [],
      selectedLatLng: null,
      selectedIndex: 0,
    }
  },
  watch: {
    value(v) {
      if (!this.value) {
        this.text = ''
      } else {
        if (!this.selectedLatLng ||
            this.selectedLatLng.lat !== v.lat ||
            this.selectedLatLng.lng !== v.lng) {
          axios.get('https://api.beeline.sg/onemap/revgeocode?' + querystring.stringify({
            location: `${this.value.lng},${this.value.lat}`
          }))
          .then((response) => {
            this.text = response.data.BUILDING ||
              response.data.ROAD ||
              `${this.value.lat}, ${this.value.lng}`
          })
        }
      }
    }
  },
  methods: {
    updateSearch(value) {
      this.text = value
      this.throttledQuery()
    },
    throttledQuery: _.throttle(function () {
      if (this.text) {
        axios.get('https://developers.onemap.sg/commonapi/search?' + querystring.stringify({
          searchVal: this.text,
          returnGeom: 'Y',
          getAddrDetails: 'Y',
          pageNum: 1
        }))
        .then((response) => {
          if (response.data.found) {
            this.searchResults = response.data.results.slice(0, 10)
            this.selectedIndex = 0
          } else {
            this.searchResults = []
            this.selectedIndex = 0
          }
        })
      } else {
        this.searchResults = []
        this.selectedIndex = 0
        this.$emit('input', null)
      }
    }, 300),

    useSearchResult(index) {
      const selected = this.searchResults[this.selectedIndex]
      if (!selected) return

      this.text = selected.SEARCHVAL
      this.searchResults = []
      this.selectedLatLng = {
        lat: parseFloat(selected.LATITUDE),
        lng: parseFloat(selected.LONGITUDE),
      }

      this.$emit('input', this.selectedLatLng)
    }
  }
}

</script>
