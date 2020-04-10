import { useState } from 'react';
import validators from './lib/validators';

function extendValidators( name, fn ) {
    validators[name] = fn;
};

function model( value, ...validate) {
    return { value, validate };
}

export { extendValidators, model };

const has = (o,k) => o[k]!==undefined;

const flatten = object => {
  return Object.assign( {}, ...function _flatten( objectBit, path = '' ) {  //spread the result into our return object
    return [].concat(                                                       //concat everything into one level
      ...Object.keys( objectBit ).map(                                      //iterate over object
        key => typeof objectBit[ key ] === 'object' && !Array.isArray(objectBit[key]) ?                       //check if there is a nested object
          _flatten( objectBit[ key ], !path?key:`${ path }.${ key }` ) :              //call itself if there is
          ( { [  !path ? key : `${ path }.${ key }` ]: objectBit[ key ] } )                //append object with it’s path as key
      )
    )
  }( object ) );
};

const getValidationPaths = (options) => {
    const paths = flatten(options);
    for(let k in paths){
        if(!Array.isArray(paths[k])){
            paths[k]=[paths[k]];
        }
    }
    console.log('validationPaths',paths);
    return paths;
}

function execValidator(fn,val) {
    const executor = typeof fn==='function'?fn:has(validators,fn)?validators[fn]:function noop(){ console.warn('built in validator with name `%s` not found. this is a no-op',fn)};//default-> no op
    const res = executor(val);
    if(!(res instanceof Promise)){
        if(res){
            return Promise.reject(!(res instanceof Error) ? new Error(res): res);
        }
        return Promise.resolve();
    }
    return res;
}

function parsePath(path) {
    return path.split('.');
}

//recursive assign value to all properties of object
function oSet(o,v) {
    for(let k in o){
        if(typeof o[k]==='object'){
            oSet(o[k],v);
        }else{
            o[k]=v;
        }
    }
    return o;
}

function assignValues( optPointer, statePointer, errorPointer ) {
    for(let k in optPointer) {
        console.log(k,optPointer[k]);
        if(typeof optPointer[k]==='object'&&optPointer[k]!==null){
            let shouldRecurse=true;
            if(has(optPointer[k],'value')){
                statePointer[k]=optPointer[k].value;
                shouldRecurse=false;
            }
            if(has(optPointer[k],'validate')){
                errorPointer[k]=optPointer[k].validate;
                shouldRecurse=false;
            }
            if(shouldRecurse){
                if(!has(statePointer,k)){
                    statePointer[k]={};
                }
                if(!has(errorPointer,k)){
                    errorPointer[k]={};
                }
                assignValues(optPointer[k],statePointer[k],errorPointer[k]);
            }
        }else{
            statePointer[k]=optPointer[k];
        }
    }
} 

function parseOptions ( opts ) {
    const defaultState = {};
    const errorOptions = {};
    assignValues(opts,defaultState,errorOptions);//this recursive function will populate defaultState and errorOptions for us.
    const errorState = oSet({...defaultState},false);
    const validationPaths = getValidationPaths(errorOptions);
    console.log(defaultState,errorState,validationPaths);
    return {defaultState,errorState,validationPaths};
}

function stringifyErr( err ) {
    if(typeof err ==='string'){
        return err;
    }else{
        // Error, or Error like object(eg, custom error classes)
        if(typeof err==='object' && has(err,'message')) {
            return err.message;
        }
    }
    return err.toString();//last resort
}

// const customInputMethods = {};

// function createCustomInput( name, interface ) {
//     customInputMethods[name]=interface;
// }

export default function useModels(options={}) {

    const {defaultState,errorState,validationPaths} = parseOptions(options);
    const watchPaths={};

    const [state,setState] = useState(defaultState);
    const [errors,setErrors] = useState(errorState);

    console.log(state,errors);

    const validate = async () => {
        console.log('validate()');
        const errs=[];
        for(let k in validationPaths){
            for(let i=0;i<validationPaths[k].length;i++){
                try{
                    await execValidator(validationPaths[k][i],getValue(k));
                }
                catch(e){
                    errs.push({field:k,error:e});
                }
            }
        }

        console.log('got results',errs);
        let errState = oSet({...defaultState},false);
        console.log('errState is',errState);
        if(errs.length){
            console.log('got %d errors',errs.length);
            errs.forEach(err=>{
                console.log('looking at errors',err.field,err.error);
                errState=getUpdate(err.field,stringifyErr(err.error),errState);
            });
        }
        console.log(errState);
        setErrors(errState);    
        return errs;

    }

    const validatePath = async (path,value) => {
        console.log('validatePath()');
        if(has(validationPaths,path)){
            for(let i=0;i<validationPaths[path].length;i++){
                try{
                    await execValidator(validationPaths[path][i],value);
                }
                catch(e){
                    console.log('gotError in validatePath()',e);
                    return setErrors(getUpdate(path,stringifyErr(e),errors));
                }
            }
            setErrors(getUpdate(path,false,errors));
        }else{
            console.log('no validation for field');
        }
    };

    let errorHandler =()=>{};

    function getValue(name) {
        console.log('getValue()');
        const path = parsePath(name);
        let value = state;
        for(let i=0;i<path.length;i++) {
            value=value[path[i]];
        }
        return value;
    }

    function getUpdate(name,value,__state=state) {
        console.log('getUpdate()');
        const _state = {...__state};
        const path = parsePath(name);
        if(path.length){
            var obj = _state;
            for(let i=0;i<path.length-1;i++) {
                obj = has(obj,path[i]) ? obj[path[i]] : {};
            }
            obj[path[path.length-1]] = value;    
        }
        return _state;    
    }

    function input(name,type="text"){
        console.log('input()')
        return {
            onChange: (e)=>{
                console.log(e);
                var value = e;//components like react-select-me pass primitive values
                if(has(e,'value')){
                    value = e.value;
                }
                console.log(has(e,'target'));
                if(has(e,'target')){
                    value = e.target.value;//normal inputs dont
                }
                console.log(value);
                const oldValue = getValue(name);
                setState(getUpdate(name,value));
                if(watchPaths[name]){
                    watchPaths[name](value,oldValue);
                }
                validatePath(name,value);
            },
            value: getValue(name),
            name,
            type
        };
    };

    function checkbox(name,truevalue=true,falsevalue=false){
        console.log('checkbox()');
        return {
            onChange: (e)=>{
                const newValue = e.target.checked?truevalue:falsevalue;
                const oldValue = getValue(name);
                setState(getUpdate(name,newValue));
                if(watchPaths[name]){
                    watchPaths[name](newValue,oldValue);
                }
                validatePath(name,newValue);
            },
            checked: getValue(name)===truevalue,
            type:'checkbox',
            name,
            value:truevalue
        };
    };

    function radio(name,value=null){
        console.log('radio()');
        return {
            onChange: (e)=>{
                if(e.target.checked){
                    const newValue = value;
                    const oldValue = getValue(name);
                    setState(getUpdate(name,value))
                    if(watchPaths[name]){
                        watchPaths[name](newValue,oldValue);
                    }
                    validatePath(name,newValue);
                }
            },
            checked:  getValue(name)===value,
            type:'radio',
            name,
            value
        };
    };

    function submit(cb){
        console.log('submit()')
        return async e=>{
            console.log('onSubmit()');
            e.preventDefault();
            const errs = await validate();
            console.log('got result from validate()',errs);
            if(errs.length){
                errorHandler(errors,state);
            }else{
                cb(state);//send the full state to the submit function
            }
            e.stopPropagation();
        };
        
    };

    function error(cb) {
        console.log('error()');
        errorHandler=cb;
        return e=>{
            console.log('errorHandler()');
            cb(errors,state);
        };
    }

    function getState() {
        console.log('getState()');
        return state;
    }

    function getErrors(){
        console.log('getErrors()');
        return errors;
    }

    function watch( path, fn ) {
        console.log('watch()')
        watchPaths[path]=fn;
        return function unwatch(){
            delete watchPaths[path];
        }
    }

    function set( name, value, validate=true,watchers=true ) {
        const oldValue = getValue(name);
        setState(getUpdate(name,value));
        if(watchers && watchPaths[name]){
            watchPaths[name](value,oldValue);
        }
        if(validate){
            validatePath(name,value);
        }
    }

    function hydrate( _state, _errors=false) {
        console.log('hydrate()');
        setState({...state,..._state});
        if(_errors){
            setErrors({...errors,..._errors});
        }
    } 
    
    return { input, checkbox, radio, submit, error, errors, state, watch, hydrate, set, getState, getErrors, setState, setErrors };

};