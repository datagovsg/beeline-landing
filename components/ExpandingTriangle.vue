<template>
<span class="mdi mdi-triangle expanding-triangle"
  :class="{active}"></span>
</template>
<script>
export default {
  props: ['active']
}
</script>
<style>
.expanding-triangle {
  transition: transform 0.3s;
  transform-origin: center;
  display: inline-block;
}
.expanding-triangle.active {
  transform: rotate(180deg);
}
.expanding-triangle:not(.active) {
  transform: rotate(90deg);
}
</style>
