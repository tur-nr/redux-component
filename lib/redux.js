(function(window, Redux) {
  var EVENT_STATE = 'state';

  // will build the reducer based on the elements children
  function buildReducer(element) {
    var children = element.children;
    var reducers = [];
    var combine;

    // get all reducers
    for (var i = 0, l = children.length; i < l; ++i) {
      if (children[i] instanceof ReduxReducerElement) {
        reducers.push(children[i]);
      }
    }

    // no reducers
    if (!reducers.length) {
      // return an empty reducer
      return function defaultReducer(state, action) {
        return state;
      };
    }

    // if we have a single reducer with no combine key
    if (reducers.length === 1 && !reducers[0].getAttribute('combine-key')) {
      return reducers[0].reduce.bind(reducers[0]);
    }

    // multiple reducers
    combine = {};
    reducers.forEach(function(reducer) {
      var key = reducer.getAttribute('combine-key');
      if (!key) { // MUST have a combine key
        throw new TypeError('missing combine-key attribute for multiple reducers');
      }
      combine[key] = reducer.reduce.bind(reducer);
    });

    return Redux.combineReducers(combine);
  }

  var reducerPrototype = Object.create(HTMLElement.prototype);
  reducerPrototype.reduce = function reduce(state, action) {
    // developers should implement their own reduce function
    // incase they haven't just return state
    return state;
  };
  var ReduxReducerElement = document.registerElement('redux-reducer', { prototype: reducerPrototype });

  var actionPrototype = Object.create(HTMLElement.prototype);
  // takes the elements attributes and creates a redux action object
  actionPrototype.composeAction = function() {
    var attributes = this.attributes;
    var actions = {};
    for (var i = 0, l = attributes.length, attr = attributes[i]; i < l; ++i) {
      actions[attr.name] = attr.value;
    }
    return action;
  };
  // builds the action to be used when dispatching actions
  actionPrototype.action = function action() {
    // developers should implement their own action factory
    // incase they haven't just return the default composed action
    return this.composeAction();
  };
  var ReduxActionElement = document.registerElement('redux-action', { prototype: actionPrototype });

  var storePrototype = Object.create(HTMLElement.prototype);
  storePrototype.createdCallback = function createdCallback() {
    var element = this;

    // listen for reducer elements
    var observer = new MutationObserver(function(mutations) {
      var shouldBuildReducers = false;

      // review each mutation
      mutations.forEach(function(mutation) {
        // added and removed children
        ['addedNodes', 'removedNodes'].forEach(function(nodeKey) {
          var nodes = mutation[nodeKey];
          for (var i = 0, l = nodes.length; i < length; ++i) {
            if (!shouldBuildReducers) {
              shouldBuildReducers = nodes.item(i) instanceof ReduxReducerElement;
            }
          }
        });
      });

      // was a reducer added or removed, rebuild internal reducer
      if (shouldBuildReducers) {
        this.setReducer(buildReducer(this));
      }
    });
    observer.observe(this, { childList: true });

    // create a redux store
    var store = Redux.createStore(buildReducer(this));

    // listen to state changes and dispatch own state event
    store.subscribe(function() {
      var event = new Event(EVENT_STATE, { detail: store.getState() });
      element.dispatchEvent(event);
    });

    // expose the redux store
    Object.defineProperty(this, 'reduxStore', {
      enumerable: true,
      value: store
    });
  };

  // replaces the redux store's reducer
  storePrototype.setReducer = function setReducer(reducer) {
    if (typeof reducer !== 'function') {
      throw new TypeError('reducer is not a function');
    }
    return this.reduxStore.replaceReducer(reducer);
  };

  // look for an action element and dispatch it to redux
  storePrototype.dispatchAction = function dispatchAction(type, extension) {
    if (!type || typeof type !== 'string') {
      throw new TypeError('type must be a string');
    }
    var element = this.querySelector('redux-action[type="' + type + '"]');
    if (!element) {
      return;
    }
    extension = extension ? extension : {};
  };
  // dispatch acction to redux
  storePrototype.dispatch = function(action) {
    if (!action || typeof action !== 'object') {
      throw new TypeError('action is not a object');
    }
    return this.reduxStore.dispatch(action);
  };
  var ReduxStoreElement = document.registerElement('redux-store', { prototype: storePrototype });
  ReduxStoreElement.EVENT_STATE = EVENT_STATE;

  // expose elements
  window.ReduxStoreElement = ReduxStoreElement;
  window.ReduxReducerElement = ReduxReducerElement;
  window.ReduxActionElement = ReduxActionElement;
})(this, this.Redux);
