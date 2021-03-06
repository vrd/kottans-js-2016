(function()
{
  'use strict'
  //if (typeof Object.deepAssign == "function") return

  Object.defineProperty(Object, 'deepAssign',
  {
    value: function deepAssign(target, ...sources)
    { 
      //helper function for copying objects (mini assign) 
      function copy(from)
      { 
        if (from === null) throw new TypeError('null detected')
        //from is object and some work is needed
        if (from instanceof Object || from instanceof Array) 
        {
          var to = new from.constructor
          Reflect.ownKeys(from).forEach( key => 
          {        
            if (from.propertyIsEnumerable(key))
            { //simple way:
              // to[key] = copy(from[key])
              //data/accessor detection:
              let descr = Object.getOwnPropertyDescriptor(from, key)
              if ('value' in descr) to[key] = copy(descr.value)
              else Object.defineProperty(to, key, descr)          
            }        
          })
        }
        //from is object that can be copied with "new from.constructor"
        else if (from === Object(from)) var to = new from.constructor(from)
        //from is primitive and can be simply copied         
        else var to = from
        return to
      }

      if ([target].concat(sources).some(arg => arg === null)) throw new TypeError('null detected')
      
      var to = copy(target)

      for (let i = 1; i < arguments.length; i++)
      {
        let from = arguments[i]
        //from and to are objects and have same type so trying to merge
        if (from === Object(from) && to === Object(to) && from.constructor === to.constructor)
        {
          Reflect.ownKeys(from).forEach( key => 
          {        
            if (from.propertyIsEnumerable(key))
            { //simple way
              //to[key] = deepAssign(to[key], from[key])
              //more complex
              let descr = Object.getOwnPropertyDescriptor(from, key)
              if ('value' in descr) {
                if (key in to) 
                {
                  if (Object.getOwnPropertyDescriptor(to, key).configurable === false) throw new Error('property is non-configurable!')
                  else to[key] = deepAssign(to[key], from[key]) //merge
                }                
                else to[key] = copy(from[key]) //copy
              }
              else Object.defineProperty(to, key, descr) //source.key is accessor, merge is difficult, so rewrite
            }        
          })
        }
        //from and to are different types and can't be merged 
        else to = copy(from)
      }
      return to 
    },
    writable: true,
    configurable: true
  })
})()

