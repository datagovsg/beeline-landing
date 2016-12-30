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

export function logIn() {
  return new Promise((resolve, reject) =>
    auth0Lock.show({
      responseType: 'token',
    }, (error, profile, idToken) => {
      if (error)
        reject(error)
      else
        resolve({profile, idToken});
    })
  );
}

export function logOut() {
}
