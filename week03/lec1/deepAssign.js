'use strict'

module.exports = (target, sources) => {
  
  function deep(target, source) {
    if (source !== Object(source)) {
      var to = source
    } else {
      var to = new Object(target)
      console.log(JSON.stringify(to))
      Reflect.ownKeys(source).forEach( key => {
        console.log(JSON.stringify(to))
        if (source.propertyIsEnumerable(key)) {
          console.log('prop is enum')
          to[key] = deep(to[key], source[key])
        }
        console.log(JSON.stringify(to))
      })          
    }
    return to 
  }

  if (src.length === 0) {
    throw new Error('At least two args are needed!')
  } else if (src.length === 1) {

  }



}


