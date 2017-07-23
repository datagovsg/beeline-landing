<template>
  <div class="from-template">
    <section>
      <label>Try to arrive by</label>
      <select>
        <option v-for="arriveTime in arriveTimes" :value="arriveTime">{{arriveTime}}</option>
      </select>
    </section>

    <section class="columns">
      <div class="stops">
        <h2>Boarding Stops</h2>
        <ul class="stops-list">
          <li v-for="(stop, index) in boardingStops">
            {{index + 1}}.
            {{stop.description}}
          </li>
        </ul>
      </div>

      <div class="stops">
        <h2>Alighting Stops</h2>
        <ul class="stops-list">
          <li v-for="(stop, index) in alightingStops">
            {{index + 1}}.
            {{stop.description}}
          </li>
        </ul>
      </div>
    </section>
  </div>

</template>
<style lang="scss">
.columns {
  display: flex;
  justify-content: center;
  flex-direction: row;
}
.stops {
  width: 400px;
}
ul.stops-list {
  &, & > li {margin: 0; padding: 0; list-style-type: none}

  & > li {
    margin: 0.5em;
    padding: 1em;
    box-shadow: 2px 2px 10px rgba(128, 128, 128, 0.5);
  }
}
</style>
<script>
import axios from 'axios'
import querystring from 'querystring'
import _ from 'lodash'
import {mapGetters} from 'vuex'

export default {
  data () {
    return {
      route: null,
      arriveTimes: [
        ' 8:00 AM',
        ' 8:15 AM',
        ' 8:30 AM',
        ' 8:45 AM',
        ' 9:00 AM',
        ' 9:15 AM',
      ],
    }
  },
  computed: {
    ...mapGetters('shared', 'autogenerateStops'),
    routePromise () {
      if (this.$route.query.routeId) {
        return axios.get(`https://api.beeline.sg/routes/${this.$route.query.routeId}?` + querystring.stringify({
          include_trips: true,
          start_date: Date.now(),
        }))
          .then((response) => response.data)
      } else {
        return null
      }
    },
    /**
      Harmonize the representation of stops
    **/
    stopsFromRoute () {
      const tripStops = _.sortBy(_.get(this.route, 'trips.0.tripStops'), 'time')
      if (!tripStops) {
        return null
      } else {
        return tripStops.map(ts => ({
          latLng: {
            lat: ts.stop.coordinates.coordinates[1],
            lng: ts.stop.coordinates.coordinates[0],
          },
          description: ts.stop.description,
          type: ts.canBoard ? 'boarding' : 'alighting'
        }))
      }
    },
    stopsFromParsed () {
      if (!this.parsedStops) {
        return null
      } else {
        return this.parsedStops.map(([lat, lng]) => ({
          latLng: {lat, lng},
          description: `${lat}, ${lng}`, // FIXME: lookup the list of stops
          type: 'boarding'
        }))
      }
    },
    stops () {
      return this.stopsFromRoute || this.stopsFromParsed
    },
    boardingStops () {
      return this.stops.filter(s => s.type === 'boarding')
    },
    alightingStops () {
      return this.stops.filter(s => s.type !== 'boarding')
    },
    parsedStops () {
      if (!this.$route.query.stops) {
        return null
      } else {
        const latlngs = this.$route.query.stops.split(';')
          .map(latlng => latlng.split(',').map(x => parseInt(x)))
        return latlngs
      }
    }
  },
  watch: {
    routePromise: {
      immediate: true,
      async handler(p) {
        if (p) {
          this.route = await p
        } else {
          this.route = null
        }
      }
    }
  }
}
</script>
