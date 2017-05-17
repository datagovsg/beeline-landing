import moment from 'moment';

export default {
  formatTime(s) {
    return moment(s).utcOffset(480).format('h:mm a')
  },

  formatDateTime(s) {
    return moment(s).utcOffset(480).format('D MMMM YYYY, h:mm a')
  }
}

export function getMsSinceMidnight(msSinceEpoch) {
  var dateTime = new Date(msSinceEpoch);
  var dateTimeCopy = new Date(dateTime);
  return dateTime - dateTimeCopy.setHours(0,0,0,0);
}
