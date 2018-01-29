<template>
  <span>
    {{email}}
  </span>
</template>

<script>
import RequiresAuth from '~/mixins/RequiresAuth'
import axios from 'axios'

export default {
  props: ['requestId'],
  mixins: [RequiresAuth],

  data () {
    return {
      email: null,
    }
  },

  computed: {
    emailPromise () {
      if (this.auth.token) {
        return axios.get(`https://api.beeline.sg/suggestions/web/${this.requestId}`, {
          headers: {
            authorization: `Bearer ${this.token}`
          }
        })
          .then((response) => response.data.email)
      }
    }
  },

  watch: {
    emailPromise: {
      immediate: true,
      handler (v) {
        if (v) {
          v.then(e => { this.email = e })
        } else {
          this.email = null
        }
      }
    }
  }

}
</script>
