<template>
  <div class="input-group">
    <input type="text" :value="link" ref="textbox" class="form-control" />
    <span class="input-group-btn">
      <button @click="copyToClipboard" class="btn btn-primary">
        <i class="glyphicon glyphicon-copy"></i>
      </button>
    </span>
  </div>
</template>

<script>

export default {
  props: ['link'],

  methods: {
    copyToClipboard () {
      this.$refs.textbox.select()
      document.execCommand('copy')
    },
  }
}
</script>
