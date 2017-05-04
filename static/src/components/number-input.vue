<template>
  <input type="number" :value="value" @input="updateValue" />
</template>

<script>

export default {
  props: ['value'],
  methods: {
    updateValue(e) {
      this.$emit('input', parseFloat(e.target.value))
    }
  }
}
</script>
