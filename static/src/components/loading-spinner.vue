<template>
  <img src="/static/img/loading.svg"
    :style="style"
    class="loading-spinner" />
</template>
<script>
export default {
  props: ['type', 'show'],
  computed: {
    style() {
      if (this.show) {
        return {}
      }
      else if (this.type === 'hide') {
        return {visibility: 'hidden'}
      } else {
        return {display: 'none'}
      }
    }
  }
}
</script>
