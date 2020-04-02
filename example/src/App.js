import React from 'react'

import useModels from 'use-models'

export default function App(props) {

    const {input,checkbox,radio,submit} = useModels({
        name:'',
        email:'',
        remember:false,
        newsletter:'no'
    });

    const onSubmit = submit(state=>{
        //do something with your form data
        console.log(state);
    });

    return (
        <form onSubmit={onSubmit}>
            <div>
                <label>Name</label>
                <input {...input('name')} />
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
    
};

export default App;
