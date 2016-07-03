"use strict"

function fun(arr, fn, init) {
  if (!arr.length) return init
  else return fun(arr.slice(1), fn, fn(init, arr[0])) 
}

module.exports = fun
