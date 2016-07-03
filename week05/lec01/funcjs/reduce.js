"use strict"

function fun(input) {
  return input.reduce((stats, fruit) => {
    //console.log(stats)
    if (stats[fruit])
      stats[fruit] += 1
    else 
      stats[fruit] = 1
    return stats
  }, {})
}

module.exports = fun
