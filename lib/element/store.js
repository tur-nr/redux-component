(function(global) {
  /** @constant {String} */
  var EVENT_STATE = 'state';

  /** @constant {String} */
  var TAG_NAME = 'redux-store';

  /** @type {Object} */
  var store;

  /**
   * @memberof ReduxStoreElement
   * @property {Object} ReduxStoreElement.prototype
   */
  var prototype = Object.create(HTMLElement.prototype);

  /**
   * ReduxStoreElement `createdCallback` callback. Creates redux store,
   * subscribes for state changes and sets up event emitters.
   *
   * @exception {SyntaxtError} Redux store already exists.
   * @memberof ReduxStoreElementt .prototype
   */
  prototype.createdCallback = function createdCallback() {
    var observer;

    // does the store exist
    if (store) {
      // multiple store elements is forbidden
      throw new SyntaxError('page has multiple store elements');
    }

    // create new redux store
    store = Redux.createStore(buildReducer.bind(this)(), {});

    // subscribe to state changes and emit an element event
    store.subscribe(reduxSubscriber.bind(this));

    // expose store dispatch
    Object.defineProperty(this, 'dispatch', {
      enumerable: true,
      value: store.dispatch
    });

    // observe child node mutations for reducers, actions and middleware
    observer = new MutationObserver(mutationObserver);
    observer.observe(this, {
      childList: true
    });
  };

  /**
   * @memberof ReduxStoreElement.prototype
   */
  prototype.dispatchAction = function dispatchAction(type, extension) {
    var action;

    if (!type || typeof type !== 'string') {
      throw new TypeError('type must be a string');
    }

    action = this.querySelector('redux-action[type="' + type + '"]');
    if (!action) {
      throw new TypeError('no action element found: ' + type);
    }

    return action.dispatch(extension);
  };

  // element options
  var options = {
    prototype: prototype
  };

  /**
   * ReduxStoreElement
   *
   * @constructor
   * @event ReduxStoreElement#EVENT_STATE
   */
  var ReduxStoreElement = document.registerElement(TAG_NAME, options);
  Object.defineProperty(ReduxStoreElement, 'EVENT_STATE', {
    value: EVENT_STATE
  });

  /**
   * Redux subscribe callback.
   *
   * @private
   * @this {ReduxStoreElement}
   * @fires ReduxStoreElement#EVENT_STATE
   */
  function reduxSubscriber() {
    var event = new CustomEvent(EVENT_STATE, {
      detail: store.getState()
    });
    this.dispatchEvent(event);
  }

  /**
   * MutationObserver callback.
   *
   * @private
   * @this {ReduxStoreElement}
   * @param {MutationRecord[]} mutations
   */
  function mutationObserver(mutations) {
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
      store.replaceReducer(buildReducer.bind(this)());
    }
  }

  /**
   * Builds a redux reducer callback finding all redux-reducer children
   * of the store element.
   *
   * @private
   * @this {ReduxStoreElement}
   * @return {Function}
   */
  function buildReducer() {
    var children = this.children;
    var reducers = [];
    var combine;

    // get all reducers
    for (var i = 0, l = children.length; i < l; ++i) {
      if (children[i] instanceof ReduxReducerElement) {
        reducers.push(children[i]);
      }
    }

    // no redustore.getState()cers
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

   /** @exports ReduxStoreElement */
  global.ReduxStoreElement = ReduxStoreElement;
})(this);
