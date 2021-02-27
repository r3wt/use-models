const JSDOMEnvironment = require('jest-environment-jsdom-sixteen');

// Extends JSDOM to include polyfills
class SuperJSDOMEnvironment extends JSDOMEnvironment {
  constructor(config) {
    super(config);
    global.window = this.global;
    global.document = this.document;

    // Add Form Validation polyfill
    // `require` down here because package has side-effects that change `global.window`/`global.document`
    const hyperform = require('hyperform'); 
    hyperform(this.global);
  }
}

module.exports = SuperJSDOMEnvironment;