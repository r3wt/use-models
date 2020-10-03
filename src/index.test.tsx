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
};

export default function Form() {
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
      email: 'test@test.com',
      newsletter: 'yes'
    })
  }, [hydrate]);

  const onSubmit = submit((state) => {
    //do something with your form data
    console.log(state)
  });

  const onError = error((errors, state) => {
    //do something on form submit error
    console.log(errors,state);
  });

  watch('username', (value, previousValue) => {
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
            <pre className='debug'>{JSON.stringify(state, null, 2)}</pre>
          </div>
          <div className='result-50'>
            <strong>Errors:</strong>
            <pre className='debug'>{JSON.stringify(errors, null, 2)}</pre>
          </div>
        </div>
      </form>
    </div>
  );
};


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
    unmount();
  });

});