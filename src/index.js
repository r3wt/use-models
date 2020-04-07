import {useState,useMemo} from 'react';
import validators from './lib/validators';

function extendValidators( name, fn ) {
    validators[name] = fn;
};

var debugMode=false;
function enableDebug( v ) {
    debugMode=true
}

function log(...args){
    debugMode && console.log(...args);
}

export {extendValidators,enableDebug};

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
    log('validationPaths',paths);
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

export default function useModels(defaultState={}) {

    const [state,setState] = useState(defaultState);
    const [errors,setErrors] = useState(oSet({...defaultState},false));
    log(state,errors);

    let validationPaths = null;
    let validate = ()=>new Promise(resolve=>resolve(0));
    let errorHandler =()=>{};
    function useValidation( options ) {
        log('useValidation()');
        validationPaths = getValidationPaths(options);
        validate = async () => {
            log('validate()');
            const errs=[];
            for(let k in validationPaths){
                for(let i =0;i<validationPaths[k].length;i++){
                    try{
                        await execValidator(validationPaths[k][i],getValue(k));
                    }
                    catch(e){
                        errs.push({field:k,error:e});
                    }
                }
            }

            log('got results',errs);
            let errState = oSet({...defaultState},false);
            log('errState is',errState);
            if(errs.length){
                log('got %d errors',errs.length);
                errs.forEach(err=>{
                    log('looking at errors',err.field,err.error);
                    err.error=typeof err.error!='string'?err.error.message:err.error;
                    errState=getUpdate(err.field,err.error,errState);
                });
            }
            log(errState);
            setErrors(errState);    
            return errs;

        }
        log(validationPaths);
    }

    function getValue(name) {
        log('getValue()');
        const path = parsePath(name);
        let value = state;
        for(let i=0;i<path.length;i++) {
            value=value[path[i]];
        }
        return value;
    }

    function getUpdate(name,value,__state=state) {
        log('getUpdate()');
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

    function input(name,type="text",..._validators){
        log('input()')
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
                setState(getUpdate(name,value))
            },
            value: getValue(name),
            name,
            type
        };
    };

    function checkbox(name,truevalue=true,falsevalue=false){
        log('checkbox()');
        return {
            onChange: (e)=>setState(getUpdate(name,e.target.checked?truevalue:falsevalue)),
            checked: getValue(name)===truevalue,
            type:'checkbox',
            name,
            value:truevalue
        };
    };

    function radio(name,value=null){
        log('radio()');
        return {
            onChange: (e)=>e.target.checked && setState(getUpdate(name,value)),
            checked:  getValue(name)===value,
            type:'radio',
            name,
            value
        };
    };

    function submit(cb){
        log('submit()')
        return async e=>{
            log('onSubmit()');
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
        log('error()');
        errorHandler=cb;
        return e=>{
            log('errorHandler()');
            cb(errors,state);
        };
    }

    function getState() {
        log('getState()');
        return state;
    }

    function getErrors(){
        log('getErrors()');
        return errors;
    }
    
    return {input,checkbox,radio,submit,error,getState,getErrors,setState,useValidation};

};