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

  static map(iterable, mapper) {

    return new this((resolve, reject) => {

      let result = []
      let started = 0
      let done = 0

      for (let i of iterable) {
        started++
        this.resolve(i).then(value => {
          result.push(mapper(value))
          done++
          if (done == started)
            resolve(result)
        },  reject)
      }

    })
  } 
}

describe("MyPromise.map-test", function () {

    function mapper(val) {
        return val * 2;
    }

    function deferredMapper(val) {
        return MyPromise.resolve(mapper(val));
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
        return MyPromise.map(MyPromise.resolve(123), mapper).caught(TypeError, function(e){
        });
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
