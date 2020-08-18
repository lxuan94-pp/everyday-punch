const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const getYMD = date => {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  return [year, month, day].map(formatNumber).join('-')
}

const getHMS = date => {
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  return [hour, minute, second].map(formatNumber).join(':')
}

const getHM = date => {
  var hour = date.getHours()
  var minute = date.getMinutes()

  return [hour, minute].map(formatNumber).join(':')
}

const getW = date => {
  var d = date.getDay();
  var arr = ['日', '一', '二', '三', '四', '五', '六'];

  return '星期' + arr[d];
}

module.exports = {
  formatTime: formatTime,
  getYMD: getYMD,
  getHMS: getHMS,
  getHM: getHM,
  getW: getW
}
