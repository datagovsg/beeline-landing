
<template>
  <ul class="pagination">
   <li v-if="boundaryLinks" @click="goTo(0)">
     <span aria-hidden="true">&laquo;</span>
   </li>
   <li @click="goTo(value - 1)">
     <span aria-hidden="true">&lsaquo;</span>
   </li>

   <li v-for="page in pages" @click="goTo(page)"
      :class="{active: page === value}">
     <a>{{page + 1}}</a>
   </li>

   <li @click="goTo(value + 1)">
     <span aria-hidden="true">&rsaquo;</span>
   </li>
   <li v-if="boundaryLinks" @click="goTo(totalPages - 1)">
     <span aria-hidden="true">&laquo;</span>
   </li>
 </ul>
</template>

<script>
/* eslint-disable */
import _ from 'lodash'

export default {
  props: [
    'boundaryLinks', 'totalItems', 'itemsPerPage', 'value'
  ],
  computed: {
    totalPages() {
      return Math.max(
        1,
        Math.floor(((this.totalItems || 0) + ((this.itemsPerPage || 30) - 1)) / (this.itemsPerPage || 30)))
    },
    pages() {
      return _.range(0, this.totalPages)
    }
  },
  methods: {
    goTo(page) {
      this.$emit('input', page)
    }
  }
}
</script>
