"use strict"

module.exports = function(arr, fn) {
  return arr.reduce((res, a) => {
    res.push(fn(a))
    return res
  }, [])
}
