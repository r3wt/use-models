import React,{useEffect} from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import useModels, { model, extendValidators } from './index';

extendValidators('checkUsername', async (_value:string) => {
  return await Promise.reject('That username is taken');
});

type FormState = {
  submit_error: string;
  name: string;
  username: string;
  email: string;
  remember: boolean;
  newsletter: string;
  config: {
    user_type: string;
  };
  non_existent: string;
};

function Form() {
  const {
    state,
    errors,
    input,
    checkbox,
    radio,
    submit,
    error,
    watch,
    hydrate,
    set
  } = useModels<FormState>({
    name: model('', (value:string):void|string => {
      if (value.length < 5) {
        return 'Name must be at least 5 characters';
      }
    }),
    username: model('', 'checkUsername'),
    email: model('', 'email'),
    remember: false,
    non_existent: model('','nonExistentValidator'),//testing a validator which does not exist to hit that codepath
    newsletter: 'no',
    config: {
      user_type:  model('user', (value:string):void|string => {
        if(['user','admin'].indexOf(value) === -1) {
          return 'invalid user type';
        }
      })
    }
  });

  //we can hydrate the state(and errors), for example from localstorage or a db call
  useEffect(() => {
    hydrate({
      name: 'Garrett',
      email: 'test@test',
      newsletter: 'yes'
    });
  }, [hydrate]);

  const onSubmit = submit((state) => {
    //do something with your form data
    console.log(state)
  });

  const onError = error((errors, state) => {
    //do something on form submit error
    console.log(errors,state);
  });

  const unwatch = watch('username', (value, previousValue) => {
    console.log('username changed from %s to %s', previousValue, value)
  }); // returns a function that unregisters the watcher.

  return (
    <div className='form'>
      <form onSubmit={onSubmit} onError={onError}>
        <div className='form-group'>
          <label>Select user type:</label>
          <div className='user-type-select'>
            <div
              aria-label='normal-user'
              className={
                'user-type-option' +
                (state.config.user_type === 'user' ? ' selected' : '')
              }
              onClick={(_e:React.MouseEvent<HTMLDivElement>) => set('config.user_type', 'user')}
            >
              Normal User
            </div>
            <div
              aria-label='admin-user'
              className={
                'user-type-option' +
                (state.config.user_type === 'admin' ? ' selected' : '')
              }
              onClick={(_e:React.MouseEvent<HTMLDivElement>) => set('config.user_type', 'admin')}
            >
              Admin User
            </div>
          </div>
        </div>
        <div className='form-group'>
          <label htmlFor='name'>Name</label>
          <input id='name' {...input('name')} />
          {errors.name && <p className='help-text'>{errors.name}</p>}
        </div>
        <div className='form-group'>
          <label htmlFor='username'>Desired Username</label>
          <input id='username' {...input('username')} />
          {errors.username && <p className='help-text'>{errors.username}</p>}
        </div>
        <div className='form-group'>
          <label htmlFor='email'>Email Address</label>
          <input id='email' {...input('email', 'email')} />
          {errors.email && <p className='help-text'>{errors.email}</p>}
        </div>
        <div className='form-group-check'>
          <input {...checkbox('remember')} /> <label>Remember me</label>
        </div>
        <div className='form-group with-nested'>
          <label>Sign up for newsletter?</label>
          <div className='form-group-check'>
            <input {...radio('newsletter', 'yes')} />{' '}
            <label>Yes, Sign me up!</label>
          </div>
          <div className='form-group-check'>
            <input {...radio('newsletter', 'no')} /> <label>No thanks</label>
          </div>
        </div>
        <button type='submit'>Submit</button>
        <div className='results'>
          <div className='result-50'>
            <strong>State:</strong>
            <pre className='debug'>{stringify(state)}</pre>
          </div>
          <div className='result-50'>
            <strong>Errors:</strong>
            <pre className='debug'>{stringify(errors)}</pre>
          </div>
        </div>
        <div className='form-group'>
          <label htmlFor='NonExistent'>Non Existent</label>
          <input id='NonExistent' {...input('non_existent')} />
          {errors.name && <p className='help-text'>{errors.non_existent}</p>}
        </div>
        <button type="button" onClick={unwatch}>Unwatch username</button>
      </form>
    </div>
  );
};


function stringify(v:any) {
  return JSON.stringify(v, null, 2);
}

function ExtendedTests1() {

  const {
    hydrate,
    getErrors,
    getState,
    get,
    set,
    watch
  } = useModels<{email:string}>({
    email: model('', 'email'),
  });

  function getEmailValue() {
    return get('email');
  }

  watch('email',(value:string,previousValue:string)=>{
    console.log('value %s, previous value %s',value,previousValue);
  });

  function setEmailValue() {
    set('email','test@test.com');
  }

  //we can hydrate the state(and errors), for example from localstorage or a db call
  useEffect(() => {
    hydrate({
      email: 'test@test'
    },{
      email: 'Invalid Email Address'
    });
  }, [hydrate]);

  return (
    <div className='results'>
      <div className='result-50'>
        <strong>State:</strong>
        <pre className='debug' data-testid="state">{stringify(getState())}</pre>
      </div>
      <div className='result-50'>
        <strong>Errors:</strong>
        <pre className='debug' data-testid="errors">{stringify(getErrors())}</pre>
      </div>
      <button type="button" onClick={getEmailValue}>Get Email Value</button>
      <button type="button" onClick={setEmailValue}>Set Email Value</button>
    </div>
  );

}

describe('use-models',()=>{
  
  it('renders Form component and manipulates the form like a user would',async()=>{

    const {unmount,getByLabelText,getByText} = render(<Form />);

    // name
    const name = await waitFor(()=>getByLabelText('Name'));
    expect(name).toBeInTheDocument();
    await userEvent.type(name,'Mr Obvious');

    // username
    const user = await waitFor(()=>getByLabelText('Desired Username'));
    expect(user).toBeInTheDocument();
    await userEvent.type(user,'user123');

    // email
    const email = await waitFor(()=>getByLabelText('Email Address'));
    expect(email).toBeInTheDocument();
    await userEvent.type(email,'abc123@hotmail.com');
    const usertype = await waitFor(()=>getByLabelText('admin-user'));
    expect(usertype).toBeInTheDocument();
    fireEvent.click(usertype);
    const submit = await waitFor(()=>getByText(/Submit/,{selector:'button'}));
    expect(submit).toBeInTheDocument();
    fireEvent.click(submit);

    // unwatch the username
    const unwatch = await waitFor(()=>getByText('Unwatch username'));
    expect(unwatch).toBeInTheDocument();
    fireEvent.click(unwatch);

    unmount();
  });

  it('tests getState(), getErrors() and error hydration in hydrate()',async()=>{
    const {unmount,getByText} = render(<ExtendedTests1 />);
    await new Promise((resolve)=>setTimeout(resolve,100));// give time for first render so we are hydrated. 
    const errors = await waitFor(()=>getByText(/test@test/));
    const state = await waitFor(()=>getByText(/Invalid Email Address/));
    expect(errors).toBeInTheDocument();
    expect(state).toBeInTheDocument();
    await new Promise((resolve)=>setTimeout(resolve,100));
    unmount();
  });

  it('tests set() and get()',async()=>{
    const {unmount,getByText} = render(<ExtendedTests1 />);
    await new Promise((resolve)=>setTimeout(resolve,100));// give time for first render so we are hydrated. 
    
    const getB = await waitFor(()=>getByText(/Get Email Value/,{selector:'button'}));
    expect(getB).toBeInTheDocument();
    fireEvent.click(getB);

    const setB = await waitFor(()=>getByText(/Set Email Value/,{selector:'button'}));
    expect(setB).toBeInTheDocument();
    fireEvent.click(setB);
    await new Promise((resolve)=>setTimeout(resolve,100));
    unmount();
  });

  it('supports array in state',async()=>{

    const defaultState = {
      items: [{ foo: 'test', checked: false },{ foo: 'bar', checked: false }]
    };
    function ComponentTest() {
      const {input,state} = useModels<{ items: { foo: string;}[] }>(defaultState);

      return (
        <div>
          <input data-testid="foo0" {...input('items.0.foo')} />
          <input data-testid="foo1" {...input('items.1.foo')} />
          <div data-testid="state">{JSON.stringify(state)}</div>
        </div>
      )

    }

    const {unmount,getByTestId} = render(<ComponentTest />);

    const state = await waitFor(()=>getByTestId("state"));

    expect(state).toHaveTextContent(JSON.stringify(defaultState));

    const foo1 = await waitFor(()=>getByTestId("foo0"));
    const foo2 = await waitFor(()=>getByTestId("foo1"));

    expect(foo1).toHaveValue("test");
    expect(foo2).toHaveValue("bar");

    fireEvent.change(foo1,{ target: { value: '25' }});
    fireEvent.change(foo2,{ target: { value: '55' }});

    expect(foo1).toHaveValue("25");
    expect(foo2).toHaveValue("55");

    unmount();

  });

  it('tests behavior of checkbox()',async()=>{

    function Component() {
      const { checkbox,state, watch } = useModels<{field: boolean}>({
        field: false
      });

      watch('field',(newValue,oldValue)=>console.log('new: %s , old: %s',newValue,oldValue));

      return (
        <div>
          <input data-testid="field" {...checkbox('field')} />
          <div data-testid="state">{JSON.stringify(state)}</div>
        </div>
      )
    }

    const {unmount,getByTestId} = render(<Component />);

    const field = await waitFor(()=>getByTestId('field'));

    fireEvent.click(field);

    expect(field).toBeChecked();

    const state = await waitFor(()=>getByTestId('state'));

    expect(state).toHaveTextContent('{"field":true}');

    unmount();

  });

  it('tests behavior of checkbox()',async()=>{

    function Component() {
      const { radio,state, watch } = useModels<{field: string}>({
        field: 'A'
      });

      watch('field',(newValue,oldValue)=>console.log('new: %s , old: %s',newValue,oldValue));

      return (
        <div>
          <div>
            <label>A</label>
            <input data-testid="field-a" {...radio('field','A')} />
          </div>
          <div>
            <label>A</label>
            <input data-testid="field-b" {...radio('field','B')} />
          </div>
          <div data-testid="state">{JSON.stringify(state)}</div>
        </div>
      )
    }

    const {unmount,getByTestId} = render(<Component />);

    const field = await waitFor(()=>getByTestId('field-a'));

    expect(field).toBeChecked();

    const state = await waitFor(()=>getByTestId('state'));

    expect(state).toHaveTextContent('{"field":"A"}');

    const fieldB = await waitFor(()=>getByTestId('field-b'));

    fireEvent.click(fieldB);

    expect(fieldB).toBeChecked();

    expect(state).toHaveTextContent('{"field":"B"}');

    unmount();

  });

  it('tests behavior of validators on empty field',async()=>{

    const defaultState = {
      email: model('','email')
    };
    function ComponentTest() {
      const {input, errors, submit} = useModels<{ email: string; }>(defaultState);

      const onSubmit = submit(_state=>{

      });

      return (
        <form onSubmit={onSubmit}>
          <input data-testid="foo0" {...input('email','email')} />
          {errors.email && <p data-testid="email-error">{errors.email}</p>}
          <button type="submit">Submit</button>
        </form>
      )

    }

    const {unmount,getByText,getByTestId} = render(<ComponentTest />);

    const submit = await waitFor(()=>getByText('Submit',{ selector: 'button' }));

    expect(submit).toBeInTheDocument();

    fireEvent.click(submit);

    expect(waitFor(()=>getByTestId('email-error'))).rejects.toThrow();

    unmount();

  });


});