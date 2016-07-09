"use strict"

var nodeConfig = require('config')
var config = nodeConfig.get('Server')

var App = require('./app.js')
var app = new App()

app.use(require('./midware1.js'))
app.use(require('./midware2.js'))

app.start(config.host, config.port, () => console.log("listening on " + config.port))
