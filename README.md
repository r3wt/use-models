# use-models

> advanced form model hooks for your functional react components. build huge, complex forms with validation using minimal boilerplate code.

[![NPM](https://img.shields.io/npm/v/use-models.svg)](https://www.npmjs.com/package/use-models) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save use-models
```

## Features

- form helpers `input`, `checkbox`, and `radio` which wire up your form elements to state with path syntax, eg `book.author.firstname`. nesting supported for objects(and possibly arrays)
- form validation supporting built in validators, custom validators, async validators, and ability to extend built in validators for usage across project.
- simple `state` object representing your forms state, and an `errors` object which displays when a field has an error. state properties are mirrored on the errors object.
- ability to hydrate state using the `hydrate` function, useful for syncing from api or from localstorage, or whatever you need. 
- ability to watch fields for changes with `watch` helper method, which receives `oldValue` and `newValue` as arguments.
- `submit` and `error` functions that create handlers for your form's `onSubmit` and `onError` events. submit receives a copy of `state` and `errors` receives a list of form errors.
- no dependencies (other than react ofc)
- highly configurable/composable. 
- plugin friendly, offering plenty of ways to "hook" into the library for custom functionality.

## Tutorial

> this tutorial will teach you the concepts of how to use the features to build your application

1. setting up your state with `useModels` and wiring up an input to the state with `input` helper.

```jsx
import React from 'react';
import useModels from 'use-models';

export default function Example() {

    // here you can see that useModels is called with an object defining our state(and optionally validation, which will be shown in a later step)
    const { 
        input, // input ( path, type='text' )
        checkbox, // checkbox( path, trueValue=true, falseValue=false )
        radio // radio( path, value )
    } = useModels({
        email_address: '',
        password:'',
        remember_me: false,
        newsletter_signup: 'no'
    });

    // this is example shows a login form
    return (
        <div className="example">
            <form>
            <div className="form-group">
                <label>Email</label>
                <input {...input('email_address','email')} />
            </div>
            <div className="form-group">
                <label>Password</label>
                <input {...input('password','password')} />
            </div>
            <div className="form-group-check">
                <input {...checkbox('remember')} /> <label>Remember me</label>
            </div>
            <div className="form-group with-nested">
                <label>Sign up for newsletter?</label>
                <div className="form-group-check">
                    <input {...radio('newsletter','yes')} /> <label>Yes, Sign me up!</label>
                </div>
                <div className="form-group-check">
                    <input {...radio('newsletter','no')} /> <label>No thanks</label>
                </div>
            </div>
            <button type="submit">Login</button>
            </form>
        </div>
    );

}
```

2. adding validation 

importing the model helper:
```jsx
import React from 'react';
import useModels,{model} from 'use-models';//we can add the model helper for ease in defining our models. this is optional, as options can be defined as a plain object as well
```

using model helper:

```jsx
const { 
    input, // input ( path, type='text' )
    checkbox, // checkbox( path, trueValue=true, falseValue=false )
    radio // radio( path, value )
} = useModels({
    email_address: model('','email') // here we are declaring a field with default value of "" and a named validator called "email" which validates an email address.
});
```

using a plain object:

```jsx
const { 
    input, // input ( path, type='text' )
    checkbox, // checkbox( path, trueValue=true, falseValue=false )
    radio // radio( path, value )
} = useModels({
    email_address: { value: '', validate:['email'] } // equivalent to model('','email');
});
```

custom validator functions:

```jsx
const { 
    input, // input ( path, type='text' )
    checkbox, // checkbox( path, trueValue=true, falseValue=false )
    radio // radio( path, value )
} = useModels({
    username: model('',value=>{
        // we are passing a custom validator
        // you should return a string or Error( Custom error classes and Error Like objects are ok too) for failing validation, else return a falsy value or nothing at all
        // you can also return a promise for async validation, which will be shown in next example
        if(value.length<5){
            return 'Username must be atleast 5 characters in length. Choose a longer name';// you can return a string error message
        }
        if(value.length>30){
            return new Error('Username cannot be longer than 30 characters in length. Choose a shorter name.');//showing returning an Error object
        }

    })
}); 
```

async validator example:

```jsx
export default function Example() {
    const { 
        input, // input ( path, type='text' )
        checkbox, // checkbox( path, trueValue=true, falseValue=false )
        radio // radio( path, value )
    } = useModels({
        username: model('',async value=>{
            return await new Promise((resolve,reject)=>{
                setTimeout(()=>{
                    reject(new Error('that username is taken. try a different name'))
                },200);
            });
        })// simulating a network call to check if the username is available.
    });

    ...

}
```

extending validators for shared re-use across your project:

```jsx
import useModels,{model,extendValidators} from 'use-models';

extendValidators('myCustomValidator',value=>{
    // your validation logic here
});

function Example() {
    const { 
        input, // input ( path, type='text' )
        checkbox, // checkbox( path, trueValue=true, falseValue=false )
        radio // radio( path, value )
    } = useModels({
        username: model('','myCustomValidator')// tell useModels() to use `myCustomValidator` for this field
    });

    ...

}

```

you can use as many validator functions as you want. the additional arguments to `model()` will accumulate:

```jsx
model('','email','myCustomValidator',value=>{}) // equivalent to { value:'', validate:['email','myCustomValidator', value=>{} ] }
```

3. handling form submit and form submit error

```jsx
export default function Example() {
    const { submit, error } = useModels({
        foo:''
    });

    const onSubmit = submit(state=>{
        //the form has been submitted and there are no errors. the full state object is available here(though it is also returned from `useModels()` as well)
    });

    const onError = error((errors,state)=>{
        //the form was submitted, but there is an error. 
        // NOTE: the arguments to this function may change, but currently the error and state objects are what is received.
    });

    return <form onSubmit={onSubmit} onError={onError}> ... </form>  
}

```

4. displaying form errors by reading `error` object

> The state object is mirrored 1:1 to the errors object. all values in the errors object will be `false`, unless the field has an error.
> for example, if you have a field called `username`, you can check if there is an error in the field by reading `errors.username`, as shown below:

```jsx
export default function Example() {
    const { input, submit, error, state, errors } = useModels({
        username: model('','not_empty')
    });

    const onSubmit = submit(()=>{});
    const onError = error(()=>{});

    return (
        <form onSubmit={onSubmit} onError={onError}>
            <label>Choose Username</label>
            <input {...input('username')} />
            { errors.username && <p className="input-error">{errors.username}</p> }
            <button type="submit">Submit</button>
        </form>
    )
}
```

5. executing code when the value of a field changes using the `watch()` api

```jsx
export default function Example() {
    const { input, watch } = useModels({
        username: model('','not_empty')
    });

    // you can watch a field for changes, very simply
    // the returned function can be used to deregister the watcher
    const unwatch = watch('username',(newValue,oldValue)=>{
        console.log('username changed from %s to %s',oldValue,newValue);
    });

    return (
        <form onSubmit={onSubmit} onError={onError}>
            <label>Choose Username</label>
            <input {...input('username')} />
            { errors.username && <p className="input-error">{errors.username}</p> }
            <button type="submit">Submit</button>
        </form>
    )
}
```

6. reading the `state` object

> sometimes you want to read the form state and use it to render some component in your ui with the form state. you can do that with the `state` variable.

```jsx
export default function Example() {
    const { input, state } = useModels({
        age: ''
    });

    return (
        <form>
            <div>
                <label>Please enter your age:</label>
                <input {...input('age')} />
            </div>  
            <div>
                <p><strong>You entered: </strong> {state.age} </p>
                { state.age != '' && state.age < 18 ? <p>You are not old enough to see this content</p>:<p>You are old enough to see this content</p> }
            </div>
        </form>
    );
}
```

7. populating the state with data using `hydrate()`
> you will probably face a situation where you need to load some data, whether from the network or from localstorage or even a cookie. you can do so very easily using `hydrate()`
> below example shows hydrating state on componentMount, which is probably the most common use case.
> NOTE: in addition to hydrating the `state`, you can also hydrate the `errors` object if desired, by passing a second argument.
> NOTE: partial updating is supported, but only for top level keys. no diffing is done at a nested level. this behavior may change in the future.
```jsx
import React,{useEffect} from 'react'
import useModels from 'use-models'

export default function Example() {

    const { hydrate, state } = useModels({
        firstname:'',
        lastname:'',
        email:''
    });

    useEffect(()=>{
        hydrate({
            firstname:'Garrett',
            lastname:'Morris',
            email:'test@test.com'
        });
    },[hydrate]);// note: if you don't pass hydrate in as a dependency to useEffect(), the linter complains. 

    console.log(state);// on second render you will see state populated with the values passed to hydrate.

    return (
        ...
    );
}
```

8. using `get()` and `set()` for custom input methods or for other state features, like a loading indicator

```jsx

import React from 'react'
import useModels from 'use-models'

function registerUser( name ) {
    ...
}

export default function Example() {

    const { state, input, get, set, submit } = useModels({
        loading: false,
        name:'',
        user_type:'user',
        submit_error:null
    });

    const onSubmit = submit(()=>{
        set('loading',true);
        registerUser(state.name).then(()=>{
            set('loading',false);
            set('submit_error',null);
        })
        .catch(err=>{
            console.log('err',err);
            set('loading',false);
            set('submit_error',err.message);
        })
    })

    return (
        state.loading ? <div>'Loading...'</div> : (
            <form onSubmit={onSubmit}>
                { state.submit_error && <p className="alert">Form Error: {state.submit_error} </p> }
                <h1>Register Account</h1>
                <div className="form-group">
                    <label>Your Name</label>
                    <input {...input('name')} />
                </div>
                <div className="user-type-select">
                    <div className={"user-type-option"+(state.user_type==='user'?' selected':'')} onClick={e=>set('user_type','user')}>
                        Normal User
                    </div>
                    <div className={"user-type-option"+(state.user_type==='admin'?' selected':'')} onClick={e=>set('user_type','admin')}>
                        Admin User
                    </div>
                </div>
                <button type="submit">Create User</button>
            </form>

        )
    )

```


9. advanced topics: directly manipulating `state` and `errors` programatically
   
> this feature is experimental, and you are responsible for managing the diffing of your state and error objects. failure to do so will definitely crash your ui

```jsx
// you do this at your own risk!
const state = {...getState()};
state.foo=1;
setState(state);
```

## API


#### main export: 

`useModels( Object options={} )` 
> initializes the state of the component, returning helper functions for use in your component.
> NOTE: must be called from within a functional component.
    
**arguments**
- `options` - declare your default state with options for each field. example syntax `{ name:'' }` or `{ name: { value:'', validators:[] }}`. you can also use the `model` helper like so `{ name: model(defaultValue,...validationFunctions)}` as a shorthand for declaring the value and validators for the field. 

**returns**
- An object with helper functions `{ input, checkbox, radio, submit, error, getState, getErrors, setState, setErrors, errors, state, watch, hydrate }`

#### helpers (returned from `useModels()`):

- `hydrate( Object state[, Object errors] )` - allows you to hydrate your state with the data of your choice. you can optionally hydrate the errors as well.
- `state` - this is the state object. you can use it to read/display data from the state for whatever reason you wish. (see examples)
- `errors` - this is the errors object. you can use it to read data from the errors and display the error messages. (see examples)
- `watch( String name, Function callback( Any newValue, Any oldValue ) )` - allows you to assign a watcher to a state field and be notified when its value changes. 
   - `name` - the path of the model to watch. nesting is supported
   - `callback` - the callback function to execute when the model changes. it will receive `newValue` and `oldValue` as arguments. 
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
- `get( String name )` - can be used to read the value of a given model.
- `set( String name, Any value, Boolean validate=true, Boolean watchers=true )` - can be used to directly manipulate a given model.
   - `name` - the path of the model to update. nesting is supported.
   - `value` - the value to set for the model.
   - `validate` - whether or not to run validators on the new value. defaults to `true`.
   - `watchers` - whether or not to run watchers on the new value. defaults to `true`. 
- `submit( Function callback( state ) )` - given a callback, this method returns an `onSubmit` handler for your form. the passed `callback` will be called with the `state` object. 
   - `callback` - a function to be called when the form is submitted.
- `error( Function callback( errors, state) )` - given a callback, this returns an `onError` handler for your form. if any native validation or custom validation errors occurs, you will receive that info here.
   - `callback` - a function to be called when an error occurs during form submit. 
- `getState` - retrieves the `state` object programatically.
- `setState( Object newState )` - allows you to programatically manipulate the state object.
- `getErrors` - retrieves the `errors` object programatically.
- `setErrors` - allows you to programatically manipulate the errors object.


## License

MIT © [r3wt](https://github.com/r3wt)