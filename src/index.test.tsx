import React from 'react';
import Form from '../example/src/Form';
import { render, waitFor, fireEvent } from '@testing-library/react';


describe('use-models',()=>{
  
  it('renders Form component and manipulates the form like a user would',async()=>{
    const {unmount,getByLabelText} = render(<Form />);
  });

});