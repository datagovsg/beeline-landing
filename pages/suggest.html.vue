<template>
  <form class="container suggest" @submit.prevent="submit" v-cloak id="submit-form">
    <div class="row">
      <h1 class="heading">Suggest a new route</h1>

      <!-- hmm... using events to pass data out? good idea? -->
      <transition name="vanish">
        <PreviousSuggestions v-if="auth.token"
            :token="auth.token"
            :suggestions="suggestions"
            @refresh_required="refreshPreviousSuggestions"
            @hover_suggestion="suggestionsDisplay.hover = $event"
            @click_suggestion="suggestionsDisplay.selected = $event; panToSuggestion($event)"
            />
      </transition>

      <!-- map start -->
      <div class="col-lg-7 col-md-6 col-sm-12 col-xs-12">
        <gmap-map :center="center" :zoom="zoom"
            class="gmap"
            @click="click" ref="map" :options="mapSettings.defaultMapOptions">
          <gmap-marker v-if="suggestion.origin" :position="suggestion.origin" label="S">
          </gmap-marker>
          <gmap-marker v-if="suggestion.destination" :position="suggestion.destination" label="E">
          </gmap-marker>
          <gmap-polyline v-if="path" :path="path">
          </gmap-polyline>
          <similar-requests :requests="similarRequests.requests"
            @hovered-on="similarRequests.hoveredRequest = $event">
          </similar-requests>

          <CurvedOD v-for="suggestion in suggestions"
            v-if="(!suggestionsDisplay.hover || suggestion.id !== suggestionsDisplay.hover.id) &&
              (!suggestionsDisplay.selected || suggestion.id !== suggestionsDisplay.selected.id)"
            :key="suggestion.id"
            :start="{lat: suggestion.board.coordinates[1], lng: suggestion.board.coordinates[0]}"
            :end="{lat: suggestion.alight.coordinates[1], lng: suggestion.alight.coordinates[0]}"
            :options="{
              icons: mapSettings.chevronIcons('#4b3863', 2),
              strokeColor: '#FF3863',
              strokeOpacity: 0.0,
              strokeWeight: 1.5,
              }"
            />
          <CurvedOD v-if="suggestionsDisplay.hover"
            :start="{lat: suggestionsDisplay.hover.board.coordinates[1], lng: suggestionsDisplay.hover.board.coordinates[0]}"
            :end="{lat: suggestionsDisplay.hover.alight.coordinates[1], lng: suggestionsDisplay.hover.alight.coordinates[0]}"
            :options="{
              icons: mapSettings.chevronIcons('#4b3863', 2.5),
              strokeColor: '#FF3863',
              strokeOpacity: 0.0,
              strokeWeight: 5,
              }"
            />
          <CurvedOD v-if="suggestionsDisplay.selected"
            :start="{lat: suggestionsDisplay.selected.board.coordinates[1], lng: suggestionsDisplay.selected.board.coordinates[0]}"
            :end="{lat: suggestionsDisplay.selected.alight.coordinates[1], lng: suggestionsDisplay.selected.alight.coordinates[0]}"
            :options="{
              icons: mapSettings.chevronIcons('#FF3863', 2.5),
              strokeColor: '#FF3863',
              strokeOpacity: 0.0,
              strokeWeight: 5,
              zIndex: 10
              }"
            />
          <gmap-marker v-if="suggestionsDisplay.selected"
            :position="{lat: suggestionsDisplay.selected.board.coordinates[1], lng: suggestionsDisplay.selected.board.coordinates[0]}"
            label="S">
          </gmap-marker>
          <gmap-marker v-if="suggestionsDisplay.selected"
            :position="{lat: suggestionsDisplay.selected.alight.coordinates[1], lng: suggestionsDisplay.selected.alight.coordinates[0]}"
            label="E">
          </gmap-marker>

          <div slot="visible">
            <div class="map-status-bar" v-show="similarRequests.hoveredRequest">
              <template v-if="similarRequests.hoveredRequest">
                {{similarRequests.hoveredRequest.email || '(anonymous)'}}
              </template>
            </div>
          </div>
        </gmap-map>
      </div>
      <!-- map ends -->

      <!-- form start -->
      <div class="col-lg-5 col-md-6 col-sm-12 col-xs-12">
        <div class="form-group">
          <label class="control-label" for="start-address">
            Start address
          </label>
          <my-validate
            :validate-value="suggestion.origin"
            :validate-rule="validLatLng"
            @validation-changed="validation.originValid = $event"
            :required="true"
          >
            <gmap-autocomplete type="text"
              placeholder="Street, Postal code, Building name, etc."
              class="form-control address-autocomplete"
              id="start-address"
              :value="suggestion.originText"
              :component-restrictions="{country: 'SG'}"
              @focus.native="focusIn('origin')"
              @place_changed="updatePlace"
              v-focus-placeholder
              data-focus-placeholder="Click on the map, or type the name of the place.">
            </gmap-autocomplete>
          </my-validate>
          <transition name="expand" css appear>
            <div class="alert alert-info" v-show="validation.originValid && validation.originValid.touched && !validation.originValid.valid">
              <i class="fa fa-info-circle"></i>
              <span class="small">Please enter a valid Singapore address.</span>
            </div>
          </transition>
        </div>

        <div class="form-group">
          <label class="control-label" for="end-address">
            End address
          </label>
          <my-validate
            :validate-value="suggestion.destination"
            :validate-rule="validLatLng"
            @validation-changed="validation.destinationValid = $event"
            :required="true"
          >
            <gmap-autocomplete type="text"
              id="end-address"
              placeholder="Street, Postal code, Building name, etc."
              class="form-control address-autocomplete"
              :value="suggestion.destinationText"
              @focus.native="focusIn('destination')"
              @place_changed="updatePlace"
              :component-restrictions="{country: 'SG'}"
              v-focus-placeholder
              data-focus-placeholder="Click on the map, or type the name of the place.">
            </gmap-autocomplete>
          </my-validate>
          <transition name="expand">
            <div class="alert alert-info" v-show="validation.destinationValid && validation.destinationValid.touched && !validation.destinationValid.valid">
              <i class="fa fa-info-circle"></i> <span class="small">Please enter a valid Singapore address.</span>
            </div>
          </transition>
        </div>

        <div class="form-group"
             v-if="suggestion.origin && suggestion.destination"
             v-show="runningRoutes.length > 0">
          {{runningRoutes.length}} routes running nearby! Book now!
          <p class="small" v-for="route in runningRoutes">
            <a target="new"
               :href="'https://app.beeline.sg/#/tabs/booking/'+route.id+'/stops'">
              ({{departureTimeFor(route)}}) {{route.from}}<br/>
              ({{arrivalTimeFor(route)}}) {{route.to}}<br/>
            </a>
          </p>
        </div>

        <div class="form-group"
             v-if="suggestion.origin && suggestion.destination"
             v-show="crowdstartedRoutes.length > 0">
          {{crowdstartedRoutes.length}} routes similar to your suggestion are being crowdstarted!
          <p class="small" v-for="route in crowdstartedRoutes">
            <a target="new"
               :href="'https://app.beeline.sg/#/tabs/crowdstart/'+route.id+'/detail'">
              ({{departureTimeFor(route)}}) {{route.from}}<br/>
              ({{arrivalTimeFor(route)}}) {{route.to}}<br/>
            </a>
          </p>

          <p>A route will go live once enough people back it!</p>
        </div>

        <div class="form-group" v-if="suggestion.origin && suggestion.destination">
          There are {{similarRequests.requests.length}} suggestion(s) similar to yours.

          <transition name="expand">
            <div v-show="similarRequests.requests.length > 0">
              <requests-time-histogram :requests="similarRequests.requests"
                :width="320" :height="320">
              </requests-time-histogram>
            </div>
          </transition>

          <!-- <p>(Hint: once there are 15 similar suggestions, we can begin to
          crowdstart a route!)</p> -->
        </div>

        <div class="form-group">
          <label class="control-label" for="arrival-time">
            Time at Destination
          </label>
          <!-- workaround for weird bug where the <select> option has
              to be selected twice -->
          <!-- <my-validate
            :required="true"
            @validation-changed="validation.time = $event"
          > -->
          <select id="arrival-time"
            class="form-control" v-model="arrivalTime"
            @focus="(validation.time.touched = true) && zoomOut()">
            <option disabled value="">Arrival Time at Destination</option>
            <optgroup v-for="group in TimeGroups" :label="group.label">
              <option :value="dateformat(time, 'HH:MM', true)" v-for="time in group.times">
                {{dateformat(time, 'h:MM TT', true)}}
              </option>
            </optgroup>
          </select>
          <!-- </my-validate> -->
          <transition name="expand">
            <!-- <div class="alert alert-info" v-show="validation.time && validation.time.touched && !validation.time.valid"> -->
            <div class="alert alert-info" v-show="!arrivalTime">
              <i class="fa fa-info-circle"></i>
              <span class="small">
                Please select the time you want to arrive at your destination.
              </span>
            </div>
          </transition>
        </div>

        <div class="form-group">
          <div>
            <label class="small">
              <my-validate
                :required="true"
                @validation-changed="validation.agreeTerms = $event"
              >
                <input type="checkbox" v-model="agreeTerms">
              </my-validate>
              Yes, I read and agree to Beeline's <a class="btn-link" href="privacy_policy.html" target="_blank">Privacy Policy</a> and <a class="btn-link" href="terms_of_use.html" target="_blank">Terms of use</a>.
            </label>
          </div>
          <transition name="expand" css appear>
            <div class="alert alert-info" v-show="validation.agreeTerms && !validation.agreeTerms.valid">
              <i class="fa fa-info-circle"></i> <span class="small"> Please read and agree to the terms if you want to submit a route suggestions.</span>
            </div>
          </transition>
        </div>
        <hr class="suggest">
        <div class="form-group" v-if="!auth.email">
          You need to verify your email in order to proceed.
          <div class="text-center">
            <button class="btn btn-default" @click="showLogin" type="button">
              Verify my email
            </button>
          </div>
        </div>

        <transition name="expand">
          <div class="form-group" v-show="noVerification || auth.token">
            <label>
              Email Address
            </label>

            <my-validate
              :required="true"
              :validate-rule="isEmail"
              @validation-changed="validation.email = $event"
            >
              <input type="email" class="form-control" v-model="auth.email"
              placeholder="Your Email Address" :disabled="auth.token">
            </my-validate>
            <transition name="expand">
              <div class="alert alert-info" v-show="validation.email && validation.email.touched && !validation.email.valid">
                <i class="fa fa-info-circle"></i>
                <span class="small">Please enter a valid email address.</span>
              </div>
            </transition>
          </div>
        </transition>

        <div v-if="auth.token">
          <button class="btn btn-default" @click="auth.token = null" type="button">
            Use another email address
          </button>
        </div>

        <div class="text-center">
          <button type="submit" class="btn btn-primary btn-lg submit" :disabled="!formValid">
            Submit Route Suggestion
          </button>
        </div>
        <!-- END: Authentication providers -->
      </div>
    </div>

    <div class="modal fade" tabindex="-1" role="dialog" id="submitted-dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 class="modal-title">Suggestion submitted</h4>
          </div>
          <div class="modal-body">
            <p v-if="auth.token">
              Thank you. Your suggestion has been submitted!
            </p>
            <p v-else>
              Thank you. Your suggestion has been received! We will add it to our suggestions database once you have verified your email address. Please check your email inbox for further instructions.
            </p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default" data-dismiss="modal">
              Continue
            </button>
          </div>
        </div>
        <!-- /.modal-content -->
      </div>
      <!-- /.modal-dialog -->
    </div>
    <!-- /.modal -->

    <div class="modal fade" tabindex="-1" role="dialog" id="submitted-error-dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 class="modal-title">Error submitting suggestion</h4>
          </div>
          <div class="modal-body">
            <p>Sorry, there was a server error. Please try again later.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default" data-dismiss="modal">
              Back
            </button>
          </div>
        </div>
        <!-- /.modal-content -->
      </div>
      <!-- /.modal-dialog -->
    </div>
    <!-- /.modal -->
  </form>
</template>

<style>
label.control-label {
  display: block;
}
</style>

<script>
import SimilarRequests from '~/components/suggest/SimilarRequests'
import RequestsTimeHistogram from '~/components/suggest/RequestsTimeHistogram'
import PreviousSuggestions from '~/components/suggest/PreviousSuggestions'
import CurvedOD from '~/components/suggest/CurvedOD'
import MyValidate from '~/components/suggest/MyValidate'
import MapSettings from '~/components/suggest/MapSettings'
import RequiresAuth from '~/mixins/RequiresAuth'
import _ from 'lodash'
import querystring from 'querystring'
import axios from 'axios'
import * as VueGoogleMaps from '~/node_modules/vue2-google-maps'
import $ from 'jquery'
import dateformat from 'dateformat'
import {isWithinReach} from '~/components/suggest/latlngDistance'

const INIT = {
  zoom: 11,
  center: {lat: 1.38, lng: 103.8}
}

const allCrowdstartedRoutes = axios.get('https://api.beeline.sg/crowdstart/status')
 .then(r => r.data)
 .then(rs => {
   for (let route of rs) {
     for (let trip of route.trips) {
       trip.tripStops = _.sortBy(trip.tripStops, 'time')
     }
   }
   rs.trips = _.sortBy(rs.trips, 'date')
   return rs
 })

export default {
  layout: 'landing',
  components: {
    RequestsTimeHistogram,
    SimilarRequests,
    MyValidate,
    PreviousSuggestions,
    CurvedOD
  },
  mixins: [RequiresAuth],
  head () {
    return {
      meta: [
        {property: 'og:title', content: `Beeline.sg -- Suggest a Route`},
        {property: 'og:type', content: 'article'},
        {property: 'og:url', content: `https://www.beeline.sg${this.$route.fullPath}`},
        {property: 'og:image', content: 'https://www.beeline.sg/images/feature_mainBeeline.png'},
        {property: 'og:description', content: `You suggest, we crowdstart`},
      ]
    }
  },
  data() {
    return {
      Singapore: {
        south: 1.199038,
        west: 103.591472,
        north: 1.522356,
        east: 104.047404
      },
      TimeGroups: [
        {
          label: 'AM',
          times: [
            6.5 * 3600e3,
            7.0 * 3600e3,
            7.5 * 3600e3,
            8.0 * 3600e3,
            8.5 * 3600e3,
            9.0 * 3600e3,
            9.5 * 3600e3,
            10.0 * 3600e3,
            10.5 * 3600e3,
          ],
        },
        {
          label: 'PM',
          times: [
            17.0 * 3600e3,
            17.5 * 3600e3,
            18.0 * 3600e3,
            18.5 * 3600e3,
            19.0 * 3600e3,
            19.5 * 3600e3,
            20.0 * 3600e3,
            20.5 * 3600e3,
            21.0 * 3600e3,
            21.5 * 3600e3,
          ]
        }
      ],
      maxDistance: 1000,
      center: INIT.center,
      zoom: INIT.zoom,
      suggestion: {
        origin: null,
        originPlace: undefined,
        destination: null,
        destinationPlace: undefined,
        originText: '',
        destinationText: '',
        referrer: null
      },
      arrivalTime: '',
      noVerification: false,
      agreeTerms: false,
      focusAt: null,
      lock: null,
      mapSettings: MapSettings,
      similarRequests: {
        requests: [],
        hoveredRequest: null,
      },
      runningRoutes: [],
      crowdstartedRoutes: [],
      validation: {
        originValid: null,
        destinationValid: null,
        time: {
          touched: false,
          valid: false,
        },
        agreeTerms: null,
        email: null,
      },
      isEmail(str) {
        return /.+@.+\..+/i.test(str)
      },

      suggestions: null,
      suggestionsDisplay: {
        hover: null,
        selected: null,
      }
    }
  },
  computed: {
    formValid() {
      return _.every([
        this.suggestion.origin,
        this.suggestion.destination,
        this.auth.email,
        this.arrivalTime,
        this.agreeTerms
      ])
    },
    path() {
      if (_.get(this.suggestion, 'origin') &&
          _.get(this.suggestion, 'destination')) {
        return [
          this.suggestion.origin,
          this.suggestion.destination
        ]
      }
      return false
    },

    requestOriginDestination () {
      return [this.suggestion.origin, this.suggestion.destination]
    },
  },
  watch: {
    'suggestion.originPlace'(place) {
      if (place && place.geometry) {
        this.suggestion.origin = place.geometry.location
        this.zoomIn(this.suggestion.origin)
      } else {
        console.log(place)
      }
    },
    'suggestion.destinationPlace'(place) {
      if (place && place.geometry) {
        this.suggestion.destination = place.geometry.location
        this.zoomIn(this.suggestion.destination)
      } else {
        console.log(place)
      }
    },
    requestOriginDestination () {
      this.updateHash()
      this.updateSimilarRequests()
      this.updateRunningRoutes()
      this.updateCrowdstartedRoutes()
    },

    'auth.token' () {
      this.refreshPreviousSuggestions()
    }
  },
  created() {
    this.geocoderPromise = VueGoogleMaps.loaded.then(() => {
      return new google.maps.Geocoder()
    })
  },
  async mounted() {
    // Set up bootstrap
    window.jQuery = $
    require('bootstrap')

    // Set up hash
    updateHash(this)
  },
  methods: {
    dateformat,
    submit(event) {
      /* eslint-disable */
      // compute time as seconds past midnight
      var splitTime = this.arrivalTime.split(':')
      var time = splitTime[0] * 3600e3 + splitTime[1] * 60e3

      var suggestionData = {
        time: time,
        boardLat: this.suggestion.origin.lat(),
        boardLon: this.suggestion.origin.lng(),
        alightLat: this.suggestion.destination.lat(),
        alightLon: this.suggestion.destination.lng(),
        email: this.auth.email,
        emailVerification: {
          type: 'auth0',
          data: this.auth.token
        }
      }
      if (this.suggestion.referrer) {
        Object.assign(suggestionData, {
          referrer: this.suggestion.referrer
        })
      }

      axios.post('https://api.beeline.sg/suggestions/web', suggestionData)
      .then((success) => {
        this.refreshPreviousSuggestions()

        const hash = this.getHash()

        $('#submitted-dialog').modal('show')
          .on('hidden.bs.modal', () => {
            if (this.auth.token) {
              // No need to redirect... just reload the suggestions
              // window.location.href = `/suggestSubmitted.html#${hash}`
            } else {
              window.location.href = `/suggestVerify.html#${hash}`
            }
          })

        this.time = null
        this.suggestion = {
          origin: null,
          destination: null,
          originPlace: null,
          destinationPlace: null,
          referrer: null
        }
      }, (error) => {
        $('#submitted-error-dialog').modal('show')
      })
    },
    updateSimilarRequests() {
      if (this.suggestion.origin && this.suggestion.destination) {
        axios.get('https://api.beeline.sg/suggestions/web/similar?' + querystring.stringify({
          startLat: this.suggestion.origin.lat(),
          startLng: this.suggestion.origin.lng(),
          endLat: this.suggestion.destination.lat(),
          endLng: this.suggestion.destination.lng(),
          startDistance: this.maxDistance,
          endDistance: this.maxDistance,
        }))
        .then(r => r.data)
        .then(s => this.similarRequests.requests = s)
        .catch(err => console.error(err))
      }
    },
    updateRunningRoutes() {
      if (this.suggestion.origin && this.suggestion.destination) {
        axios.get('https://api.beeline.sg/routes/search_by_latlon?' + querystring.stringify({
          startLat: this.suggestion.origin.lat(),
          startLng: this.suggestion.origin.lng(),
          endLat: this.suggestion.destination.lat(),
          endLng: this.suggestion.destination.lng(),
          maxDistance: this.maxDistance,
          tags: JSON.stringify(['public']),
        }))
        .then(r => r.data)
        .then(rs => {
          for (let route of rs) {
            for (let trip of route.trips) {
              trip.tripStops = _.sortBy(trip.tripStops, 'time')
            }
          }
          rs.trips = _.sortBy(rs.trips, 'date')
          this.runningRoutes = rs
        })
        .catch(err => console.error(err))
      }
    },
    updateCrowdstartedRoutes() {
      const origin = this.suggestion.origin
      const destination = this.suggestion.destination
      if (origin && destination) {
        allCrowdstartedRoutes.then(routes => routes.filter(route =>
          _.some(
            route.trips[0].tripStops,
            ts => ts.canBoard && isWithinReach(ts, origin, this.maxDistance)
          ) &&
          _.some(
            route.trips[0].tripStops,
            ts => ts.canAlight && isWithinReach(ts, destination, this.maxDistance)
          )
        ))
        .then(filteredRoutes => {
          this.crowdstartedRoutes = filteredRoutes
        })
        .catch(err => console.error(err))
      }
    },
    updateHash() {
      window.location.hash = '#' + this.getHash()
    },
    getHash() {
      return querystring.stringify(_.assign({},
        this.suggestion.origin ? {
          originLat: this.suggestion.origin.lat(),
          originLng: this.suggestion.origin.lng(),
        } : {},
        this.suggestion.destination ? {
          destinationLat: this.suggestion.destination.lat(),
          destinationLng: this.suggestion.destination.lng(),
        } : {}
      ))
    },
    departureTimeFor(route) {
      var tripStops = _.sortBy(route.trips[0].tripStops, ts => ts.time)
      return dateformat(new Date(tripStops[0].time).getTime() - 8*3600e3, 'HH:MM', true)
    },
    arrivalTimeFor(route) {
      var tripStops = _.sortBy(route.trips[0].tripStops, ts => ts.time)
      return dateformat(new Date(tripStops[tripStops.length - 1].time).getTime() - 8*3600e3, 'HH:MM', true)
    },
    click(event) {
      if (this.focusAt) {
        this.setAndGeocodeLocation(this.focusAt, event.latLng)
      }
    },
    setAndGeocodeLocation(focusAt, latLng) {
      this.suggestion[focusAt] = latLng

      // Reverse geocode...
      this.geocoderPromise.then((geocoder) => {
        geocoder.geocode({location: latLng}, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK) {
            if (results[0]) {
              this.$set(this.suggestion, `${focusAt}Text`,
                        results[0].formatted_address)
            }
          }
        })
      })
    },
    zoomIn(where) {
      this.center = where
      this.zoom = 15
    },
    zoomOut() {
      if (this.suggestion.origin && this.suggestion.destination) {
        var bounds = new google.maps.LatLngBounds()
        bounds.extend(this.suggestion.origin)
        bounds.extend(this.suggestion.destination)
        this.$refs.map.fitBounds(bounds)
      }
      else {
        this.center = INIT.center
        this.zoom = INIT.zoom
      }
    },
    focusIn(which) {
      this.focusAt = which
    },
    focusOut(which) {
      if (this.focusAt === which) {
        this.focusAt = null
      }
    },
    validLatLng(latlng) {
      return latlng &&
          (latlng.lat() >= 1 && latlng.lat() <= 2) &&
          (latlng.lng() >= 100 && latlng.lng() <= 105)
    },
    updatePlace(place) {
      this.suggestion[this.focusAt] = place.geometry.location
    },
    setReferrer(referrer) {
      this.suggestion.referrer = referrer
    },


    refreshPreviousSuggestions () {
      if (this.auth.token) {
        return axios.get('https://api.beeline.sg/suggestions/web', {
          headers: {
            authorization: `Bearer ${this.auth.token}`
          }
        })
        .then((s) => {
          this.suggestions = s.data
          /* If the selected / hovered entry was deleted, then we must also
          stop showing it*/
          this.suggestionsDisplay.selected = this.suggestionsDisplay.selected
            && s.data.find(s => s.id === this.suggestionsDisplay.selected.id)
          this.suggestionsDisplay.hover = this.suggestionsDisplay.selected
            && s.data.find(s => s.id === this.suggestionsDisplay.selected.id)
        })
        .catch(() => {
          this.suggestions = false
          this.suggestionsDisplay.selected = null
          this.suggestionsDisplay.hover = null
        })
      } else {
        this.suggestions = []
        this.suggestionsDisplay.selected = null
        this.suggestionsDisplay.hover = null
      }
    },
    panToSuggestion (s) {
      if (this.$refs.map) {
        const bounds = new google.maps.LatLngBounds()
        bounds.extend({
          lat: s.board.coordinates[1],
          lng: s.board.coordinates[0],
        })
        bounds.extend({
          lat: s.alight.coordinates[1],
          lng: s.alight.coordinates[0],
        })
        this.$refs.map.fitBounds(bounds)
      }
    }
  }
}

function updateHash (vue) {
  var hash = window.location.hash;
  if (!hash) return;
  hash = hash.substr(1);
  hash = querystring.parse(hash);

  VueGoogleMaps.loaded.then(() => {
    if (hash.originLat && hash.originLng) {
      vue.setAndGeocodeLocation('origin', new google.maps.LatLng({
        lat: parseFloat(hash.originLat),
        lng: parseFloat(hash.originLng)
      }))
    }

    if (hash.destinationLat && hash.destinationLng) {
      vue.setAndGeocodeLocation('destination', new google.maps.LatLng({
        lat: parseFloat(hash.destinationLat),
        lng: parseFloat(hash.destinationLng)
      }))
    }
  });

  if(hash.referrer) {
    vue.setReferrer(hash.referrer)
  }
}

</script>
