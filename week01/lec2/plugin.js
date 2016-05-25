"use strict"

const PostHTML = require("posthtml")

const html = `<p class="js-smth kottansjs-smth col-lg-12 
pricol-lg-12 col-xs-push-1 pricol-xs-push-144 margin5left">Text</p>`


const plugin = tree => {
  tree.map( node => {
    //regexps for processing
    const bootRegExp = /^col\-(xs|sm|md|lg)(\-(push|pull|offset))?\-\d\d?$/i
    const datajsRegExp = /^js\-\w+/i
    // create array of classes and reduce it to two arrays:
    // datajs[] and class[] without bootstrap stuff
    let newClasses = node.attrs.class.split(" ").reduce( (prev, cur) => {
      if (datajsRegExp.test(cur)) {
        prev.datajs[prev.datajs.length] = cur.slice(3) //add class name without first three symbols (js-)
      } else if (!bootRegExp.test(cur)) {
        prev.class[prev.class.length] = cur        
      }      
      return prev
    }, {datajs: [], class: []} //initial prev value
    )
    //create data-js attribute
    if (newClasses.datajs.length > 0) {
      node.attrs['data-js'] = newClasses.datajs.join(" ")
    }
    //replase class attribute with new value
    if (newClasses.class.length > 0) {
      node.attrs.class = newClasses.class.join(" ")
    } else {
      delete node.attrs.class //or delete it if no classes left
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
