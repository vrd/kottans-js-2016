"use strict"

function fun(operation, num) {
  if (num > 0) {
    operation()
    fun(operation, num-1)
  }
}

module.exports = fun
