<template>
  <GmapMarker
    :icon="mapSettings.manWavingArmBlueIcon"
    :position="{lat: position.lat, lng: position.lng}"
    />
</template>

<script>
import mapSettings from '~/components/suggest/MapSettings'

export default {
  props: ['request', 'position'],

  data () {
    return {
      mapSettings,
    }
  },
}
</script>
