module.exports = class App {

  constructor() {
    this.middleWares = []
  }

  use(func) {
    this.middleWares.push(func)
  }

  start(host, port, cb) {
    const http = require('http')
    const httpServer = http.createServer((req, res) => {
      for (let func of this.middleWares) {
        func(req, res)
      }
    })
    httpServer.listen(port, host, 511, cb)
  }
}
