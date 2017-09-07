<template>
  <div class="previous-suggestions">
    <h3>Your previous suggestions</h3>

    <template v-if="suggestions === null">
      Loading...
    </template>
    <template v-else-if="suggestions === false">
      <i class="glyphicon glyphicon-alert"/>
      There was an error loading your suggestions
    </template>
    <template v-else-if="suggestions.length === 0">
      You have no previous suggestions
    </template>
    <template v-else>
      <table>
        <thead>
          <tr>
            <th class="index"></th>
            <th>Suggestion</th>
            <th>Date</th>
            <th class="delete">Delete</th>
          </tr>
        </thead>
        <VanishOnDelete tag="tbody">
          <tr v-for="(suggestion, index) in suggestions" :key="suggestion.id"
              @click="$emit('click_suggestion', suggestion)"
              @mouseover="$emit('hover_suggestion', suggestion)"
              @mouseout="$emit('hover_suggestion', null)"
              >
            <td class="index">
              {{index + 1}}.
            </td>
            <td>
              From
              <strong>
                <GeocodedLatLng
                  :value="{lat: suggestion.alight.coordinates[1], lng: suggestion.alight.coordinates[0]}"
                  />
              </strong>
              going to
              <strong>
                <GeocodedLatLng
                  :value="{lat: suggestion.board.coordinates[1], lng: suggestion.board.coordinates[0]}"
                  />
              </strong>
              arriving by
              <strong>
                {{dateformat(suggestion.time, 'h:MM TT', true)}}
              </strong>
            </td>
            <td>
              {{dateformat(suggestion.createdAt, 'dd mmm yyyy')}}
            </td>
            <td class="delete">
              <a href="#" @click.prevent="deleteSuggestion(suggestion)" title="Delete this suggestion">
                <i class="glyphicon glyphicon-minus-sign" />
              </a>
            </td>
          </tr>
        </VanishOnDelete>
      </table>
    </template>
  </div>
</template>

<style scoped lang="scss">
table {
  margin: 0 0 2em 0;
  width: 100%;
  tr {
    border-bottom: solid 1px #CCC;
    &:hover {
      td {
        background-color: #DEF;
      }
    }
  }
  td {
    padding: 0.5em;
    &.index, &.delete {
      width: 3em
    }
  }
}
</style>

<script>
import axios from 'axios'
import dateformat from 'dateformat'
import VanishOnDelete from '../VanishOnDelete'
import GeocodedLatLng from '~/components/GeocodedLatLng'

export default {
  props: ['token', 'suggestions'],

  data () {
    return {
      // suggestions: null
    }
  },

  components: {
    VanishOnDelete, GeocodedLatLng
  },

  mounted () {
    // this.refresh()
  },

  methods: {
    dateformat,

    // refresh () {
    //   return axios.get('https://api.beeline.sg/suggestions/web', {
    //     headers: {
    //       authorization: `Bearer ${this.token}`
    //     }
    //   })
    //   .then((s) => {
    //     this.suggestions = s.data
    //   })
    //   .catch(() => {
    //     this.suggestions = false
    //   })
    //   .then(() => {
    //     this.$emit('list_changed', this.suggestions)
    //   })
    // },

    deleteSuggestion (suggestion) {
      // FIXME: use a soft modal
      if (confirm(`Are you sure you want to delete this suggestion?`)) {
        axios.delete(`https://api.beeline.sg/suggestions/web/${suggestion.id}`, {
          headers: {
            authorization: `Bearer ${this.token}`
          }
        })
        .then(() => this.$emit('refresh_required'))
      }
    }
  }
}
</script>
