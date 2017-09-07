<template>
  <transition-group name="vanish-on-delete" :tag="tag">
    <slot />
  </transition-group>
</template>
<script>
export default { props: ['tag'] }
</script>
<style>

.vanish-on-delete-enter-active, .vanish-on-delete-leave-active {
  transition: all 0.3s;
}

.vanish-on-delete-enter, .vanish-on-delete-leave-to {
  opacity: 0;
  transform: scaleY(0);
}
.vanish-on-delete-enter-to, .vanish-on-delete-leave {
  opacity: 1.0;
  transform: scaleY(1.0);
}
</style>
