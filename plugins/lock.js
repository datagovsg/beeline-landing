/* eslint-disable */
let lock = null
let resultPromise = null

export function getLock () {
  return null
  //
  // const {default: Auth0Lock} = require('auth0-lock')
  //
  // if (!lock) {
  //   lock = new Auth0Lock('PwDT8IepW58tRCqZlLQkFKxKpuYrgNAp', 'beeline-suggestions.auth0.com', {
  //     auth: {
  //       redirect: true,
  //       redirectUrl: 'http://localhost:3000/auth_redirect',
  //       autoParseHash: false,
  //       params: {
  //         state: window.location.href,
  //         scope: 'openid name email'
  //       },
  //       responseType: 'token',
  //     },
  //     languageDictionary: {
  //       title: 'Beeline Suggestions'
  //     },
  //     theme: {
  //       logo: 'https://datagovsg.github.io/beeline-landing/images/beelineAuth0.png'
  //     },
  //     autoclose: true
  //   })
  //
  //   resultPromise = new Promise((resolve, reject) => {
  //     const hash = window.location.hash
  //     lock.resumeAuth(hash, (err, result) => {
  //       if (!err && !result) {
  //         return resolve(null)
  //       } else if (err) {
  //         return reject(err)
  //       } else if (result) {
  //         return resolve(result)
  //       }
  //     })
  //   })
  // }
  // return lock
}

export function getLockPromise () {
  return resultPromise
}

if (process.BROWSER_BUILD) {
  getLock()
}
