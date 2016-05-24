"use strict"

const PostHTML = require("posthtml")

const html = `<p class="js-smth col-lg-12 margin5left">Text</p>`
const newHtml =`<p data-js=smth class=margin5left>Text</p>`
const bootstrapRegExp = /col\-lg\-12/i
const datajsRegExp = /js\-\w+/i

const plugin = tree => {
  tree.map( node => {
    let classes = node.attrs.class.split(" ")
    let newClasses = classes.reduce( (prev, cur) => {
      if (!bootstrapRegExp.test(cur)) {
        prev.class[prev.class.length] = cur        
      }
      else if (datajsRegExp.test(cur)) {
        prev.datajs[prev.datajs.length] = cur
      }      
      return prev
    }, {datajs: [], class: []})
    if (newClasses.datajs) {
      node.attrs.datajs = newClasses.datajs.join(" ")
    }
    if (newClasses.class) {
      node.attrs.class = newClasses.class.join(" ")
    }    
    return node       
  })
} 

PostHTML([plugin])
  //.use(plugin)
  .process(html)
  .then( result => {
      console.log('\ntree: ' + JSON.stringify(result.tree))
      console.log('\nhtml: ' + result.html)
      //return tree
    }
  )
