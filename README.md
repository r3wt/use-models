# use-models

> advanced form model hooks for your functional react components

[![NPM](https://img.shields.io/npm/v/use-models.svg)](https://www.npmjs.com/package/use-models) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save use-models
```

## Usage

```jsx
import React from 'react';

import useModels from 'use-models';

function checkIfUserNameExists( value, err) {
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            reject('That username is taken');
        },200);
    });
}

export default function App(props) {

    const {input,checkbox,radio,submit,error,useValidation} = useModels({
        name:'',
        username:'',
        email:'',
        remember:false,
        newsletter:'no'
    });

    // errors is a state object that can be read to show when a form has an error.
    const errors = useValidation({
        name:( value ) => {
            if( value.length<5 ){
                return 'Name must be at least 5 characters';
            }
        }, //custom function based validator
        email:'email', //built in validator
        username:( value ) => {
            return checkIfUserNameExists(value)
        }// showing async validation
    });

    const onSubmit = submit(state=>{
        //do something with your form data
        console.log(state);
    });

    const onError = error((errors,state)=>{
        //do something on form submit error
    });

    return (
        <form onSubmit={onSubmit} onError={onError}>
            <div>
                <label>Name</label>
                <input {...input('name')} />
                { errors.name && <p class='help-text'>{errors.name}</p> }
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


#### main export: 

`useModels( Object defaultState={}, Boolean autoAssign=true )` 
> initializes the state of the component, returning helper functions for use in your component.
> NOTE: must be called from within a functional component.
    
**arguments**
- `defaultState` - declares the default state used by your component. supports nested objects and arrays.
- `autoAssign` - if `defaultState` is an empty object and `autoAssign` is true, each call to one of the helper functions will create the default value in the state object automatically, if the value doesn't yet exist for that path.

**returns**
- An object with helper functions `{input,checkbox,radio,submit,error,getState,setState,useValidation}`

#### helper:

- `useValidation( Object options )` - you can optionally use this helper to configure form validation for one or more form inputs.
- `input( String name, String type='text' )` - for use with `input`, `select`, `textarea` and other components. returns `props` for use on inputs.
   - `name` - the path of the model. nesting is supported. examples of valid paths: `firstname` or `book.author.firstname` or `post.comments.0.text`. 
   - `type` - the type attribute for the input. defaults to `text`
- `checkbox( String name,Any truevalue=true,Any falsevalue=false )` - to be used for checkbox components, whether native or custom. returns `props` for use on inputs.
   - `name` - see description under `input`
   - `truevalue` - the value for the field if checkbox is checked. defaults to `true`
   - `falsevalue` - the value for the field if checkbox is unchecked. defaults to `false`
- `radio( String name, Any value=null )` - for use with radio components, whether native or custom. value is the value to assign to the state if the radio is checked. returns `props` for use on inputs.
   - `name` - see description under `input`
   - `value` - the value of the field if the checkbox is checked. 
- `submit( Function callback( state ) )` - given a callback, this method returns an `onSubmit` handler for your form. the passed `callback` will be called with the `state` object. 
   - `callback` - a function to be called when the form is submitted.
- `error( Function callback( errors, state) )` - given a callback, this returns an `onError` handler for your form. if any native validation or custom validation errors occurs, you will receive that info here.
   - `callback` - a function to be called when an error occurs during form submit. 
- `getState` - retrieves the `state` object programatically.
- `setState( Object newState )` - allows you to programatically manipulate the state.


## License

MIT © [r3wt](https://github.com/r3wt)