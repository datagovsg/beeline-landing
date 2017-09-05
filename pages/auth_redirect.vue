<script>
import {getLock, getLockPromise} from '~/plugins/lock'
import {mapMutations} from 'vuex'

export default {
  mounted () {
    getLock()
    getLockPromise().then((result) => {
      this.updateWithResult(result)
      window.location.href = result.state
    })
  },
  render () {
    return ''
  },
  methods: {
    ...mapMutations('login', ['updateWithResult']),
  }
}

</script>
