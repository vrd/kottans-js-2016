"use strict"

const PostHTML = require("posthtml")

const html = `<p class="js-smth col-lg-12 margin5left">Text</p>`
const newHtml =`<p data-js=smth class=margin5left>Text</p>`
const bootstrapRegExp = /col\-lg\-12/i


const plugin = tree => {
  tree.map( node => {
    let classes = node.attrs.class.split(" ")
    let newClasses = classes.reduce( (prev, cur) => {
      if (!bootstrapRegExp.test(cur)) {
        prev[prev.length] = cur        
      }      
      return prev
    }, [])
    node.attrs.class = newClasses.join(" ")
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
