import assert from 'assert';
import Vuex from 'vuex';
import Vue from 'vue';
import querystring from 'querystring';
import {latlngDistance} from './utils/latlngDistance';
import _ from 'lodash';
import jwtDecode from 'jwt-decode';
import {logIn, logOut} from './utils/login'
import * as adminLogin from './utils/adminLogin'

export function createStore() {
  var allLelongRoutes = Vue.resource(process.env.BEELINE_API + '/custom/lelong/status')
    .get()
    .then(r => r.json())
    .then(rs => {
      for (let route of rs) {
        for (let trip of route.trips) {
          trip.tripStops = _.sortBy(trip.tripStops, 'time')
        }
      }
      rs.trips = _.sortBy(rs.trips, 'date')
      return rs;
    });

  var store = new Vuex.Store({
    state: {
      origin: null,
      destination: null,
      selectedRoute: null,
      similarRequests: null,

      runningRoutes: null,
      crowdstartedRoutes: null,
      autogeneratedRoutes: null,
      loadingRequests: 0,

      maxDistance: 1000,
      autogenerateSettings: {
        maxDetourMinutes: 2,
        startClusterRadius: 3000,
        endClusterRadius: 3000,
        startWalkingDistance: 300,
        endWalkingDistance: 300,
        dataSource: 'suggestions'
      },

      crowdstartRoute: {},
      crowdstartRouteStartTime: 0,

      idToken: null,
      profile: null,
      adminIdToken: null,
      adminProfile: null,

      suggestions: null,

      now: Date.now(),
    },
    mutations: {
      setOrigin(state, origin) {
        state.origin = origin;
      },
      setDestination(state, destination) {
        state.destination = destination;
      },
      setSelectedRoute(state, route) {
        state.selectedRoute = route;
      },
      setSimilarRequests(state, requests) {
        state.similarRequests = requests;
      },
      incrementLoading(state) {
        state.loadingRequests++;
      },
      decrementLoading(state) {
        state.loadingRequests--;
      },
      setRunningRoutes(state, routes) {
        state.runningRoutes = routes;
      },
      setAutogeneratedRoutes(state, routes) {
        state.autogeneratedRoutes = _.cloneDeep(routes);
      },
      setCrowdstartedRoutes(state, routes) {
        state.crowdstartedRoutes = routes;
      },
      setAutogenerateSettings(state, settings) {
        state.autogenerateSettings = settings;
      },
      setCrowdstartRouteStartTime(state, time) {
        state.crowdstartRouteStartTime = time;
      },
      crowdstartRoute(state, route) {
        state.crowdstartRoute = route;
      },

      setProfile(state, {profile, idToken}) {
        // Persist to local storage
        try {
          window.localStorage['profile'] = JSON.stringify(profile)
          window.localStorage['idToken'] = idToken;
        } catch (err) {}

        state.profile = profile;
        state.idToken = idToken;
      },
      setAdminProfile(state, {profile, idToken}) {
        // Persist to local storage
        try {
          window.localStorage['adminProfile'] = JSON.stringify(profile)
          window.localStorage['adminIdToken'] = idToken;
        } catch (err) {}

        state.adminProfile = profile;
        state.adminIdToken = idToken;
      },
      updateTimestamp(state) {
        state.now = Date.now();
      },
      setSuggestions(state, suggestions) {
        state.suggestions = suggestions;
      }
    },
    getters: {
      decodedIdToken: state => {
        if (!state.idToken) {
          return null;
        } else {
          return jwtDecode(state.idToken);
        }
      },
      idTokenState: state => {
        if (!state.idToken) {
          return Promise.resolve(false);
        } else {
          var token;
          try {
            token = jwtDecode(state.idToken);
          } catch (err) {
            return Promise.resolve(false);
          }

          if (!token.exp || token.exp * 1000 > (state.now + 10 * 6000)) {
            return Promise.resolve(true);
          } else {
            return Promise.resolve(false);
          }

          // TODO: Handle refresh tokens
        }
      }
    },
    actions: {
      checkIdToken(context) {
        context.commit('updateTimestamp')

        context.getters.idTokenState
        .then((r) => {
          if (!r) {
            context.commit('setProfile', {profile: null, idToken: null})
          }
        })
      },
      fetchSimilarRequests(context) {
        if (context.state.origin && context.state.destination) {
          Vue.resource(process.env.BEELINE_API + '/suggestions/web/similar?' + querystring.stringify({
            startLat: context.state.origin.lat,
            startLng: context.state.origin.lng,
            endLat: context.state.destination.lat,
            endLng: context.state.destination.lng,
            startDistance: context.state.maxDistance,
            endDistance: context.state.maxDistance,
          })).get()
          .then(r => r.json())
          .then(rs => {
            context.commit('setSimilarRequests', rs);
          });
        }
      },
      processRequest(context) {
        // Take the origin, destination, and start fetching
        context.dispatch('fetchRunningRoutes')
        context.dispatch('fetchCrowdstartedRoutes')
        context.dispatch('fetchAutogeneratedRoutes')
      },
      fetchRunningRoutes(context) {
        if (context.state.origin && context.state.destination) {
          context.commit('incrementLoading');

          Vue.resource(process.env.BEELINE_API + '/routes/search_by_latlon?' + querystring.stringify({
            startLat: context.state.origin.lat,
            startLng: context.state.origin.lng,
            endLat: context.state.destination.lat,
            endLng: context.state.destination.lng,
            maxDistance: context.state.maxDistance,
            tags: JSON.stringify(['public']),
          })).get()
          .then(r => r.json())
          .then(rs => {
            for (let route of rs) {
              for (let trip of route.trips) {
                trip.tripStops = _.sortBy(trip.tripStops, 'time')
              }
            }
            rs.trips = _.sortBy(rs.trips, 'date')

            context.commit('setRunningRoutes', rs);
          })
          .catch(err => console.error(err))
          .finally(() => context.commit('decrementLoading'))
        }
      },
      fetchCrowdstartedRoutes(context) {
        if (context.state.origin && context.state.destination) {
          context.commit('incrementLoading');

          allLelongRoutes.then((routes) => routes.filter(route =>
            _.some(route.trips[0].tripStops, ts => ts.canBoard &&
                latlngDistance([ts.stop.coordinates.coordinates[1], ts.stop.coordinates.coordinates[0]],
                               [context.state.origin.lat, context.state.origin.lng]) < context.state.maxDistance) &&
                _.some(route.trips[0].tripStops, ts => ts.canAlight &&
                latlngDistance([ts.stop.coordinates.coordinates[1], ts.stop.coordinates.coordinates[0]],
                               [context.state.destination.lat, context.state.destination.lng]) < context.state.maxDistance)
          ))
          .then((filteredRoutes) => context.commit('setCrowdstartedRoutes', filteredRoutes))
          .catch(err => console.error(err))
          .finally(() => context.commit('decrementLoading'))
        }
      },
      fetchAutogeneratedRoutes(context) {
        if (context.state.origin && context.state.destination) {
          context.commit('incrementLoading');

          Vue.resource('/routes/propose?' + querystring.stringify({
            origin_lat: context.state.origin.lat,
            origin_lng: context.state.origin.lng,
            destination_lat: context.state.destination.lat,
            destination_lng: context.state.destination.lng,
            settings: JSON.stringify(context.state.autogenerateSettings)
          })).get()
          .then(r => r.json())
          .then(rs => {
            if (rs.status === 'success') {
              // Take only the ten routes with the most number of passengers
              const routesSortedByPax = _.sortBy(rs.payload, route => - _.sumBy(route.requests, r => r.weight));
              context.commit('setAutogeneratedRoutes', routesSortedByPax)
            } else {
              throw new Error(rs.payload);
            }
          })
          .catch(err => console.error(err))
          .finally(() => context.commit('decrementLoading'));
        }
      },
      fetchSuggestions(context) {
        if (context.state.idToken) {
          Vue.http.get(process.env.BEELINE_API + '/suggestions/web',
          {
            headers: {
              authorization: `Bearer ${context.state.idToken}`
            }
          })
          .then(r => r.data)
          .then(results => {
            context.commit('setSuggestions', results);
          })
          .catch(() => {
            context.commit('setSuggestions', null);
          })
        } else {
          context.commit('setSuggestions', null);
        }
      },
      logIn(context) {
        return logIn()
        .then((result) => {
          context.commit('setProfile', result);
        })
        .catch(error => {
          alert("Your email could not be verified");
        });
      },
      logOut(context) {
        context.commit('setProfile', {profile: null, idToken: null});
      },

      adminLogIn(context) {
        return adminLogin.logIn()
        .then((result) => {
          context.commit('setAdminProfile', result);
        })
        .catch(error => {
          alert("Your email could not be verified");
        });
      },
      adminLogOut(context) {
        context.commit('setAdminProfile', {profile: null, idToken: null});
      },
      recomputeTimings(context) {
        assert(context.state.crowdstartRoute);

        // Use the Google Maps Distance API to compute the travel time
        // on the next working day
        // FIXME: account for public holidays
        var today = new Date();
        today.setDate(today.getDate() + 1); // Increment by one
        while (today.getDate() == 0 || today.getDate() == 6) { // Don't fall on a weekend
          today.setDate(today.getDate() + 1)
        }
        var peakHourNextWorkingDay = Date.UTC( // Just set it at 8.30
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          (7 - 8),
          (30),
          0
        )

        var tss = context.state.crowdstartRoute.trips[0].tripStops

        const pointToLatLng = geojson => ({
          lat: geojson.coordinates[1],
          lng: geojson.coordinates[0],
        })

        var directionsAPIParams = {
          origin: pointToLatLng(tss[0].stop.coordinates),
          destination: pointToLatLng(tss[tss.length - 1].stop.coordinates),
          waypoints: tss.slice(1, tss.length - 1)
            .map(s => ({location: pointToLatLng(s.stop.coordinates)})),
          travelMode: google.maps.TravelMode.DRIVING,
          drivingOptions: {
            departureTime: new Date(peakHourNextWorkingDay),
          }
        };

        var directionsService = new google.maps.DirectionsService();

        return (new Promise((resolve, reject) =>
          directionsService.route(directionsAPIParams, (result, status) => {
            if (status === 'OK')
              resolve(result)
            else
              reject(status);
          })
        ))
          .then(result => // Map the result to a list of durations
            result.routes[0].legs.map(leg => leg.duration.value * 1000)
          )
          .then(durations => {
            // Update the timings on the simulated route
            var sum = 0;

            // Clone the route...
            var simulatedRoute = {
              ...context.state.crowdstartRoute,
              trips: [{
                ...context.state.crowdstartRoute.trips[0],
                tripStops: context.state.crowdstartRoute.trips[0].tripStops.map(ts => ({
                  ...ts
                }))
              }]
            }

            simulatedRoute.trips[0].tripStops[0].time = 0;
            // We set 1 minute to let bus slow down, drop/pick passengers, and drive again.
            var contingencyDelay = 60 * 1000;
            durations.forEach((d, i) => {
              sum += d + contingencyDelay;
              simulatedRoute.trips[0].tripStops[i + 1].time = sum;
            })

            // Let the user deal with it.
            context.commit('crowdstartRoute', simulatedRoute);
          })
      }
    }
  })

  const throttledHandler = _.throttle(() => {
    store.dispatch('fetchSimilarRequests')
    store.dispatch('processRequest')
  }, 300, {leading: false, trailing: true})

  store.watch(state => state.origin, throttledHandler)
  store.watch(state => state.destination, throttledHandler)
  store.watch(state => state.autogenerateSettings, () => {
    store.dispatch('fetchAutogeneratedRoutes')
  })

  store.commit('setProfile',
    {
      profile: JSON.parse(window.localStorage['profile'] || 'null'),
      idToken: window.localStorage['idToken'] || null
    });

  store.commit('setAdminProfile',
    {
      profile: JSON.parse(window.localStorage['adminProfile'] || 'null'),
      idToken: window.localStorage['adminIdToken'] || null
    });
  return store;
}
