const hasChinese = (str) => {
  const re = /[\u4E00-\u9FA5]+/;
  return re.test(str);
};
const isWord = (str) => {
  const re = /[a-zA-Z]+/g;
  return re.test(str);
}
const debounce = (fn, delay = 200) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}
const isTimestamp = (value) => {
  try {
    // 尝试创建一个Date对象
    const date = new Date(Number(value));

    // 检查返回的日期实例是不是被JS引擎识别为有效日期
    // 这里我们只检查年份是否在合理的范围内，例如1970年至未来的一个合理年份
    const minYear = 1970;
    const maxYear = new Date().getFullYear() + 20; // 假设未来20年内的时间戳都是合理的
    return !isNaN(date.getTime()) && date.getFullYear() >= minYear && date.getFullYear() <= maxYear;
  } catch (error) {
    // 如果转换过程中抛出错误，则不是有效的时间戳
    return false;
  }
}
const timestampToDateTimeString = (timestamp) => {
  // 创建一个新的Date对象，传入时间戳
  const date = new Date(Number(timestamp));

  // 获取年、月、日、小时、分钟和秒
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  const hours = ("0" + date.getHours()).slice(-2);
  const minutes = ("0" + date.getMinutes()).slice(-2);
  const seconds = ("0" + date.getSeconds()).slice(-2);

  // 返回格式化后的日期时间字符串
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}