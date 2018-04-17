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

      <div v-if="showErrorDetails">
        <hr/>
        <ul style="word-wrap: break-word">
          <li>{{ debug.originalHash }}</li>
          <li>{{ debug.redirectTo }}</li>
          <li>{{ debug.localStorage }}</li>
        </ul>
      </div>
      <div v-else>
        <a href="#"  @click.prevent="showErrorDetails = true">
          (tap / click here to show details)
        </a>
      </div>
    </div>
  </div>
</template>

<style>
</style>

<script>
import RequiresAuth from '../mixins/RequiresAuth'
import querystring from 'querystring'

export default {
  mixins: [RequiresAuth],
  data () {
    return {
      error: null,
      showErrorDetails: false,
      debug: null,
    }
  },
  async mounted () {
    this.auth._disableTokenCheck()

    this.auth.getAuth0Instance().then((auth0) => {
      this.debug = {
        originalHash: {
          ...querystring.parse(window.location.hash.replace(/^#?/, '')),
          id_token: '[redacted]',
          refresh_token: '[redacted]',
          access_token: '[redacted]',
        },
        localStorage: JSON.stringify({
          ...window.localStorage,
          idToken: '[redacted]',
          refreshToken: '[redacted]',
        }),
        redirectTo: window.sessionStorage.redirectAfterLoginTo,
      }

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
