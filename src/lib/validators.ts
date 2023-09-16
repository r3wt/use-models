export type ErrorLikeObject = {
  message: string;
};
export type ValidatorFunctionReturnTypes = void | null | false | undefined | string | Error | ErrorLikeObject;
export type ValidatorFunction = (val: any) => ValidatorFunctionReturnTypes | Promise<ValidatorFunctionReturnTypes>;

// the built in validators
const validators:Record<string,ValidatorFunction> = {
  required(value: string): void | string {
    return value.length === 0 ? 'can\'t be empty' : void 0;
  },
  email(value: string): void | string {
    const input = document.createElement('input');
    input.type = 'email';
    input.value = value;
    let result = input.checkValidity();
    const parts = value.split('@');
    if (!result || Array.isArray(parts) && parts.length >= 2 && parts[1].indexOf('.') <= 0) {
      return 'Invalid Email Address';
    }
  },
  az_space(value: string): void | string {
    if (! /^[A-Za-z .]+$/.test(value)) {
      return 'Only letters and spaces are allowed.';
    }
  },
  website(value: string): void | string {
    if (! /(^|\s)((https?:\/\/)[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi.test(value)) {
      return 'Please enter a valid url.';
    }
  },
  person(value: string): void | string {
    if (! /^(-?([A-Z].\s)?([A-Z][a-z]+)\s?)+([A-Z]'([A-Z][a-z]+))?$/g.test(value)) {
      return 'Enter a valid name.'
    }
  }
};

export default validators;

export function extendValidators(name: string, fn: ValidatorFunction) {
  validators[name] = fn;
};

export type ModelOption = {
  value: any;
  validate: Array<ValidatorFunction | string>;
}

export function model(value: any, ...validate: Array<ValidatorFunction | string>) {
  return { value, validate } as ModelOption;
}