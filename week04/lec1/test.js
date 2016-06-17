"use strict";

var assert = require("assert");
var MyPromise = require("./mypromise.js")


//--------------- TESTS --------------------
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

function isSubset(subset, superset) {
  var i, subsetLen;
  subsetLen = subset.length;
  if (subsetLen > superset.length) {
      return false;
  }
  for(i = 0; i<subsetLen; i++) {
      if(!contains(superset, subset[i])) {
          return false;
      }
  }
  return true;
}

function contains(arr, result) {
  return arr.indexOf(result) > -1;
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
            .catch(function(){
            });
    });

    it("should reject on NaN", function(){
        return MyPromise.some([1,2,3], -0/0)
            .then(assert.fail)
            .catch(function(){
            });
    });

    it("should reject on non-array", function(){
        return MyPromise.some({}, 2)
            .then(assert.fail)
            .catch(function(){
            });
    });

    it("should reject with rangeerror when impossible to fulfill", function(){
        return MyPromise.some([1,2,3], 4)
            .then(assert.fail)
            .catch(function(e){
            });
    });

    it("should fulfill with empty array with 0", function(){
        return MyPromise.some([1,2,3], 0).then(function(result){
            assert.deepEqual(result, []);
        });
    });
});

var RangeError = MyPromise.RangeError;

describe("MyPromise.some-test", function () {

    specify("should reject empty input", function() {
        return MyPromise.some([], 1).catch(function() {
        });
    });

    specify("should resolve values array", function() {
        var input = [1, 2, 3];
        return MyPromise.some(input, 2).then(
            function(results) {
                assert(isSubset(results, input));
            },
            assert.fail
        )
    });

    specify("should resolve MyPromises array", function() {
        var input = [MyPromise.resolve(1), MyPromise.resolve(2), MyPromise.resolve(3)];
        return MyPromise.some(input, 2).then(
            function(results) {
                assert(isSubset(results, [1, 2, 3]));
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
            .catch(function(e) {
                assert(e[0] === 2);
                assert(e[1] === 3);
                assert(e.length === 2);
            });
    });

    /*specify("aggregate error should be caught in .error", function() {
        var input = [MyPromise.resolve(1), MyPromise.reject(2), MyPromise.reject(3)];
        var AggregateError = MyPromise.AggregateError;
        return MyPromise.some(input, 2)
            .then(assert.fail)
            .error(function(e) {
                assert(e[0] === 2);
                assert(e[1] === 3);
                assert(e.length === 2);
            });
    });*/

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
        return MyPromise.some(MyPromise.resolve(1), 1).catch(function(e){
        });
    });

    specify("should reject when given immediately rejected MyPromise", function() {
        var err = new Error();
        return MyPromise.some(MyPromise.reject(err), 1).then(assert.fail, function(e) {
            assert.strictEqual(err, e);
        });
    });
});


function promised(val) {
    return new MyPromise(function(f) {
        setTimeout(function() {
            f(val);
        }, 1);
    });
}
function promising(val) {
    return function() {
        return promised(val);
    }
}
function promisingThen(val) {
    return function() {
        return promised(val).then(function(resolved) {
            return resolved;
        });
    }
}

function thenabled(val) {
    return {
        then: function(f){
            setTimeout(function() {
                f(val);
            }, 1);
        }
    };
}
function thenabling(val) {
    return function() { return thenabled(val); }
}

function evaluate(val) {
    if (typeof val === 'function') {
        val = val();
    }
    if (Array.isArray(val)) {
        val = val.map(function(member) {
            return evaluate(member);
        });
    }
    return val;
}


var ACCUM_CRITERIA = [
    { value: 0,                desc: "that is resolved" },
    { value: promising(0),     desc: "as a MyPromise" },
    { value: promisingThen(0), desc: "as a deferred MyPromise" },
    { value: thenabling(0),    desc: "as a thenable" },
];

var VALUES_CRITERIA = [
    { value: [],               total: 0, desc: "and no values" },
    { value: [ 1 ],            total: 1, desc: "and a single resolved value" },
    { value: [ 1, 2, 3 ],      total: 6, desc: "and multiple resolved values" },
    { value: [ promising(1) ], total: 1, desc: "and a single MyPromise" },
    { value: [
        promising(1),
        promising(2),
        promising(3)
    ], total: 6, desc: "and multiple MyPromises" },
    { value: [
        promisingThen(1)
    ], total: 1, desc: "and a single deferred MyPromise" },
    { value: [
        promisingThen(1),
        promisingThen(2),
        promisingThen(3)
    ], total: 6, desc: "and multiple deferred MyPromises" },
    { value: [
        thenabling(1)
    ], total: 1, desc: "and a single thenable" },
    { value: [
        thenabling(1),
        thenabling(2),
        thenabling(3)
    ], total: 6, desc: "and multiple thenables" },
    { value: [
        thenabling(1),
        promisingThen(2),
        promising(3),
        4
    ], total: 10, desc: "and a blend of values" },
];

var ERROR = new Error("BOOM");


describe("MyPromise.prototype.reduce", function() {
    it("works with no values", function() {
        return MyPromise.resolve([]).reduce(function(total, value) {
            return total + value + 5;
        }).then(function(total) {
            assert.strictEqual(total, undefined);
        });
    });

    it("works with a single value", function() {
        return MyPromise.resolve([ 25 ]).reduce(function(total, value) {
            return total + value + 5;
        }).then(function(total) {
            assert.strictEqual(total, 25);
        });
    });

    it("works when the iterator returns a value", function() {
        return MyPromise.resolve([ 1, 2, 3 ]).reduce(function(total, value) {
            return total + value + 5;
        }).then(function(total) {
            assert.strictEqual(total, (1 + 2+5 + 3+5));
        });
    });

    it("works when the reducer returns a MyPromise", function() {
        return MyPromise.resolve([ 1, 2, 3 ]).reduce(function(total, value) {
            return promised(6).then(function(bonus) {
                return total + value + bonus;
            });
        }).then(function(total) {
            assert.strictEqual(total, (1 + 2+6 + 3+6));
        });
    });

    it("works when the iterator returns a thenable", function() {
        return MyPromise.resolve([ 1, 2, 3 ]).reduce(function(total, value) {
            return thenabled(total + value + 7);
        }).then(function(total) {
            assert.strictEqual(total, (1 + 2+7 + 3+7));
        });
    });
});


describe("MyPromise.reduce", function() {

    it("should allow returning values", function() {
        var a = [promised(1), promised(2), promised(3)];

        return MyPromise.reduce(a, function(total, a) {
            return total + a + 5;
        }, 0).then(function(total){
            assert.equal(total, 1+5 + 2+5 + 3+5);
        });
    });

    it("should allow returning promises", function() {
        var a = [promised(1), promised(2), promised(3)];

        return MyPromise.reduce(a, function(total, a) {
            return promised(5).then(function(b) {
                return total + a + b;
            });
        }, 0).then(function(total){
            assert.equal(total, 1+5 + 2+5 + 3+5);
        });
    });

    it("should allow returning thenables", function() {
        var b = [1,2,3];
        var a = [];

        return MyPromise.reduce(b, function(total, cur) {
            a.push(cur);
            return thenabled(3);
        }, 0).then(function(total) {
            assert.equal(total, 3);
            assert.deepEqual(a, b);
        });
    });

    it("propagates error", function() {
        var a = [promised(1), promised(2), promised(3)];
        var e = new Error("asd");
        return MyPromise.reduce(a, function(total, a) {
            if (a > 2) {
                throw e;
            }
            return total + a + 5;
        }, 0).then(assert.fail, function(err) {
            assert.equal(err, e);
        });
    });

    describe("with no initial accumulator or values", function() {
        it("works when the iterator returns a value", function() {
            return MyPromise.reduce([], function(total, value) {
                return total + value + 5;
            }).then(function(total){
                assert.strictEqual(total, undefined);
            });
        });

        it("works when the iterator returns a MyPromise", function() {
            return MyPromise.reduce([], function(total, value) {
                return promised(5).then(function(bonus) {
                    return total + value + bonus;
                });
            }).then(function(total){
                assert.strictEqual(total, undefined);
            });
        });

        it("works when the iterator returns a thenable", function() {
            return MyPromise.reduce([], function(total, value) {
                return thenabled(total + value + 5);
            }).then(function(total){
                assert.strictEqual(total, undefined);
            });
        });
    });


    describe("with an initial accumulator value", function() {
        ACCUM_CRITERIA.forEach(function(criteria) {
            var initial = criteria.value;

            describe(criteria.desc, function() {
                VALUES_CRITERIA.forEach(function(criteria) {
                    var values = criteria.value;
                    var valueTotal = criteria.total;

                    describe(criteria.desc, function() {
                        it("works when the iterator returns a value", function() {
                            return MyPromise.reduce(evaluate(values), function(total, value) {
                                return total + value + 5;
                            }, evaluate(initial)).then(function(total){
                                assert.strictEqual(total, valueTotal + (values.length * 5));
                            });
                        });

                      

                        it("works when the iterator returns a MyPromise", function() {
                            return MyPromise.reduce(evaluate(values), function(total, value) {
                                return promised(5).then(function(bonus) {
                                    return total + value + bonus;
                                });
                            }, evaluate(initial)).then(function(total){
                                assert.strictEqual(total, valueTotal + (values.length * 5));
                            });
                        });

                        it("works when the iterator returns a thenable", function() {
                            return MyPromise.reduce(evaluate(values), function(total, value) {
                                return thenabled(total + value + 5);
                            }, evaluate(initial)).then(function(total){
                                assert.strictEqual(total, valueTotal + (values.length * 5));
                            });
                        });
                    });
                });
            });
        });

            

        it("propagates an initial Error", function() {
            var initial = MyPromise.reject(ERROR);
            var values = [
                thenabling(1),
                promisingThen(2)(),
                promised(3),
                4
            ];

            return MyPromise.reduce(values, function(total, value) {
                return value;
            }, initial).then(assert.fail, function(err) {
                assert.equal(err, ERROR);
            });
        });

        it("propagates a value's Error", function() {
            var initial = 0;
            var values = [
                thenabling(1),
                promisingThen(2)(),
                MyPromise.reject(ERROR),
                promised(3),
                4
            ];

            return MyPromise.reduce(values, function(total, value) {
                return value;
            }, initial).then(assert.fail, function(err) {
                assert.equal(err, ERROR);
            });
        });

        it("propagates an Error from the iterator", function() {
            var initial = 0;
            var values = [
                thenabling(1),
                promisingThen(2)(),
                promised(3),
                4
            ];

            return MyPromise.reduce(values, function(total, value) {
                if (value === 2) {
                    throw ERROR;
                }
                return value;
            }, initial).then(assert.fail, function(err) {
                assert.equal(err, ERROR);
            });
        });
    });



    describe("with a 0th value acting as an accumulator", function() {
        it("acts this way when an accumulator value is provided yet `undefined`", function() {
            return MyPromise.reduce([ 1, 2, 3 ], function(total, value) {
                return ((total === void 0) ? 0 : total) + value + 5;
            }, undefined).then(function(total){
                assert.strictEqual(total, (1 + 2+5 + 3+5));
            });
        });

        it("survives an `undefined` 0th value", function() {
            return MyPromise.reduce([ undefined, 1, 2, 3 ], function(total, value) {
                return ((total === void 0) ? 0 : total) + value + 5;
            }).then(function(total){
                assert.strictEqual(total, (1+5 + 2+5 + 3+5));
            });
        });

        ACCUM_CRITERIA.forEach(function(criteria) {
            var zeroth = criteria.value;

            describe(criteria.desc, function() {
                VALUES_CRITERIA.forEach(function(criteria) {
                    var values = criteria.value;
                    var zerothAndValues = [ zeroth ].concat(values);
                    var valueTotal = criteria.total;

                    describe(criteria.desc, function() {
                        it("works when the iterator returns a value", function() {
                            return MyPromise.reduce(evaluate(zerothAndValues), function(total, value) {
                                return total + value + 5;
                            }).then(function(total){
                                assert.strictEqual(total, valueTotal + (values.length * 5));
                            });
                        });

                        it("works when the iterator returns a MyPromise", function() {
                            return MyPromise.reduce(evaluate(zerothAndValues), function(total, value) {
                                return promised(5).then(function(bonus) {
                                    return total + value + bonus;
                                });
                            }).then(function(total){
                                assert.strictEqual(total, valueTotal + (values.length * 5));
                            });
                        });

                        it("works when the iterator returns a thenable", function() {
                            return MyPromise.reduce(evaluate(zerothAndValues), function(total, value) {
                                return thenabled(total + value + 5);
                            }).then(function(total){
                                assert.strictEqual(total, valueTotal + (values.length * 5));
                            });
                        });
                    });
                });
            });
        });

        it("propagates an initial Error", function() {
            var values = [
                MyPromise.reject(ERROR),
                thenabling(1),
                promisingThen(2)(),
                promised(3),
                4
            ];

            return MyPromise.reduce(values, function(total, value) {
                return value;
            }).then(assert.fail, function(err) {
                assert.equal(err, ERROR);
            });
        });

        it("propagates a value's Error", function() {
            var values = [
                0,
                thenabling(1),
                promisingThen(2)(),
                MyPromise.reject(ERROR),
                promised(3),
                4
            ];

            return MyPromise.reduce(values, function(total, value) {
                return value;
            }).then(assert.fail, function(err) {
                assert.equal(err, ERROR);
            });
        });

        it("propagates an Error from the iterator", function() {
            var values = [
                0,
                thenabling(1),
                promisingThen(2)(),
                promised(3),
                4
            ];

            return MyPromise.reduce(values, function(total, value) {
                if (value === 2) {
                    throw ERROR;
                }
                return value;
            }).then(assert.fail, function(err) {
                assert.equal(err, ERROR);
            });
        });
    });
});



var sentinel = {};
var other = {};
describe("MyPromise.reduce-test", function () {

    function plus(sum, val) {
        return sum + val;
    }

    function later(val) {
        return MyPromise.delay(1, val);
    }


    specify("should reduce values without initial value", function() {
        return MyPromise.reduce([1,2,3], plus).then(
            function(result) {
                assert.deepEqual(result, 6);
            },
            assert.fail
        );
    });

    specify("should reduce values with initial value", function() {
        return MyPromise.reduce([1,2,3], plus, 1).then(
            function(result) {
                assert.deepEqual(result, 7);
            },
            assert.fail
        );
    });

    specify("should reduce values with initial promise", function() {
        return MyPromise.reduce([1,2,3], plus, MyPromise.resolve(1)).then(
            function(result) {
                assert.deepEqual(result, 7);
            },
            assert.fail
        );
    });

    specify("should reduce promised values without initial value", function() {
        var input = [MyPromise.resolve(1), MyPromise.resolve(2), MyPromise.resolve(3)];
        return MyPromise.reduce(input, plus).then(
            function(result) {
                assert.deepEqual(result, 6);
            },
            assert.fail
        );
    });

    specify("should reduce promised values with initial value", function() {
        var input = [MyPromise.resolve(1), MyPromise.resolve(2), MyPromise.resolve(3)];
        return MyPromise.reduce(input, plus, 1).then(
            function(result) {
                assert.deepEqual(result, 7);
            },
            assert.fail
        );
    });

    specify("should reduce promised values with initial promise", function() {
        var input = [MyPromise.resolve(1), MyPromise.resolve(2), MyPromise.resolve(3)];
        return MyPromise.reduce(input, plus, MyPromise.resolve(1)).then(
            function(result) {
                assert.deepEqual(result, 7);
            },
            assert.fail
        );
    });

    specify("should reduce empty input with initial value", function() {
        var input = [];
        return MyPromise.reduce(input, plus, 1).then(
            function(result) {
                assert.deepEqual(result, 1);
            },
            assert.fail
        );
    });

    specify("should reduce empty input with eventual promise", function() {
        return MyPromise.reduce([], plus, MyPromise.delay(1, 1)).then(
            function(result) {
                assert.deepEqual(result, 1);
            },
            assert.fail
        );
    });

    specify("should reduce empty input with initial promise", function() {
        return MyPromise.reduce([], plus, MyPromise.resolve(1)).then(
            function(result) {
                assert.deepEqual(result, 1);
            },
            assert.fail
        );
    });

    specify("should reject MyPromise input contains rejection", function() {
        var input = [MyPromise.resolve(1), MyPromise.reject(2), MyPromise.resolve(3)];
        return MyPromise.reduce(input, plus, MyPromise.resolve(1)).then(
            assert.fail,
            function(result) {
                assert.deepEqual(result, 2);
            }
        );
    });

    specify("should reduce to undefined with empty array", function() {
        return MyPromise.reduce([], plus).then(function(r){
            assert(r === void 0);
        });
    });

    specify("should reduce to initial value with empty array", function() {
        return MyPromise.reduce([], plus, sentinel).then(function(r){
            assert(r === sentinel);
        });
    });

    specify("should reduce in input order", function() {
        return MyPromise.reduce([later(1), later(2), later(3)], plus, '').then(
            function(result) {
                assert.deepEqual(result, '123');
            },
            assert.fail
        );
    });

    specify("should accept a promise for an array", function() {
        return MyPromise.reduce(MyPromise.resolve([1, 2, 3]), plus, '').then(
            function(result) {
                assert.deepEqual(result, '123');
            },
            assert.fail
        );
    });

    specify("should resolve to initialValue MyPromise input promise does not resolve to an array", function() {
        return MyPromise.reduce(MyPromise.resolve(123), plus, 1).catch(function(e){
        });
    });

    specify("should provide correct basis value", function() {
        function insertIntoArray(arr, val, i) {
            arr[i] = val;
            return arr;
        }

        return MyPromise.reduce([later(1), later(2), later(3)], insertIntoArray, []).then(
            function(result) {
                assert.deepEqual(result, [1,2,3]);
            },
            assert.fail
        );
    });

    describe("checks", function() {
        function later(val, ms) {
            return MyPromise.delay(ms, val);
        }

        function plus(sum, val) {
            return sum + val;
        }

        function plusDelayed(sum, val) {
            return MyPromise.delay(0).then(function() {
                return sum + val;
            });
        }

        function check(delay1, delay2, delay3) {
          return MyPromise.reduce([
            later(1, delay1),
            later(2, delay2),
            later(3, delay3)
          ], plus, '').then(function(result) {
            assert.deepEqual(result, '123');
          })
        }

        function checkDelayed(delay1, delay2, delay3) {
          return MyPromise.reduce([
            later(1, delay1),
            later(2, delay2),
            later(3, delay3)
          ], plusDelayed, '').then(function(result) {
            assert.deepEqual(result, '123');
          })
        }

        specify("16, 16, 16", function() {
            return check(16, 16, 16);
        });

        specify("16, 16, 4", function() {
            return check(16, 16, 4);
        });
        specify("4, 16, 16", function() {
            return check(4, 16, 16);
        });
        specify("16, 4, 16", function() {
            return check(16, 4, 16);
        });
        specify("16, 16, 4", function() {
            return check(16, 16, 4);
        });
        specify("4, 4, 16", function() {
            return check(4, 4, 16);
        });
        specify("16, 4, 4", function() {
            return check(16, 4, 4);
        });
        specify("4, 16, 4", function() {
            return check(4, 16, 4);
        });
        specify("4, 4, 4", function() {
            return check(4, 4, 4);
        });


        specify("16, 16, 16", function() {
            return checkDelayed(16, 16, 16);
        });

        specify("16, 16, 4", function() {
            return checkDelayed(16, 16, 4);
        });
        specify("4, 16, 16", function() {
            return checkDelayed(4, 16, 16);
        });
        specify("16, 4, 16", function() {
            return checkDelayed(16, 4, 16);
        });
        specify("16, 16, 4", function() {
            return checkDelayed(16, 16, 4);
        });
        specify("4, 4, 16", function() {
            return checkDelayed(4, 4, 16);
        });
        specify("16, 4, 4", function() {
            return checkDelayed(16, 4, 4);
        });
        specify("4, 16, 4", function() {
            return checkDelayed(4, 16, 4);
        });
        specify("4, 4, 4", function() {
            return checkDelayed(4, 4, 4);
        });

    })
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
