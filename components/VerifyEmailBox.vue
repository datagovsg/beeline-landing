<template>
  <div v-if="state === 0">
    You need to verify your email address in order to proceed.
    <button class="btn btn-primary" @click="auth.showLogin" type="button">
      Verify my email with Google / Facebook
    </button>
    <button class="btn btn-default" @click="setState(1)" type="button">
      Verify my email with a code
    </button>
  </div>
  <div v-else-if="state === 1">
    Enter your email address:
    <div class="input-group">
      <input type="email" class="form-control" v-model="email" placeholder="e.g. john@example.com"
        ref="emailBox" />
      <span class="input-group-btn">
        <button class="btn btn-default" @click="sendToEmail" type="button">
          Send me a code
        </button>
      </span>
    </div>
    <br/>
    <a href="#" @click.prevent="setState(0)">Change verification method</a>
  </div>
  <div v-else-if="state === 2">
    Please enter the code sent to your email address ({{ email }}).
    <br/>
    <div class="input-group form-inline">
      <input type="tel" class="form-control" v-model="code" ref="codeBox" placeholder="e.g. 123456"/>
      <span class="input-group-btn">
        <button class="btn btn-default" @click="verifyEmail" type="button">
          Verify
        </button>
      </span>
    </div>
    <transition name="expand">
      <div v-if="verifyError" class="alert alert-warning">
        {{verifyError}}
      </div>
    </transition>
    <br/>
    <a href="#" @click.prevent="setState(1)">Change email address</a>
  </div>
</template>

<script>
import RequiresAuth from '../mixins/RequiresAuth'

const STATE_INITIAL = 0
const STATE_EMAIL = 1
const STATE_CODE = 2

export default {
  data () {
    return {
      state: STATE_INITIAL,
      email: '',
      code: '',
      verifyError: null,
    }
  },
  mixins: [RequiresAuth],
  methods: {
    setState (nextState) {
      this.state = nextState
      if (nextState === STATE_EMAIL) {
        this.$nextTick(() => this.$refs.emailBox.focus())
      } else if (nextState === STATE_CODE) {
        this.$nextTick(() => this.$refs.codeBox.focus())
      } else {
        throw new Error(`Unknown state transition from ${this.state} to ${nextState}`)
      }
    },

    sendToEmail () {
      this.auth.showLoginPasswordless(this.email)
        .then(() => {
          this.setState(STATE_CODE)
        })
    },

    verifyEmail () {
      this.auth.verifyPasswordless(this.email, this.code)
        .then(() => {
          this.verifyError = null
        })
        .catch((err) => {
          this.verifyError = 'Your email could not be verified'
          console.error(err)
        })
    }
  }
}
</script>
