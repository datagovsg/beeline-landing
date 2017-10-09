<template>
  <div>
    <!--
      Any emails in the code will be messed up by CloudFlare, and then Vue will
      choke because the DOM does not match the virtual DOM
    -->
    <!--email_off-->
    <!-- Static navbar -->
    <LandingNav />
    <nuxt :nuxtChildKey="$route.path" />
    <hr class="divider">
    <LandingFooter />
    <!--/email_off-->
  </div>
</template>

<style>
.vanish-enter-active, .vanish-leave-active {
  transition: all 0.3s;
}
.vanish-enter, .vanish-leave-to {
  max-height: 0;
  /*transform: scale(0, 0);*/
  opacity: 0;
}
.vanish-enter-to, .vanish-leave {
  max-height: 999px;
  /*transform: scale(1.0, 1.0);*/
  opacity: 1.0;
}
</style>

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
        {
          href: 'https://fonts.googleapis.com/css?family=Lato:400,300',
          rel: 'stylesheet',
          type: 'text/css'
        }
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
