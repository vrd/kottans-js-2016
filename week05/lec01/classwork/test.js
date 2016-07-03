"use strict"

require('chai').should()

const add = require("./")

describe ("add", () => {
  it("should be a func with 1 paRAM", () => {
    add.should
    .be.a('function')
    .have.lengthOf(1)
  })

  it('should add up to 3 numbers', () => {
    add("1").should.equal(1)
    add("1,2").should.equal(3)
    add("3,6,1").should.equal(10)
    add("1,2,3,4,5").should.equal(15)
  })

  it('should return 0 from empty string', () => {
    add("").should.equal(0)
  })

  it('should handle new lines between numbers',  () => {
    add("\n10\n3").should.equal(13)
  })

  it("should return NaN at incorrect input", () => {  
    add("1,\n").should.be.NaN
  })

  it("should allow custom delimiters", () => {
    add("//;\n1;2;3").should.equal(6)
    add("//*\n1*2*3").should.equal(6)
    add("//*\n1A2\n4").should.equal(6)
  })

})
