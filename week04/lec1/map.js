"use strict";
/*
Based on When.js tests

Open Source Initiative OSI - The MIT License

http://www.opensource.org/licenses/mit-license.php

Copyright (c) 2011 Brian Cavalier

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/
var assert = require("assert");
//var testUtils = require("./helpers/util.js");
//import MyPromise as Promise from "./blueMyPromise"
class MyPromise extends Promise {
  
  constructor() {
    super(...arguments)
  }

  static delay(ms, func) {
    return new MyPromise((resolve, reject) => {
      setTimeout(() => { resolve(func) }, ms)
    })
  }

  static map(iterable, mapper) {
    
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
              return mapper(val)            
            },  reject)
            .then(mapval => {
              result.push(mapval)
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
              return filterer(val)            
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
      //let started = 0
      let done = 0

      this.resolve(iterable)
      .then( iter => {
        if (iter[Symbol.iterator]) {
          for (let i of iter) {
            //started++
            this.resolve(i)
            .then(val => {
              if (done < count) {
                result.push(val)
              }
              console.log(result)
              done++
              console.log(done)
              if (done == count) {
                console.log('resolve!')
                resolve(result)
              }
            },  reject)
          }
        }
        else
          resolve(new Array())        
      },  reject)
    })
  }
}

describe("MyPromise.some", function(){
    it("should fulfill (basic test)", function(){
        return MyPromise.some([1,2,3], 2).then(function(results){
            assert.deepEqual(results, [1, 2]);
        });
    });

    it("should reject on negative number", function(){
        return MyPromise.some([1,2,3], -1)
            .then(assert.fail)
            .caught(MyPromise.TypeError, function(){
            });
    });

    it("should reject on NaN", function(){
        return MyPromise.some([1,2,3], -0/0)
            .then(assert.fail)
            .caught(MyPromise.TypeError, function(){
            });
    });

    it("should reject on non-array", function(){
        return MyPromise.some({}, 2)
            .then(assert.fail)
            .caught(MyPromise.TypeError, function(){
            });
    });

    it("should reject with rangeerror when impossible to fulfill", function(){
        return MyPromise.some([1,2,3], 4)
            .then(assert.fail)
            .caught(MyPromise.RangeError, function(e){
            });
    });

    it("should fulfill with empty array with 0", function(){
        return MyPromise.some([1,2,3], 0).then(function(result){
            assert.deepEqual(result, []);
        });
    });
});

/*var RangeError = MyPromise.RangeError;

describe("MyPromise.some-test", function () {

    specify("should reject empty input", function() {
        return MyPromise.some([], 1).caught(RangeError, function() {
        });
    });

    specify("should resolve values array", function() {
        var input = [1, 2, 3];
        return MyPromise.some(input, 2).then(
            function(results) {
                assert(testUtils.isSubset(results, input));
            },
            assert.fail
        )
    });

    specify("should resolve MyPromises array", function() {
        var input = [MyPromise.resolve(1), MyPromise.resolve(2), MyPromise.resolve(3)];
        return MyPromise.some(input, 2).then(
            function(results) {
                assert(testUtils.isSubset(results, [1, 2, 3]));
            },
            assert.fail
        )
    });

    specify("should not resolve sparse array input", function() {
        var input = [, 1, , 2, 3 ];
        return MyPromise.some(input, 2).then(
            function(results) {
                assert.deepEqual(results, [void 0, 1]);
            },
            function() {
                console.error(arguments);
                assert.fail();
            }
        )
    });

    specify("should reject with all rejected input values if resolving howMany becomes impossible", function() {
        var input = [MyPromise.resolve(1), MyPromise.reject(2), MyPromise.reject(3)];
        return MyPromise.some(input, 2).then(
            assert.fail,
            function(err) {
                //Cannot use deep equality in IE8 because non-enumerable properties are not
                //supported
                assert(err[0] === 2);
                assert(err[1] === 3);
            }
        )
    });

    specify("should reject with aggregateError", function() {
        var input = [MyPromise.resolve(1), MyPromise.reject(2), MyPromise.reject(3)];
        var AggregateError = MyPromise.AggregateError;
        return MyPromise.some(input, 2)
            .then(assert.fail)
            .caught(AggregateError, function(e) {
                assert(e[0] === 2);
                assert(e[1] === 3);
                assert(e.length === 2);
            });
    });

    specify("aggregate error should be caught in .error", function() {
        var input = [MyPromise.resolve(1), MyPromise.reject(2), MyPromise.reject(3)];
        var AggregateError = MyPromise.AggregateError;
        return MyPromise.some(input, 2)
            .then(assert.fail)
            .error(function(e) {
                assert(e[0] === 2);
                assert(e[1] === 3);
                assert(e.length === 2);
            });
    });

    specify("should accept a MyPromise for an array", function() {
        var expected, input;

        expected = [1, 2, 3];
        input = MyPromise.resolve(expected);

        return MyPromise.some(input, 2).then(
            function(results) {
                assert.deepEqual(results.length, 2);
            },
            assert.fail
        )
    });

    specify("should reject when input MyPromise does not resolve to array", function() {
        return MyPromise.some(MyPromise.resolve(1), 1).caught(TypeError, function(e){
        });
    });

    specify("should reject when given immediately rejected MyPromise", function() {
        var err = new Error();
        return MyPromise.some(MyPromise.reject(err), 1).then(assert.fail, function(e) {
            assert.strictEqual(err, e);
        });
    });
});*/

describe("MyPromise.map-test", function () {

    function mapper(val) {
        return val * 2;
    }

    function deferredMapper(val) {
        return MyPromise.delay(1, mapper(val));
    }

    specify("should map input values array", function() {
        var input = [1, 2, 3];
        return MyPromise.map(input, mapper).then(
            function(results) {
                assert.deepEqual(results, [2,4,6]);
            },
            assert.fail
        );
    });

    specify("should map input MyPromises array", function() {
        var input = [MyPromise.resolve(1), MyPromise.resolve(2), MyPromise.resolve(3)];
        return MyPromise.map(input, mapper).then(
            function(results) {
                assert.deepEqual(results, [2,4,6]);
            },
            assert.fail
        );
    });

    specify("should map mixed input array", function() {
        var input = [1, MyPromise.resolve(2), 3];
        return MyPromise.map(input, mapper).then(
            function(results) {
                assert.deepEqual(results, [2,4,6]);
            },
            assert.fail
        );
    });

    specify("should map input when mapper returns a MyPromise", function() {
        var input = [1,2,3];
        return MyPromise.map(input, deferredMapper).then(
            function(results) {
                assert.deepEqual(results, [2,4,6]);
            },
            assert.fail
        );
    });

    specify("should accept a MyPromise for an array", function() {
        return MyPromise.map(MyPromise.resolve([1, MyPromise.resolve(2), 3]), mapper).then(
            function(result) {
                assert.deepEqual(result, [2,4,6]);
            },
            assert.fail
        );
    });

    specify("should resolve to empty array when input MyPromise does not resolve to an array", function() {
        return MyPromise.map(MyPromise.resolve(123), mapper).catch(function(e){});          
    });

    specify("should map input MyPromises when mapper returns a MyPromise", function() {
        var input = [MyPromise.resolve(1),MyPromise.resolve(2),MyPromise.resolve(3)];
        return MyPromise.map(input, mapper).then(
            function(results) {
                assert.deepEqual(results, [2,4,6]);
            },
            assert.fail
        );
    });

    specify("should reject when input contains rejection", function() {
        var input = [MyPromise.resolve(1), MyPromise.reject(2), MyPromise.resolve(3)];
        return MyPromise.map(input, mapper).then(
            assert.fail,
            function(result) {
                assert(result === 2);
            }
        );
    });
});


describe("MyPromise filter", function() {

    function ThrownError() {}


    var arr = [1,2,3];

    function assertArr(arr) {
        assert(arr.length === 2);
        assert(arr[0] === 1);
        assert(arr[1] === 3);
    }

    function assertErr(e) {
        assert(e instanceof ThrownError);
    }

    function assertFail() {
        assert.fail();
    }
  
      

    describe("should accept eventual booleans", function() {
        specify("simple filterer function", function() {
            return MyPromise.filter(arr, function(v) {
              return v !== 2;                
            }).then(assertArr);
        });

        specify("immediately fulfilled", function() {
            return MyPromise.filter(arr, function(v) {
                return new MyPromise(function(r){
                    r(v !== 2);
                });
            }).then(assertArr);
        });


        specify("already fulfilled", function() {
            return MyPromise.filter(arr, function(v) {
                return MyPromise.resolve(v !== 2);
            }).then(assertArr);
        });

        specify("eventually fulfilled", function() {
            return MyPromise.filter(arr, function(v) {
                return new MyPromise(function(r){
                    setTimeout(function(){
                        r(v !== 2);
                    }, 1);
                });
            }).then(assertArr);
        });

        specify("immediately rejected", function() {
            return MyPromise.filter(arr, function(v) {
                return new MyPromise(function(v, r){
                    r(new ThrownError());
                });
            }).then(assertFail, assertErr);
        });
        specify("already rejected", function() {
            return MyPromise.filter(arr, function(v) {
                return MyPromise.reject(new ThrownError());
            }).then(assertFail, assertErr);
        });
        specify("eventually rejected", function() {
            return MyPromise.filter(arr, function(v) {
                return new MyPromise(function(v, r){
                    setTimeout(function(){
                        r(new ThrownError());
                    }, 1);
                });
            }).then(assertFail, assertErr);
        });


        specify("immediately fulfilled thenable", function() {
            return MyPromise.filter(arr, function(v) {
                return {
                    then: function(f, r) {
                        f(v !== 2);
                    }
                };
            }).then(assertArr);
        });
        specify("eventually fulfilled thenable", function() {
            return MyPromise.filter(arr, function(v) {
                return {
                    then: function(f, r) {
                        setTimeout(function(){
                            f(v !== 2);
                        }, 1);
                    }
                };
            }).then(assertArr);
        });

        specify("immediately rejected thenable", function() {
            return MyPromise.filter(arr, function(v) {
                return {
                    then: function(f, r) {
                        r(new ThrownError());
                    }
                };
            }).then(assertFail, assertErr);
        });
        specify("eventually rejected thenable", function() {
            return MyPromise.filter(arr, function(v) {
                return {
                    then: function(f, r) {
                        setTimeout(function(){
                            r(new ThrownError());
                        }, 1);
                    }
                };
            }).then(assertFail, assertErr);
        });

    });
});

/*describe("MyPromise.map-test with concurrency", function () {

    var concurrency = {concurrency: 2};

    function mapper(val) {
        return val * 2;
    }

    function deferredMapper(val) {
        return MyPromise.delay(1, mapper(val));
    }

    specify("should map input values array with concurrency", function() {
        var input = [1, 2, 3];
        return MyPromise.map(input, mapper, concurrency).then(
            function(results) {
                assert.deepEqual(results, [2,4,6]);
            },
            assert.fail
        );
    });

    specify("should map input MyPromises array with concurrency", function() {
        var input = [MyPromise.resolve(1), MyPromise.resolve(2), MyPromise.resolve(3)];
        return MyPromise.map(input, mapper, concurrency).then(
            function(results) {
                assert.deepEqual(results, [2,4,6]);
            },
            assert.fail
        );
    });

    specify("should map mixed input array with concurrency", function() {
        var input = [1, MyPromise.resolve(2), 3];
        return MyPromise.map(input, mapper, concurrency).then(
            function(results) {
                assert.deepEqual(results, [2,4,6]);
            },
            assert.fail
        );
    });

    specify("should map input when mapper returns a MyPromise with concurrency", function() {
        var input = [1,2,3];
        return MyPromise.map(input, deferredMapper, concurrency).then(
            function(results) {
                assert.deepEqual(results, [2,4,6]);
            },
            assert.fail
        );
    });

    specify("should accept a MyPromise for an array with concurrency", function() {
        return MyPromise.map(MyPromise.resolve([1, MyPromise.resolve(2), 3]), mapper, concurrency).then(
            function(result) {
                assert.deepEqual(result, [2,4,6]);
            },
            assert.fail
        );
    });

    specify("should resolve to empty array when input MyPromise does not resolve to an array with concurrency", function() {
        return MyPromise.map(MyPromise.resolve(123), mapper, concurrency).caught(TypeError, function(e){
        });
    });

    specify("should map input MyPromises when mapper returns a MyPromise with concurrency", function() {
        var input = [MyPromise.resolve(1),MyPromise.resolve(2),MyPromise.resolve(3)];
        return MyPromise.map(input, mapper, concurrency).then(
            function(results) {
                assert.deepEqual(results, [2,4,6]);
            },
            assert.fail
        );
    });

    specify("should reject when input contains rejection with concurrency", function() {
        var input = [MyPromise.resolve(1), MyPromise.reject(2), MyPromise.resolve(3)];
        return MyPromise.map(input, mapper, concurrency).then(
            assert.fail,
            function(result) {
                assert(result === 2);
            }
        );
    });

    specify("should not have more than {concurrency} MyPromises in flight", function() {
        var array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        var b = [];
        var now = Date.now();

        var immediates = [];
        function immediate(index) {
            var resolve;
            var ret = new MyPromise(function(){resolve = arguments[0]});
            immediates.push([ret, resolve, index]);
            return ret;
        }

        var lates = [];
        function late(index) {
            var resolve;
            var ret = new MyPromise(function(){resolve = arguments[0]});
            lates.push([ret, resolve, index]);
            return ret;
        }


        function MyPromiseByIndex(index) {
            return index < 5 ? immediate(index) : late(index);
        }

        function resolve(item) {
            item[1](item[2]);
        }

        var ret1 = MyPromise.map(array, function(value, index) {
            return MyPromiseByIndex(index).then(function() {
                b.push(value);
            });
        }, {concurrency: 5});

        var ret2 = MyPromise.delay(100).then(function() {
            assert.strictEqual(0, b.length);
            immediates.forEach(resolve);
            return immediates.map(function(item){return item[0]});
        }).delay(100).then(function() {
            assert.deepEqual(b, [0, 1, 2, 3, 4]);
            lates.forEach(resolve);
        }).delay(100).then(function() {
            assert.deepEqual(b, [0, 1, 2, 3, 4, 10, 9, 8, 7, 6 ]);
            lates.forEach(resolve);
        }).thenReturn(ret1).then(function() {
            assert.deepEqual(b, [0, 1, 2, 3, 4, 10, 9, 8, 7, 6, 5]);
        });
        return MyPromise.all([ret1, ret2]);
    });
});*/
