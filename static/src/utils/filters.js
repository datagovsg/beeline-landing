import moment from 'moment';

export default {
  formatTime(s) {
    return moment(s).utcOffset(480).format('h:mm a')
  }
}
