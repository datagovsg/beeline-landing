import SharedStoreTemplate from '~/util/SharedStoreTemplate'
import querystring from 'querystring'

const sharedRouteStore = SharedStoreTemplate(
  {},
  {
    'publicRoutes': () => ({
      url: 'https://api.beeline.sg/routes?' + querystring.stringify({
        start_date: new Date().toISOString(),
        include_trips: true,
        tags: JSON.stringify(['public']),
      })
    }),

    'crowdstartRoutes': () => ({
      url: 'https://api.beeline.sg/routes?' + querystring.stringify({
        start_date: new Date().toISOString(),
        include_trips: true,
        tags: JSON.stringify(['crowdstart']),
      })
    }),

    'crowdstartStatus': {
      url: 'https://api.beeline.sg/crowdstart/status'
    }
  }
)

export const state = sharedRouteStore.state
export const mutations = sharedRouteStore.mutations
export const actions = sharedRouteStore.actions
export const getters = sharedRouteStore.getters
