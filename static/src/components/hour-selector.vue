<template>
<select :value="value" @input="input">
  <optgroup label="AM">
    <option value="06">6</option>
    <option value="07">7</option>
    <option value="08">8</option>
    <option value="09">9</option>
  </optgroup>
  <optgroup label="PM">
    <option value="17">5</option>
    <option value="18">6</option>
    <option value="19">7</option>
    <option value="20">8</option>
  </optgroup>
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
