import Vue from 'vue'

Vue.directive('focus-placeholder', {
  bind(el, bind) {
    var originalPlaceholder = el.placeholder
    var focusPlaceholder = el.dataset.focusPlaceholder

    el.addEventListener('focus', () => {
      el.placeholder = focusPlaceholder
    })
    el.addEventListener('blur', () => {
      el.placeholder = originalPlaceholder
    })
  }
})
