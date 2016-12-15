<template>
  <div>
    <p>
      <b>{{route.from}}</b> to <b>{{route.to}}</b>
    </p>

    Arriving at {{route.time}}
  </div>
</template>

<script>
import vue from 'vue';

export default {
  props: ['route'],
  data() {

  }
}
</script>
