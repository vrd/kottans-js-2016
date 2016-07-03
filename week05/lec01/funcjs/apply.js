"use strict"

var slice = Array.prototype.slice
//var concat = Array.prototype.concat
function fun(namespace) {
  return function() {
    console.log.apply(null, [namespace].concat(slice.call(arguments, 0)))
  }
}

module.exports = fun
