"use strict"

const PostHTML = require("posthtml")

const html = `<p class="js-smth kottansjs-smth col-lg-12 pricol-lg-12 col-xs-push-1 pricol-xs-push-144 margin5left">Text</p>`
const bootstrapRegExp = /^col\-(xs|sm|md|lg)(\-(push|pull|offset))?\-\d\d?$/i
const datajsRegExp = /^js\-\w+/i

const plugin = tree => {
  tree.map( node => {
    
    let newClasses = node.attrs.class.split(" ").reduce( (prev, cur) => {
      if (datajsRegExp.test(cur)) {
        prev.datajs[prev.datajs.length] = cur.slice(3)
      } else if (!bootstrapRegExp.test(cur)) {
        prev.class[prev.class.length] = cur        
      }      
      return prev
    }, {datajs: [], class: []})

    if (newClasses.datajs.length > 0) {
      node.attrs['data-js'] = newClasses.datajs.join(" ")
    }

    if (newClasses.class.length > 0) {
      node.attrs.class = newClasses.class.join(" ")
    } else {
      delete node.attrs.class
    }   

    return node       
  })
} 

PostHTML()
  .use(plugin)
  .process(html)
  .then( result => {
      console.log('\ninput HTML:\n\n' + html)
      console.log('\noutput HTML:\n\n' + result.html + '\n')
    })
