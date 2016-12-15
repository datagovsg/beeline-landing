<template>
  <h2>Start a route</h2>
  Routes are generated from other users' submissions.

  <template v-if="proposedRoutes">
    Start with one of these routes!
    <proposed-route-viewer v-for="route in proposedRoutes"
      :route="route">
    </proposed-route-viewer>
  </template>
  <template v-else>
    ... loading ...
  </template>

  <button class="btn btn-default"
    @click="updateProposedRoutes">Suggest something else!</button>
</template>

<script>
</script>
