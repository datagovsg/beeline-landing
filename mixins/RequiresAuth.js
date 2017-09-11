import jwtDecode from 'jwt-decode'
import axios from 'axios'

export default {
  data () {
    return {
      auth: {
        email: null,
        token: null,
      },
    }
  },
  watch: {
    'auth.token': {
      immediate: true,
      handler (i) {
        // Refresh suggestions because user changed
        if (i) {
          try {
            this.auth.email = jwtDecode(i).email
          } catch (err) {
            this.auth.email = null
          }
        } else {
          this.auth.email = null
        }
      }
    },
  },
  async mounted() {
    const {default: Auth0LockPasswordless} = await import('auth0-lock-passwordless')
    const Auth0 = await import('auth0-js')

    this.lockPasswordless = window.lockPasswordless || new Auth0LockPasswordless(
      'PwDT8IepW58tRCqZlLQkFKxKpuYrgNAp',
      'beeline-suggestions.auth0.com'
    )
    this.$auth0 = new Auth0({
      clientID: 'PwDT8IepW58tRCqZlLQkFKxKpuYrgNAp',
      domain: 'beeline-suggestions.auth0.com',
    })

    this.$authHandler = ({profile, idToken, accessToken, state, refreshToken}) => {
      this.auth.token = idToken

      // Save the tokens to view suggestions
      window.localStorage.idToken = idToken
      window.localStorage.refreshToken = refreshToken
    }

    if (window.localStorage.idToken) {
      // Check expiry
      Promise.resolve(null)
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
        this.auth.token = window.localStorage.idToken
      })
      .catch(async (err) => {
        if (err.tryRefreshToken && window.localStorage.refreshToken) {
          // FIXME: this isn't going to work unless we define Auth0 somewhere
          const auth0 = this.$auth0
          auth0.refreshToken(window.localStorage.refreshToken, (err, delegationResult) => {
            if (err) return

            this.auth.token = window.localStorage.idToken = delegationResult.id_token
          })
        } else {
          throw err
        }
      })
    }
  },

  methods: {
    showLogin () {
      this.lockPasswordless.socialOrEmailcode({
        authParams: {
          scope: 'openid profile email name offline_access',
        },
        dict: {
          title: 'Beeline Suggestions',
          networkOrEmail: {
            smallSocialButtonsHeader: 'Connect using single sign-on (we will only receive your email address)',
            separatorText: 'Or, verify your email using a one-time password.',
            emailInputPlaceholder: 'yours@example.com',
          },
        },
        icon: 'https://datagovsg.github.io/beeline-landing/images/beelineAuth0.png',
        connections: ['facebook', 'google-oauth2'],
        autoclose: true,
        popup: true,
        responseType: 'token',
      }, (error, profile, idToken, accessToken, state, refreshToken) => {
        if (error) {
          // FIXME: use a soft dialog
          alert(`Your email could not be verified`)
          return
        }

        this.$authHandler({profile, idToken, accessToken, state, refreshToken})
      })
    }
  }
}
