<template>
  <div class="route-display">
    <div class="route-label">{{route.label}}</div>
    <div class="route-logo">
      <CompanyLogo :companyId="route.transportCompanyId" height="50" />
    </div>
    <div class="route-details">
      <div><b>From</b> {{route.from}}</div>
      <div><b>To</b> {{route.to}}</div>
      ${{route.trips[0].price}}
    </div>
    <div class="extra">
      <i class="mdi mdi-dots-vertical"></i>

      <DropDown>
        <ul>
          <li>
            <router-link :to="{
              path: 'design/from_template',
              query: {routeId: route.id}
              }">
              Propose a different timing
            </router-link>
          </li>
        </ul>
      </DropDown>
    </div>
  </div>
</template>
<style lang="scss">
.route-display {
  margin: 1em;
  box-shadow: 2px 2px 10px rgba(128, 128, 128, 0.5);
  display: flex;

  & > .route-details {
    flex: 1 1 auto;
  }
}
</style>
<script>
export default {
  props: ['route']
}
</script>
