"use strict"

module.exports = {
  Add: function(args) {
    if (args === "") return 0
    var sep = /[,\n]/

    const userSep = /^\/\/.\n/
    if (userSep.test(args)) {
      sep = args[2]
      args = args.slice(4)
    }

    const longUserSep = /^\/\/\[.+\]\n/
    const spec = /\[|\]|\\|\^|\$|\.|\||\?|\*|\+|\(|\)/
    if (longUserSep.test(args)) {

      var match = args.match(longUserSep)[0]
      var seps = match.slice(2,-1).match(/\[.+?\]/g)
      sep = RegExp(seps.map(m => 
        m.slice(1,-1).split("").map(a => {
          if (spec.test(a)) return ("\\" + a)
          else return a
        }).join("")       
      ).join("|"))
      
      args = args.slice(match.length)

    }    

    var nums = args.split(sep).map(Number)
    var negs = []
    var sum = 0
    for (var num of nums) {
      if (num < 0) negs.push(num)
      if (num < 1001) sum += num
    }
    if (negs.length == 0) return sum
    else throw new TypeError("negatives not allowed " + negs.join(" "))

     
  }
}
