"use strict"

class MyPromise extends Promise {
  
  constructor(...args) {
    super(...args)
  }

  static map(iterable, mapper, {concurrency = Infinity}) {

    return new this.constructor.resolve(mapper).then( mapFunc => {

      return new this.constructor((resolve, reject) => {

      let result = []
      let started = 0
      let done = 0

      for (let promise of iterable) {
        started++
        promise.then(value => {
          result.push(mapFunc(value))
          done++
          if (done == started)
            resolve(result)
        },  reject)
      }
    })    
  } 
}

exports.myPromise = new MyPromise()
 
