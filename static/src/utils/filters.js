import moment from 'moment';

export default {
  formatTime(s) {
    return moment(s).utcOffset(480).format('h:mm a')
  },

  formatDateTime(s) {
    return moment(s).utcOffset(480).format('D MMMM YYYY, h:mm a')
  }
}
