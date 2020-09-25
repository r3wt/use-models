import React from 'react';
import Form from './Form';

import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import prism from 'react-syntax-highlighter/dist/esm/styles/prism/prism';
 
SyntaxHighlighter.registerLanguage('jsx', jsx);

const codeString = `
import React, { useEffect } from 'react'
import useModels,{ model, extendValidators } from 'use-models';

extendValidators('checkUsername',async ( value ) => {
    return await new Promise((resolve,reject)=>{
        setTimeout(()=>reject(new Error('That username is taken')),200)
    });
});

export default function Form() {

    const { 
        state, errors, input, checkbox, radio, submit, error, watch, hydrate, set
    } = useModels({
        name: model('',value => {
            if( value.length<5 ){
                return 'Name must be at least 5 characters';
            }
        }),
        username: model('','checkUsername'),
        email: model('','email'),
        remember: false,
        newsletter: 'no',
        user_type:'user'
    });

    //we can hydrate the state(and errors), for example from localstorage or a db call
    useEffect(()=>{
        hydrate({
            name:'Garrett',
            email:'test@test.com',
            newsletter: 'yes'
        });
    },[hydrate]);

    const onSubmit = submit(state=>{
        //do something with your form data
        console.log(state);
    });

    const onError = error((errors,state)=>{
        //do something on form submit error
    });

    watch('username',(value,previousValue)=>{
        console.log('username changed from %s to %s',previousValue,value);
    }); // returns a function that unregisters the watcher.

    return (
        <div className="form">
            <form onSubmit={onSubmit} onError={onError}>
                <div className='form-group'>
                    <label>Select user type:</label>
                    <div className="user-type-select">
                        <div className={"user-type-option"+(state.user_type==='user'?' selected':'')} onClick={e=>set('user_type','user')}>
                            Normal User
                        </div>
                        <div className={"user-type-option"+(state.user_type==='admin'?' selected':'')} onClick={e=>set('user_type','admin')}>
                            Admin User
                        </div>
                    </div>    
                </div>
                <div className="form-group">
                    <label>Name</label>
                    <input {...input('name')} />
                    { errors.name && <p className='help-text'>{errors.name}</p> }
                </div>
                <div className="form-group">
                    <label>Desired Username</label>
                    <input {...input('username')} />
                    { errors.username && <p className='help-text'>{errors.username}</p> }
                </div>
                <div className="form-group">
                    <label>Email Address:</label>
                    <input {...input('email','email')} />
                    { errors.email && <p className='help-text'>{errors.email}</p> }
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
                <button type="submit">Submit</button>
                <div className="results">
                    <div className="result-50">
                        <strong>State:</strong>
                        <pre>
                            {JSON.stringify(state,null,2)}
                        </pre>
                    </div>
                    <div className="result-50">
                        <strong>Errors:</strong>
                        <pre>
                            {JSON.stringify(errors,null,2)}
                        </pre>
                    </div> 
                </div>
                     
            </form>
              
        </div>
    );
    
};
`;

export default function App() {

    return (
        <div className="gh-example">
            <div class="gh-100 title">
                <div className="left">
                    <h1>Use-models</h1> 
                    <p>advanced form model hooks for your functional react components</p>
                </div>
                <div className="right">
                    <a href="https://www.npmjs.com/package/use-models">[NPM]</a>
                    <a href="https://github.com/r3wt/use-models">[Github]</a>    
                </div>
            </div>
            <div class="gh-50">
                <h1>Code:</h1>
                <div className="box-1">
                    <SyntaxHighlighter language="jsx" style={prism} customStyle={{fontSize:'14px',lineHeight:'18px'}}>
                        {codeString}
                    </SyntaxHighlighter>    
                </div>
                
            </div>
            <div class="gh-50">
                <h1>Output:</h1>
                <div class="box-2">
                    <Form /> 
                </div>   
            </div>
        </div>
    )
    
};