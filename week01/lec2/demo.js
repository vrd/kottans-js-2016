"use strict"

const PostHTML = require("posthtml")
const plugin = require("./plugin")
const html = `<p class="js-smth kottansjs-smth col-lg-12 
pricol-lg-12 col-xs-push-1 pricol-xs-push-144 margin5left">Text</p>`

PostHTML()
  .use(plugin)
  .process(html)
  .then( result => {
      console.log('\ninput HTML:\n\n' + html)
      console.log('\noutput HTML:\n\n' + result.html + '\n')
    })
