import React, { useEffect } from 'react'

import useModels, { model, extendValidators } from 'use-models'

extendValidators('checkUsername', async (value) => {
  return await new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error('That username is taken')), 200)
  })
})

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
  } = useModels({
    name: model('', (value) => {
      if (value.length < 5) {
        return 'Name must be at least 5 characters'
      }
    }),
    username: model('', 'checkUsername'),
    email: model('', 'email'),
    remember: false,
    newsletter: 'no',
    user_type: 'user'
  })

  //we can hydrate the state(and errors), for example from localstorage or a db call
  useEffect(() => {
    hydrate({
      name: 'Garrett',
      email: 'test@test.com',
      newsletter: 'yes'
    })
  }, [hydrate])

  const onSubmit = submit((state) => {
    //do something with your form data
    console.log(state)
  })

  const onError = error((errors, state) => {
    //do something on form submit error
  })

  watch('username', (value, previousValue) => {
    console.log('username changed from %s to %s', previousValue, value)
  }) // returns a function that unregisters the watcher.

  return (
    <div className='form'>
      <form onSubmit={onSubmit} onError={onError}>
        <div className='form-group'>
          <label>Select user type:</label>
          <div className='user-type-select'>
            <div
              className={
                'user-type-option' +
                (state.user_type === 'user' ? ' selected' : '')
              }
              onClick={(e) => set('user_type', 'user')}
            >
              Normal User
            </div>
            <div
              className={
                'user-type-option' +
                (state.user_type === 'admin' ? ' selected' : '')
              }
              onClick={(e) => set('user_type', 'admin')}
            >
              Admin User
            </div>
          </div>
        </div>
        <div className='form-group'>
          <label>Name</label>
          <input {...input('name')} />
          {errors.name && <p className='help-text'>{errors.name}</p>}
        </div>
        <div className='form-group'>
          <label>Desired Username</label>
          <input {...input('username')} />
          {errors.username && <p className='help-text'>{errors.username}</p>}
        </div>
        <div className='form-group'>
          <label>Email Address:</label>
          <input {...input('email', 'email')} />
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
  )
};