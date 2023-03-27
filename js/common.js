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