import jwtDecode from 'jwt-decode'
import axios from 'axios'
import Vue from 'vue'

export const globalAuthState = new Vue({
  data: {
    email: null,
    token: null,

    _hasCheckedSession: false,
    _auth0Promise: false,
  },

  watch: {
    'token': {
      immediate: true,
      handler (i) {
        // Refresh suggestions because user changed
        if (i) {
          try {
            this.email = jwtDecode(i).email
          } catch (err) {
            this.email = null
          }
        } else {
          this.email = null
        }
      }
    },
  },

  methods: {
    createAuth0Instance () {
      const promise = import('auth0-js')
      .then((Auth0) => {
        return new Auth0.WebAuth({
          clientID: 'PwDT8IepW58tRCqZlLQkFKxKpuYrgNAp',
          domain: 'beeline-suggestions.auth0.com',
          redirectUri: window.location.protocol + '//' +
            window.location.host +
            '/login',
          scope: 'openid profile email name offline_access',
          responseType: 'token',
        })
      })

      promise.then(() => {
        if (window.localStorage.idToken) {
          this._checkCurrentToken()
        }
      })

      return promise
    },

    getAuth0Instance () {
      return this.auth0Promise ||
        (this.auth0Promise = this.createAuth0Instance())
    },

    _disableTokenCheck () {
      this.hasCheckedSession = true
    },

    _checkCurrentToken () {
      if (this.hasCheckedSession) {
        return
      }

      this.hasCheckedSession = true

      // Check expiry
      return Promise.resolve(null)
      .then(() => {
        const exp = jwtDecode(window.localStorage.idToken).exp * 1000
        const now = Date.now()

        if (exp - now < 3600e3) { // less than one hour to expiry
          // eslint-disable-next-line
          throw {tryRefreshToken: true}
        }
      })
      .then(() =>
        // Test the auth
        axios.get('https://api.beeline.sg/suggestions/web', {
          headers: {authorization: `Bearer ${window.localStorage.idToken}`}
        })
        .catch((err) => {
          if (err.statusCode === 401) {
            // eslint-disable-next-line
            throw {tryRefreshToken: true}
          } else {
            throw err
          }
        })
      )
      .then(() => {
        this.token = window.localStorage.idToken
      })
      .catch(async (err) => {
        if (err.tryRefreshToken && window.localStorage.refreshToken) {
          // FIXME: This is the old Auth0 API
          // For info see https://auth0.com/docs/tokens/delegation
          axios.post('https://beeline-suggestions.auth0.com/delegation', {
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            client_id: 'PwDT8IepW58tRCqZlLQkFKxKpuYrgNAp',
            refresh_token: window.localStorage.refreshToken,
            scope: 'openid profile email name offline_access',
          })
          .then((result) => {
            console.log('Used refresh token...')
            this.token = result.data.id_token
            this.saveToken(this.token, window.localStorage.refreshToken)
          })
        } else {
          throw err
        }
      })
    },

    showLogin () {
      // See recommendations at
      // https://auth0.com/docs/users/redirecting-users
      window.sessionStorage.redirectAfterLoginTo = window.location.href
      this.$auth0WebAuth.authorize({})
    },

    showLoginPasswordless (email) {
      return new Promise((resolve, reject) => {
        this.$auth0WebAuth.passwordlessStart({
          connection: 'email',
          email,
          send: 'code',
        }, (err, res) => {
          if (err) return reject(err)
          resolve(res)
        })
      })
    },

    verifyPasswordless (email, code) {
      // See recommendations at
      // https://auth0.com/docs/users/redirecting-users
      window.sessionStorage.redirectAfterLoginTo = window.location.href

      return new Promise((resolve, reject) => {
        this.$auth0WebAuth.passwordlessVerify({
          connection: 'email',
          email,
          verificationCode: code,
        }, (err, res) => {
          if (err) return reject(err)
          resolve(res)
        })
      })
    },

    saveToken (idToken, refreshToken) {
      window.localStorage.idToken = idToken
      window.localStorage.refreshToken = refreshToken
    }
  }
})

export default {
  data () {
    return {
      auth: globalAuthState,
    }
  },
  mounted () {
    this.auth.getAuth0Instance().then((a0) => {
      this.auth.$auth0WebAuth = a0
    })
  }
}
