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
},
{
  in: '<p class="jjs-some">Text</p>',
  out: '<p class="jjs-some">Text</p>' 
},
{
  in: '<p class="pricol-xs-push-1">Text</p>',
  out: '<p class="pricol-xs-push-1">Text</p>'  
},
{
  in: '<p class="col-xs-push-1 js-some123">Text</p>',
  out: '<p data-js="some123">Text</p>' 
},
{
  in: '<p class="col-xs-push-1 js-444some okclass">Text</p>',
  out: '<p class="okclass" data-js="444some">Text</p>' 
},
{
  in: '<a href="google.com">Text</a>',
  out: '<a href="google.com">Text</a>' 
},
{
  in: '<a href="col-md-9">Text</a>',
  out: '<a href="col-md-9">Text</a>' 
},
{
  in: '<a href="js-href">Text</a>',
  out: '<a href="js-href">Text</a>'
},
{
  in: '<p brfg=reterte>r67rtur67urr',
  out: '<p brfg="reterte">r67rtur67urr</p>' 
},
{
  in: '<p class="error-demo">Text</p>',
  out: '<p class="unexpected">Text</p>' 
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
        console.error('! Test ' + (i) +'\t\t[ERROR]')
        console.log('\ninput HTML:\n' + test.in)
        console.log('\nexpected HTML:\n' + test.out)
        console.log('\noutput HTML:\n' + result.html + '\n')
      }
    })
}) 

