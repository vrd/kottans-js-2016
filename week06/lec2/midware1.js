"use strict"

module.exports = (req, res)  => {
  console.log("\nmiddleware 1")
  console.log("url", req.url); 
  console.log("method", req.method); 
}
