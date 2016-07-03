"use strict"

module.exports = function(target, method) {
  var res = {count: 0}
  var old = target[method]
  target[method] = function(){
    res.count += 1
    return old.apply(target, arguments)
  }
  return res
}
