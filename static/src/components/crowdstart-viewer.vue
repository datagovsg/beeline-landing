<template>
  <div>
    <h4>{{index}}. {{crowdstart.name}}</h4>
    <div class="r">
      <div class="stops-list">
        <ol>
          <li v-for="stop in crowdstart.userSuggestedRouteStops" :key="stop.stop.description">
            <b>{{stop.arriveAt - 8 * 3600 * 1000 | formatTime}}</b>
            {{stop.stop.description}}
          </li>
        </ol>
      </div>
    </div>

    <!-- FIXME: This is not rendering, no idea why yet. -->
    <gmap-map class="gmap" :center="{lat: 1.38, lng: 103.8}" :zoom="12">
      <gmap-marker v-for="stop in crowdstart.userSuggestedRouteStops"
        :position="{lat: stop.stop.coordinates.coordinates[1], lng: stop.stop.coordinates.coordinates[0]}">
      </gmap-marker>
      <gmap-polyline v-if="crowdstart.path" :path="crowdstart.path">
      </gmap-polyline>
    </gmap-map>
  </div>
</template>

<script>
export default {
  props: ['crowdstart', 'index'],
  filters: require('../utils/filters').default,
}
</script>

<style scoped lang="scss">
.r {
  display: flex;

  .stops-list {
    flex: 1 0 auto;
  }
}
</style>
