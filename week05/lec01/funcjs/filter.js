"use strict"

function fun(objs) {
  return objs.filter(obj => obj.message.length < 50).map(obj => obj.message)
}

module.exports = fun
