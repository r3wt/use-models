import validators from './validators';

describe('validators',()=>{

  it('tests behavior of not_empty()',()=>{
    expect(validators.not_empty('')).toBe('can\'t be empty');
    expect(validators.not_empty('Test')).toBeUndefined();
  });

  it('tests behavior of email()',()=>{
    expect(validators.email('abc123@test.com')).toBeUndefined();
    expect(validators.email('invalid@.')).toBe('Invalid Email Address');
    expect(validators.email('invalid@test')).toBe('Invalid Email Address');
  });

  it('tests behavior of az_space()',()=>{
    expect(validators.az_space('abc xyz')).toBeUndefined();
    expect(validators.az_space('sbc123')).toBe('Only letters and spaces are allowed.');
  });

  it('tests behavior of website()',()=>{
    expect(validators.website('https://domain.com')).toBeUndefined();
    expect(validators.website('httpg://domain.y')).toBe('Please enter a valid url.');
  });

  it('tests behavior of person()',()=>{
    expect(validators.person('Rorschach')).toBeUndefined();
    expect(validators.person('12345')).toBe('Enter a valid name.');
  });

});