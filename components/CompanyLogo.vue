<template>
  <img :src="`https://api.beeline.sg/companies/${companyId}/logo?height=${height}`"
    :style="{height: `${height}px`}"
    :alt="`FIXME:`"/>
</template>
<script>
export default {
  props: ['height', 'companyId']
}
</script>
