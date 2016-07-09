"use strict"

module.exports = (req, res) => {
  console.log("\nmiddleware 2")
  console.log(req.headers); 
  res.end("Hello World");
}
