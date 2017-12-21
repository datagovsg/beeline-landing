export const state = () => {
  return {
    idToken: null, refreshToken: null,
  }
}

export const mutations = {
  updateWithResult (state, {idToken, refreshToken}) {
    Object.assign(window.localStorage, {
      idToken, refreshToken
    })
    Object.assign(state, {
      idToken, refreshToken
    })
  }
}

export const actions = {
  showLoginDialog () {
    // getLock().show()
  },
  logout (context) {
    context.commit('updateWithResult', {
      idToken: null,
      refreshToken: null,
    })
    Object.assign(window.localStorage, {
      idToken: null, refreshToken: null,
    })
  }
}
