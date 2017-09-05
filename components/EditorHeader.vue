<template>
  <header>
    <router-link :to="{path: '/'}">
      <img src="https://api.beeline.sg/companies/2/logo?height=80">
    </router-link>
    <div class="title"> Direct to your destination! </div>

    <div>
      <button v-if="!idToken" @click="showLoginDialog"><i class="mdi mdi-login" /></button>
      <button v-else @click="logout"><i class="mdi mdi-logout" /></button>
    </div>
  </header>
</template>

<style lang="scss">

header {
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: rgb(80, 54, 100);
  color: rgb(255, 231, 109);

  .title {
    flex: 1 1 auto;
    font-size: 50px;
  }
}

</style>
<script>
import {mapActions, mapState} from 'vuex'

export default {
  computed: {
    ...mapState('login', ['idToken']),
  },
  methods: {
    ...mapActions('login', ['showLoginDialog', 'logout']),
  }
}
</script>
