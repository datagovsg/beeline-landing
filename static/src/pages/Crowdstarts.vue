<template>
  <div>
    <template v-if="crowdstarts">
      <crowdstart-viewer v-for="(crowdstart, index) in crowdstarts"
        :key="crowdstart.id"
        :crowdstart="crowdstart" :index="index + 1">
      </crowdstart-viewer>
    </template>
    <template v-else>
      You are not logged in
    </template>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import CrowdstartViewer from '../components/crowdstart-viewer.vue'

export default {
  components: {
    CrowdstartViewer,
  },
  data() {
    return {
    }
  },
  watch: {
    idToken: {
      immediate: true,
      handler(v) {
        this.fetchCrowdstarts()
      }
    }
  },
  computed: {
    ...mapState(['crowdstarts']),
  },
  methods: {
    ...mapActions(['fetchCrowdstarts']),
  }
}
</script>