# use-models

> advanced form model hooks for your functional react components

[![NPM](https://img.shields.io/npm/v/use-models.svg)](https://www.npmjs.com/package/use-models) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save use-models
```

## Usage

```jsx
import React from 'react'

import useModels from 'use-models'

export default function App(props) {

    const {input,checkbox,radio,submit} = useModels({
        name:'',
        email:'',
        remember:false,
        newsletter:'no'
    });

    const onSubmit = submit(state=>{
        //do something with your form data
        console.log(state);
    });

    return (
        <form onSubmit={onSubmit}>
            <div>
                <label>Name</label>
                <input {...input('name')} />
            </div>
            <div>
                <label>email</label>
                <input {...input('email','email')} />
            </div>
            <div>
                <input {...checkbox('remember')} /> <label>Remember me</label>
            </div>
            <div>
                <label>Sign up for newsletter?</label><br/>
                <input {...radio('newsletter','yes')} /> <label>Yes, Sign me up!</label><br/>
                <input {...radio('newsletter','no')} /> <label>No thanks</label>
            </div>
            <button type="submit">Submit</button>
        </form>
    );
    
}
```

## API


### MAIN EXPORT: 

`useModels( defaultState={}, autoAssign=true )` 
> initializes the state of the component, returning helper functions for use in your component.
> NOTE: must be called from within a functional component.
    
**arguments**
    - `defaultState` - declares the default state used by your component. supports nested objects and arrays.
    - `autoAssign` - if defaultState is an empty object and autoAssign is true, each call to one of the helper functions will create the default value in the state object automatically.

**returns**
 An object with helper functions `{input,checkbox,radio,submit}`

 ### HELPERS:

 `input( name, type='text' )` - for use with `input`, `select`, `textarea` and other components. returns `props` for use on inputs.
 `checkbox( name, truevalue=true, falsevalue=false )` - to be used for checkbox components, whether native or custom. returns `props` for use on inputs.
 `radio( name, value=null )` - for use with radio components, whether native or custom. value is the value to assign to the state if the radio is checked. returns `props` for use on inputs.
 `submit( callback )` - given a callback, this method returns an `onSubmit` handler for your form. the passed `callback` will be called with the `state` object.



## License

MIT © [r3wt](https://github.com/r3wt)
