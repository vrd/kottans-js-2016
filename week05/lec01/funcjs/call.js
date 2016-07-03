"use strict"

function fun() {
  return Array.prototype.reduce.call(arguments, function(count, duck){
    return Object.prototype.hasOwnProperty.call(duck, 'quack') ? ++count : count
  }, 0)
}

module.exports = fun
