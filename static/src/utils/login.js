import Vue from 'vue';

/* This must be placed here, so it can intercept the login before?? */
export var auth0Lock = new Auth0Lock(
  'PwDT8IepW58tRCqZlLQkFKxKpuYrgNAp',
  'beeline-suggestions.auth0.com', {
    auth: {
      redirect: false,
      params: {
        scope: 'openid name email'
      }
    },
    languageDictionary: {
      title: 'Beeline Suggestions'
    },
    theme: {
      logo: 'https://datagovsg.github.io/beeline-landing/images/beelineAuth0.png'
    },
    autoclose: true,
  }
);

export default new Vue({
  data: {
    lock: auth0Lock,
  },
  methods: {
    logIn() {
      return new Promise((resolve, reject) =>
        this.lock.show({
          responseType: 'token',
        }, (error, profile, idToken) => {
          if (error) {
            alert("Your email could not be verified");
            reject(error);
            return;
          }

          this.$store.commit('setProfile', {profile, idToken});
          resolve({profile, idToken})
        })
      );
    },
    logOut() {
      this.$store.commit('setProfile', {profile: null, idToken: null});
    },
  }
})
