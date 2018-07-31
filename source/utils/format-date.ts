// 格式化时间
function _formatDate (timestamp) {
  let
      date    =   new Date(timestamp)               ,
      year    =   date.getFullYear().toString()     ,
      month   =   (date.getMonth() + 1).toString()  ,
      day     =   date.getDate().toString()         ,
      hours   =   date.getHours().toString()        ,
      minutes =   date.getMinutes().toString()      ,
      seconds =   date.getSeconds().toString()      ;

  // 规范月、日位数
  if (month.length === 1)     month   = `0${month}`
  if (day.length === 1)       day     = `0${day}`
  if (hours.length === 1)     hours   = `0${hours}`
  if (minutes.length === 1)   minutes = `0${minutes}`
  if (seconds.length === 1)   seconds = `0${seconds}`

  return { year, month, day, hours, minutes, seconds }
}

// 10位时间戳转换成标准时间 年-月-日 时：分：秒
function timestampToDate(timestamp) {
  let parseOfDate = _formatDate(timestamp * 1000);
  // 拼接成最终返回的时间
  return `${parseOfDate.year}-${parseOfDate.month}-${parseOfDate.day} ${parseOfDate.hours}:${parseOfDate.minutes}:${parseOfDate.seconds}`
}

// 把秒转换为小时
function secondsToHour(seconds) {
  let hour = Math.ceil(seconds / 60) / 60;
  return hour.toFixed(1);
}

// 昨天对应的日期
function yesterday() {
  let
      yesterdayTimestamp = new Date().getTime() - 3600 * 1000 * 24,
      parseOfDate        = _formatDate(yesterdayTimestamp);

  return `${parseOfDate.year}-${parseOfDate.month}-${parseOfDate.day}`
}

// 上一周对应的日期
function lastWeekDate() {
  let
      preWeekOfTimestamp  = new Date().getTime() - 3600 * 1000 * 24 * 7,
      parseOfDate         = _formatDate(preWeekOfTimestamp);

  return `${parseOfDate.year}-${parseOfDate.month}-${parseOfDate.day}`
}

// 当前的日期
function nowDate() {
  let parseOfDate = _formatDate(new Date().getTime());

  return `${parseOfDate.year}-${parseOfDate.month}-${parseOfDate.day}`
}

// 上一月对应的日期
function lastMonthDate() {
  let
      preMonthDate  = new Date().getTime() - 3600 * 1000 * 24 * 30,
      parseOfDate   = _formatDate(preMonthDate);

  return `${parseOfDate.year}-${parseOfDate.month}-${parseOfDate.day}`
}

// 去年对应的日期
function lastYearDate() {
  let
      parseOfDate = _formatDate(new Date().getTime()),
      lastYear    = parseInt(parseOfDate.year) - 1;

  return `${lastYear}-${parseOfDate.month}-${parseOfDate.day}`;
}

// 转换为年-月-日格式的日期
function formatOfDateStyle (date) {
  let dateObj = _formatDate(date);

  return `${dateObj.year}-${dateObj.month}-${dateObj.day}`
}

// 获取指定日期的下一个月 所对应的日期
function nextMonthDate(date) {
  let
      nextMonthDate  = new Date(date).getTime() + 3600 * 1000 * 24 * 30,
      parseOfDate   = _formatDate(nextMonthDate);

  return `${parseOfDate.year}-${parseOfDate.month}-${parseOfDate.day}`
}

// 把UTC时间转换为本地时间
function formatLocaleTime (UTCTime) {
  if (UTCTime) {
    // 获取当前时区差值
    let
        timeOffset = new Date().getTimezoneOffset() * 60000,
        timeStamp  = new Date(UTCTime.substring(0, 19).replace(/-/g, '/')).getTime(),
        localTime  = timeStamp - timeOffset,
        timeObj    = _formatDate(localTime);

    return `${timeObj.year}-${timeObj.month}-${timeObj.day} ${timeObj.hours}:${timeObj.minutes}:${timeObj.seconds}`
  }
}

export default {
  yesterday,
  lastWeekDate,
  nowDate,
  lastMonthDate,
  lastYearDate,
  formatOfDateStyle,
  timestampToDate,
  secondsToHour,
  nextMonthDate,
  formatLocaleTime
}
