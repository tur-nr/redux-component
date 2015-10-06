(function(global) {
  /** @constant {String} */
  var TAG_NAME = 'redux-reducer';

  var prototype = Object.create(HTMLElement.prototype);
  prototype.createdCallback = function createdCallback() {
    Object.defineProperty(this, 'stateKey', {
      enumerable: true,
      get: function() {
        var key = this.getAttribute('state-key');
        if (key) {
          return key.value;
        }
      },
      set: function(value) {
        if (!value || typeof value !== 'string') {
          throw TypeError('key must be a string');
        }
        this.setAttribute('state-key', value);
      }
    });
  };
  prototype.reduce = function reduce(state, action) {
    return state;
  };

  var options = {
    prototype: prototype
  };

  var ReduxReducerElement = document.registerElement(TAG_NAME, options);

  /** @exports ReduxReducerElement */
  global.ReduxReducerElement = ReduxReducerElement;
})(this);
