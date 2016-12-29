<template>
  <div v-if="suggestions">
    <table class="table table-striped">
      <thead>
        <tr>
          <th></th>
          <th>From</th>
          <th>To</th>
          <th>Arriving at</th>
          <th>Created on</th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <suggestion-viewer v-for="(suggestion, index) in suggestions"
          :key="suggestion.id"
          :suggestion="suggestion" :index="index + 1"
          @view="view(suggestion)"
          @destroy="destroy(suggestion)">
        </suggestion-viewer>
      </tbody>
    </tbody>
  </div>
  <div v-else>
    You are not logged in
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex'
import SuggestionViewer from '../components/suggestion-viewer.vue'

export default {
  props: ['origin', 'destination'],
  components: {
    SuggestionViewer
  },
  data() {
    return {
      suggestions: []
    }
  },
  created() {
  },
  computed: {
    ...mapState(['idToken', 'profile', 'suggestions']),
  },
  watch: {
    idToken: {
      immediate: true,
      handler(v) {
        this.fetchSuggestions()
      }
    }
  },
  methods: {
    ...mapActions(['fetchSuggestions']),
    view(suggestion) {
      this.$store.commit('setOrigin', {
        lat: suggestion.board.coordinates[1],
        lng: suggestion.board.coordinates[0],
      });
      this.$store.commit('setDestination', {
        lat: suggestion.alight.coordinates[1],
        lng: suggestion.alight.coordinates[0],
      });
      this.$router.push('/search');
    },
    destroy(suggestion) {
      if (confirm("Are you sure you want to delete this suggestion?")) {
        this.$http.delete(`http://localhost:8989/suggestions/web/${suggestion.id}`, {
          headers: {
            authorization: `Bearer ${this.idToken}`
          }
        })
        .then(() => {
          this.fetchSuggestions();
        })
      }
    }
  }
}
</script>
