import {useState} from 'react';

const has = (o,k) => o[k]!==undefined;

export default function useModels(defaultState={}) {

    const [state,setState] = useState(defaultState);

    function parsePath(path) {
        return path.split('.');
    }

    function getValue(name) {
        const path = parsePath(name);
        let value = state;
        for(let i=0;i<path.length;i++) {
            value=value[path[i]];
        }
        return value;
    }

    function getUpdate(name,value) {
        const _state = {...state};
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
        return {
            onChange: (e)=>setState(getUpdate(name,e.target.checked?truevalue:falsevalue)),
            checked: getValue(name)===truevalue,
            type:'checkbox',
            name,
            value:truevalue
        };
    };

    function radio(name,value=null){
        return {
            onChange: (e)=>e.target.checked && setState(getUpdate(name,value)),
            checked:  getValue(name)===value,
            type:'radio',
            name,
            value
        };
    };

    function submit(cb){
        return e=>{
            e.preventDefault();
            cb(state);//send the full state to the submit function
            e.stopPropagation();
        };
        
    };
    
    return {input,checkbox,radio,submit};

};