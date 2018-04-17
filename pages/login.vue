<template>
  <div v-if="auth.token">
    You are already logged in
  </div>
  <div v-else-if="error === null" class="container">
    Logging you in...
  </div>
  <div v-else-if="error" class="container">
    There was an error logging you in:
    <div class="alert alert-warning">
      {{ error }}
    </div>
  </div>
</template>

<style>
</style>

<script>
import RequiresAuth from '../mixins/RequiresAuth'

export default {
  mixins: [RequiresAuth],
  data () {
    return {
      error: null,
    }
  },
  async mounted () {
    this.auth._disableTokenCheck()

    this.auth.getAuth0Instance().then((auth0) => {
      auth0.parseHash({hash: window.location.hash}, (err, result) => {
        if (err) {
          console.error(err)
          this.error = err
          return
        }

        this.auth.saveToken(result.idToken, result.refreshToken)
        window.location.href = window.sessionStorage.redirectAfterLoginTo
      })
    })
  }
}

</script>
