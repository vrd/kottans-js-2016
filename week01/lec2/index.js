"use strict";

const PostHTML = require("posthtml");
const html = 
`
<p class=js-smth> Text </p>
`
const newHtml =
`
<p data-js=smth> Text </p>
`
PostHTML([])
