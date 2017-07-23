<template>
  <img src="/assets/spinner.svg" :style="{height: `${height}px`}" />
</template>
<script>
export default {
  props: {
    height: {
      default: '50'
    }
  }
}
</script>
