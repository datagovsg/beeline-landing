<template>
<select :value="value" @input="input">
  <option v-for="stop in stops" :value="stop.stop.description">
    {{stop.stop.description}}
  </option>
</select>
</template>
<script>
export default {
  props: ['value', 'stops'],
  methods: {
    input(event) {
      this.$emit('input', event.target.value)
    }
  }
}
</script>
