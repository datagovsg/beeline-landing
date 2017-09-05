<template>
  <div>
    <EditorHeader />
    <SearchBar />
    <nuxt/>
  </div>
</template>
<script>
import {mapMutations} from 'vuex'
import EditorHeader from '~/components/EditorHeader'
import SearchBar from '~/components/SearchBar'

export default {
  components: {
    EditorHeader, SearchBar,
  },
  mounted () {
    this.updateWithResult({
      idToken: window.localStorage.idToken,
      refreshToken: window.localStorage.refreshToken,
    })
  },
  methods: {
    ...mapMutations('login', ['updateWithResult']),
  }
}
</script>
<style>
html
{
  font-family: "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}
*, *:before, *:after
{
  box-sizing: border-box;
  margin: 0;
}
</style>
