module.exports = class MyPromise extends Promise {
  
  constructor() {
    super(...arguments)
  }

  //used in some tests  
  static delay(ms, val) {
    return new MyPromise((resolve, reject) => {
      setTimeout(() => { resolve(val) }, ms)
    })
  }


  static map(iterable, mapper) {
    
    return new this((resolve, reject) => {

      let result = []
      let started = 0
      let done = 0

      this.resolve(iterable)
      .then( iter => {
        //if input is iterable
        if (iter[Symbol.iterator]) {
          for (let i of iter) {
            //increase first counter
            started++
            //start promise 
            this.resolve(i)
            .then(val => {
              //return possible mapper promise
              return mapper(val)            
            },  reject)
            .then(mapval => {
              //append results
              result.push(mapval)
              //increase second counter
              done++
              //resolve if counters are equal
              if (done == started)
                resolve(result)
            },  reject)
          }
        }
        else
          resolve(new Array())

      },  reject)
    })
  }

  static filter(iterable, filterer) {

    return new this((resolve, reject) => {
      let result = []
      let started = 0
      let done = 0

      this.resolve(iterable)
      .then( iter => {
        if (iter[Symbol.iterator]) {
          for (let i of iter) {
            started++
            this.resolve(i)
            .then(val => {
              return (filterer(val))            
            },  reject)
            .then(filtval => {
              if (filtval) {
                result.push(i)
              } 
              done++
              if (done == started)
                resolve(result)
            },  reject)
          }
        }
        else
          resolve(new Array())        
      },  reject)
    })
  }

  static some(iterable, count) {
    
    return new this((resolve, reject) => {

      let result = []
      let rejected = []
      let done = 0      

      this.resolve(iterable)
      .then( iter => {
        //check count and iter for correctness
        if (count !== 0) {
          if (!Number.isInteger(count) || count < 0 || count > iter.length || !Array.isArray(iter))
            reject(new TypeError)
          //resolving promises
          for (let i of iter) {
            this.resolve(i)
            .then(val => {
              //push only if we don't have enough results
              if (done < count) {
                result.push(val)
              }
              //increase counter
              done++
              //if we have right amount of results 
              if (done == count) {
                resolve(result)
              }
            },  err => {
              //collecting errors
              rejected.push(err);
              //if too little unresolved promises are remained
              if ((iter.length - rejected.length) < count) {
                reject(rejected)
              }
            })
          }
        }
        //return empty array if input is incorrect
        else
          resolve(new Array())        
      },  reject)
    })
  }

  static reduce(iterable, reducer, initialValue) {
    
    return new this((resolve, reject) => {
      
      let initial  
      let arr = []

      this.resolve(iterable)
      .then(iter => {
        //create array from iterable
        if (iter[Symbol.iterator])
          arr = Array.from(iter)
        else
          reject(new TypeError)
        //resolve initialValue
        return this.resolve(initialValue)
      }, reject)
      .then(initial => {
        //special cases
        if (arr.length === 0)
          resolve(initial)
        if (initial === undefined && arr.length === 1)  
          resolve(arr[0])
        //kickstarting reduce
        let start, total
        if (initial === undefined) {
          start = 1          
          total = this.resolve(arr[0]).then( t => [t, start])                
        } else {
          start = 0          
          total = this.resolve(initial).then( t => [t, start])        
        }
        //chaining over 9000
        for (let index = start; index < arr.length + 1; index++) {         
          total = total.then(([t, i]) => {
            //to the last element
            if (i !== arr.length)
              return this.resolve(arr[i])
                .then(val => {
                  return this.resolve(reducer(t, val, i, arr.length))
            }).then(t => [t, ++i])
            //and cherry on cake  
            else
              resolve(t)
          }, reject)                     
        }

      }, reject)
    })
  }

  reduce(reducer, initialValue) {

    let iterable = this
    let myprom = this.constructor
   
    return new myprom((resolve, reject) => {
            
      myprom.resolve(iterable)
      .then(iter => {
        let arr = Array.from(iter)
        return arr
      }, reject)
      .then(arr => {
        if (arr.length === 0)
          resolve(undefined)
        if (initialValue === undefined && arr.length === 1)
          resolve(arr[0])

        let total, start
        if (initialValue === undefined) {
          start = 1          
          total = myprom.resolve([arr[0], start])          
        } else {
          start = 0
          total = myprom.resolve([initialValue, start])          
        }

        for (let index = start; index < arr.length + 1; index++) {
          total = total.then(([t, i]) => {
            if (i !== arr.length)
              return myprom.resolve(reducer(t, arr[i], i, arr.length)).then(t => [t, ++i])
            else
              resolve(t)
          }, reject)                      
        }               
      }, reject)      
    })
  }
}
