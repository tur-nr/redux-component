(function(global) {
  /** @constant {String} */
  var TAG_NAME = 'redux-action';

  var prototype = Object.create(HTMLElement.prototype);
  prototype.createdCallback = function createdCallback() {
    Object.defineProperty(this, 'actionType', {
      enumerable: true,
      get: function() {
        var type = this.getAttribute('type');
        if (type) {
          return type.value;
        }
      },
      set: function(value) {
        if (!value || typeof value !== 'string') {
          throw TypeError('actionType must be a string');
        }
        this.setAttribute('actionType', value);
      }
    });
  };
  prototype.composeAction = function composeAction() {
    var attributes = this.attributes;
    var action = {};
    for (var i = 0, l = attributes.length, attr = attributes[i]; i < l; ++i) {
      action[attr.name] = attr.value;
    }
    return action;
  };
  prototype.action = function action() {
    return this.composeAction();
  };
  prototype.dispatch = function dispatch(extension) {
    var action = this.action();
    var store = this.parentNode;

    extension = extension ? extension : {};

    // copy exentsion to the action
    for (var key in extension) {
      if (extension.hasOwnProperty(key)) {
        action[key] = extension[key];
      }
    }

    return store.dispatch(action);
  };

  var options = {
    prototype: prototype
  };

  var ReduxActionElement = document.registerElement(TAG_NAME, options);

  /** @exports ReduxActionElement */
  global.ReduxActionElement = ReduxActionElement;
})(this);
