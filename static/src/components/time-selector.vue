<template>
<select :value="value" @input="input">
  <option value="07:45">07:45</option>
  <option value="08:00">08:00</option>
  <option value="08:15">08:15</option>
  <option value="08:30">08:30</option>
  <option value="08:45">08:45</option>
  <option value="09:00">09:00</option>
</select>
</template>
<script>
export default {
  props: ['value'],
  methods: {
    input(event) {
      this.$emit('input', event.target.value)
    }
  }
}
</script>
