"use strict"

var expect = require('chai').expect

const add = require("./calc.js").Add

describe ("add", () => {
  it("should be a function with 1 argument", () => {
    expect(add).be.a('function')
    expect(add).have.lengthOf(1)
  })

  it("should return 0 at empty string", () => {
    expect(add("")).equal(0)
  })

  it("should work with one number", () => {
    expect(add("1")).equal(1)
    expect(add("13")).equal(13)
  })

  it("should work with two numbers", () => {
    expect(add("1,2")).equal(3)
    expect(add("13,25")).equal(38)
  })

  it("should work with two numbers", () => {
    expect(add("1,2")).equal(3)
    expect(add("13,25")).equal(38)
  })

  it("should work with many numbers", () => {
    expect(add("1,2,3,4,5,6,7,8,9,10")).equal(55)
    expect(add("13,25,11,0,0,0,1")).equal(50)
  })

  it("should work with newline instead of comma", () => {
    expect(add("1\n2,3")).equal(6)
    expect(add("1\n2\n3\n4")).equal(10)
  })

  it("should support different delimeters", () => {
    expect(add("//;\n10;2;3")).equal(15)
    expect(add("// \n10 2 4")).equal(16)
    expect(add("//*\n10*2*5")).equal(17)
  })

  it("should throw exception on negative numbers", () => {
    expect(() => {add("1,-2,3")}).throw(TypeError, "negatives not allowed -2")    
    expect(() => {add("-1,-2,-3")}).throw(TypeError, "negatives not allowed -1 -2 -3")
  })

  it("number bigger then 1000 should be ignored", () => {
    expect(add("10,1001,3")).equal(13)    
  })

  it("should support long delimeters", () => {
    expect(add("//[mmmm]\n10mmmm2mmmm3")).equal(15)
    expect(add("//[***]\n10***2***3")).equal(15)    
  })

  it("should support multiple delimeters", () => {
    expect(add("//[a][k]\n1a2k3")).equal(6) 
    expect(add("//[%][*][a]\n10%2*3a0")).equal(15)    
  })

  it("should support multiple long delimeters", () => {
    expect(add("//[%%%#][...]\n100%%%#2...3")).equal(105)
    expect(add("//[***][?|+]\n100***2?|+3")).equal(105)    
  })
})

