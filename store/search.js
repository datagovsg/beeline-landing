
export const state = () => ({
  origin: '',
  destination: '',
  arrivalTime: ''
})

export const mutations = {
  updateSearch(state, {field, value}) {
    state[field] = value
  }
}
