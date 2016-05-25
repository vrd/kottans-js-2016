"use strict"

const PostHTML = require("posthtml")
const plugin = require("./plugin")

const tests = [
{
  in: '<p>Text</p>',
  out: '<p>Text</p>' 
},
{
  in: '<p class="someclass">Text</p>',
  out: '<p class="someclass">Text</p>' 
},
{
  in: '<p class="col-md-10">Text</p>',
  out: '<p>Text</p>' 
},
{
  in: '<p class="col-xs-push-1">Text</p>',
  out: '<p>Text</p>' 
},
{
  in: '<p class="js-some">Text</p>',
  out: '<p data-js="some">Text</p>' 
}
]

tests.forEach( (test, i) => {
  PostHTML()
    .use(plugin)
    .process(test.in)
    .then( result => {
      if (result.html === test.out) {
        console.log('Test ' + (i) +'\t\t[OK]')
      } else {
        console.log('! Test ' + (i) +'\t\t[ERROR]')
      }
    })
}) 

