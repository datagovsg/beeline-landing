<template>
<select :value="value" @input="input">
  <option 
    v-for="minute in ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']"
    :value="minute">
    {{minute}}
  </option>
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
