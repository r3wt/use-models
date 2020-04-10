import React, { useEffect } from 'react'

import useModels,{ model, extendValidators } from 'use-models';

extendValidators('checkUsername',function checkIfUserNameExists( value ) {
    console.log('checkUsername()');
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            reject(new Error('That username is taken'));
        },200);
    });
});

export default function App() {

    console.log('App.render()');

    const { 
        state, errors, input, checkbox, radio, submit, error, watch, hydrate
    } = useModels({
        name: model('',value => {
            if( value.length<5 ){
                return 'Name must be at least 5 characters';
            }
        }),
        username: model('','checkUsername'),
        email: model('','email'),
        remember: false,
        newsletter: 'no'
    });

    //we can hydrate the state(and errors), for example from localstorage or a db call
    useEffect(()=>{
        hydrate({
            name:'Garrett',
            email:'test@test.com',
            newsletter: 'yes'
        });
    },[hydrate]);

    // hydrate({
    //     name:'Garrett',
    //     email:'test@test.com',
    //     newsletter: 'yes'
    // });

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
        <div className="example">
            <form onSubmit={onSubmit} onError={onError}>
                <h3>use-models example</h3>
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
                    <label>email</label>
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