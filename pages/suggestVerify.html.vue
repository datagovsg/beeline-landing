<template>
    <div class="container">
      <div class="suggest" @submit="submit" v-cloak id="submit-form">
        <h1 class="heading">Suggest a new route</h1>
        <p>
          Please check your email to verify your suggestion. Thank you. <br />The suggestion will expire in 24 hours if it is not verified.
          <br />
        </p>
        <p>
          <a href="/index.html" class="btn btn-primary back-to-home">Back to home</a>
        </p>
      </div>
    </div>
</template>

<script>
export default {
}
</script>
