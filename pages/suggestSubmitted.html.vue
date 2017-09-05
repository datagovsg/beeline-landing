<template>
    <div class="container suggest" v-cloak id="submit-form">
        <h1 class="heading">Suggest a new route</h1>
        <p>
          Thank you! Your suggestion has been submitted.
        </p>

        <div id="share-link-section">
          <hr/>
          <p>
            Share your suggestion:
          </p>

          <p class="form-inline">
            <textarea class="form-control" type="text" id="suggestion-link"
              v-model="shareLink"></textarea>
            <button class="btn share-suggestion-button" data-clipboard-target="#suggestion-link">
              <span class="glyphicon glyphicon-copy"></span>
            </button>
          </p>
        </div>

        <p>

          <a href="/index.html" class="btn btn-primary back-to-home">Back to home</a>
        </p>
    </div>
</template>

<script>
import querystring from 'querystring'

export default {
  layout: 'landing',
  head () {
    return {
      script: [
        {src: 'https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/1.6.0/clipboard.min.js'},
      ]
    }
  },
  data() {
    return {
      hash: null,
      shareLink: '',
    }
  },
  mounted () {
    try {
      if (window.location.hash) {
        this.hash = querystring.parse(window.location.hash.replace(/^#/, ''))
        this.shareLink = `https://www.beeline.sg/suggest.html#` +
          querystring.stringify(this.hash)
      }
    } catch (err) {}

    if (typeof Clipboard !== 'undefined') {
      // eslint-disable-next-line
      new Clipboard('.share-suggestion-button')
    }
  }
}
</script>
