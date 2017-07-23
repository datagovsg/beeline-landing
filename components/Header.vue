<template>
  <header>
    <router-link :to="{path: '/'}">
      <img src="https://api.beeline.sg/companies/2/logo?height=80">
    </router-link>
    <div class="title"> Direct to your destination! </div>
  </header>
</template>

<style lang="scss">

header {
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: rgb(80, 54, 100);
  color: rgb(255, 231, 109);

  .title {
    font-size: 50px;
  }
}

</style>
