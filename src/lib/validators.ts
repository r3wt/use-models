// the built in validators
const validators = {
    not_empty(value: string): void | string {
        return value.length === 0 ? 'can\'t be empty' : void 0;
    },
    email(value: string): void | string {
        const input = document.createElement('input');
        input.type = 'email';
        input.value = value;
        let result = input.checkValidity();
        const parts = value.split('@');
        if (parts[1] && parts[1].indexOf('.') <= 0) {
            result = false;
        } else {
            return 'Email Address can\'t be blank';
        }
        if (!result) {
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