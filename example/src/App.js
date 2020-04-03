import React from 'react'

import useModels from 'use-models'

export default function App(props) {

    const {input,checkbox,radio,submit,getState} = useModels({
        name:'',
        email:'',
        remember:false,
        newsletter:'no'
    });

    const onSubmit = submit(state=>{
        //do something with your form data
        console.log(state);
    });

    const state = getState();

    return (
        <div className="example">
            <form onSubmit={onSubmit}>
                <h3>use-models example</h3>
                <div className="form-group">
                    <label>Name</label>
                    <input {...input('name')} />
                </div>
                <div className="form-group">
                    <label>email</label>
                    <input {...input('email','email')} />
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
                <br />
                <br />
                <div>
                    <strong>Result:</strong>
                    <pre>
                        {JSON.stringify(state,null,2)}
                    </pre>
                </div>      
            </form>
              
        </div>
    );
    
};