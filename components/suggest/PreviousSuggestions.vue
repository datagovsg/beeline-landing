<template>
  <div class="previous-suggestions container">
    <h3>Your previous suggestions</h3>

    <transition name="vanish">
      <template v-if="suggestions === null">
        <div>Loading...</div>
      </template>
      <template v-else-if="suggestions === false">
        <div>
          <i class="glyphicon glyphicon-alert"/>
          There was an error loading your suggestions
        </div>
      </template>
      <template v-else-if="suggestions.length === 0">
        <div>You have no previous suggestions</div>
      </template>
      <template v-else>
        <table>
          <thead>
            <tr>
              <th class="index"></th>
              <th>Suggestion</th>
              <th></th>
              <th style="width: 7em">Date</th>
              <th class="delete">Delete</th>
            </tr>
          </thead>
          <VanishOnDelete tag="tbody">
            <tr v-for="(suggestion, index) in suggestions" :key="suggestion.id"
                @mouseover="$emit('hover_suggestion', suggestion)"
                @mouseout="$emit('hover_suggestion', null)"
                >
              <td class="index">
                {{index + 1}}.
              </td>
              <td>
                <a href="#"
                  @click.prevent="$emit('click_suggestion', suggestion)" class="route-description">
                  From
                  <strong>
                    <GeocodedLatLng
                      :value="{lat: suggestion.board.coordinates[1], lng: suggestion.board.coordinates[0]}"
                      />
                  </strong>
                  going to
                  <strong>
                    <GeocodedLatLng
                      :value="{lat: suggestion.alight.coordinates[1], lng: suggestion.alight.coordinates[0]}"
                      />
                  </strong>
                  arriving by
                  <strong>
                    {{dateformat(suggestion.time, 'h:MM TT', true)}}
                  </strong>
                </a>
              </td>
              <td>
                <nuxt-link :to="`/suggestions/${suggestion.id}`"
                    title="View suggestion details"
                    class="btn btn-default">
                  See what's nearby<i class="glyphicon glyphicon-menu-right" />
                </nuxt-link>
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
    </transition>
  </div>
</template>

<style scoped lang="scss">
table {
  margin: 0 0 2em 0;
  width: 100%;
  min-width: 500px; /* for mobile browsers */

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

    &.route-description {
      cursor: pointer;
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
