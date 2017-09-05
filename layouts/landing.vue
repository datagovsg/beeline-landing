<template>
  <div>
    <!-- Static navbar -->
    <LandingNav />
    <nuxt />
    <hr class="divider">
    <LandingFooter />
  </div>
</template>

<script>
import LandingNav from '~/components/landing/Nav.vue'
import LandingFooter from '~/components/landing/Footer.vue'

export default {
  components: {
    LandingNav, LandingFooter
  },
  head () {
    return {
      link: [
        {rel: 'stylesheet', href: '/css/animate.css'},
        {rel: 'stylesheet', href: '/css/style.css'},
      ],
      script: [
        // {src: 'js/wow.min.js'},
        {src: 'https://use.fontawesome.com/e1c177a50d.js'},
      ]
    }
  },
  mounted () {
    /* eslint-disable */
      (function(i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r;
        i[r] = i[r] || function() {
          (i[r].q = i[r].q || []).push(arguments)
        }, i[r].l = 1 * new Date();
        a = s.createElement(o),
          m = s.getElementsByTagName(o)[0];
        a.async = 1;
        a.src = g;
        m.parentNode.insertBefore(a, m)
      })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

      ga('create', 'UA-79537959-3', 'auto');
      ga('send', 'pageview');
  }
}
</script>
