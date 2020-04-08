# use-models

> advanced form model hooks for your functional react components

[![NPM](https://img.shields.io/npm/v/use-models.svg)](https://www.npmjs.com/package/use-models) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save use-models
```

## Features

- form helpers `input`, `checkbox`, and `radio` which wire up your form elements to state with path syntax, eg `book.author.firstname`
- form validation supporting built in validators, custom validators, async validators, and ability to extend built in validators for usage across project.
- ability to hydrate state using the `hydrate` function, useful for syncing from api or from localstorage, or whatever you need. 
- 

## Usage

1. **Basic Example** 

```jsx
// code to come
```

2. **Validation Example**

```jsx
// code to come
```

3. comprehensive example (all features)
```jsx
// code to come
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