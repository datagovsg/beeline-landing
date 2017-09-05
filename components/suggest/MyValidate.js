/* eslint-disable */
export default {
  props: ['validateRule', 'required', 'validateValue'],
  data() {
    return {
      touched: false,
      childComponent: null,
      cachedValue: null,
    }
  },
  render(h) {
    return this.$slots.default[0];
  },
  watch: {
    touched() {
      this.emit()
    },
    valid() {
      this.emit()
    },
  },
  mounted() {
    this.childComponent = this.$children[0] ||
      this.$el;

    if (this.childComponent.$on) {
      this.childComponent.$on('focus', () => this.touched = true)
      this.childComponent.$on('input', (value) => this.cachedValue = value)

      if (this.childComponent.$el.addEventListener) {
        this.childComponent.$el.addEventListener('focus', () => this.touched = true)
      }
    } else if (this.childComponent.addEventListener) {
      this.childComponent.addEventListener('focus', () => this.touched = true)
      this.childComponent.addEventListener('input', () => {
        if (this.childComponent.type != 'checkbox') {
          this.cachedValue = this.childComponent.value
        }
      })
      this.childComponent.addEventListener('change', () => {
        if (this.childComponent.type == 'checkbox') {
          this.cachedValue = this.childComponent.checked
        }
      })
    }
  },
  created() {
    this.emit()
  },
  computed: {
    finalValidationValue() {
      var value1 = this.validateValue;
      var value3 = this.cachedValue;

      return value1 || value3;
    },
    valid() {
      return (!this.required || this.finalValidationValue) &&
        (!this.validateRule || this.validateRule(this.finalValidationValue))
    }
  },
  methods: {
    emit() {
      this.$emit('validation-changed', {
        touched: this.touched,
        valid: this.valid,
      });
    },
  },
}
