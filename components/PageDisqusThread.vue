<template>
  <div id="disqus_thread"></div>
</template>

<script>
/* eslint-disable */
/**
*  RECOMMENDED CONFIGURATION VARIABLES: EDIT AND UNCOMMENT THE SECTION BELOW TO INSERT DYNAMIC VALUES FROM YOUR PLATFORM OR CMS.
*  LEARN WHY DEFINING THESE VARIABLES IS IMPORTANT: https://disqus.com/admin/universalcode/#configuration-variables*/

export default {
  mounted () {
    window.disqus_config = function () {
      this.page.url = 'https://www.beeline.sg' + this.$route.fullPath;
      this.page.identifier = this.$route.path;
    }

    if (typeof DISQUS !== 'undefined') {
      /* If disqus has already been loaded, reset it */
      /** Reference: https://help.disqus.com/customer/portal/articles/472107-using-disqus-on-ajax-sites **/
      DISQUS.reset({
        reload: true,
        config: window.disqus_config
      })
    }

    if (!window.disqusLoaded) {
      loadDisqus()
      window.disqusLoaded = true
    }
  }
}

const loadDisqus = function() { // DON'T EDIT BELOW THIS LINE
  var d = document, s = d.createElement('script');
  s.src = 'https://beeline-sg.disqus.com/embed.js';
  s.setAttribute('data-timestamp', +new Date());
  (d.head || d.body).appendChild(s);
};
</script>
