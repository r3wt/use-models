import { useState, useCallback } from 'react';
import validators from './lib/validators';

export type ValidatorFunctionReturnTypes = void | null | false | undefined | string | Error | ErrorLikeObject;
export type ValidatorFunction = (val: any) => ValidatorFunctionReturnTypes | Promise<ValidatorFunctionReturnTypes>;

function extendValidators(name: string, fn: ValidatorFunction) {
  validators[name] = fn;
};

export type ModelOption = {
  value: any;
  validate: Array<ValidatorFunction | string>;
}

function model(value: any, ...validate: Array<ValidatorFunction | string>) {
  return { value, validate } as ModelOption;
}

export { extendValidators, model };

const has = (o: any, k: string) => o[k] !== undefined;

const flatten = (object: any) => {
  return Object.assign({}, ...function _flatten(objectBit: any, path: string = ''): any[] {  //spread the result into our return object
    return ([] as any[]).concat(                                                       //concat everything into one level
      ...Object.keys(objectBit).map(                                      //iterate over object
        key => typeof objectBit[key] === 'object' && !Array.isArray(objectBit[key]) ?                       //check if there is a nested object
          _flatten(objectBit[key], !path ? key : `${path}.${key}`) :              //call itself if there is
          ({ [!path ? key : `${path}.${key}`]: objectBit[key] })                //append object with it’s path as key
      )
    ) as any[];
  }(object));
};

const getValidationPaths = (options: ParseOptions) => {
  const paths = flatten(options);
  // for (let k in paths) {
  //   if (!Array.isArray(paths[k])) {
  //     paths[k] = [paths[k]];
  //   }
  // }

  return paths;
}

function execValidator(fn: ValidatorFunction | string, val: any) {
  const executor = typeof fn === 'function' ? fn : has(validators, fn) ? validators[fn] : function noop() { console.warn('built in validator with name `%s` not found. this is a no-op', fn) };//default-> no op
  const res = executor(val);
  if (!(res instanceof Promise)) {
    if (res) {
      return Promise.reject(!(res instanceof Error) ? new Error(res) : res);
    }
    return Promise.resolve();
  }
  return res;
}

function parsePath(path: string) {
  return path.split('.');
}

//recursive assign value to all properties of object
function oSet(o: any, v: any) {
  for (let k in o) {
    if (typeof o[k] === 'object') {
      oSet(o[k], v);
    } else {
      o[k] = v;
    }
  }
  return o;
}

function assignValues(optPointer: any, statePointer: any, errorPointer: any) {
  for (let k in optPointer) {
    if (typeof optPointer[k] === 'object' && optPointer[k] !== null) {
      let shouldRecurse = true;
      if (has(optPointer[k], 'value')) {
        statePointer[k] = optPointer[k].value;
        shouldRecurse = false;
      }
      if (has(optPointer[k], 'validate')) {
        errorPointer[k] = optPointer[k].validate;
        shouldRecurse = false;
      }
      if (shouldRecurse) {
        if (!has(statePointer, k)) {
          statePointer[k] = Array.isArray(optPointer[k]) ? [] : {};
        }
        if (!has(errorPointer, k)) {
          errorPointer[k] = Array.isArray(optPointer[k]) ? [] : {};
        }
        assignValues(optPointer[k], statePointer[k], errorPointer[k]);
      }
    } else {
      console.log('setting k',k, optPointer[k]);
      statePointer[k] = optPointer[k];
    }
  }
}

function deepClone(inObject:any) {
  let outObject, value, key;

  if (typeof inObject !== "object" || inObject === null) {
    return inObject; // Return the value if inObject is not an object
  }

  // Create an array or object to hold the values
  outObject = Array.isArray(inObject) ? [] : {};

  for (key in inObject) {
    value = inObject[key];

    // Recursively (deep) copy for nested objects, including arrays
    outObject[key] = deepClone(value);
  }

  return outObject;
}

export type ParseOptions = {
  [key: string]: any;
};

type ErrorState<T> = { [P in keyof T]: boolean | string; };

function parseOptions<T = any>(opts: ParseOptions) {

  const state = {};
  const errors = {};
  assignValues(opts, state, errors);//this recursive function will populate defaultState and errorOptions for us.
  console.log(state);
  const errorState: ErrorState<T> = oSet(deepClone(state), false);
  console.log(state);
  const validationPaths = getValidationPaths(errors);

  return { defaultState: state as T, errorState, validationPaths };
}

export type ErrorLikeObject = {
  message: string;
};

function stringifyErr(err: string | ErrorLikeObject | unknown) {
  if (typeof err === 'string') {
    return err;
  } else {
    // Error, or Error like object(eg, custom error classes)
    if (typeof err === 'object' && has(err, 'message') && typeof (err as ErrorLikeObject).message === 'string') {
      return (err as ErrorLikeObject).message;
    }
  }
  return (err as any).toString();//last resort
}

export type Options = {
  [k: string]: ModelOption | Options | any;
};

export default function useModels<T = any>(options: Options = {}) {

  const { defaultState, errorState, validationPaths } = parseOptions<T>(options);
  const watchPaths = {};
  const [state, setState] = useState<T>(defaultState);
  const [errors, setErrors] = useState<ErrorState<T>>(errorState);

  const validate = async () => {
    const errs = [];
    for (let k in validationPaths) {
      for (let i = 0; i < validationPaths[k].length; i++) {
        try {
          await execValidator(validationPaths[k][i], getValue(k));
        }
        catch (e) {
          errs.push({ field: k, error: e });
        }
      }
    }

    let errState = oSet({ ...defaultState }, false);
    if (errs.length) {
      errs.forEach(err => {
        errState = getUpdate<ErrorState<T>>(err.field, stringifyErr(err.error), errState);
      });
    }
    setErrors(errState);
    return errs;

  }

  const validatePath = async (path: string, value: any) => {
    if (has(validationPaths, path)) {
      for (let i = 0; i < validationPaths[path].length; i++) {
        try {
          await execValidator(validationPaths[path][i], value);
        }
        catch (e) {
          return setErrors(getUpdate<ErrorState<T>>(path, stringifyErr(e), errors));
        }
      }
      setErrors(getUpdate(path, false, errors));
    }
  };

  let errorHandler: any = () => { };

  function getValue(name: string) {
    const path = parsePath(name);
    let value = state;
    for (let i = 0; i < path.length; i++) {
      value = value[path[i]];
    }
    return (value as unknown) as string;
  }

  function getUpdate<T2 = T>(name: string, value: any, __state: any = state) {
    const _state: T2 = { ...__state };
    const path = parsePath(name);
    if (path.length) {
      var obj = _state;
      for (let i = 0; i < path.length - 1; i++) {
        obj = has(obj, path[i]) ? obj[path[i]] : {};
      }
      obj[path[path.length - 1]] = value;
    }
    return _state;
  }

  function input(name: string, type: string = "text") {
    return {
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | any> | React.SyntheticEvent<EventTarget> | Event | any) => {

        var value = e;//components like react-select-me pass primitive values
        if (has(e, 'value')) {
          value = (e as any).value;
        }

        if (has(e, 'target')) {
          value = (e as any).target.value;//normal inputs dont
        }

        const oldValue = getValue(name);
        setState(getUpdate(name, value));
        if (watchPaths[name]) {
          watchPaths[name](value, oldValue);
        }
        validatePath(name, value);
      },
      value: getValue(name),
      name,
      type
    };
  };

  function checkbox(name: string, truevalue: any = true, falsevalue: any = false) {

    return {
      onChange: (e: React.ChangeEvent<HTMLInputElement> | React.SyntheticEvent<EventTarget> | Event | any) => {
        const newValue = (e as any).target.checked ? truevalue : falsevalue;
        const oldValue = getValue(name);
        setState(getUpdate(name, newValue));
        if (watchPaths[name]) {
          watchPaths[name](newValue, oldValue);
        }
        validatePath(name, newValue);
      },
      checked: getValue(name) === truevalue,
      type: 'checkbox',
      name,
      value: truevalue
    };
  };

  function radio(name: string, value: any = null) {

    return {
      onChange: (e: React.ChangeEvent<HTMLInputElement> | React.SyntheticEvent<EventTarget> | Event | any) => {
        if ((e as any).target.checked) {
          const newValue = value;
          const oldValue = getValue(name);
          setState(getUpdate(name, value))
          if (watchPaths[name]) {
            watchPaths[name](newValue, oldValue);
          }
          validatePath(name, newValue);
        }
      },
      checked: getValue(name) === value,
      type: 'radio',
      name,
      value
    };
  };

  function submit(cb: (state: any) => any | void) {
    return async (e: React.FormEvent<EventTarget> | React.SyntheticEvent<EventTarget> | Event | any) => {
      e.preventDefault();
      const errs = await validate();

      if (errs.length) {
        errorHandler(errors, state);
      } else {
        cb(state);//send the full state to the submit function
      }
      e.stopPropagation();
    };

  };

  function error(cb: (errors: any, state: any) => any | void) {

    errorHandler = cb;
    return () => {

      cb(errors, state);
    };
  }

  function getState() {

    return state;
  }

  function getErrors() {

    return errors;
  }

  function watch(path: string, fn: (newVal: any, oldVal: any) => any) {
    watchPaths[path] = fn;
    return function unwatch() {
      delete watchPaths[path];
    }
  }

  function set(name: string, value: any, runValidators = true, runWatchers = true) {
    const oldValue = getValue(name);
    setState(getUpdate(name, value));
    if (runWatchers && watchPaths[name]) {
      watchPaths[name](value, oldValue);
    }
    if (runValidators
) {
      validatePath(name, value);
    }
  }

  function get(name: string) {
    return getValue(name);
  }

  const hydrate = useCallback((_state: any, _errors: any = false) => {

    setState({ ...state, ..._state });
    if (_errors) {
      setErrors({ ...errors, ..._errors });
    }

  }, []);

  return { input, checkbox, radio, submit, error, errors, state, watch, hydrate, set, get, getState, getErrors, setState, setErrors };

};