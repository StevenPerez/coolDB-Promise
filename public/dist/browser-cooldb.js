(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var clone = (function() {
'use strict';

/**
 * Clones (copies) an Object using deep copying.
 *
 * This function supports circular references by default, but if you are certain
 * there are no circular references in your object, you can save some CPU time
 * by calling clone(obj, false).
 *
 * Caution: if `circular` is false and `parent` contains circular references,
 * your program may enter an infinite loop and crash.
 *
 * @param `parent` - the object to be cloned
 * @param `circular` - set to true if the object to be cloned may contain
 *    circular references. (optional - true by default)
 * @param `depth` - set to a number if the object is only to be cloned to
 *    a particular depth. (optional - defaults to Infinity)
 * @param `prototype` - sets the prototype to be used when cloning an object.
 *    (optional - defaults to parent prototype).
*/
function clone(parent, circular, depth, prototype) {
  var filter;
  if (typeof circular === 'object') {
    depth = circular.depth;
    prototype = circular.prototype;
    filter = circular.filter;
    circular = circular.circular
  }
  // maintain two arrays for circular references, where corresponding parents
  // and children have the same index
  var allParents = [];
  var allChildren = [];

  var useBuffer = typeof Buffer != 'undefined';

  if (typeof circular == 'undefined')
    circular = true;

  if (typeof depth == 'undefined')
    depth = Infinity;

  // recurse this function so we don't reset allParents and allChildren
  function _clone(parent, depth) {
    // cloning null always returns null
    if (parent === null)
      return null;

    if (depth == 0)
      return parent;

    var child;
    var proto;
    if (typeof parent != 'object') {
      return parent;
    }

    if (clone.__isArray(parent)) {
      child = [];
    } else if (clone.__isRegExp(parent)) {
      child = new RegExp(parent.source, __getRegExpFlags(parent));
      if (parent.lastIndex) child.lastIndex = parent.lastIndex;
    } else if (clone.__isDate(parent)) {
      child = new Date(parent.getTime());
    } else if (useBuffer && Buffer.isBuffer(parent)) {
      child = new Buffer(parent.length);
      parent.copy(child);
      return child;
    } else {
      if (typeof prototype == 'undefined') {
        proto = Object.getPrototypeOf(parent);
        child = Object.create(proto);
      }
      else {
        child = Object.create(prototype);
        proto = prototype;
      }
    }

    if (circular) {
      var index = allParents.indexOf(parent);

      if (index != -1) {
        return allChildren[index];
      }
      allParents.push(parent);
      allChildren.push(child);
    }

    for (var i in parent) {
      var attrs;
      if (proto) {
        attrs = Object.getOwnPropertyDescriptor(proto, i);
      }

      if (attrs && attrs.set == null) {
        continue;
      }
      child[i] = _clone(parent[i], depth - 1);
    }

    return child;
  }

  return _clone(parent, depth);
}

/**
 * Simple flat clone using prototype, accepts only objects, usefull for property
 * override on FLAT configuration object (no nested props).
 *
 * USE WITH CAUTION! This may not behave as you wish if you do not know how this
 * works.
 */
clone.clonePrototype = function clonePrototype(parent) {
  if (parent === null)
    return null;

  var c = function () {};
  c.prototype = parent;
  return new c();
};

// private utility functions

function __objToStr(o) {
  return Object.prototype.toString.call(o);
};
clone.__objToStr = __objToStr;

function __isDate(o) {
  return typeof o === 'object' && __objToStr(o) === '[object Date]';
};
clone.__isDate = __isDate;

function __isArray(o) {
  return typeof o === 'object' && __objToStr(o) === '[object Array]';
};
clone.__isArray = __isArray;

function __isRegExp(o) {
  return typeof o === 'object' && __objToStr(o) === '[object RegExp]';
};
clone.__isRegExp = __isRegExp;

function __getRegExpFlags(re) {
  var flags = '';
  if (re.global) flags += 'g';
  if (re.ignoreCase) flags += 'i';
  if (re.multiline) flags += 'm';
  return flags;
};
clone.__getRegExpFlags = __getRegExpFlags;

return clone;
})();

if (typeof module === 'object' && module.exports) {
  module.exports = clone;
}

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/clone/clone.js","/../../node_modules/clone")
},{"buffer":4,"oMfpAn":7}],2:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * cuid.js
 * Collision-resistant UID generator for browsers and node.
 * Sequential for fast db lookups and recency sorting.
 * Safe for element IDs and server-side lookups.
 *
 * Extracted from CLCTR
 * 
 * Copyright (c) Eric Elliott 2012
 * MIT License
 */

/*global window, navigator, document, require, process, module */
(function (app) {
  'use strict';
  var namespace = 'cuid',
    c = 0,
    blockSize = 4,
    base = 36,
    discreteValues = Math.pow(base, blockSize),

    pad = function pad(num, size) {
      var s = "000000000" + num;
      return s.substr(s.length-size);
    },

    randomBlock = function randomBlock() {
      return pad((Math.random() *
            discreteValues << 0)
            .toString(base), blockSize);
    },

    safeCounter = function () {
      c = (c < discreteValues) ? c : 0;
      c++; // this is not subliminal
      return c - 1;
    },

    api = function cuid() {
      // Starting with a lowercase letter makes
      // it HTML element ID friendly.
      var letter = 'c', // hard-coded allows for sequential access

        // timestamp
        // warning: this exposes the exact date and time
        // that the uid was created.
        timestamp = (new Date().getTime()).toString(base),

        // Prevent same-machine collisions.
        counter,

        // A few chars to generate distinct ids for different
        // clients (so different computers are far less
        // likely to generate the same id)
        fingerprint = api.fingerprint(),

        // Grab some more chars from Math.random()
        random = randomBlock() + randomBlock();

        counter = pad(safeCounter().toString(base), blockSize);

      return  (letter + timestamp + counter + fingerprint + random);
    };

  api.slug = function slug() {
    var date = new Date().getTime().toString(36),
      counter,
      print = api.fingerprint().slice(0,1) +
        api.fingerprint().slice(-1),
      random = randomBlock().slice(-2);

      counter = safeCounter().toString(36).slice(-4);

    return date.slice(-2) + 
      counter + print + random;
  };

  api.globalCount = function globalCount() {
    // We want to cache the results of this
    var cache = (function calc() {
        var i,
          count = 0;

        for (i in window) {
          count++;
        }

        return count;
      }());

    api.globalCount = function () { return cache; };
    return cache;
  };

  api.fingerprint = function browserPrint() {
    return pad((navigator.mimeTypes.length +
      navigator.userAgent.length).toString(36) +
      api.globalCount().toString(36), 4);
  };

  // don't change anything from here down.
  if (app.register) {
    app.register(namespace, api);
  } else if (typeof module !== 'undefined') {
    module.exports = api;
  } else {
    app[namespace] = api;
  }

}(this.applitude || this));

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/cuid/dist/browser-cuid.js","/../../node_modules/cuid/dist")
},{"buffer":4,"oMfpAn":7}],3:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
 * @version   2.1.1
 */

(function() {
    "use strict";
    function lib$es6$promise$utils$$objectOrFunction(x) {
      return typeof x === 'function' || (typeof x === 'object' && x !== null);
    }

    function lib$es6$promise$utils$$isFunction(x) {
      return typeof x === 'function';
    }

    function lib$es6$promise$utils$$isMaybeThenable(x) {
      return typeof x === 'object' && x !== null;
    }

    var lib$es6$promise$utils$$_isArray;
    if (!Array.isArray) {
      lib$es6$promise$utils$$_isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    } else {
      lib$es6$promise$utils$$_isArray = Array.isArray;
    }

    var lib$es6$promise$utils$$isArray = lib$es6$promise$utils$$_isArray;
    var lib$es6$promise$asap$$len = 0;
    var lib$es6$promise$asap$$toString = {}.toString;
    var lib$es6$promise$asap$$vertxNext;
    function lib$es6$promise$asap$$asap(callback, arg) {
      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len] = callback;
      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len + 1] = arg;
      lib$es6$promise$asap$$len += 2;
      if (lib$es6$promise$asap$$len === 2) {
        // If len is 2, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        lib$es6$promise$asap$$scheduleFlush();
      }
    }

    var lib$es6$promise$asap$$default = lib$es6$promise$asap$$asap;

    var lib$es6$promise$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;
    var lib$es6$promise$asap$$browserGlobal = lib$es6$promise$asap$$browserWindow || {};
    var lib$es6$promise$asap$$BrowserMutationObserver = lib$es6$promise$asap$$browserGlobal.MutationObserver || lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;
    var lib$es6$promise$asap$$isNode = typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

    // test for web worker but not in IE10
    var lib$es6$promise$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
      typeof importScripts !== 'undefined' &&
      typeof MessageChannel !== 'undefined';

    // node
    function lib$es6$promise$asap$$useNextTick() {
      var nextTick = process.nextTick;
      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
      // setImmediate should be used instead instead
      var version = process.versions.node.match(/^(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$/);
      if (Array.isArray(version) && version[1] === '0' && version[2] === '10') {
        nextTick = setImmediate;
      }
      return function() {
        nextTick(lib$es6$promise$asap$$flush);
      };
    }

    // vertx
    function lib$es6$promise$asap$$useVertxTimer() {
      return function() {
        lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);
      };
    }

    function lib$es6$promise$asap$$useMutationObserver() {
      var iterations = 0;
      var observer = new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    // web worker
    function lib$es6$promise$asap$$useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = lib$es6$promise$asap$$flush;
      return function () {
        channel.port2.postMessage(0);
      };
    }

    function lib$es6$promise$asap$$useSetTimeout() {
      return function() {
        setTimeout(lib$es6$promise$asap$$flush, 1);
      };
    }

    var lib$es6$promise$asap$$queue = new Array(1000);
    function lib$es6$promise$asap$$flush() {
      for (var i = 0; i < lib$es6$promise$asap$$len; i+=2) {
        var callback = lib$es6$promise$asap$$queue[i];
        var arg = lib$es6$promise$asap$$queue[i+1];

        callback(arg);

        lib$es6$promise$asap$$queue[i] = undefined;
        lib$es6$promise$asap$$queue[i+1] = undefined;
      }

      lib$es6$promise$asap$$len = 0;
    }

    function lib$es6$promise$asap$$attemptVertex() {
      try {
        var r = require;
        var vertx = r('vertx');
        lib$es6$promise$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
        return lib$es6$promise$asap$$useVertxTimer();
      } catch(e) {
        return lib$es6$promise$asap$$useSetTimeout();
      }
    }

    var lib$es6$promise$asap$$scheduleFlush;
    // Decide what async method to use to triggering processing of queued callbacks:
    if (lib$es6$promise$asap$$isNode) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useNextTick();
    } else if (lib$es6$promise$asap$$BrowserMutationObserver) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMutationObserver();
    } else if (lib$es6$promise$asap$$isWorker) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMessageChannel();
    } else if (lib$es6$promise$asap$$browserWindow === undefined && typeof require === 'function') {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$attemptVertex();
    } else {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useSetTimeout();
    }

    function lib$es6$promise$$internal$$noop() {}

    var lib$es6$promise$$internal$$PENDING   = void 0;
    var lib$es6$promise$$internal$$FULFILLED = 1;
    var lib$es6$promise$$internal$$REJECTED  = 2;

    var lib$es6$promise$$internal$$GET_THEN_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$selfFullfillment() {
      return new TypeError("You cannot resolve a promise with itself");
    }

    function lib$es6$promise$$internal$$cannotReturnOwn() {
      return new TypeError('A promises callback cannot return that same promise.');
    }

    function lib$es6$promise$$internal$$getThen(promise) {
      try {
        return promise.then;
      } catch(error) {
        lib$es6$promise$$internal$$GET_THEN_ERROR.error = error;
        return lib$es6$promise$$internal$$GET_THEN_ERROR;
      }
    }

    function lib$es6$promise$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
      try {
        then.call(value, fulfillmentHandler, rejectionHandler);
      } catch(e) {
        return e;
      }
    }

    function lib$es6$promise$$internal$$handleForeignThenable(promise, thenable, then) {
       lib$es6$promise$asap$$default(function(promise) {
        var sealed = false;
        var error = lib$es6$promise$$internal$$tryThen(then, thenable, function(value) {
          if (sealed) { return; }
          sealed = true;
          if (thenable !== value) {
            lib$es6$promise$$internal$$resolve(promise, value);
          } else {
            lib$es6$promise$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          if (sealed) { return; }
          sealed = true;

          lib$es6$promise$$internal$$reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          lib$es6$promise$$internal$$reject(promise, error);
        }
      }, promise);
    }

    function lib$es6$promise$$internal$$handleOwnThenable(promise, thenable) {
      if (thenable._state === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, thenable._result);
      } else if (thenable._state === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, thenable._result);
      } else {
        lib$es6$promise$$internal$$subscribe(thenable, undefined, function(value) {
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      }
    }

    function lib$es6$promise$$internal$$handleMaybeThenable(promise, maybeThenable) {
      if (maybeThenable.constructor === promise.constructor) {
        lib$es6$promise$$internal$$handleOwnThenable(promise, maybeThenable);
      } else {
        var then = lib$es6$promise$$internal$$getThen(maybeThenable);

        if (then === lib$es6$promise$$internal$$GET_THEN_ERROR) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$GET_THEN_ERROR.error);
        } else if (then === undefined) {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        } else if (lib$es6$promise$utils$$isFunction(then)) {
          lib$es6$promise$$internal$$handleForeignThenable(promise, maybeThenable, then);
        } else {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        }
      }
    }

    function lib$es6$promise$$internal$$resolve(promise, value) {
      if (promise === value) {
        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$selfFullfillment());
      } else if (lib$es6$promise$utils$$objectOrFunction(value)) {
        lib$es6$promise$$internal$$handleMaybeThenable(promise, value);
      } else {
        lib$es6$promise$$internal$$fulfill(promise, value);
      }
    }

    function lib$es6$promise$$internal$$publishRejection(promise) {
      if (promise._onerror) {
        promise._onerror(promise._result);
      }

      lib$es6$promise$$internal$$publish(promise);
    }

    function lib$es6$promise$$internal$$fulfill(promise, value) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }

      promise._result = value;
      promise._state = lib$es6$promise$$internal$$FULFILLED;

      if (promise._subscribers.length !== 0) {
        lib$es6$promise$asap$$default(lib$es6$promise$$internal$$publish, promise);
      }
    }

    function lib$es6$promise$$internal$$reject(promise, reason) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }
      promise._state = lib$es6$promise$$internal$$REJECTED;
      promise._result = reason;

      lib$es6$promise$asap$$default(lib$es6$promise$$internal$$publishRejection, promise);
    }

    function lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      parent._onerror = null;

      subscribers[length] = child;
      subscribers[length + lib$es6$promise$$internal$$FULFILLED] = onFulfillment;
      subscribers[length + lib$es6$promise$$internal$$REJECTED]  = onRejection;

      if (length === 0 && parent._state) {
        lib$es6$promise$asap$$default(lib$es6$promise$$internal$$publish, parent);
      }
    }

    function lib$es6$promise$$internal$$publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if (subscribers.length === 0) { return; }

      var child, callback, detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          lib$es6$promise$$internal$$invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function lib$es6$promise$$internal$$ErrorObject() {
      this.error = null;
    }

    var lib$es6$promise$$internal$$TRY_CATCH_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$tryCatch(callback, detail) {
      try {
        return callback(detail);
      } catch(e) {
        lib$es6$promise$$internal$$TRY_CATCH_ERROR.error = e;
        return lib$es6$promise$$internal$$TRY_CATCH_ERROR;
      }
    }

    function lib$es6$promise$$internal$$invokeCallback(settled, promise, callback, detail) {
      var hasCallback = lib$es6$promise$utils$$isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        value = lib$es6$promise$$internal$$tryCatch(callback, detail);

        if (value === lib$es6$promise$$internal$$TRY_CATCH_ERROR) {
          failed = true;
          error = value.error;
          value = null;
        } else {
          succeeded = true;
        }

        if (promise === value) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$cannotReturnOwn());
          return;
        }

      } else {
        value = detail;
        succeeded = true;
      }

      if (promise._state !== lib$es6$promise$$internal$$PENDING) {
        // noop
      } else if (hasCallback && succeeded) {
        lib$es6$promise$$internal$$resolve(promise, value);
      } else if (failed) {
        lib$es6$promise$$internal$$reject(promise, error);
      } else if (settled === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, value);
      } else if (settled === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, value);
      }
    }

    function lib$es6$promise$$internal$$initializePromise(promise, resolver) {
      try {
        resolver(function resolvePromise(value){
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function rejectPromise(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      } catch(e) {
        lib$es6$promise$$internal$$reject(promise, e);
      }
    }

    function lib$es6$promise$enumerator$$Enumerator(Constructor, input) {
      var enumerator = this;

      enumerator._instanceConstructor = Constructor;
      enumerator.promise = new Constructor(lib$es6$promise$$internal$$noop);

      if (enumerator._validateInput(input)) {
        enumerator._input     = input;
        enumerator.length     = input.length;
        enumerator._remaining = input.length;

        enumerator._init();

        if (enumerator.length === 0) {
          lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
        } else {
          enumerator.length = enumerator.length || 0;
          enumerator._enumerate();
          if (enumerator._remaining === 0) {
            lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
          }
        }
      } else {
        lib$es6$promise$$internal$$reject(enumerator.promise, enumerator._validationError());
      }
    }

    lib$es6$promise$enumerator$$Enumerator.prototype._validateInput = function(input) {
      return lib$es6$promise$utils$$isArray(input);
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._validationError = function() {
      return new Error('Array Methods must be provided an Array');
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._init = function() {
      this._result = new Array(this.length);
    };

    var lib$es6$promise$enumerator$$default = lib$es6$promise$enumerator$$Enumerator;

    lib$es6$promise$enumerator$$Enumerator.prototype._enumerate = function() {
      var enumerator = this;

      var length  = enumerator.length;
      var promise = enumerator.promise;
      var input   = enumerator._input;

      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
        enumerator._eachEntry(input[i], i);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
      var enumerator = this;
      var c = enumerator._instanceConstructor;

      if (lib$es6$promise$utils$$isMaybeThenable(entry)) {
        if (entry.constructor === c && entry._state !== lib$es6$promise$$internal$$PENDING) {
          entry._onerror = null;
          enumerator._settledAt(entry._state, i, entry._result);
        } else {
          enumerator._willSettleAt(c.resolve(entry), i);
        }
      } else {
        enumerator._remaining--;
        enumerator._result[i] = entry;
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
      var enumerator = this;
      var promise = enumerator.promise;

      if (promise._state === lib$es6$promise$$internal$$PENDING) {
        enumerator._remaining--;

        if (state === lib$es6$promise$$internal$$REJECTED) {
          lib$es6$promise$$internal$$reject(promise, value);
        } else {
          enumerator._result[i] = value;
        }
      }

      if (enumerator._remaining === 0) {
        lib$es6$promise$$internal$$fulfill(promise, enumerator._result);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
      var enumerator = this;

      lib$es6$promise$$internal$$subscribe(promise, undefined, function(value) {
        enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED, i, value);
      }, function(reason) {
        enumerator._settledAt(lib$es6$promise$$internal$$REJECTED, i, reason);
      });
    };
    function lib$es6$promise$promise$all$$all(entries) {
      return new lib$es6$promise$enumerator$$default(this, entries).promise;
    }
    var lib$es6$promise$promise$all$$default = lib$es6$promise$promise$all$$all;
    function lib$es6$promise$promise$race$$race(entries) {
      /*jshint validthis:true */
      var Constructor = this;

      var promise = new Constructor(lib$es6$promise$$internal$$noop);

      if (!lib$es6$promise$utils$$isArray(entries)) {
        lib$es6$promise$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
        return promise;
      }

      var length = entries.length;

      function onFulfillment(value) {
        lib$es6$promise$$internal$$resolve(promise, value);
      }

      function onRejection(reason) {
        lib$es6$promise$$internal$$reject(promise, reason);
      }

      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
        lib$es6$promise$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
      }

      return promise;
    }
    var lib$es6$promise$promise$race$$default = lib$es6$promise$promise$race$$race;
    function lib$es6$promise$promise$resolve$$resolve(object) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$resolve(promise, object);
      return promise;
    }
    var lib$es6$promise$promise$resolve$$default = lib$es6$promise$promise$resolve$$resolve;
    function lib$es6$promise$promise$reject$$reject(reason) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$reject(promise, reason);
      return promise;
    }
    var lib$es6$promise$promise$reject$$default = lib$es6$promise$promise$reject$$reject;

    var lib$es6$promise$promise$$counter = 0;

    function lib$es6$promise$promise$$needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function lib$es6$promise$promise$$needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    var lib$es6$promise$promise$$default = lib$es6$promise$promise$$Promise;
    /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise’s eventual value or the reason
      why the promise cannot be fulfilled.

      Terminology
      -----------

      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.

      A promise can be in one of three states: pending, fulfilled, or rejected.

      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.

      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.


      Basic Usage:
      ------------

      ```js
      var promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);

        // on failure
        reject(reason);
      });

      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Advanced Usage:
      ---------------

      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.

      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          var xhr = new XMLHttpRequest();

          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();

          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }

      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Unlike callbacks, promises are great composable primitives.

      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON

        return values;
      });
      ```

      @class Promise
      @param {function} resolver
      Useful for tooling.
      @constructor
    */
    function lib$es6$promise$promise$$Promise(resolver) {
      this._id = lib$es6$promise$promise$$counter++;
      this._state = undefined;
      this._result = undefined;
      this._subscribers = [];

      if (lib$es6$promise$$internal$$noop !== resolver) {
        if (!lib$es6$promise$utils$$isFunction(resolver)) {
          lib$es6$promise$promise$$needsResolver();
        }

        if (!(this instanceof lib$es6$promise$promise$$Promise)) {
          lib$es6$promise$promise$$needsNew();
        }

        lib$es6$promise$$internal$$initializePromise(this, resolver);
      }
    }

    lib$es6$promise$promise$$Promise.all = lib$es6$promise$promise$all$$default;
    lib$es6$promise$promise$$Promise.race = lib$es6$promise$promise$race$$default;
    lib$es6$promise$promise$$Promise.resolve = lib$es6$promise$promise$resolve$$default;
    lib$es6$promise$promise$$Promise.reject = lib$es6$promise$promise$reject$$default;

    lib$es6$promise$promise$$Promise.prototype = {
      constructor: lib$es6$promise$promise$$Promise,

    /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.

      ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```

      Chaining
      --------

      The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.

      ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });

      findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

      ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```

      Assimilation
      ------------

      Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```

      If the assimliated promise rejects, then the downstream promise will also reject.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```

      Simple Example
      --------------

      Synchronous Example

      ```javascript
      var result;

      try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```

      Advanced Example
      --------------

      Synchronous Example

      ```javascript
      var author, books;

      try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js

      function foundBooks(books) {

      }

      function failure(reason) {

      }

      findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```

      @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      Useful for tooling.
      @return {Promise}
    */
      then: function(onFulfillment, onRejection) {
        var parent = this;
        var state = parent._state;

        if (state === lib$es6$promise$$internal$$FULFILLED && !onFulfillment || state === lib$es6$promise$$internal$$REJECTED && !onRejection) {
          return this;
        }

        var child = new this.constructor(lib$es6$promise$$internal$$noop);
        var result = parent._result;

        if (state) {
          var callback = arguments[state - 1];
          lib$es6$promise$asap$$default(function(){
            lib$es6$promise$$internal$$invokeCallback(state, child, callback, result);
          });
        } else {
          lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection);
        }

        return child;
      },

    /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.

      ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }

      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }

      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```

      @method catch
      @param {Function} onRejection
      Useful for tooling.
      @return {Promise}
    */
      'catch': function(onRejection) {
        return this.then(null, onRejection);
      }
    };
    function lib$es6$promise$polyfill$$polyfill() {
      var local;

      if (typeof global !== 'undefined') {
          local = global;
      } else if (typeof self !== 'undefined') {
          local = self;
      } else {
          try {
              local = Function('return this')();
          } catch (e) {
              throw new Error('polyfill failed because global object is unavailable in this environment');
          }
      }

      var P = local.Promise;

      if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
        return;
      }

      local.Promise = lib$es6$promise$promise$$default;
    }
    var lib$es6$promise$polyfill$$default = lib$es6$promise$polyfill$$polyfill;

    var lib$es6$promise$umd$$ES6Promise = {
      'Promise': lib$es6$promise$promise$$default,
      'polyfill': lib$es6$promise$polyfill$$default
    };

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define['amd']) {
      define(function() { return lib$es6$promise$umd$$ES6Promise; });
    } else if (typeof module !== 'undefined' && module['exports']) {
      module['exports'] = lib$es6$promise$umd$$ES6Promise;
    } else if (typeof this !== 'undefined') {
      this['ES6Promise'] = lib$es6$promise$umd$$ES6Promise;
    }

    lib$es6$promise$polyfill$$default();
}).call(this);


}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/es6-promise/dist/es6-promise.js","/../../node_modules/es6-promise/dist")
},{"buffer":4,"oMfpAn":7}],4:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
  // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
  // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
  // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
  // because we need to be able to add all the node Buffer API methods. This is an issue
  // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // assume that object is array-like
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer._useTypedArrays) {
    for (var i = 0; i < len; i++)
      target[i + target_start] = this[i + start]
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/index.js","/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer")
},{"base64-js":5,"buffer":4,"ieee754":6,"oMfpAn":7}],5:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/base64-js/lib/b64.js","/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/base64-js/lib")
},{"buffer":4,"oMfpAn":7}],6:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/ieee754/index.js","/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/ieee754")
},{"buffer":4,"oMfpAn":7}],7:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/process/browser.js","/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/process")
},{"buffer":4,"oMfpAn":7}],8:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*
 * @name Lazy.js
 *
 * @fileOverview
 * Lazy.js is a lazy evaluation library for JavaScript.
 *
 * This has been done before. For examples see:
 *
 * - [wu.js](http://fitzgen.github.io/wu.js/)
 * - [Linq.js](http://linqjs.codeplex.com/)
 * - [from.js](https://github.com/suckgamoni/fromjs/)
 * - [IxJS](http://rx.codeplex.com/)
 * - [sloth.js](http://rfw.name/sloth.js/)
 *
 * However, at least at present, Lazy.js is faster (on average) than any of
 * those libraries. It is also more complete, with nearly all of the
 * functionality of [Underscore](http://underscorejs.org/) and
 * [Lo-Dash](http://lodash.com/).
 *
 * Finding your way around the code
 * --------------------------------
 *
 * At the heart of Lazy.js is the {@link Sequence} object. You create an initial
 * sequence using {@link Lazy}, which can accept an array, object, or string.
 * You can then "chain" together methods from this sequence, creating a new
 * sequence with each call.
 *
 * Here's an example:
 *
 *     var data = getReallyBigArray();
 *
 *     var statistics = Lazy(data)
 *       .map(transform)
 *       .filter(validate)
 *       .reduce(aggregate);
 *
 * {@link Sequence} is the foundation of other, more specific sequence types.
 *
 * An {@link ArrayLikeSequence} provides indexed access to its elements.
 *
 * An {@link ObjectLikeSequence} consists of key/value pairs.
 *
 * A {@link StringLikeSequence} is like a string (duh): actually, it is an
 * {@link ArrayLikeSequence} whose elements happen to be characters.
 *
 * An {@link AsyncSequence} is special: it iterates over its elements
 * asynchronously (so calling `each` generally begins an asynchronous loop and
 * returns immediately).
 *
 * For more information
 * --------------------
 *
 * I wrote a blog post that explains a little bit more about Lazy.js, which you
 * can read [here](http://philosopherdeveloper.com/posts/introducing-lazy-js.html).
 *
 * You can also [create an issue on GitHub](https://github.com/dtao/lazy.js/issues)
 * if you have any issues with the library. I work through them eventually.
 *
 * [@dtao](https://github.com/dtao)
 */

(function(context) {
  /**
   * Wraps an object and returns a {@link Sequence}. For `null` or `undefined`,
   * simply returns an empty sequence (see {@link Lazy.strict} for a stricter
   * implementation).
   *
   * - For **arrays**, Lazy will create a sequence comprising the elements in
   *   the array (an {@link ArrayLikeSequence}).
   * - For **objects**, Lazy will create a sequence of key/value pairs
   *   (an {@link ObjectLikeSequence}).
   * - For **strings**, Lazy will create a sequence of characters (a
   *   {@link StringLikeSequence}).
   *
   * @public
   * @param {Array|Object|string} source An array, object, or string to wrap.
   * @returns {Sequence} The wrapped lazy object.
   *
   * @exampleHelpers
   * // Utility functions to provide to all examples
   * function increment(x) { return x + 1; }
   * function isEven(x) { return x % 2 === 0; }
   * function isPositive(x) { return x > 0; }
   * function isNegative(x) { return x < 0; }
   *
   * @examples
   * Lazy([1, 2, 4])       // instanceof Lazy.ArrayLikeSequence
   * Lazy({ foo: "bar" })  // instanceof Lazy.ObjectLikeSequence
   * Lazy("hello, world!") // instanceof Lazy.StringLikeSequence
   * Lazy()                // sequence: []
   * Lazy(null)            // sequence: []
   */
  function Lazy(source) {
    if (source instanceof Array) {
      return new ArrayWrapper(source);

    } else if (typeof source === "string") {
      return new StringWrapper(source);

    } else if (source instanceof Sequence) {
      return source;
    }

    if (Lazy.extensions) {
      var extensions = Lazy.extensions, length = extensions.length, result;
      while (!result && length--) {
        result = extensions[length](source);
      }
      if (result) {
        return result;
      }
    }

    return new ObjectWrapper(source);
  }

  Lazy.VERSION = '0.4.0';

  /*** Utility methods of questionable value ***/

  Lazy.noop = function noop() {};
  Lazy.identity = function identity(x) { return x; };

  /**
   * Provides a stricter version of {@link Lazy} which throws an error when
   * attempting to wrap `null`, `undefined`, or numeric or boolean values as a
   * sequence.
   *
   * @public
   * @returns {Function} A stricter version of the {@link Lazy} helper function.
   *
   * @examples
   * var Strict = Lazy.strict();
   *
   * Strict()                  // throws
   * Strict(null)              // throws
   * Strict(true)              // throws
   * Strict(5)                 // throws
   * Strict([1, 2, 3])         // instanceof Lazy.ArrayLikeSequence
   * Strict({ foo: "bar" })    // instanceof Lazy.ObjectLikeSequence
   * Strict("hello, world!")   // instanceof Lazy.StringLikeSequence
   *
   * // Let's also ensure the static functions are still there.
   * Strict.range(3)           // sequence: [0, 1, 2]
   * Strict.generate(Date.now) // instanceof Lazy.GeneratedSequence
   */
  Lazy.strict = function strict() {
    function StrictLazy(source) {
      if (source == null) {
        throw new Error("You cannot wrap null or undefined using Lazy.");
      }

      if (typeof source === "number" || typeof source === "boolean") {
        throw new Error("You cannot wrap primitive values using Lazy.");
      }

      return Lazy(source);
    };

    Lazy(Lazy).each(function(property, name) {
      StrictLazy[name] = property;
    });

    return StrictLazy;
  };

  /**
   * The `Sequence` object provides a unified API encapsulating the notion of
   * zero or more consecutive elements in a collection, stream, etc.
   *
   * Lazy evaluation
   * ---------------
   *
   * Generally speaking, creating a sequence should not be an expensive operation,
   * and should not iterate over an underlying source or trigger any side effects.
   * This means that chaining together methods that return sequences incurs only
   * the cost of creating the `Sequence` objects themselves and not the cost of
   * iterating an underlying data source multiple times.
   *
   * The following code, for example, creates 4 sequences and does nothing with
   * `source`:
   *
   *     var seq = Lazy(source) // 1st sequence
   *       .map(func)           // 2nd
   *       .filter(pred)        // 3rd
   *       .reverse();          // 4th
   *
   * Lazy's convention is to hold off on iterating or otherwise *doing* anything
   * (aside from creating `Sequence` objects) until you call `each`:
   *
   *     seq.each(function(x) { console.log(x); });
   *
   * Defining custom sequences
   * -------------------------
   *
   * Defining your own type of sequence is relatively simple:
   *
   * 1. Pass a *method name* and an object containing *function overrides* to
   *    {@link Sequence.define}. If the object includes a function called `init`,
   *    this function will be called upon initialization.
   * 2. The object should include at least either a `getIterator` method or an
   *    `each` method. The former supports both asynchronous and synchronous
   *    iteration, but is slightly more cumbersome to implement. The latter
   *    supports synchronous iteration and can be automatically implemented in
   *    terms of the former. You can also implement both if you want, e.g. to
   *    optimize performance. For more info, see {@link Iterator} and
   *    {@link AsyncSequence}.
   *
   * As a trivial example, the following code defines a new method, `sample`,
   * which randomly may or may not include each element from its parent.
   *
   *     Lazy.Sequence.define("sample", {
   *       each: function(fn) {
   *         return this.parent.each(function(e) {
   *           // 50/50 chance of including this element.
   *           if (Math.random() > 0.5) {
   *             return fn(e);
   *           }
   *         });
   *       }
   *     });
   *
   * (Of course, the above could also easily have been implemented using
   * {@link #filter} instead of creating a custom sequence. But I *did* say this
   * was a trivial example, to be fair.)
   *
   * Now it will be possible to create this type of sequence from any parent
   * sequence by calling the method name you specified. In other words, you can
   * now do this:
   *
   *     Lazy(arr).sample();
   *     Lazy(arr).map(func).sample();
   *     Lazy(arr).map(func).filter(pred).sample();
   *
   * Etc., etc.
   *
   * @public
   * @constructor
   */
  function Sequence() {}

  /**
   * Create a new constructor function for a type inheriting from `Sequence`.
   *
   * @public
   * @param {string|Array.<string>} methodName The name(s) of the method(s) to be
   *     used for constructing the new sequence. The method will be attached to
   *     the `Sequence` prototype so that it can be chained with any other
   *     sequence methods, like {@link #map}, {@link #filter}, etc.
   * @param {Object} overrides An object containing function overrides for this
   *     new sequence type. **Must** include either `getIterator` or `each` (or
   *     both). *May* include an `init` method as well. For these overrides,
   *     `this` will be the new sequence, and `this.parent` will be the base
   *     sequence from which the new sequence was constructed.
   * @returns {Function} A constructor for a new type inheriting from `Sequence`.
   *
   * @examples
   * // This sequence type logs every element to the specified logger as it
   * // iterates over it.
   * Lazy.Sequence.define("verbose", {
   *   init: function(logger) {
   *     this.logger = logger;
   *   },
   *
   *   each: function(fn) {
   *     var logger = this.logger;
   *     return this.parent.each(function(e, i) {
   *       logger(e);
   *       return fn(e, i);
   *     });
   *   }
   * });
   *
   * Lazy([1, 2, 3]).verbose(logger).each(Lazy.noop) // calls logger 3 times
   */
  Sequence.define = function define(methodName, overrides) {
    if (!overrides || (!overrides.getIterator && !overrides.each)) {
      throw new Error("A custom sequence must implement *at least* getIterator or each!");
    }

    return defineSequenceType(Sequence, methodName, overrides);
  };

  /**
   * Gets the number of elements in the sequence. In some cases, this may
   * require eagerly evaluating the sequence.
   *
   * @public
   * @returns {number} The number of elements in the sequence.
   *
   * @examples
   * Lazy([1, 2, 3]).size();                 // => 3
   * Lazy([1, 2]).map(Lazy.identity).size(); // => 2
   * Lazy([1, 2, 3]).reject(isEven).size();  // => 2
   * Lazy([1, 2, 3]).take(1).size();         // => 1
   * Lazy({ foo: 1, bar: 2 }).size();        // => 2
   * Lazy('hello').size();                   // => 5
   */
  Sequence.prototype.size = function size() {
    return this.getIndex().length();
  };

  /**
   * Creates an {@link Iterator} object with two methods, `moveNext` -- returning
   * true or false -- and `current` -- returning the current value.
   *
   * This method is used when asynchronously iterating over sequences. Any type
   * inheriting from `Sequence` must implement this method or it can't support
   * asynchronous iteration.
   *
   * Note that **this method is not intended to be used directly by application
   * code.** Rather, it is intended as a means for implementors to potentially
   * define custom sequence types that support either synchronous or
   * asynchronous iteration.
   *
   * @public
   * @returns {Iterator} An iterator object.
   *
   * @examples
   * var iterator = Lazy([1, 2]).getIterator();
   *
   * iterator.moveNext(); // => true
   * iterator.current();  // => 1
   * iterator.moveNext(); // => true
   * iterator.current();  // => 2
   * iterator.moveNext(); // => false
   */
  Sequence.prototype.getIterator = function getIterator() {
    return new Iterator(this);
  };

  /**
   * Gets the root sequence underlying the current chain of sequences.
   */
  Sequence.prototype.root = function root() {
    return this.parent.root();
  };

  /**
   * Whether or not the current sequence is an asynchronous one. This is more
   * accurate than checking `instanceof {@link AsyncSequence}` because, for
   * example, `Lazy([1, 2, 3]).async().map(Lazy.identity)` returns a sequence
   * that iterates asynchronously even though it's not an instance of
   * `AsyncSequence`.
   */
  Sequence.prototype.isAsync = function isAsync() {
    return this.parent ? this.parent.isAsync() : false;
  };

  /**
   * Evaluates the sequence and produces an appropriate value (an array in most
   * cases, an object for {@link ObjectLikeSequence}s or a string for
   * {@link StringLikeSequence}s).
   */
  Sequence.prototype.value = function value() {
    return this.toArray();
  };

  /**
   * Applies the current transformation chain to a given source.
   *
   * @examples
   * var sequence = Lazy([])
   *   .map(function(x) { return x * -1; })
   *   .filter(function(x) { return x % 2 === 0; });
   *
   * sequence.apply([1, 2, 3, 4]); // => [-2, -4]
   */
  Sequence.prototype.apply = function apply(source) {
    var root = this.root(),
        previousSource = root.source,
        result;

    try {
      root.source = source;
      result = this.value();
    } finally {
      root.source = previousSource;
    }

    return result;
  };

  /**
   * The Iterator object provides an API for iterating over a sequence.
   *
   * The purpose of the `Iterator` type is mainly to offer an agnostic way of
   * iterating over a sequence -- either synchronous (i.e. with a `while` loop)
   * or asynchronously (with recursive calls to either `setTimeout` or --- if
   * available --- `setImmediate`). It is not intended to be used directly by
   * application code.
   *
   * @public
   * @constructor
   * @param {Sequence} sequence The sequence to iterate over.
   */
  function Iterator(sequence) {
    this.sequence = sequence;
    this.index    = -1;
  }

  /**
   * Gets the current item this iterator is pointing to.
   *
   * @public
   * @returns {*} The current item.
   */
  Iterator.prototype.current = function current() {
    return this.cachedIndex && this.cachedIndex.get(this.index);
  };

  /**
   * Moves the iterator to the next item in a sequence, if possible.
   *
   * @public
   * @returns {boolean} True if the iterator is able to move to a new item, or else
   *     false.
   */
  Iterator.prototype.moveNext = function moveNext() {
    var cachedIndex = this.cachedIndex;

    if (!cachedIndex) {
      cachedIndex = this.cachedIndex = this.sequence.getIndex();
    }

    if (this.index >= cachedIndex.length() - 1) {
      return false;
    }

    ++this.index;
    return true;
  };

  /**
   * Creates an array snapshot of a sequence.
   *
   * Note that for indefinite sequences, this method may raise an exception or
   * (worse) cause the environment to hang.
   *
   * @public
   * @returns {Array} An array containing the current contents of the sequence.
   *
   * @examples
   * Lazy([1, 2, 3]).toArray() // => [1, 2, 3]
   */
  Sequence.prototype.toArray = function toArray() {
    return this.reduce(function(arr, element) {
      arr.push(element);
      return arr;
    }, []);
  };

  /**
   * Provides an indexed view into the sequence.
   *
   * For sequences that are already indexed, this will simply return the
   * sequence. For non-indexed sequences, this will eagerly evaluate the
   * sequence.
   *
   * @returns {ArrayLikeSequence} A sequence containing the current contents of
   *     the sequence.
   *
   * @examples
   * Lazy([1, 2, 3]).filter(isEven)            // instanceof Lazy.Sequence
   * Lazy([1, 2, 3]).filter(isEven).getIndex() // instanceof Lazy.ArrayLikeSequence
   */
  Sequence.prototype.getIndex = function getIndex() {
    return new ArrayWrapper(this.toArray());
  };

  /**
   * Returns the element at the specified index. Note that, for sequences that
   * are not {@link ArrayLikeSequence}s, this may require partially evaluating
   * the sequence, iterating to reach the result. (In other words for such
   * sequences this method is not O(1).)
   *
   * @public
   * @param {number} i The index to access.
   * @returns {*} The element.
   *
   */
  Sequence.prototype.get = function get(i) {
    var element;
    this.each(function(e, index) {
      if (index === i) {
        element = e;
        return false;
      }
    });
    return element;
  };

  /**
   * Provides an indexed, memoized view into the sequence. This will cache the
   * result whenever the sequence is first iterated, so that subsequent
   * iterations will access the same element objects.
   *
   * @public
   * @returns {ArrayLikeSequence} An indexed, memoized sequence containing this
   *     sequence's elements, cached after the first iteration.
   *
   * @example
   * function createObject() { return new Object(); }
   *
   * var plain    = Lazy.generate(createObject, 10),
   *     memoized = Lazy.generate(createObject, 10).memoize();
   *
   * plain.toArray()[0] === plain.toArray()[0];       // => false
   * memoized.toArray()[0] === memoized.toArray()[0]; // => true
   */
  Sequence.prototype.memoize = function memoize() {
    return new MemoizedSequence(this);
  };

  /**
   * @constructor
   */
  function MemoizedSequence(parent) {
    this.parent = parent;
  }

  // MemoizedSequence needs to have its prototype set up after ArrayLikeSequence

  /**
   * Creates an object from a sequence of key/value pairs.
   *
   * @public
   * @returns {Object} An object with keys and values corresponding to the pairs
   *     of elements in the sequence.
   *
   * @examples
   * var details = [
   *   ["first", "Dan"],
   *   ["last", "Tao"],
   *   ["age", 29]
   * ];
   *
   * Lazy(details).toObject() // => { first: "Dan", last: "Tao", age: 29 }
   */
  Sequence.prototype.toObject = function toObject() {
    return this.reduce(function(object, pair) {
      object[pair[0]] = pair[1];
      return object;
    }, {});
  };

  /**
   * Iterates over this sequence and executes a function for every element.
   *
   * @public
   * @aka forEach
   * @param {Function} fn The function to call on each element in the sequence.
   *     Return false from the function to end the iteration.
   *
   * @examples
   * Lazy([1, 2, 3, 4]).each(fn) // calls fn 4 times
   */
  Sequence.prototype.each = function each(fn) {
    var iterator = this.getIterator(),
        i = -1;

    while (iterator.moveNext()) {
      if (fn(iterator.current(), ++i) === false) {
        return false;
      }
    }

    return true;
  };

  Sequence.prototype.forEach = function forEach(fn) {
    return this.each(fn);
  };

  /**
   * Creates a new sequence whose values are calculated by passing this sequence's
   * elements through some mapping function.
   *
   * @public
   * @aka collect
   * @param {Function} mapFn The mapping function used to project this sequence's
   *     elements onto a new sequence.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy([]).map(increment)        // sequence: []
   * Lazy([1, 2, 3]).map(increment) // sequence: [2, 3, 4]
   *
   * @benchmarks
   * function increment(x) { return x + 1; }
   *
   * var smArr = Lazy.range(10).toArray(),
   *     lgArr = Lazy.range(100).toArray();
   *
   * Lazy(smArr).map(increment).each(Lazy.noop) // lazy - 10 elements
   * Lazy(lgArr).map(increment).each(Lazy.noop) // lazy - 100 elements
   * _.each(_.map(smArr, increment), _.noop)    // lodash - 10 elements
   * _.each(_.map(lgArr, increment), _.noop)    // lodash - 100 elements
   */
  Sequence.prototype.map = function map(mapFn) {
    return new MappedSequence(this, createCallback(mapFn));
  };

  Sequence.prototype.collect = function collect(mapFn) {
    return this.map(mapFn);
  };

  /**
   * @constructor
   */
  function MappedSequence(parent, mapFn) {
    this.parent = parent;
    this.mapFn  = mapFn;
  }

  MappedSequence.prototype = new Sequence();

  MappedSequence.prototype.getIterator = function getIterator() {
    return new MappingIterator(this.parent, this.mapFn);
  };

  MappedSequence.prototype.each = function each(fn) {
    var mapFn = this.mapFn;
    return this.parent.each(function(e, i) {
      return fn(mapFn(e, i), i);
    });
  };

  /**
   * @constructor
   */
  function MappingIterator(sequence, mapFn) {
    this.iterator = sequence.getIterator();
    this.mapFn    = mapFn;
    this.index    = -1;
  }

  MappingIterator.prototype.current = function current() {
    return this.mapFn(this.iterator.current(), this.index);
  };

  MappingIterator.prototype.moveNext = function moveNext() {
    if (this.iterator.moveNext()) {
      ++this.index;
      return true;
    }

    return false;
  };

  /**
   * Creates a new sequence whose values are calculated by accessing the specified
   * property from each element in this sequence.
   *
   * @public
   * @param {string} propertyName The name of the property to access for every
   *     element in this sequence.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * var people = [
   *   { first: "Dan", last: "Tao" },
   *   { first: "Bob", last: "Smith" }
   * ];
   *
   * Lazy(people).pluck("last") // sequence: ["Tao", "Smith"]
   */
  Sequence.prototype.pluck = function pluck(property) {
    return this.map(property);
  };

  /**
   * Creates a new sequence whose values are calculated by invoking the specified
   * function on each element in this sequence.
   *
   * @public
   * @param {string} methodName The name of the method to invoke for every element
   *     in this sequence.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * function Person(first, last) {
   *   this.fullName = function fullName() {
   *     return first + " " + last;
   *   };
   * }
   *
   * var people = [
   *   new Person("Dan", "Tao"),
   *   new Person("Bob", "Smith")
   * ];
   *
   * Lazy(people).invoke("fullName") // sequence: ["Dan Tao", "Bob Smith"]
   */
  Sequence.prototype.invoke = function invoke(methodName) {
    return this.map(function(e) {
      return e[methodName]();
    });
  };

  /**
   * Creates a new sequence whose values are the elements of this sequence which
   * satisfy the specified predicate.
   *
   * @public
   * @aka select
   * @param {Function} filterFn The predicate to call on each element in this
   *     sequence, which returns true if the element should be included.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * var numbers = [1, 2, 3, 4, 5, 6];
   *
   * Lazy(numbers).filter(isEven) // sequence: [2, 4, 6]
   *
   * @benchmarks
   * function isEven(x) { return x % 2 === 0; }
   *
   * var smArr = Lazy.range(10).toArray(),
   *     lgArr = Lazy.range(100).toArray();
   *
   * Lazy(smArr).filter(isEven).each(Lazy.noop) // lazy - 10 elements
   * Lazy(lgArr).filter(isEven).each(Lazy.noop) // lazy - 100 elements
   * _.each(_.filter(smArr, isEven), _.noop)    // lodash - 10 elements
   * _.each(_.filter(lgArr, isEven), _.noop)    // lodash - 100 elements
   */
  Sequence.prototype.filter = function filter(filterFn) {
    return new FilteredSequence(this, createCallback(filterFn));
  };

  Sequence.prototype.select = function select(filterFn) {
    return this.filter(filterFn);
  };

  /**
   * @constructor
   */
  function FilteredSequence(parent, filterFn) {
    this.parent   = parent;
    this.filterFn = filterFn;
  }

  FilteredSequence.prototype = new Sequence();

  FilteredSequence.prototype.getIterator = function getIterator() {
    return new FilteringIterator(this.parent, this.filterFn);
  };

  FilteredSequence.prototype.each = function each(fn) {
    var filterFn = this.filterFn,
        j = 0;

    return this.parent.each(function(e, i) {
      if (filterFn(e, i)) {
        return fn(e, j++);
      }
    });
  };

  FilteredSequence.prototype.reverse = function reverse() {
    return this.parent.reverse().filter(this.filterFn);
  };

  /**
   * @constructor
   */
  function FilteringIterator(sequence, filterFn) {
    this.iterator = sequence.getIterator();
    this.filterFn = filterFn;
    this.index    = 0;
  }

  FilteringIterator.prototype.current = function current() {
    return this.value;
  };

  FilteringIterator.prototype.moveNext = function moveNext() {
    var iterator = this.iterator,
        filterFn = this.filterFn,
        value;

    while (iterator.moveNext()) {
      value = iterator.current();
      if (filterFn(value, this.index++)) {
        this.value = value;
        return true;
      }
    }

    this.value = undefined;
    return false;
  };

  /**
   * Creates a new sequence whose values exclude the elements of this sequence
   * identified by the specified predicate.
   *
   * @public
   * @param {Function} rejectFn The predicate to call on each element in this
   *     sequence, which returns true if the element should be omitted.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy([1, 2, 3, 4, 5]).reject(isEven)              // sequence: [1, 3, 5]
   * Lazy([{ foo: 1 }, { bar: 2 }]).reject('foo')      // sequence: [{ bar: 2 }]
   * Lazy([{ foo: 1 }, { foo: 2 }]).reject({ foo: 2 }) // sequence: [{ foo: 1 }]
   */
  Sequence.prototype.reject = function reject(rejectFn) {
    rejectFn = createCallback(rejectFn);
    return this.filter(function(e) { return !rejectFn(e); });
  };

  /**
   * Creates a new sequence whose values have the specified type, as determined
   * by the `typeof` operator.
   *
   * @public
   * @param {string} type The type of elements to include from the underlying
   *     sequence, i.e. where `typeof [element] === [type]`.
   * @returns {Sequence} The new sequence, comprising elements of the specified
   *     type.
   *
   * @examples
   * Lazy([1, 2, 'foo', 'bar']).ofType('number')  // sequence: [1, 2]
   * Lazy([1, 2, 'foo', 'bar']).ofType('string')  // sequence: ['foo', 'bar']
   * Lazy([1, 2, 'foo', 'bar']).ofType('boolean') // sequence: []
   */
  Sequence.prototype.ofType = function ofType(type) {
    return this.filter(function(e) { return typeof e === type; });
  };

  /**
   * Creates a new sequence whose values are the elements of this sequence with
   * property names and values matching those of the specified object.
   *
   * @public
   * @param {Object} properties The properties that should be found on every
   *     element that is to be included in this sequence.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * var people = [
   *   { first: "Dan", last: "Tao" },
   *   { first: "Bob", last: "Smith" }
   * ];
   *
   * Lazy(people).where({ first: "Dan" }) // sequence: [{ first: "Dan", last: "Tao" }]
   *
   * @benchmarks
   * var animals = ["dog", "cat", "mouse", "horse", "pig", "snake"];
   *
   * Lazy(animals).where({ length: 3 }).each(Lazy.noop) // lazy
   * _.each(_.where(animals, { length: 3 }), _.noop)    // lodash
   */
  Sequence.prototype.where = function where(properties) {
    return this.filter(properties);
  };

  /**
   * Creates a new sequence with the same elements as this one, but to be iterated
   * in the opposite order.
   *
   * Note that in some (but not all) cases, the only way to create such a sequence
   * may require iterating the entire underlying source when `each` is called.
   *
   * @public
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy([1, 2, 3]).reverse() // sequence: [3, 2, 1]
   * Lazy([]).reverse()        // sequence: []
   */
  Sequence.prototype.reverse = function reverse() {
    return new ReversedSequence(this);
  };

  /**
   * @constructor
   */
  function ReversedSequence(parent) {
    this.parent = parent;
  }

  ReversedSequence.prototype = new Sequence();

  ReversedSequence.prototype.getIterator = function getIterator() {
    return new ReversedIterator(this.parent);
  };

  /**
   * @constuctor
   */
  function ReversedIterator(sequence) {
    this.sequence = sequence;
  }

  ReversedIterator.prototype.current = function current() {
    return this.getIndex().get(this.index);
  };

  ReversedIterator.prototype.moveNext = function moveNext() {
    var index  = this.getIndex(),
        length = index.length();

    if (typeof this.index === "undefined") {
      this.index = length;
    }

    return (--this.index >= 0);
  };

  ReversedIterator.prototype.getIndex = function getIndex() {
    if (!this.cachedIndex) {
      this.cachedIndex = this.sequence.getIndex();
    }

    return this.cachedIndex;
  };

  /**
   * Creates a new sequence with all of the elements of this one, plus those of
   * the given array(s).
   *
   * @public
   * @param {...*} var_args One or more values (or arrays of values) to use for
   *     additional items after this sequence.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * var left  = [1, 2, 3];
   * var right = [4, 5, 6];
   *
   * Lazy(left).concat(right)         // sequence: [1, 2, 3, 4, 5, 6]
   * Lazy(left).concat(Lazy(right))   // sequence: [1, 2, 3, 4, 5, 6]
   * Lazy(left).concat(right, [7, 8]) // sequence: [1, 2, 3, 4, 5, 6, 7, 8]
   */
  Sequence.prototype.concat = function concat(var_args) {
    return new ConcatenatedSequence(this, arraySlice.call(arguments, 0));
  };

  /**
   * @constructor
   */
  function ConcatenatedSequence(parent, arrays) {
    this.parent = parent;
    this.arrays = arrays;
  }

  ConcatenatedSequence.prototype = new Sequence();

  ConcatenatedSequence.prototype.each = function each(fn) {
    var done = false,
        i = 0;

    this.parent.each(function(e) {
      if (fn(e, i++) === false) {
        done = true;
        return false;
      }
    });

    if (!done) {
      Lazy(this.arrays).flatten().each(function(e) {
        if (fn(e, i++) === false) {
          return false;
        }
      });
    }
  };

  /**
   * Creates a new sequence comprising the first N elements from this sequence, OR
   * (if N is `undefined`) simply returns the first element of this sequence.
   *
   * @public
   * @aka head, take
   * @param {number=} count The number of elements to take from this sequence. If
   *     this value exceeds the length of the sequence, the resulting sequence
   *     will be essentially the same as this one.
   * @returns {*} The new sequence (or the first element from this sequence if
   *     no count was given).
   *
   * @examples
   * function powerOfTwo(exp) {
   *   return Math.pow(2, exp);
   * }
   *
   * Lazy.generate(powerOfTwo).first()          // => 1
   * Lazy.generate(powerOfTwo).first(5)         // sequence: [1, 2, 4, 8, 16]
   * Lazy.generate(powerOfTwo).skip(2).first()  // => 4
   * Lazy.generate(powerOfTwo).skip(2).first(2) // sequence: [4, 8]
   */
  Sequence.prototype.first = function first(count) {
    if (typeof count === "undefined") {
      return getFirst(this);
    }
    return new TakeSequence(this, count);
  };

  Sequence.prototype.head =
  Sequence.prototype.take = function (count) {
    return this.first(count);
  };

  /**
   * @constructor
   */
  function TakeSequence(parent, count) {
    this.parent = parent;
    this.count  = count;
  }

  TakeSequence.prototype = new Sequence();

  TakeSequence.prototype.getIterator = function getIterator() {
    return new TakeIterator(this.parent, this.count);
  };

  TakeSequence.prototype.each = function each(fn) {
    var count = this.count,
        i     = 0;

    var handle = this.parent.each(function(e) {
      var result;
      if (i < count) { result = fn(e, i++); }
      if (i >= count) { return false; }
      return result;
    });

    if (handle instanceof AsyncHandle) {
      return handle;
    }

    return i === count;
  };

  /**
   * @constructor
   */
  function TakeIterator(sequence, count) {
    this.iterator = sequence.getIterator();
    this.count    = count;
  }

  TakeIterator.prototype.current = function current() {
    return this.iterator.current();
  };

  TakeIterator.prototype.moveNext = function moveNext() {
    return ((--this.count >= 0) && this.iterator.moveNext());
  };

  /**
   * Creates a new sequence comprising the elements from the head of this sequence
   * that satisfy some predicate. Once an element is encountered that doesn't
   * satisfy the predicate, iteration will stop.
   *
   * @public
   * @param {Function} predicate
   * @returns {Sequence} The new sequence
   *
   * @examples
   * function lessThan(x) {
   *   return function(y) {
   *     return y < x;
   *   };
   * }
   *
   * Lazy([1, 2, 3, 4]).takeWhile(lessThan(3)) // sequence: [1, 2]
   * Lazy([1, 2, 3, 4]).takeWhile(lessThan(0)) // sequence: []
   */
  Sequence.prototype.takeWhile = function takeWhile(predicate) {
    return new TakeWhileSequence(this, predicate);
  };

  /**
   * @constructor
   */
  function TakeWhileSequence(parent, predicate) {
    this.parent    = parent;
    this.predicate = predicate;
  }

  TakeWhileSequence.prototype = new Sequence();

  TakeWhileSequence.prototype.each = function each(fn) {
    var predicate = this.predicate,
        finished = false,
        j = 0;

    var result = this.parent.each(function(e, i) {
      if (!predicate(e, i)) {
        finished = true;
        return false;
      }

      return fn(e, j++);
    });

    if (result instanceof AsyncHandle) {
      return result;
    }

    return finished;
  };

  /**
   * Creates a new sequence comprising all but the last N elements of this
   * sequence.
   *
   * @public
   * @param {number=} count The number of items to omit from the end of the
   *     sequence (defaults to 1).
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy([1, 2, 3, 4]).initial()                    // sequence: [1, 2, 3]
   * Lazy([1, 2, 3, 4]).initial(2)                   // sequence: [1, 2]
   * Lazy([1, 2, 3]).filter(Lazy.identity).initial() // sequence: [1, 2]
   */
  Sequence.prototype.initial = function initial(count) {
    return new InitialSequence(this, count);
  };

  function InitialSequence(parent, count) {
    this.parent = parent;
    this.count = typeof count === "number" ? count : 1;
  }

  InitialSequence.prototype = new Sequence();

  InitialSequence.prototype.each = function each(fn) {
    var index = this.parent.getIndex();
    return index.take(index.length() - this.count).each(fn);
  };

  /**
   * Creates a new sequence comprising the last N elements of this sequence, OR
   * (if N is `undefined`) simply returns the last element of this sequence.
   *
   * @public
   * @param {number=} count The number of items to take from the end of the
   *     sequence.
   * @returns {*} The new sequence (or the last element from this sequence
   *     if no count was given).
   *
   * @examples
   * Lazy([1, 2, 3]).last()                 // => 3
   * Lazy([1, 2, 3]).last(2)                // sequence: [2, 3]
   * Lazy([1, 2, 3]).filter(isEven).last(2) // sequence: [2]
   */
  Sequence.prototype.last = function last(count) {
    if (typeof count === "undefined") {
      return this.reverse().first();
    }
    return this.reverse().take(count).reverse();
  };

  /**
   * Returns the first element in this sequence with property names and values
   * matching those of the specified object.
   *
   * @public
   * @param {Object} properties The properties that should be found on some
   *     element in this sequence.
   * @returns {*} The found element, or `undefined` if none exists in this
   *     sequence.
   *
   * @examples
   * var words = ["foo", "bar"];
   *
   * Lazy(words).findWhere({ 0: "f" }); // => "foo"
   * Lazy(words).findWhere({ 0: "z" }); // => undefined
   */
  Sequence.prototype.findWhere = function findWhere(properties) {
    return this.where(properties).first();
  };

  /**
   * Creates a new sequence comprising all but the first N elements of this
   * sequence.
   *
   * @public
   * @aka skip, tail, rest
   * @param {number=} count The number of items to omit from the beginning of the
   *     sequence (defaults to 1).
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy([1, 2, 3, 4]).rest()  // sequence: [2, 3, 4]
   * Lazy([1, 2, 3, 4]).rest(0) // sequence: [1, 2, 3, 4]
   * Lazy([1, 2, 3, 4]).rest(2) // sequence: [3, 4]
   * Lazy([1, 2, 3, 4]).rest(5) // sequence: []
   */
  Sequence.prototype.rest = function rest(count) {
    return new DropSequence(this, count);
  };

  Sequence.prototype.skip =
  Sequence.prototype.tail =
  Sequence.prototype.drop = function drop(count) {
    return this.rest(count);
  };

  /**
   * @constructor
   */
  function DropSequence(parent, count) {
    this.parent = parent;
    this.count  = typeof count === "number" ? count : 1;
  }

  DropSequence.prototype = new Sequence();

  DropSequence.prototype.each = function each(fn) {
    var count   = this.count,
        dropped = 0,
        i       = 0;

    return this.parent.each(function(e) {
      if (dropped++ < count) { return; }
      return fn(e, i++);
    });
  };

  /**
   * Creates a new sequence comprising the elements from this sequence *after*
   * those that satisfy some predicate. The sequence starts with the first
   * element that does not match the predicate.
   *
   * @public
   * @aka skipWhile
   * @param {Function} predicate
   * @returns {Sequence} The new sequence
   */
  Sequence.prototype.dropWhile = function dropWhile(predicate) {
    return new DropWhileSequence(this, predicate);
  };

  Sequence.prototype.skipWhile = function skipWhile(predicate) {
    return this.dropWhile(predicate);
  };

  /**
   * @constructor
   */
  function DropWhileSequence(parent, predicate) {
    this.parent    = parent;
    this.predicate = predicate;
  }

  DropWhileSequence.prototype = new Sequence();

  DropWhileSequence.prototype.each = function each(fn) {
    var predicate = this.predicate,
        done      = false;

    return this.parent.each(function(e) {
      if (!done) {
        if (predicate(e)) {
          return;
        }

        done = true;
      }

      return fn(e);
    });
  };

  /**
   * Creates a new sequence with the same elements as this one, but ordered
   * using the specified comparison function.
   *
   * This has essentially the same behavior as calling
   * [`Array#sort`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort),
   * but obviously instead of modifying the collection it returns a new
   * {@link Sequence} object.
   *
   * @public
   * @param {Function=} sortFn The function used to compare elements in the
   *     sequence. The function will be passed two elements and should return:
   *     - 1 if the first is greater
   *     - -1 if the second is greater
   *     - 0 if the two values are the same
   * @param {boolean} descending Whether or not the resulting sequence should be
   *     in descending order (defaults to `false`).
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy([5, 10, 1]).sort()                // sequence: [1, 5, 10]
   * Lazy(['foo', 'bar']).sort()            // sequence: ['bar', 'foo']
   * Lazy(['b', 'c', 'a']).sort(null, true) // sequence: ['c', 'b', 'a']
   * Lazy([5, 10, 1]).sort(null, true)      // sequence: [10, 5, 1]
   *
   * // Sorting w/ custom comparison function
   * Lazy(['a', 'ab', 'aa', 'ba', 'b', 'abc']).sort(function compare(x, y) {
   *   if (x.length && (x.length !== y.length)) { return compare(x.length, y.length); }
   *   if (x === y) { return 0; }
   *   return x > y ? 1 : -1;
   * });
   * // => sequence: ['a', 'b', 'aa', 'ab', 'ba', 'abc']
   */
  Sequence.prototype.sort = function sort(sortFn, descending) {
    sortFn || (sortFn = compare);
    if (descending) { sortFn = reverseArguments(sortFn); }
    return new SortedSequence(this, sortFn);
  };

  /**
   * Creates a new sequence with the same elements as this one, but ordered by
   * the results of the given function.
   *
   * You can pass:
   *
   * - a *string*, to sort by the named property
   * - a function, to sort by the result of calling the function on each element
   *
   * @public
   * @param {Function} sortFn The function to call on the elements in this
   *     sequence, in order to sort them.
   * @param {boolean} descending Whether or not the resulting sequence should be
   *     in descending order (defaults to `false`).
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * function population(country) {
   *   return country.pop;
   * }
   *
   * function area(country) {
   *   return country.sqkm;
   * }
   *
   * var countries = [
   *   { name: "USA", pop: 320000000, sqkm: 9600000 },
   *   { name: "Brazil", pop: 194000000, sqkm: 8500000 },
   *   { name: "Nigeria", pop: 174000000, sqkm: 924000 },
   *   { name: "China", pop: 1350000000, sqkm: 9700000 },
   *   { name: "Russia", pop: 143000000, sqkm: 17000000 },
   *   { name: "Australia", pop: 23000000, sqkm: 7700000 }
   * ];
   *
   * Lazy(countries).sortBy(population).last(3).pluck('name') // sequence: ["Brazil", "USA", "China"]
   * Lazy(countries).sortBy(area).last(3).pluck('name')       // sequence: ["USA", "China", "Russia"]
   * Lazy(countries).sortBy(area, true).first(3).pluck('name') // sequence: ["Russia", "China", "USA"]
   *
   * @benchmarks
   * var randoms = Lazy.generate(Math.random).take(100).toArray();
   *
   * Lazy(randoms).sortBy(Lazy.identity).each(Lazy.noop) // lazy
   * _.each(_.sortBy(randoms, Lazy.identity), _.noop)    // lodash
   */
  Sequence.prototype.sortBy = function sortBy(sortFn, descending) {
    sortFn = createComparator(sortFn);
    if (descending) { sortFn = reverseArguments(sortFn); }
    return new SortedSequence(this, sortFn);
  };

  /**
   * @constructor
   */
  function SortedSequence(parent, sortFn) {
    this.parent = parent;
    this.sortFn = sortFn;
  }

  SortedSequence.prototype = new Sequence();

  SortedSequence.prototype.each = function each(fn) {
    var sortFn = this.sortFn,
        result = this.parent.toArray();

    result.sort(sortFn);

    return forEach(result, fn);
  };

  /**
   * @examples
   * var items = [{ a: 4 }, { a: 3 }, { a: 5 }];
   *
   * Lazy(items).sortBy('a').reverse();
   * // => sequence: [{ a: 5 }, { a: 4 }, { a: 3 }]
   *
   * Lazy(items).sortBy('a').reverse().reverse();
   * // => sequence: [{ a: 3 }, { a: 4 }, { a: 5 }]
   */
  SortedSequence.prototype.reverse = function reverse() {
    return new SortedSequence(this.parent, reverseArguments(this.sortFn));
  };

  /**
   * Creates a new {@link ObjectLikeSequence} comprising the elements in this
   * one, grouped together according to some key. The value associated with each
   * key in the resulting object-like sequence is an array containing all of
   * the elements in this sequence with that key.
   *
   * @public
   * @param {Function|string} keyFn The function to call on the elements in this
   *     sequence to obtain a key by which to group them, or a string representing
   *     a parameter to read from all the elements in this sequence.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * function oddOrEven(x) {
   *   return x % 2 === 0 ? 'even' : 'odd';
   * }
   *
   * var numbers = [1, 2, 3, 4, 5];
   *
   * Lazy(numbers).groupBy(oddOrEven)            // sequence: { odd: [1, 3, 5], even: [2, 4] }
   * Lazy(numbers).groupBy(oddOrEven).get("odd") // => [1, 3, 5]
   * Lazy(numbers).groupBy(oddOrEven).get("foo") // => undefined
   *
   * Lazy([
   *   { name: 'toString' },
   *   { name: 'toString' }
   * ]).groupBy('name');
   * // => sequence: {
   *   'toString': [
   *     { name: 'toString' },
   *     { name: 'toString' }
   *   ]
   * }
   */
  Sequence.prototype.groupBy = function groupBy(keyFn) {
    return new GroupedSequence(this, keyFn);
  };

  /**
   * @constructor
   */
  function GroupedSequence(parent, keyFn) {
    this.parent = parent;
    this.keyFn  = keyFn;
  }

  // GroupedSequence must have its prototype set after ObjectLikeSequence has
  // been fully initialized.

  /**
   * Creates a new {@link ObjectLikeSequence} comprising the elements in this
   * one, indexed according to some key.
   *
   * @public
   * @param {Function|string} keyFn The function to call on the elements in this
   *     sequence to obtain a key by which to index them, or a string
   *     representing a property to read from all the elements in this sequence.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * var people = [
   *   { name: 'Bob', age: 25 },
   *   { name: 'Fred', age: 34 }
   * ];
   *
   * var bob  = people[0],
   *     fred = people[1];
   *
   * Lazy(people).indexBy('name') // sequence: { 'Bob': bob, 'Fred': fred }
   */
  Sequence.prototype.indexBy = function(keyFn) {
    return new IndexedSequence(this, keyFn);
  };

  /**
   * @constructor
   */
  function IndexedSequence(parent, keyFn) {
    this.parent = parent;
    this.keyFn  = keyFn;
  }

  // IndexedSequence must have its prototype set after ObjectLikeSequence has
  // been fully initialized.

  /**
   * Creates a new {@link ObjectLikeSequence} containing the unique keys of all
   * the elements in this sequence, each paired with the number of elements
   * in this sequence having that key.
   *
   * @public
   * @param {Function|string} keyFn The function to call on the elements in this
   *     sequence to obtain a key by which to count them, or a string representing
   *     a parameter to read from all the elements in this sequence.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * function oddOrEven(x) {
   *   return x % 2 === 0 ? 'even' : 'odd';
   * }
   *
   * var numbers = [1, 2, 3, 4, 5];
   *
   * Lazy(numbers).countBy(oddOrEven)            // sequence: { odd: 3, even: 2 }
   * Lazy(numbers).countBy(oddOrEven).get("odd") // => 3
   * Lazy(numbers).countBy(oddOrEven).get("foo") // => undefined
   */
  Sequence.prototype.countBy = function countBy(keyFn) {
    return new CountedSequence(this, keyFn);
  };

  /**
   * @constructor
   */
  function CountedSequence(parent, keyFn) {
    this.parent = parent;
    this.keyFn  = keyFn;
  }

  // CountedSequence, like GroupedSequence, must have its prototype set after
  // ObjectLikeSequence has been fully initialized.

  /**
   * Creates a new sequence with every unique element from this one appearing
   * exactly once (i.e., with duplicates removed).
   *
   * @public
   * @aka unique
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy([1, 2, 2, 3, 3, 3]).uniq() // sequence: [1, 2, 3]
   *
   * @benchmarks
   * function randomOf(array) {
   *   return function() {
   *     return array[Math.floor(Math.random() * array.length)];
   *   };
   * }
   *
   * var mostUnique = Lazy.generate(randomOf(_.range(100)), 100).toArray(),
   *     someUnique = Lazy.generate(randomOf(_.range(50)), 100).toArray(),
   *     mostDupes  = Lazy.generate(randomOf(_.range(5)), 100).toArray();
   *
   * Lazy(mostUnique).uniq().each(Lazy.noop) // lazy - mostly unique elements
   * Lazy(someUnique).uniq().each(Lazy.noop) // lazy - some unique elements
   * Lazy(mostDupes).uniq().each(Lazy.noop)  // lazy - mostly duplicate elements
   * _.each(_.uniq(mostUnique), _.noop)      // lodash - mostly unique elements
   * _.each(_.uniq(someUnique), _.noop)      // lodash - some unique elements
   * _.each(_.uniq(mostDupes), _.noop)       // lodash - mostly duplicate elements
   */
  Sequence.prototype.uniq = function uniq(keyFn) {
    return new UniqueSequence(this, keyFn);
  };

  Sequence.prototype.unique = function unique(keyFn) {
    return this.uniq(keyFn);
  };

  /**
   * @constructor
   */
  function UniqueSequence(parent, keyFn) {
    this.parent = parent;
    this.keyFn  = keyFn;
  }

  UniqueSequence.prototype = new Sequence();

  UniqueSequence.prototype.each = function each(fn) {
    var cache = new Set(),
        keyFn = this.keyFn,
        i     = 0;

    if (keyFn) {
      keyFn = createCallback(keyFn);
      return this.parent.each(function(e) {
        if (cache.add(keyFn(e))) {
          return fn(e, i++);
        }
      });

    } else {
      return this.parent.each(function(e) {
        if (cache.add(e)) {
          return fn(e, i++);
        }
      });
    }
  };

  /**
   * Creates a new sequence by combining the elements from this sequence with
   * corresponding elements from the specified array(s).
   *
   * @public
   * @param {...Array} var_args One or more arrays of elements to combine with
   *     those of this sequence.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy([1, 2]).zip([3, 4]) // sequence: [[1, 3], [2, 4]]
   *
   * @benchmarks
   * var smArrL = Lazy.range(10).toArray(),
   *     smArrR = Lazy.range(10, 20).toArray(),
   *     lgArrL = Lazy.range(100).toArray(),
   *     lgArrR = Lazy.range(100, 200).toArray();
   *
   * Lazy(smArrL).zip(smArrR).each(Lazy.noop) // lazy - zipping 10-element arrays
   * Lazy(lgArrL).zip(lgArrR).each(Lazy.noop) // lazy - zipping 100-element arrays
   * _.each(_.zip(smArrL, smArrR), _.noop)    // lodash - zipping 10-element arrays
   * _.each(_.zip(lgArrL, lgArrR), _.noop)    // lodash - zipping 100-element arrays
   */
  Sequence.prototype.zip = function zip(var_args) {
    if (arguments.length === 1) {
      return new SimpleZippedSequence(this, (/** @type {Array} */ var_args));
    } else {
      return new ZippedSequence(this, arraySlice.call(arguments, 0));
    }
  };

  /**
   * @constructor
   */
  function ZippedSequence(parent, arrays) {
    this.parent = parent;
    this.arrays = arrays;
  }

  ZippedSequence.prototype = new Sequence();

  ZippedSequence.prototype.each = function each(fn) {
    var arrays = this.arrays,
        i = 0;
    this.parent.each(function(e) {
      var group = [e];
      for (var j = 0; j < arrays.length; ++j) {
        if (arrays[j].length > i) {
          group.push(arrays[j][i]);
        }
      }
      return fn(group, i++);
    });
  };

  /**
   * Creates a new sequence with the same elements as this one, in a randomized
   * order.
   *
   * @public
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy([1, 2, 3, 4, 5]).shuffle().value() // =~ [1, 2, 3, 4, 5]
   */
  Sequence.prototype.shuffle = function shuffle() {
    return new ShuffledSequence(this);
  };

  /**
   * @constructor
   */
  function ShuffledSequence(parent) {
    this.parent = parent;
  }

  ShuffledSequence.prototype = new Sequence();

  ShuffledSequence.prototype.each = function each(fn) {
    var shuffled = this.parent.toArray(),
        floor = Math.floor,
        random = Math.random,
        j = 0;

    for (var i = shuffled.length - 1; i > 0; --i) {
      swap(shuffled, i, floor(random() * i));
      if (fn(shuffled[i], j++) === false) {
        return;
      }
    }
    fn(shuffled[0], j);
  };

  /**
   * Creates a new sequence with every element from this sequence, and with arrays
   * exploded so that a sequence of arrays (of arrays) becomes a flat sequence of
   * values.
   *
   * @public
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy([1, [2, 3], [4, [5]]]).flatten() // sequence: [1, 2, 3, 4, 5]
   * Lazy([1, Lazy([2, 3])]).flatten()     // sequence: [1, 2, 3]
   */
  Sequence.prototype.flatten = function flatten() {
    return new FlattenedSequence(this);
  };

  /**
   * @constructor
   */
  function FlattenedSequence(parent) {
    this.parent = parent;
  }

  FlattenedSequence.prototype = new Sequence();

  FlattenedSequence.prototype.each = function each(fn) {
    var index = 0;

    return this.parent.each(function recurseVisitor(e) {
      if (e instanceof Array) {
        return forEach(e, recurseVisitor);
      }

      if (e instanceof Sequence) {
        return e.each(recurseVisitor);
      }

      return fn(e, index++);
    });
  };

  /**
   * Creates a new sequence with the same elements as this one, except for all
   * falsy values (`false`, `0`, `""`, `null`, and `undefined`).
   *
   * @public
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy(["foo", null, "bar", undefined]).compact() // sequence: ["foo", "bar"]
   */
  Sequence.prototype.compact = function compact() {
    return this.filter(function(e) { return !!e; });
  };

  /**
   * Creates a new sequence with all the elements of this sequence that are not
   * also among the specified arguments.
   *
   * @public
   * @aka difference
   * @param {...*} var_args The values, or array(s) of values, to be excluded from the
   *     resulting sequence.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy([1, 2, 3, 4, 5]).without(2, 3)   // sequence: [1, 4, 5]
   * Lazy([1, 2, 3, 4, 5]).without([4, 5]) // sequence: [1, 2, 3]
   */
  Sequence.prototype.without = function without(var_args) {
    return new WithoutSequence(this, arraySlice.call(arguments, 0));
  };

  Sequence.prototype.difference = function difference(var_args) {
    return this.without.apply(this, arguments);
  };

  /**
   * @constructor
   */
  function WithoutSequence(parent, values) {
    this.parent = parent;
    this.values = values;
  }

  WithoutSequence.prototype = new Sequence();

  WithoutSequence.prototype.each = function each(fn) {
    var set = createSet(this.values),
        i = 0;
    return this.parent.each(function(e) {
      if (!set.contains(e)) {
        return fn(e, i++);
      }
    });
  };

  /**
   * Creates a new sequence with all the unique elements either in this sequence
   * or among the specified arguments.
   *
   * @public
   * @param {...*} var_args The values, or array(s) of values, to be additionally
   *     included in the resulting sequence.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy(["foo", "bar"]).union([])             // sequence: ["foo", "bar"]
   * Lazy(["foo", "bar"]).union(["bar", "baz"]) // sequence: ["foo", "bar", "baz"]
   */
  Sequence.prototype.union = function union(var_args) {
    return this.concat(var_args).uniq();
  };

  /**
   * Creates a new sequence with all the elements of this sequence that also
   * appear among the specified arguments.
   *
   * @public
   * @param {...*} var_args The values, or array(s) of values, in which elements
   *     from this sequence must also be included to end up in the resulting sequence.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy(["foo", "bar"]).intersection([])             // sequence: []
   * Lazy(["foo", "bar"]).intersection(["bar", "baz"]) // sequence: ["bar"]
   */
  Sequence.prototype.intersection = function intersection(var_args) {
    if (arguments.length === 1 && arguments[0] instanceof Array) {
      return new SimpleIntersectionSequence(this, (/** @type {Array} */ var_args));
    } else {
      return new IntersectionSequence(this, arraySlice.call(arguments, 0));
    }
  };

  /**
   * @constructor
   */
  function IntersectionSequence(parent, arrays) {
    this.parent = parent;
    this.arrays = arrays;
  }

  IntersectionSequence.prototype = new Sequence();

  IntersectionSequence.prototype.each = function each(fn) {
    var sets = Lazy(this.arrays).map(function(values) {
      return new UniqueMemoizer(Lazy(values).getIterator());
    });

    var setIterator = new UniqueMemoizer(sets.getIterator()),
        i = 0;

    return this.parent.each(function(e) {
      var includedInAll = true;
      setIterator.each(function(set) {
        if (!set.contains(e)) {
          includedInAll = false;
          return false;
        }
      });

      if (includedInAll) {
        return fn(e, i++);
      }
    });
  };

  /**
   * @constructor
   */
  function UniqueMemoizer(iterator) {
    this.iterator     = iterator;
    this.set          = new Set();
    this.memo         = [];
    this.currentValue = undefined;
  }

  UniqueMemoizer.prototype.current = function current() {
    return this.currentValue;
  };

  UniqueMemoizer.prototype.moveNext = function moveNext() {
    var iterator = this.iterator,
        set = this.set,
        memo = this.memo,
        current;

    while (iterator.moveNext()) {
      current = iterator.current();
      if (set.add(current)) {
        memo.push(current);
        this.currentValue = current;
        return true;
      }
    }
    return false;
  };

  UniqueMemoizer.prototype.each = function each(fn) {
    var memo = this.memo,
        length = memo.length,
        i = -1;

    while (++i < length) {
      if (fn(memo[i], i) === false) {
        return false;
      }
    }

    while (this.moveNext()) {
      if (fn(this.currentValue, i++) === false) {
        break;
      }
    }
  };

  UniqueMemoizer.prototype.contains = function contains(e) {
    if (this.set.contains(e)) {
      return true;
    }

    while (this.moveNext()) {
      if (this.currentValue === e) {
        return true;
      }
    }

    return false;
  };

  /**
   * Checks whether every element in this sequence satisfies a given predicate.
   *
   * @public
   * @aka all
   * @param {Function} predicate A function to call on (potentially) every element
   *     in this sequence.
   * @returns {boolean} True if `predicate` returns true for every element in the
   *     sequence (or the sequence is empty). False if `predicate` returns false
   *     for at least one element.
   *
   * @examples
   * var numbers = [1, 2, 3, 4, 5];
   *
   * var objects = [{ foo: true }, { foo: false, bar: true }];
   *
   * Lazy(numbers).every(isEven)     // => false
   * Lazy(numbers).every(isPositive) // => true
   * Lazy(objects).all('foo')        // => false
   * Lazy(objects).all('bar')        // => false
   */
  Sequence.prototype.every = function every(predicate) {
    predicate = createCallback(predicate);

    return this.each(function(e, i) {
      return !!predicate(e, i);
    });
  };

  Sequence.prototype.all = function all(predicate) {
    return this.every(predicate);
  };

  /**
   * Checks whether at least one element in this sequence satisfies a given
   * predicate (or, if no predicate is specified, whether the sequence contains at
   * least one element).
   *
   * @public
   * @aka any
   * @param {Function=} predicate A function to call on (potentially) every element
   *     in this sequence.
   * @returns {boolean} True if `predicate` returns true for at least one element
   *     in the sequence. False if `predicate` returns false for every element (or
   *     the sequence is empty).
   *
   * @examples
   * var numbers = [1, 2, 3, 4, 5];
   *
   * Lazy(numbers).some()           // => true
   * Lazy(numbers).some(isEven)     // => true
   * Lazy(numbers).some(isNegative) // => false
   * Lazy([]).some()                // => false
   */
  Sequence.prototype.some = function some(predicate) {
    predicate = createCallback(predicate, true);

    var success = false;
    this.each(function(e) {
      if (predicate(e)) {
        success = true;
        return false;
      }
    });
    return success;
  };

  Sequence.prototype.any = function any(predicate) {
    return this.some(predicate);
  };

  /**
   * Checks whether NO elements in this sequence satisfy the given predicate
   * (the opposite of {@link Sequence#all}, basically).
   *
   * @public
   * @param {Function=} predicate A function to call on (potentially) every element
   *     in this sequence.
   * @returns {boolean} True if `predicate` does not return true for any element
   *     in the sequence. False if `predicate` returns true for at least one
   *     element.
   *
   * @examples
   * var numbers = [1, 2, 3, 4, 5];
   *
   * Lazy(numbers).none()           // => false
   * Lazy(numbers).none(isEven)     // => false
   * Lazy(numbers).none(isNegative) // => true
   * Lazy([]).none(isEven)          // => true
   * Lazy([]).none(isNegative)      // => true
   * Lazy([]).none()                // => true
   */
  Sequence.prototype.none = function none(predicate) {
    return !this.any(predicate);
  };

  /**
   * Checks whether the sequence has no elements.
   *
   * @public
   * @returns {boolean} True if the sequence is empty, false if it contains at
   *     least one element.
   *
   * @examples
   * Lazy([]).isEmpty()        // => true
   * Lazy([1, 2, 3]).isEmpty() // => false
   */
  Sequence.prototype.isEmpty = function isEmpty() {
    return !this.any();
  };

  /**
   * Performs (at worst) a linear search from the head of this sequence,
   * returning the first index at which the specified value is found.
   *
   * @public
   * @param {*} value The element to search for in the sequence.
   * @returns {number} The index within this sequence where the given value is
   *     located, or -1 if the sequence doesn't contain the value.
   *
   * @examples
   * function reciprocal(x) { return 1 / x; }
   *
   * Lazy(["foo", "bar", "baz"]).indexOf("bar")   // => 1
   * Lazy([1, 2, 3]).indexOf(4)                   // => -1
   * Lazy([1, 2, 3]).map(reciprocal).indexOf(0.5) // => 1
   */
  Sequence.prototype.indexOf = function indexOf(value) {
    var foundIndex = -1;
    this.each(function(e, i) {
      if (e === value) {
        foundIndex = i;
        return false;
      }
    });
    return foundIndex;
  };

  /**
   * Performs (at worst) a linear search from the tail of this sequence,
   * returning the last index at which the specified value is found.
   *
   * @public
   * @param {*} value The element to search for in the sequence.
   * @returns {number} The last index within this sequence where the given value
   *     is located, or -1 if the sequence doesn't contain the value.
   *
   * @examples
   * Lazy(["a", "b", "c", "b", "a"]).lastIndexOf("b")    // => 3
   * Lazy([1, 2, 3]).lastIndexOf(0)                      // => -1
   * Lazy([2, 2, 1, 2, 4]).filter(isEven).lastIndexOf(2) // 2
   */
  Sequence.prototype.lastIndexOf = function lastIndexOf(value) {
    var reversed = this.getIndex().reverse(),
        index    = reversed.indexOf(value);
    if (index !== -1) {
      index = reversed.length() - index - 1;
    }
    return index;
  };

  /**
   * Performs a binary search of this sequence, returning the lowest index where
   * the given value is either found, or where it belongs (if it is not already
   * in the sequence).
   *
   * This method assumes the sequence is in sorted order and will fail otherwise.
   *
   * @public
   * @param {*} value The element to search for in the sequence.
   * @returns {number} An index within this sequence where the given value is
   *     located, or where it belongs in sorted order.
   *
   * @examples
   * Lazy([1, 3, 6, 9]).sortedIndex(3)                    // => 1
   * Lazy([1, 3, 6, 9]).sortedIndex(7)                    // => 3
   * Lazy([5, 10, 15, 20]).filter(isEven).sortedIndex(10) // => 0
   * Lazy([5, 10, 15, 20]).filter(isEven).sortedIndex(12) // => 1
   */
  Sequence.prototype.sortedIndex = function sortedIndex(value) {
    var indexed = this.getIndex(),
        lower   = 0,
        upper   = indexed.length(),
        i;

    while (lower < upper) {
      i = (lower + upper) >>> 1;
      if (compare(indexed.get(i), value) === -1) {
        lower = i + 1;
      } else {
        upper = i;
      }
    }
    return lower;
  };

  /**
   * Checks whether the given value is in this sequence.
   *
   * @public
   * @param {*} value The element to search for in the sequence.
   * @returns {boolean} True if the sequence contains the value, false if not.
   *
   * @examples
   * var numbers = [5, 10, 15, 20];
   *
   * Lazy(numbers).contains(15) // => true
   * Lazy(numbers).contains(13) // => false
   */
  Sequence.prototype.contains = function contains(value) {
    return this.indexOf(value) !== -1;
  };

  /**
   * Aggregates a sequence into a single value according to some accumulator
   * function.
   *
   * For an asynchronous sequence, instead of immediately returning a result
   * (which it can't, obviously), this method returns an {@link AsyncHandle}
   * whose `onComplete` method can be called to supply a callback to handle the
   * final result once iteration has completed.
   *
   * @public
   * @aka inject, foldl
   * @param {Function} aggregator The function through which to pass every element
   *     in the sequence. For every element, the function will be passed the total
   *     aggregated result thus far and the element itself, and should return a
   *     new aggregated result.
   * @param {*=} memo The starting value to use for the aggregated result
   *     (defaults to the first element in the sequence).
   * @returns {*} The result of the aggregation, or, for asynchronous sequences,
   *     an {@link AsyncHandle} whose `onComplete` method accepts a callback to
   *     handle the final result.
   *
   * @examples
   * function multiply(x, y) { return x * y; }
   *
   * var numbers = [1, 2, 3, 4];
   *
   * Lazy(numbers).reduce(multiply)    // => 24
   * Lazy(numbers).reduce(multiply, 5) // => 120
   */
  Sequence.prototype.reduce = function reduce(aggregator, memo) {
    if (arguments.length < 2) {
      return this.tail().reduce(aggregator, this.head());
    }

    var eachResult = this.each(function(e, i) {
      memo = aggregator(memo, e, i);
    });

    // TODO: Think of a way more efficient solution to this problem.
    if (eachResult instanceof AsyncHandle) {
      return eachResult.then(function() { return memo; });
    }

    return memo;
  };

  Sequence.prototype.inject =
  Sequence.prototype.foldl = function foldl(aggregator, memo) {
    return this.reduce(aggregator, memo);
  };

  /**
   * Aggregates a sequence, from the tail, into a single value according to some
   * accumulator function.
   *
   * @public
   * @aka foldr
   * @param {Function} aggregator The function through which to pass every element
   *     in the sequence. For every element, the function will be passed the total
   *     aggregated result thus far and the element itself, and should return a
   *     new aggregated result.
   * @param {*} memo The starting value to use for the aggregated result.
   * @returns {*} The result of the aggregation.
   *
   * @examples
   * function append(s1, s2) {
   *   return s1 + s2;
   * }
   *
   * function isVowel(str) {
   *   return "aeiou".indexOf(str) !== -1;
   * }
   *
   * Lazy("abcde").reduceRight(append)                 // => "edcba"
   * Lazy("abcde").filter(isVowel).reduceRight(append) // => "ea"
   */
  Sequence.prototype.reduceRight = function reduceRight(aggregator, memo) {
    if (arguments.length < 2) {
      return this.initial(1).reduceRight(aggregator, this.last());
    }

    // This bothers me... but frankly, calling reverse().reduce() is potentially
    // going to eagerly evaluate the sequence anyway; so it's really not an issue.
    var indexed = this.getIndex(),
        i = indexed.length() - 1;
    return indexed.reverse().reduce(function(m, e) {
      return aggregator(m, e, i--);
    }, memo);
  };

  Sequence.prototype.foldr = function foldr(aggregator, memo) {
    return this.reduceRight(aggregator, memo);
  };

  /**
   * Groups this sequence into consecutive (overlapping) segments of a specified
   * length. If the underlying sequence has fewer elements than the specfied
   * length, then this sequence will be empty.
   *
   * @public
   * @param {number} length The length of each consecutive segment.
   * @returns {Sequence} The resulting sequence of consecutive segments.
   *
   * @examples
   * Lazy([]).consecutive(2)        // => sequence: []
   * Lazy([1]).consecutive(2)       // => sequence: []
   * Lazy([1, 2]).consecutive(2)    // => sequence: [[1, 2]]
   * Lazy([1, 2, 3]).consecutive(2) // => sequence: [[1, 2], [2, 3]]
   * Lazy([1, 2, 3]).consecutive(0) // => sequence: [[]]
   * Lazy([1, 2, 3]).consecutive(1) // => sequence: [[1], [2], [3]]
   */
  Sequence.prototype.consecutive = function consecutive(count) {
    var queue    = new Queue(count);
    var segments = this.map(function(element) {
      if (queue.add(element).count === count) {
        return queue.toArray();
      }
    });
    return segments.compact();
  };

  /**
   * Breaks this sequence into chunks (arrays) of a specified length.
   *
   * @public
   * @param {number} size The size of each chunk.
   * @returns {Sequence} The resulting sequence of chunks.
   *
   * @examples
   * Lazy([]).chunk(2)        // sequence: []
   * Lazy([1, 2, 3]).chunk(2) // sequence: [[1, 2], [3]]
   * Lazy([1, 2, 3]).chunk(1) // sequence: [[1], [2], [3]]
   * Lazy([1, 2, 3]).chunk(4) // sequence: [[1, 2, 3]]
   * Lazy([1, 2, 3]).chunk(0) // throws
   */
  Sequence.prototype.chunk = function chunk(size) {
    if (size < 1) {
      throw new Error("You must specify a positive chunk size.");
    }

    return new ChunkedSequence(this, size);
  };

  /**
   * @constructor
   */
  function ChunkedSequence(parent, size) {
    this.parent    = parent;
    this.chunkSize = size;
  }

  ChunkedSequence.prototype = new Sequence();

  ChunkedSequence.prototype.getIterator = function getIterator() {
    return new ChunkedIterator(this.parent, this.chunkSize);
  };

  /**
   * @constructor
   */
  function ChunkedIterator(sequence, size) {
    this.iterator = sequence.getIterator();
    this.size     = size;
  }

  ChunkedIterator.prototype.current = function current() {
    return this.currentChunk;
  };

  ChunkedIterator.prototype.moveNext = function moveNext() {
    var iterator  = this.iterator,
        chunkSize = this.size,
        chunk     = [];

    while (chunk.length < chunkSize && iterator.moveNext()) {
      chunk.push(iterator.current());
    }

    if (chunk.length === 0) {
      return false;
    }

    this.currentChunk = chunk;
    return true;
  };

  /**
   * Passes each element in the sequence to the specified callback during
   * iteration. This is like {@link Sequence#each}, except that it can be
   * inserted anywhere in the middle of a chain of methods to "intercept" the
   * values in the sequence at that point.
   *
   * @public
   * @param {Function} callback A function to call on every element in the
   *     sequence during iteration. The return value of this function does not
   *     matter.
   * @returns {Sequence} A sequence comprising the same elements as this one.
   *
   * @examples
   * Lazy([1, 2, 3]).tap(fn).each(Lazy.noop); // calls fn 3 times
   */
  Sequence.prototype.tap = function tap(callback) {
    return new TappedSequence(this, callback);
  };

  /**
   * @constructor
   */
  function TappedSequence(parent, callback) {
    this.parent = parent;
    this.callback = callback;
  }

  TappedSequence.prototype = new Sequence();

  TappedSequence.prototype.each = function each(fn) {
    var callback = this.callback;
    return this.parent.each(function(e, i) {
      callback(e, i);
      return fn(e, i);
    });
  };

  /**
   * Seaches for the first element in the sequence satisfying a given predicate.
   *
   * @public
   * @aka detect
   * @param {Function} predicate A function to call on (potentially) every element
   *     in the sequence.
   * @returns {*} The first element in the sequence for which `predicate` returns
   *     `true`, or `undefined` if no such element is found.
   *
   * @examples
   * function divisibleBy3(x) {
   *   return x % 3 === 0;
   * }
   *
   * var numbers = [5, 6, 7, 8, 9, 10];
   *
   * Lazy(numbers).find(divisibleBy3) // => 6
   * Lazy(numbers).find(isNegative)   // => undefined
   */
  Sequence.prototype.find = function find(predicate) {
    return this.filter(predicate).first();
  };

  Sequence.prototype.detect = function detect(predicate) {
    return this.find(predicate);
  };

  /**
   * Gets the minimum value in the sequence.
   *
   * @public
   * @param {Function=} valueFn The function by which the value for comparison is
   *     calculated for each element in the sequence.
   * @returns {*} The element with the lowest value in the sequence, or
   *     `Infinity` if the sequence is empty.
   *
   * @examples
   * function negate(x) { return x * -1; }
   *
   * Lazy([]).min()                       // => Infinity
   * Lazy([6, 18, 2, 49, 34]).min()       // => 2
   * Lazy([6, 18, 2, 49, 34]).min(negate) // => 49
   */
  Sequence.prototype.min = function min(valueFn) {
    if (typeof valueFn !== "undefined") {
      return this.minBy(valueFn);
    }

    return this.reduce(function(x, y) { return y < x ? y : x; }, Infinity);
  };

  Sequence.prototype.minBy = function minBy(valueFn) {
    valueFn = createCallback(valueFn);
    return this.reduce(function(x, y) { return valueFn(y) < valueFn(x) ? y : x; });
  };

  /**
   * Gets the maximum value in the sequence.
   *
   * @public
   * @param {Function=} valueFn The function by which the value for comparison is
   *     calculated for each element in the sequence.
   * @returns {*} The element with the highest value in the sequence, or
   *     `-Infinity` if the sequence is empty.
   *
   * @examples
   * function reverseDigits(x) {
   *   return Number(String(x).split('').reverse().join(''));
   * }
   *
   * Lazy([]).max()                              // => -Infinity
   * Lazy([6, 18, 2, 48, 29]).max()              // => 48
   * Lazy([6, 18, 2, 48, 29]).max(reverseDigits) // => 29
   */
  Sequence.prototype.max = function max(valueFn) {
    if (typeof valueFn !== "undefined") {
      return this.maxBy(valueFn);
    }

    return this.reduce(function(x, y) { return y > x ? y : x; }, -Infinity);
  };

  Sequence.prototype.maxBy = function maxBy(valueFn) {
    valueFn = createCallback(valueFn);
    return this.reduce(function(x, y) { return valueFn(y) > valueFn(x) ? y : x; });
  };

  /**
   * Gets the sum of the values in the sequence.
   *
   * @public
   * @param {Function=} valueFn The function used to select the values that will
   *     be summed up.
   * @returns {*} The sum.
   *
   * @examples
   * Lazy([]).sum()                     // => 0
   * Lazy([1, 2, 3, 4]).sum()           // => 10
   * Lazy([1.2, 3.4]).sum(Math.floor)   // => 4
   * Lazy(['foo', 'bar']).sum('length') // => 6
   */
  Sequence.prototype.sum = function sum(valueFn) {
    if (typeof valueFn !== "undefined") {
      return this.sumBy(valueFn);
    }

    return this.reduce(function(x, y) { return x + y; }, 0);
  };

  Sequence.prototype.sumBy = function sumBy(valueFn) {
    valueFn = createCallback(valueFn);
    return this.reduce(function(x, y) { return x + valueFn(y); }, 0);
  };

  /**
   * Creates a string from joining together all of the elements in this sequence,
   * separated by the given delimiter.
   *
   * @public
   * @aka toString
   * @param {string=} delimiter The separator to insert between every element from
   *     this sequence in the resulting string (defaults to `","`).
   * @returns {string} The delimited string.
   *
   * @examples
   * Lazy([6, 29, 1984]).join("/")  // => "6/29/1984"
   * Lazy(["a", "b", "c"]).join()   // => "a,b,c"
   * Lazy(["a", "b", "c"]).join("") // => "abc"
   * Lazy([1, 2, 3]).join()         // => "1,2,3"
   * Lazy([1, 2, 3]).join("")       // => "123"
   * Lazy(["", "", ""]).join(",")   // => ",,"
   */
  Sequence.prototype.join = function join(delimiter) {
    delimiter = typeof delimiter === "string" ? delimiter : ",";

    return this.reduce(function(str, e, i) {
      if (i > 0) {
        str += delimiter;
      }
      return str + e;
    }, "");
  };

  Sequence.prototype.toString = function toString(delimiter) {
    return this.join(delimiter);
  };

  /**
   * Creates a sequence, with the same elements as this one, that will be iterated
   * over asynchronously when calling `each`.
   *
   * @public
   * @param {number=} interval The approximate period, in milliseconds, that
   *     should elapse between each element in the resulting sequence. Omitting
   *     this argument will result in the fastest possible asynchronous iteration.
   * @returns {AsyncSequence} The new asynchronous sequence.
   *
   * @examples
   * Lazy([1, 2, 3]).async(100).each(fn) // calls fn 3 times asynchronously
   */
  Sequence.prototype.async = function async(interval) {
    return new AsyncSequence(this, interval);
  };

  /**
   * @constructor
   */
  function SimpleIntersectionSequence(parent, array) {
    this.parent = parent;
    this.array  = array;
    this.each   = getEachForIntersection(array);
  }

  SimpleIntersectionSequence.prototype = new Sequence();

  SimpleIntersectionSequence.prototype.eachMemoizerCache = function eachMemoizerCache(fn) {
    var iterator = new UniqueMemoizer(Lazy(this.array).getIterator()),
        i = 0;

    return this.parent.each(function(e) {
      if (iterator.contains(e)) {
        return fn(e, i++);
      }
    });
  };

  SimpleIntersectionSequence.prototype.eachArrayCache = function eachArrayCache(fn) {
    var array = this.array,
        find  = arrayContains,
        i = 0;

    return this.parent.each(function(e) {
      if (find(array, e)) {
        return fn(e, i++);
      }
    });
  };

  function getEachForIntersection(source) {
    if (source.length < 40) {
      return SimpleIntersectionSequence.prototype.eachArrayCache;
    } else {
      return SimpleIntersectionSequence.prototype.eachMemoizerCache;
    }
  }

  /**
   * An optimized version of {@link ZippedSequence}, when zipping a sequence with
   * only one array.
   *
   * @param {Sequence} parent The underlying sequence.
   * @param {Array} array The array with which to zip the sequence.
   * @constructor
   */
  function SimpleZippedSequence(parent, array) {
    this.parent = parent;
    this.array  = array;
  }

  SimpleZippedSequence.prototype = new Sequence();

  SimpleZippedSequence.prototype.each = function each(fn) {
    var array = this.array;
    return this.parent.each(function(e, i) {
      return fn([e, array[i]], i);
    });
  };

  /**
   * An `ArrayLikeSequence` is a {@link Sequence} that provides random access to
   * its elements. This extends the API for iterating with the additional methods
   * {@link #get} and {@link #length}, allowing a sequence to act as a "view" into
   * a collection or other indexed data source.
   *
   * The initial sequence created by wrapping an array with `Lazy(array)` is an
   * `ArrayLikeSequence`.
   *
   * All methods of `ArrayLikeSequence` that conceptually should return
   * something like a array (with indexed access) return another
   * `ArrayLikeSequence`, for example:
   *
   * - {@link Sequence#map}
   * - {@link ArrayLikeSequence#slice}
   * - {@link Sequence#take} and {@link Sequence#drop}
   * - {@link Sequence#reverse}
   *
   * The above is not an exhaustive list. There are also certain other cases
   * where it might be possible to return an `ArrayLikeSequence` (e.g., calling
   * {@link Sequence#concat} with a single array argument), but this is not
   * guaranteed by the API.
   *
   * Note that in many cases, it is not possible to provide indexed access
   * without first performing at least a partial iteration of the underlying
   * sequence. In these cases an `ArrayLikeSequence` will not be returned:
   *
   * - {@link Sequence#filter}
   * - {@link Sequence#uniq}
   * - {@link Sequence#union}
   * - {@link Sequence#intersect}
   *
   * etc. The above methods only return ordinary {@link Sequence} objects.
   *
   * Defining custom array-like sequences
   * ------------------------------------
   *
   * Creating a custom `ArrayLikeSequence` is essentially the same as creating a
   * custom {@link Sequence}. You just have a couple more methods you need to
   * implement: `get` and (optionally) `length`.
   *
   * Here's an example. Let's define a sequence type called `OffsetSequence` that
   * offsets each of its parent's elements by a set distance, and circles back to
   * the beginning after reaching the end. **Remember**: the initialization
   * function you pass to {@link #define} should always accept a `parent` as its
   * first parameter.
   *
   *     ArrayLikeSequence.define("offset", {
   *       init: function(parent, offset) {
   *         this.offset = offset;
   *       },
   *
   *       get: function(i) {
   *         return this.parent.get((i + this.offset) % this.parent.length());
   *       }
   *     });
   *
   * It's worth noting a couple of things here.
   *
   * First, Lazy's default implementation of `length` simply returns the parent's
   * length. In this case, since an `OffsetSequence` will always have the same
   * number of elements as its parent, that implementation is fine; so we don't
   * need to override it.
   *
   * Second, the default implementation of `each` uses `get` and `length` to
   * essentially create a `for` loop, which is fine here. If you want to implement
   * `each` your own way, you can do that; but in most cases (as here), you can
   * probably just stick with the default.
   *
   * So we're already done, after only implementing `get`! Pretty easy, huh?
   *
   * Now the `offset` method will be chainable from any `ArrayLikeSequence`. So
   * for example:
   *
   *     Lazy([1, 2, 3]).map(mapFn).offset(3);
   *
   * ...will work, but:
   *
   *     Lazy([1, 2, 3]).filter(mapFn).offset(3);
   *
   * ...will not (because `filter` does not return an `ArrayLikeSequence`).
   *
   * (Also, as with the example provided for defining custom {@link Sequence}
   * types, this example really could have been implemented using a function
   * already available as part of Lazy.js: in this case, {@link Sequence#map}.)
   *
   * @public
   * @constructor
   *
   * @examples
   * Lazy([1, 2, 3])                    // instanceof Lazy.ArrayLikeSequence
   * Lazy([1, 2, 3]).map(Lazy.identity) // instanceof Lazy.ArrayLikeSequence
   * Lazy([1, 2, 3]).take(2)            // instanceof Lazy.ArrayLikeSequence
   * Lazy([1, 2, 3]).drop(2)            // instanceof Lazy.ArrayLikeSequence
   * Lazy([1, 2, 3]).reverse()          // instanceof Lazy.ArrayLikeSequence
   * Lazy([1, 2, 3]).slice(1, 2)        // instanceof Lazy.ArrayLikeSequence
   */
  function ArrayLikeSequence() {}

  ArrayLikeSequence.prototype = new Sequence();

  /**
   * Create a new constructor function for a type inheriting from
   * `ArrayLikeSequence`.
   *
   * @public
   * @param {string|Array.<string>} methodName The name(s) of the method(s) to be
   *     used for constructing the new sequence. The method will be attached to
   *     the `ArrayLikeSequence` prototype so that it can be chained with any other
   *     methods that return array-like sequences.
   * @param {Object} overrides An object containing function overrides for this
   *     new sequence type. **Must** include `get`. *May* include `init`,
   *     `length`, `getIterator`, and `each`. For each function, `this` will be
   *     the new sequence and `this.parent` will be the source sequence.
   * @returns {Function} A constructor for a new type inheriting from
   *     `ArrayLikeSequence`.
   *
   * @examples
   * Lazy.ArrayLikeSequence.define("offset", {
   *   init: function(offset) {
   *     this.offset = offset;
   *   },
   *
   *   get: function(i) {
   *     return this.parent.get((i + this.offset) % this.parent.length());
   *   }
   * });
   *
   * Lazy([1, 2, 3]).offset(1) // sequence: [2, 3, 1]
   */
  ArrayLikeSequence.define = function define(methodName, overrides) {
    if (!overrides || typeof overrides.get !== 'function') {
      throw new Error("A custom array-like sequence must implement *at least* get!");
    }

    return defineSequenceType(ArrayLikeSequence, methodName, overrides);
  };

  /**
   * Returns the element at the specified index.
   *
   * @public
   * @param {number} i The index to access.
   * @returns {*} The element.
   *
   * @examples
   * function increment(x) { return x + 1; }
   *
   * Lazy([1, 2, 3]).get(1)                // => 2
   * Lazy([1, 2, 3]).get(-1)               // => undefined
   * Lazy([1, 2, 3]).map(increment).get(1) // => 3
   */
  ArrayLikeSequence.prototype.get = function get(i) {
    return this.parent.get(i);
  };

  /**
   * Returns the length of the sequence.
   *
   * @public
   * @returns {number} The length.
   *
   * @examples
   * function increment(x) { return x + 1; }
   *
   * Lazy([]).length()                       // => 0
   * Lazy([1, 2, 3]).length()                // => 3
   * Lazy([1, 2, 3]).map(increment).length() // => 3
   */
  ArrayLikeSequence.prototype.length = function length() {
    return this.parent.length();
  };

  /**
   * Returns the current sequence (since it is already indexed).
   */
  ArrayLikeSequence.prototype.getIndex = function getIndex() {
    return this;
  };

  /**
   * An optimized version of {@link Sequence#getIterator}.
   */
  ArrayLikeSequence.prototype.getIterator = function getIterator() {
    return new IndexedIterator(this);
  };

  /**
   * An optimized version of {@link Iterator} meant to work with already-indexed
   * sequences.
   *
   * @param {ArrayLikeSequence} sequence The sequence to iterate over.
   * @constructor
   */
  function IndexedIterator(sequence) {
    this.sequence = sequence;
    this.index    = -1;
  }

  IndexedIterator.prototype.current = function current() {
    return this.sequence.get(this.index);
  };

  IndexedIterator.prototype.moveNext = function moveNext() {
    if (this.index >= this.sequence.length() - 1) {
      return false;
    }

    ++this.index;
    return true;
  };

  /**
   * An optimized version of {@link Sequence#each}.
   */
  ArrayLikeSequence.prototype.each = function each(fn) {
    var length = this.length(),
        i = -1;

    while (++i < length) {
      if (fn(this.get(i), i) === false) {
        return false;
      }
    }

    return true;
  };

  /**
   * Returns a new sequence with the same elements as this one, minus the last
   * element.
   *
   * @public
   * @returns {ArrayLikeSequence} The new array-like sequence.
   *
   * @examples
   * Lazy([1, 2, 3]).pop() // sequence: [1, 2]
   * Lazy([]).pop()        // sequence: []
   */
  ArrayLikeSequence.prototype.pop = function pop() {
    return this.initial();
  };

  /**
   * Returns a new sequence with the same elements as this one, minus the first
   * element.
   *
   * @public
   * @returns {ArrayLikeSequence} The new array-like sequence.
   *
   * @examples
   * Lazy([1, 2, 3]).shift() // sequence: [2, 3]
   * Lazy([]).shift()        // sequence: []
   */
  ArrayLikeSequence.prototype.shift = function shift() {
    return this.drop();
  };

  /**
   * Returns a new sequence comprising the portion of this sequence starting
   * from the specified starting index and continuing until the specified ending
   * index or to the end of the sequence.
   *
   * @public
   * @param {number} begin The index at which the new sequence should start.
   * @param {number=} end The index at which the new sequence should end.
   * @returns {ArrayLikeSequence} The new array-like sequence.
   *
   * @examples
   * Lazy([1, 2, 3, 4, 5]).slice(0)     // sequence: [1, 2, 3, 4, 5]
   * Lazy([1, 2, 3, 4, 5]).slice(2)     // sequence: [3, 4, 5]
   * Lazy([1, 2, 3, 4, 5]).slice(2, 4)  // sequence: [3, 4]
   * Lazy([1, 2, 3, 4, 5]).slice(-1)    // sequence: [5]
   * Lazy([1, 2, 3, 4, 5]).slice(1, -1) // sequence: [2, 3, 4]
   * Lazy([1, 2, 3, 4, 5]).slice(0, 10) // sequence: [1, 2, 3, 4, 5]
   */
  ArrayLikeSequence.prototype.slice = function slice(begin, end) {
    var length = this.length();

    if (begin < 0) {
      begin = length + begin;
    }

    var result = this.drop(begin);

    if (typeof end === "number") {
      if (end < 0) {
        end = length + end;
      }
      result = result.take(end - begin);
    }

    return result;
  };

  /**
   * An optimized version of {@link Sequence#map}, which creates an
   * {@link ArrayLikeSequence} so that the result still provides random access.
   *
   * @public
   *
   * @examples
   * Lazy([1, 2, 3]).map(Lazy.identity) // instanceof Lazy.ArrayLikeSequence
   */
  ArrayLikeSequence.prototype.map = function map(mapFn) {
    return new IndexedMappedSequence(this, createCallback(mapFn));
  };

  /**
   * @constructor
   */
  function IndexedMappedSequence(parent, mapFn) {
    this.parent = parent;
    this.mapFn  = mapFn;
  }

  IndexedMappedSequence.prototype = new ArrayLikeSequence();

  IndexedMappedSequence.prototype.get = function get(i) {
    if (i < 0 || i >= this.parent.length()) {
      return undefined;
    }

    return this.mapFn(this.parent.get(i), i);
  };

  /**
   * An optimized version of {@link Sequence#filter}.
   */
  ArrayLikeSequence.prototype.filter = function filter(filterFn) {
    return new IndexedFilteredSequence(this, createCallback(filterFn));
  };

  /**
   * @constructor
   */
  function IndexedFilteredSequence(parent, filterFn) {
    this.parent   = parent;
    this.filterFn = filterFn;
  }

  IndexedFilteredSequence.prototype = new FilteredSequence();

  IndexedFilteredSequence.prototype.each = function each(fn) {
    var parent = this.parent,
        filterFn = this.filterFn,
        length = this.parent.length(),
        i = -1,
        j = 0,
        e;

    while (++i < length) {
      e = parent.get(i);
      if (filterFn(e, i) && fn(e, j++) === false) {
        return false;
      }
    }

    return true;
  };

  /**
   * An optimized version of {@link Sequence#reverse}, which creates an
   * {@link ArrayLikeSequence} so that the result still provides random access.
   *
   * @public
   *
   * @examples
   * Lazy([1, 2, 3]).reverse() // instanceof Lazy.ArrayLikeSequence
   */
  ArrayLikeSequence.prototype.reverse = function reverse() {
    return new IndexedReversedSequence(this);
  };

  /**
   * @constructor
   */
  function IndexedReversedSequence(parent) {
    this.parent = parent;
  }

  IndexedReversedSequence.prototype = new ArrayLikeSequence();

  IndexedReversedSequence.prototype.get = function get(i) {
    return this.parent.get(this.length() - i - 1);
  };

  /**
   * An optimized version of {@link Sequence#first}, which creates an
   * {@link ArrayLikeSequence} so that the result still provides random access.
   *
   * @public
   *
   * @examples
   * Lazy([1, 2, 3]).first(2) // instanceof Lazy.ArrayLikeSequence
   */
  ArrayLikeSequence.prototype.first = function first(count) {
    if (typeof count === "undefined") {
      return this.get(0);
    }

    return new IndexedTakeSequence(this, count);
  };

  /**
   * @constructor
   */
  function IndexedTakeSequence(parent, count) {
    this.parent = parent;
    this.count  = count;
  }

  IndexedTakeSequence.prototype = new ArrayLikeSequence();

  IndexedTakeSequence.prototype.length = function length() {
    var parentLength = this.parent.length();
    return this.count <= parentLength ? this.count : parentLength;
  };

  /**
   * An optimized version of {@link Sequence#rest}, which creates an
   * {@link ArrayLikeSequence} so that the result still provides random access.
   *
   * @public
   *
   * @examples
   * Lazy([1, 2, 3]).rest() // instanceof Lazy.ArrayLikeSequence
   */
  ArrayLikeSequence.prototype.rest = function rest(count) {
    return new IndexedDropSequence(this, count);
  };

  /**
   * @constructor
   */
  function IndexedDropSequence(parent, count) {
    this.parent = parent;
    this.count  = typeof count === "number" ? count : 1;
  }

  IndexedDropSequence.prototype = new ArrayLikeSequence();

  IndexedDropSequence.prototype.get = function get(i) {
    return this.parent.get(this.count + i);
  };

  IndexedDropSequence.prototype.length = function length() {
    var parentLength = this.parent.length();
    return this.count <= parentLength ? parentLength - this.count : 0;
  };

  /**
   * An optimized version of {@link Sequence#concat} that returns another
   * {@link ArrayLikeSequence} *if* the argument is an array.
   *
   * @public
   * @param {...*} var_args
   *
   * @examples
   * Lazy([1, 2]).concat([3, 4]) // instanceof Lazy.ArrayLikeSequence
   * Lazy([1, 2]).concat([3, 4]) // sequence: [1, 2, 3, 4]
   */
  ArrayLikeSequence.prototype.concat = function concat(var_args) {
    if (arguments.length === 1 && arguments[0] instanceof Array) {
      return new IndexedConcatenatedSequence(this, (/** @type {Array} */ var_args));
    } else {
      return Sequence.prototype.concat.apply(this, arguments);
    }
  };

  /**
   * @constructor
   */
  function IndexedConcatenatedSequence(parent, other) {
    this.parent = parent;
    this.other  = other;
  }

  IndexedConcatenatedSequence.prototype = new ArrayLikeSequence();

  IndexedConcatenatedSequence.prototype.get = function get(i) {
    var parentLength = this.parent.length();
    if (i < parentLength) {
      return this.parent.get(i);
    } else {
      return this.other[i - parentLength];
    }
  };

  IndexedConcatenatedSequence.prototype.length = function length() {
    return this.parent.length() + this.other.length;
  };

  /**
   * An optimized version of {@link Sequence#uniq}.
   */
  ArrayLikeSequence.prototype.uniq = function uniq(keyFn) {
    return new IndexedUniqueSequence(this, createCallback(keyFn));
  };

  /**
   * @param {ArrayLikeSequence} parent
   * @constructor
   */
  function IndexedUniqueSequence(parent, keyFn) {
    this.parent = parent;
    this.each   = getEachForParent(parent);
    this.keyFn  = keyFn;
  }

  IndexedUniqueSequence.prototype = new Sequence();

  IndexedUniqueSequence.prototype.eachArrayCache = function eachArrayCache(fn) {
    // Basically the same implementation as w/ the set, but using an array because
    // it's cheaper for smaller sequences.
    var parent = this.parent,
        keyFn  = this.keyFn,
        length = parent.length(),
        cache  = [],
        find   = arrayContains,
        key, value,
        i = -1,
        j = 0;

    while (++i < length) {
      value = parent.get(i);
      key = keyFn(value);
      if (!find(cache, key)) {
        cache.push(key);
        if (fn(value, j++) === false) {
          return false;
        }
      }
    }
  };

  IndexedUniqueSequence.prototype.eachSetCache = UniqueSequence.prototype.each;

  function getEachForParent(parent) {
    if (parent.length() < 100) {
      return IndexedUniqueSequence.prototype.eachArrayCache;
    } else {
      return UniqueSequence.prototype.each;
    }
  }

  // Now that we've fully initialized the ArrayLikeSequence prototype, we can
  // set the prototype for MemoizedSequence.

  MemoizedSequence.prototype = new ArrayLikeSequence();

  MemoizedSequence.prototype.cache = function cache() {
    return this.cachedResult || (this.cachedResult = this.parent.toArray());
  };

  MemoizedSequence.prototype.get = function get(i) {
    return this.cache()[i];
  };

  MemoizedSequence.prototype.length = function length() {
    return this.cache().length;
  };

  MemoizedSequence.prototype.slice = function slice(begin, end) {
    return this.cache().slice(begin, end);
  };

  MemoizedSequence.prototype.toArray = function toArray() {
    return this.cache().slice(0);
  };

  /**
   * ArrayWrapper is the most basic {@link Sequence}. It directly wraps an array
   * and implements the same methods as {@link ArrayLikeSequence}, but more
   * efficiently.
   *
   * @constructor
   */
  function ArrayWrapper(source) {
    this.source = source;
  }

  ArrayWrapper.prototype = new ArrayLikeSequence();

  ArrayWrapper.prototype.root = function root() {
    return this;
  };

  ArrayWrapper.prototype.isAsync = function isAsync() {
    return false;
  };

  /**
   * Returns the element at the specified index in the source array.
   *
   * @param {number} i The index to access.
   * @returns {*} The element.
   */
  ArrayWrapper.prototype.get = function get(i) {
    return this.source[i];
  };

  /**
   * Returns the length of the source array.
   *
   * @returns {number} The length.
   */
  ArrayWrapper.prototype.length = function length() {
    return this.source.length;
  };

  /**
   * An optimized version of {@link Sequence#each}.
   */
  ArrayWrapper.prototype.each = function each(fn) {
    return forEach(this.source, fn);
  };

  /**
   * An optimized version of {@link Sequence#map}.
   */
  ArrayWrapper.prototype.map = function map(mapFn) {
    return new MappedArrayWrapper(this, createCallback(mapFn));
  };

  /**
   * An optimized version of {@link Sequence#filter}.
   */
  ArrayWrapper.prototype.filter = function filter(filterFn) {
    return new FilteredArrayWrapper(this, createCallback(filterFn));
  };

  /**
   * An optimized version of {@link Sequence#uniq}.
   */
  ArrayWrapper.prototype.uniq = function uniq(keyFn) {
    return new UniqueArrayWrapper(this, keyFn);
  };

  /**
   * An optimized version of {@link ArrayLikeSequence#concat}.
   *
   * @param {...*} var_args
   */
  ArrayWrapper.prototype.concat = function concat(var_args) {
    if (arguments.length === 1 && arguments[0] instanceof Array) {
      return new ConcatArrayWrapper(this, (/** @type {Array} */ var_args));
    } else {
      return ArrayLikeSequence.prototype.concat.apply(this, arguments);
    }
  };

  /**
   * An optimized version of {@link Sequence#toArray}.
   */
  ArrayWrapper.prototype.toArray = function toArray() {
    return this.source.slice(0);
  };

  /**
   * @constructor
   */
  function MappedArrayWrapper(parent, mapFn) {
    this.parent = parent;
    this.mapFn  = mapFn;
  }

  MappedArrayWrapper.prototype = new ArrayLikeSequence();

  MappedArrayWrapper.prototype.get = function get(i) {
    var source = this.parent.source;

    if (i < 0 || i >= source.length) {
      return undefined;
    }

    return this.mapFn(source[i]);
  };

  MappedArrayWrapper.prototype.length = function length() {
    return this.parent.source.length;
  };

  MappedArrayWrapper.prototype.each = function each(fn) {
    var source = this.parent.source,
        length = source.length,
        mapFn  = this.mapFn,
        i = -1;

    while (++i < length) {
      if (fn(mapFn(source[i], i), i) === false) {
        return false;
      }
    }

    return true;
  };

  /**
   * @constructor
   */
  function FilteredArrayWrapper(parent, filterFn) {
    this.parent   = parent;
    this.filterFn = filterFn;
  }

  FilteredArrayWrapper.prototype = new FilteredSequence();

  FilteredArrayWrapper.prototype.each = function each(fn) {
    var source = this.parent.source,
        filterFn = this.filterFn,
        length = source.length,
        i = -1,
        j = 0,
        e;

    while (++i < length) {
      e = source[i];
      if (filterFn(e, i) && fn(e, j++) === false) {
        return false;
      }
    }

    return true;
  };

  /**
   * @constructor
   */
  function UniqueArrayWrapper(parent, keyFn) {
    this.parent = parent;
    this.each   = getEachForSource(parent.source);
    this.keyFn  = keyFn;
  }

  UniqueArrayWrapper.prototype = new Sequence();

  UniqueArrayWrapper.prototype.eachNoCache = function eachNoCache(fn) {
    var source = this.parent.source,
        keyFn  = this.keyFn,
        length = source.length,
        find   = arrayContainsBefore,
        value,

        // Yes, this is hideous.
        // Trying to get performance first, will refactor next!
        i = -1,
        k = 0;

    while (++i < length) {
      value = source[i];
      if (!find(source, value, i, keyFn) && fn(value, k++) === false) {
        return false;
      }
    }

    return true;
  };

  UniqueArrayWrapper.prototype.eachArrayCache = function eachArrayCache(fn) {
    // Basically the same implementation as w/ the set, but using an array because
    // it's cheaper for smaller sequences.
    var source = this.parent.source,
        keyFn  = this.keyFn,
        length = source.length,
        cache  = [],
        find   = arrayContains,
        key, value,
        i = -1,
        j = 0;

    if (keyFn) {
      keyFn = createCallback(keyFn);
      while (++i < length) {
        value = source[i];
        key = keyFn(value);
        if (!find(cache, key)) {
          cache.push(key);
          if (fn(value, j++) === false) {
            return false;
          }
        }
      }

    } else {
      while (++i < length) {
        value = source[i];
        if (!find(cache, value)) {
          cache.push(value);
          if (fn(value, j++) === false) {
            return false;
          }
        }
      }
    }

    return true;
  };

  UniqueArrayWrapper.prototype.eachSetCache = UniqueSequence.prototype.each;

  /**
   * My latest findings here...
   *
   * So I hadn't really given the set-based approach enough credit. The main issue
   * was that my Set implementation was totally not optimized at all. After pretty
   * heavily optimizing it (just take a look; it's a monstrosity now!), it now
   * becomes the fastest option for much smaller values of N.
   */
  function getEachForSource(source) {
    if (source.length < 40) {
      return UniqueArrayWrapper.prototype.eachNoCache;
    } else if (source.length < 100) {
      return UniqueArrayWrapper.prototype.eachArrayCache;
    } else {
      return UniqueArrayWrapper.prototype.eachSetCache;
    }
  }

  /**
   * @constructor
   */
  function ConcatArrayWrapper(parent, other) {
    this.parent = parent;
    this.other  = other;
  }

  ConcatArrayWrapper.prototype = new ArrayLikeSequence();

  ConcatArrayWrapper.prototype.get = function get(i) {
    var source = this.parent.source,
        sourceLength = source.length;

    if (i < sourceLength) {
      return source[i];
    } else {
      return this.other[i - sourceLength];
    }
  };

  ConcatArrayWrapper.prototype.length = function length() {
    return this.parent.source.length + this.other.length;
  };

  ConcatArrayWrapper.prototype.each = function each(fn) {
    var source = this.parent.source,
        sourceLength = source.length,
        other = this.other,
        otherLength = other.length,
        i = 0,
        j = -1;

    while (++j < sourceLength) {
      if (fn(source[j], i++) === false) {
        return false;
      }
    }

    j = -1;
    while (++j < otherLength) {
      if (fn(other[j], i++) === false) {
        return false;
      }
    }

    return true;
  };

  /**
   * An `ObjectLikeSequence` object represents a sequence of key/value pairs.
   *
   * The initial sequence you get by wrapping an object with `Lazy(object)` is
   * an `ObjectLikeSequence`.
   *
   * All methods of `ObjectLikeSequence` that conceptually should return
   * something like an object return another `ObjectLikeSequence`.
   *
   * @public
   * @constructor
   *
   * @examples
   * var obj = { foo: 'bar' };
   *
   * Lazy(obj).assign({ bar: 'baz' })   // instanceof Lazy.ObjectLikeSequence
   * Lazy(obj).defaults({ bar: 'baz' }) // instanceof Lazy.ObjectLikeSequence
   * Lazy(obj).invert()                 // instanceof Lazy.ObjectLikeSequence
   */
  function ObjectLikeSequence() {}

  ObjectLikeSequence.prototype = new Sequence();

  /**
   * Create a new constructor function for a type inheriting from
   * `ObjectLikeSequence`.
   *
   * @public
   * @param {string|Array.<string>} methodName The name(s) of the method(s) to be
   *     used for constructing the new sequence. The method will be attached to
   *     the `ObjectLikeSequence` prototype so that it can be chained with any other
   *     methods that return object-like sequences.
   * @param {Object} overrides An object containing function overrides for this
   *     new sequence type. **Must** include `each`. *May* include `init` and
   *     `get` (for looking up an element by key).
   * @returns {Function} A constructor for a new type inheriting from
   *     `ObjectLikeSequence`.
   *
   * @examples
   * function downcaseKey(value, key) {
   *   return [key.toLowerCase(), value];
   * }
   *
   * Lazy.ObjectLikeSequence.define("caseInsensitive", {
   *   init: function() {
   *     var downcased = this.parent
   *       .map(downcaseKey)
   *       .toObject();
   *     this.downcased = Lazy(downcased);
   *   },
   *
   *   get: function(key) {
   *     return this.downcased.get(key.toLowerCase());
   *   },
   *
   *   each: function(fn) {
   *     return this.downcased.each(fn);
   *   }
   * });
   *
   * Lazy({ Foo: 'bar' }).caseInsensitive()            // sequence: { foo: 'bar' }
   * Lazy({ FOO: 'bar' }).caseInsensitive().get('foo') // => 'bar'
   * Lazy({ FOO: 'bar' }).caseInsensitive().get('FOO') // => 'bar'
   */
  ObjectLikeSequence.define = function define(methodName, overrides) {
    if (!overrides || typeof overrides.each !== 'function') {
      throw new Error("A custom object-like sequence must implement *at least* each!");
    }

    return defineSequenceType(ObjectLikeSequence, methodName, overrides);
  };

  ObjectLikeSequence.prototype.value = function value() {
    return this.toObject();
  };

  /**
   * Gets the element at the specified key in this sequence.
   *
   * @public
   * @param {string} key The key.
   * @returns {*} The element.
   *
   * @examples
   * Lazy({ foo: "bar" }).get("foo")                          // => "bar"
   * Lazy({ foo: "bar" }).extend({ foo: "baz" }).get("foo")   // => "baz"
   * Lazy({ foo: "bar" }).defaults({ bar: "baz" }).get("bar") // => "baz"
   * Lazy({ foo: "bar" }).invert().get("bar")                 // => "foo"
   * Lazy({ foo: 1, bar: 2 }).pick(["foo"]).get("foo")        // => 1
   * Lazy({ foo: 1, bar: 2 }).pick(["foo"]).get("bar")        // => undefined
   * Lazy({ foo: 1, bar: 2 }).omit(["foo"]).get("bar")        // => 2
   * Lazy({ foo: 1, bar: 2 }).omit(["foo"]).get("foo")        // => undefined
   */
  ObjectLikeSequence.prototype.get = function get(key) {
    var pair = this.pairs().find(function(pair) {
      return pair[0] === key;
    });

    return pair ? pair[1] : undefined;
  };

  /**
   * Returns a {@link Sequence} whose elements are the keys of this object-like
   * sequence.
   *
   * @public
   * @returns {Sequence} The sequence based on this sequence's keys.
   *
   * @examples
   * Lazy({ hello: "hola", goodbye: "hasta luego" }).keys() // sequence: ["hello", "goodbye"]
   */
  ObjectLikeSequence.prototype.keys = function keys() {
    return this.map(function(v, k) { return k; });
  };

  /**
   * Returns a {@link Sequence} whose elements are the values of this object-like
   * sequence.
   *
   * @public
   * @returns {Sequence} The sequence based on this sequence's values.
   *
   * @examples
   * Lazy({ hello: "hola", goodbye: "hasta luego" }).values() // sequence: ["hola", "hasta luego"]
   */
  ObjectLikeSequence.prototype.values = function values() {
    return this.map(function(v, k) { return v; });
  };

  /**
   * Throws an exception. Asynchronous iteration over object-like sequences is
   * not supported.
   *
   * @public
   * @examples
   * Lazy({ foo: 'bar' }).async() // throws
   */
  ObjectLikeSequence.prototype.async = function async() {
    throw new Error('An ObjectLikeSequence does not support asynchronous iteration.');
  };

  ObjectLikeSequence.prototype.filter = function filter(filterFn) {
    return new FilteredObjectLikeSequence(this, createCallback(filterFn));
  };

  function FilteredObjectLikeSequence(parent, filterFn) {
    this.parent = parent;
    this.filterFn = filterFn;
  }

  FilteredObjectLikeSequence.prototype = new ObjectLikeSequence();

  FilteredObjectLikeSequence.prototype.each = function each(fn) {
    var filterFn = this.filterFn;

    return this.parent.each(function(v, k) {
      if (filterFn(v, k)) {
        return fn(v, k);
      }
    });
  };

  /**
   * Returns this same sequence. (Reversing an object-like sequence doesn't make
   * any sense.)
   */
  ObjectLikeSequence.prototype.reverse = function reverse() {
    return this;
  };

  /**
   * Returns an {@link ObjectLikeSequence} whose elements are the combination of
   * this sequence and another object. In the case of a key appearing in both this
   * sequence and the given object, the other object's value will override the
   * one in this sequence.
   *
   * @public
   * @aka extend
   * @param {Object} other The other object to assign to this sequence.
   * @returns {ObjectLikeSequence} A new sequence comprising elements from this
   *     sequence plus the contents of `other`.
   *
   * @examples
   * Lazy({ "uno": 1, "dos": 2 }).assign({ "tres": 3 }) // sequence: { uno: 1, dos: 2, tres: 3 }
   * Lazy({ foo: "bar" }).assign({ foo: "baz" });       // sequence: { foo: "baz" }
   */
  ObjectLikeSequence.prototype.assign = function assign(other) {
    return new AssignSequence(this, other);
  };

  ObjectLikeSequence.prototype.extend = function extend(other) {
    return this.assign(other);
  };

  /**
   * @constructor
   */
  function AssignSequence(parent, other) {
    this.parent = parent;
    this.other  = other;
  }

  AssignSequence.prototype = new ObjectLikeSequence();

  AssignSequence.prototype.get = function get(key) {
    return this.other[key] || this.parent.get(key);
  };

  AssignSequence.prototype.each = function each(fn) {
    var merged = new Set(),
        done   = false;

    Lazy(this.other).each(function(value, key) {
      if (fn(value, key) === false) {
        done = true;
        return false;
      }

      merged.add(key);
    });

    if (!done) {
      return this.parent.each(function(value, key) {
        if (!merged.contains(key) && fn(value, key) === false) {
          return false;
        }
      });
    }
  };

  /**
   * Returns an {@link ObjectLikeSequence} whose elements are the combination of
   * this sequence and a 'default' object. In the case of a key appearing in both
   * this sequence and the given object, this sequence's value will override the
   * default object's.
   *
   * @public
   * @param {Object} defaults The 'default' object to use for missing keys in this
   *     sequence.
   * @returns {ObjectLikeSequence} A new sequence comprising elements from this
   *     sequence supplemented by the contents of `defaults`.
   *
   * @examples
   * Lazy({ name: "Dan" }).defaults({ name: "User", password: "passw0rd" }) // sequence: { name: "Dan", password: "passw0rd" }
   */
  ObjectLikeSequence.prototype.defaults = function defaults(defaults) {
    return new DefaultsSequence(this, defaults);
  };

  /**
   * @constructor
   */
  function DefaultsSequence(parent, defaults) {
    this.parent   = parent;
    this.defaults = defaults;
  }

  DefaultsSequence.prototype = new ObjectLikeSequence();

  DefaultsSequence.prototype.get = function get(key) {
    return this.parent.get(key) || this.defaults[key];
  };

  DefaultsSequence.prototype.each = function each(fn) {
    var merged = new Set(),
        done   = false;

    this.parent.each(function(value, key) {
      if (fn(value, key) === false) {
        done = true;
        return false;
      }

      if (typeof value !== "undefined") {
        merged.add(key);
      }
    });

    if (!done) {
      Lazy(this.defaults).each(function(value, key) {
        if (!merged.contains(key) && fn(value, key) === false) {
          return false;
        }
      });
    }
  };

  /**
   * Returns an {@link ObjectLikeSequence} whose values are this sequence's keys,
   * and whose keys are this sequence's values.
   *
   * @public
   * @returns {ObjectLikeSequence} A new sequence comprising the inverted keys and
   *     values from this sequence.
   *
   * @examples
   * Lazy({ first: "Dan", last: "Tao" }).invert() // sequence: { Dan: "first", Tao: "last" }
   */
  ObjectLikeSequence.prototype.invert = function invert() {
    return new InvertedSequence(this);
  };

  /**
   * @constructor
   */
  function InvertedSequence(parent) {
    this.parent = parent;
  }

  InvertedSequence.prototype = new ObjectLikeSequence();

  InvertedSequence.prototype.each = function each(fn) {
    this.parent.each(function(value, key) {
      return fn(key, value);
    });
  };

  /**
   * Produces an {@link ObjectLikeSequence} consisting of all the recursively
   * merged values from this and the given object(s) or sequence(s).
   *
   * @public
   * @param {...Object|ObjectLikeSequence} others The other object(s) or
   *     sequence(s) whose values will be merged into this one.
   * @param {Function=} mergeFn An optional function used to customize merging
   *     behavior.
   * @returns {ObjectLikeSequence} The new sequence consisting of merged values.
   *
   * @examples
   * // These examples are completely stolen from Lo-Dash's documentation:
   * // lodash.com/docs#merge
   *
   * var names = {
   *   'characters': [
   *     { 'name': 'barney' },
   *     { 'name': 'fred' }
   *   ]
   * };
   *
   * var ages = {
   *   'characters': [
   *     { 'age': 36 },
   *     { 'age': 40 }
   *   ]
   * };
   *
   * var food = {
   *   'fruits': ['apple'],
   *   'vegetables': ['beet']
   * };
   *
   * var otherFood = {
   *   'fruits': ['banana'],
   *   'vegetables': ['carrot']
   * };
   *
   * function mergeArrays(a, b) {
   *   return Array.isArray(a) ? a.concat(b) : undefined;
   * }
   *
   * Lazy(names).merge(ages); // => sequence: { 'characters': [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred', 'age': 40 }] }
   * Lazy(food).merge(otherFood, mergeArrays); // => sequence: { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot'] }
   *
   * // ----- Now for my own tests: -----
   *
   * // merges objects
   * Lazy({ foo: 1 }).merge({ foo: 2 }); // => sequence: { foo: 2 }
   * Lazy({ foo: 1 }).merge({ bar: 2 }); // => sequence: { foo: 1, bar: 2 }
   *
   * // goes deep
   * Lazy({ foo: { bar: 1 } }).merge({ foo: { bar: 2 } }); // => sequence: { foo: { bar: 2 } }
   * Lazy({ foo: { bar: 1 } }).merge({ foo: { baz: 2 } }); // => sequence: { foo: { bar: 1, baz: 2 } }
   * Lazy({ foo: { bar: 1 } }).merge({ foo: { baz: 2 } }); // => sequence: { foo: { bar: 1, baz: 2 } }
   *
   * // gives precedence to later sources
   * Lazy({ foo: 1 }).merge({ bar: 2 }, { bar: 3 }); // => sequence: { foo: 1, bar: 3 }
   *
   * // undefined gets passed over
   * Lazy({ foo: 1 }).merge({ foo: undefined }); // => sequence: { foo: 1 }
   *
   * // null doesn't get passed over
   * Lazy({ foo: 1 }).merge({ foo: null }); // => sequence: { foo: null }
   *
   * // array contents get merged as well
   * Lazy({ foo: [{ bar: 1 }] }).merge({ foo: [{ baz: 2 }] }); // => sequence: { foo: [{ bar: 1, baz: 2}] }
   */
  ObjectLikeSequence.prototype.merge = function merge(var_args) {
    var mergeFn = arguments.length > 1 && typeof arguments[arguments.length - 1] === "function" ?
      arrayPop.call(arguments) : null;
    return new MergedSequence(this, arraySlice.call(arguments, 0), mergeFn);
  };

  /**
   * @constructor
   */
  function MergedSequence(parent, others, mergeFn) {
    this.parent  = parent;
    this.others  = others;
    this.mergeFn = mergeFn;
  }

  MergedSequence.prototype = new ObjectLikeSequence();

  MergedSequence.prototype.each = function each(fn) {
    var others  = this.others,
        mergeFn = this.mergeFn || mergeObjects,
        keys    = {};

    var iteratedFullSource = this.parent.each(function(value, key) {
      var merged = value;

      forEach(others, function(other) {
        if (key in other) {
          merged = mergeFn(merged, other[key]);
        }
      });

      keys[key] = true;

      return fn(merged, key);
    });

    if (iteratedFullSource === false) {
      return false;
    }

    var remaining = {};

    forEach(others, function(other) {
      for (var k in other) {
        if (!keys[k]) {
          remaining[k] = mergeFn(remaining[k], other[k]);
        }
      }
    });

    return Lazy(remaining).each(fn);
  };

  /**
   * @private
   * @examples
   * mergeObjects({ foo: 1 }, { bar: 2 }); // => { foo: 1, bar: 2 }
   * mergeObjects({ foo: { bar: 1 } }, { foo: { baz: 2 } }); // => { foo: { bar: 1, baz: 2 } }
   * mergeObjects({ foo: { bar: 1 } }, { foo: undefined }); // => { foo: { bar: 1 } }
   * mergeObjects({ foo: { bar: 1 } }, { foo: null }); // => { foo: null }
   */
  function mergeObjects(a, b) {
    if (typeof b === 'undefined') {
      return a;
    }

    // Unless we're dealing with two objects, there's no merging to do --
    // just replace a w/ b.
    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
      return b;
    }

    var merged = {}, prop;
    for (prop in a) {
      merged[prop] = mergeObjects(a[prop], b[prop]);
    }
    for (prop in b) {
      if (!merged[prop]) {
        merged[prop] = b[prop];
      }
    }
    return merged;
  }

  /**
   * Creates a {@link Sequence} consisting of the keys from this sequence whose
   *     values are functions.
   *
   * @public
   * @aka methods
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * var dog = {
   *   name: "Fido",
   *   breed: "Golden Retriever",
   *   bark: function() { console.log("Woof!"); },
   *   wagTail: function() { console.log("TODO: implement robotic dog interface"); }
   * };
   *
   * Lazy(dog).functions() // sequence: ["bark", "wagTail"]
   */
  ObjectLikeSequence.prototype.functions = function functions() {
    return this
      .filter(function(v, k) { return typeof(v) === "function"; })
      .map(function(v, k) { return k; });
  };

  ObjectLikeSequence.prototype.methods = function methods() {
    return this.functions();
  };

  /**
   * Creates an {@link ObjectLikeSequence} consisting of the key/value pairs from
   * this sequence whose keys are included in the given array of property names.
   *
   * @public
   * @param {Array} properties An array of the properties to "pick" from this
   *     sequence.
   * @returns {ObjectLikeSequence} The new sequence.
   *
   * @examples
   * var players = {
   *   "who": "first",
   *   "what": "second",
   *   "i don't know": "third"
   * };
   *
   * Lazy(players).pick(["who", "what"]) // sequence: { who: "first", what: "second" }
   */
  ObjectLikeSequence.prototype.pick = function pick(properties) {
    return new PickSequence(this, properties);
  };

  /**
   * @constructor
   */
  function PickSequence(parent, properties) {
    this.parent     = parent;
    this.properties = properties;
  }

  PickSequence.prototype = new ObjectLikeSequence();

  PickSequence.prototype.get = function get(key) {
    return arrayContains(this.properties, key) ? this.parent.get(key) : undefined;
  };

  PickSequence.prototype.each = function each(fn) {
    var inArray    = arrayContains,
        properties = this.properties;

    return this.parent.each(function(value, key) {
      if (inArray(properties, key)) {
        return fn(value, key);
      }
    });
  };

  /**
   * Creates an {@link ObjectLikeSequence} consisting of the key/value pairs from
   * this sequence excluding those with the specified keys.
   *
   * @public
   * @param {Array} properties An array of the properties to *omit* from this
   *     sequence.
   * @returns {ObjectLikeSequence} The new sequence.
   *
   * @examples
   * var players = {
   *   "who": "first",
   *   "what": "second",
   *   "i don't know": "third"
   * };
   *
   * Lazy(players).omit(["who", "what"]) // sequence: { "i don't know": "third" }
   */
  ObjectLikeSequence.prototype.omit = function omit(properties) {
    return new OmitSequence(this, properties);
  };

  /**
   * @constructor
   */
  function OmitSequence(parent, properties) {
    this.parent     = parent;
    this.properties = properties;
  }

  OmitSequence.prototype = new ObjectLikeSequence();

  OmitSequence.prototype.get = function get(key) {
    return arrayContains(this.properties, key) ? undefined : this.parent.get(key);
  };

  OmitSequence.prototype.each = function each(fn) {
    var inArray    = arrayContains,
        properties = this.properties;

    return this.parent.each(function(value, key) {
      if (!inArray(properties, key)) {
        return fn(value, key);
      }
    });
  };

  /**
   * Maps the key/value pairs in this sequence to arrays.
   *
   * @public
   * @aka toArray
   * @returns {Sequence} An sequence of `[key, value]` pairs.
   *
   * @examples
   * var colorCodes = {
   *   red: "#f00",
   *   green: "#0f0",
   *   blue: "#00f"
   * };
   *
   * Lazy(colorCodes).pairs() // sequence: [["red", "#f00"], ["green", "#0f0"], ["blue", "#00f"]]
   */
  ObjectLikeSequence.prototype.pairs = function pairs() {
    return this.map(function(v, k) { return [k, v]; });
  };

  /**
   * Creates an array from the key/value pairs in this sequence.
   *
   * @public
   * @returns {Array} An array of `[key, value]` elements.
   *
   * @examples
   * var colorCodes = {
   *   red: "#f00",
   *   green: "#0f0",
   *   blue: "#00f"
   * };
   *
   * Lazy(colorCodes).toArray() // => [["red", "#f00"], ["green", "#0f0"], ["blue", "#00f"]]
   */
  ObjectLikeSequence.prototype.toArray = function toArray() {
    return this.pairs().toArray();
  };

  /**
   * Creates an object with the key/value pairs from this sequence.
   *
   * @public
   * @returns {Object} An object with the same key/value pairs as this sequence.
   *
   * @examples
   * var colorCodes = {
   *   red: "#f00",
   *   green: "#0f0",
   *   blue: "#00f"
   * };
   *
   * Lazy(colorCodes).toObject() // => { red: "#f00", green: "#0f0", blue: "#00f" }
   */
  ObjectLikeSequence.prototype.toObject = function toObject() {
    return this.reduce(function(object, value, key) {
      object[key] = value;
      return object;
    }, {});
  };

  // Now that we've fully initialized the ObjectLikeSequence prototype, we can
  // actually set the prototypes for GroupedSequence, IndexedSequence, and
  // CountedSequence.

  GroupedSequence.prototype = new ObjectLikeSequence();

  GroupedSequence.prototype.each = function each(fn) {
    var keyFn   = createCallback(this.keyFn),
        result;

    result = this.parent.reduce(function(grouped,e) {
      var key = keyFn(e);
      if (!(grouped[key] instanceof Array)) {
        grouped[key] = [e];
      } else {
        grouped[key].push(e);
      }
      return grouped;
    },{});

    return transform(function(grouped) {
      for (var key in grouped) {
        if (fn(grouped[key], key) === false) {
          return false;
        }
      }
    }, result);
  };

  IndexedSequence.prototype = new ObjectLikeSequence();

  IndexedSequence.prototype.each = function each(fn) {
    var keyFn   = createCallback(this.keyFn),
        indexed = {};

    return this.parent.each(function(e) {
      var key = keyFn(e);
      if (!indexed[key]) {
        indexed[key] = e;
        return fn(e, key);
      }
    });
  };

  CountedSequence.prototype = new ObjectLikeSequence();

  CountedSequence.prototype.each = function each(fn) {
    var keyFn   = createCallback(this.keyFn),
        counted = {};

    this.parent.each(function(e) {
      var key = keyFn(e);
      if (!counted[key]) {
        counted[key] = 1;
      } else {
        counted[key] += 1;
      }
    });

    for (var key in counted) {
      if (fn(counted[key], key) === false) {
        return false;
      }
    }

    return true;
  };

  /**
   * Watches for all changes to a specified property (or properties) of an
   * object and produces a sequence whose elements have the properties
   * `{ property, value }` indicating which property changed and what it was
   * changed to.
   *
   * Note that this method **only works on directly wrapped objects**; it will
   * *not* work on any arbitrary {@link ObjectLikeSequence}.
   *
   * @public
   * @param {(string|Array)=} propertyNames A property name or array of property
   *     names to watch. If this parameter is `undefined`, all of the object's
   *     current (enumerable) properties will be watched.
   * @returns {Sequence} A sequence comprising `{ property, value }` objects
   *     describing each change to the specified property/properties.
   *
   * @examples
   * var obj = {},
   *     changes = [];
   *
   * Lazy(obj).watch('foo').each(function(change) {
   *   changes.push(change);
   * });
   *
   * obj.foo = 1;
   * obj.bar = 2;
   * obj.foo = 3;
   *
   * obj.foo; // => 3
   * changes; // => [{ property: 'foo', value: 1 }, { property: 'foo', value: 3 }]
   */
  ObjectLikeSequence.prototype.watch = function watch(propertyNames) {
    throw new Error('You can only call #watch on a directly wrapped object.');
  };

  /**
   * @constructor
   */
  function ObjectWrapper(source) {
    this.source = source;
  }

  ObjectWrapper.prototype = new ObjectLikeSequence();

  ObjectWrapper.prototype.root = function root() {
    return this;
  };

  ObjectWrapper.prototype.isAsync = function isAsync() {
    return false;
  };

  ObjectWrapper.prototype.get = function get(key) {
    return this.source[key];
  };

  ObjectWrapper.prototype.each = function each(fn) {
    var source = this.source,
        key;

    for (key in source) {
      if (fn(source[key], key) === false) {
        return false;
      }
    }

    return true;
  };

  /**
   * A `StringLikeSequence` represents a sequence of characters.
   *
   * The initial sequence you get by wrapping a string with `Lazy(string)` is a
   * `StringLikeSequence`.
   *
   * All methods of `StringLikeSequence` that conceptually should return
   * something like a string return another `StringLikeSequence`.
   *
   * @public
   * @constructor
   *
   * @examples
   * function upcase(str) { return str.toUpperCase(); }
   *
   * Lazy('foo')               // instanceof Lazy.StringLikeSequence
   * Lazy('foo').toUpperCase() // instanceof Lazy.StringLikeSequence
   * Lazy('foo').reverse()     // instanceof Lazy.StringLikeSequence
   * Lazy('foo').take(2)       // instanceof Lazy.StringLikeSequence
   * Lazy('foo').drop(1)       // instanceof Lazy.StringLikeSequence
   * Lazy('foo').substring(1)  // instanceof Lazy.StringLikeSequence
   *
   * // Note that `map` does not create a `StringLikeSequence` because there's
   * // no guarantee the mapping function will return characters. In the event
   * // you do want to map a string onto a string-like sequence, use
   * // `mapString`:
   * Lazy('foo').map(Lazy.identity)       // instanceof Lazy.ArrayLikeSequence
   * Lazy('foo').mapString(Lazy.identity) // instanceof Lazy.StringLikeSequence
   */
  function StringLikeSequence() {}

  StringLikeSequence.prototype = new ArrayLikeSequence();

  /**
   * Create a new constructor function for a type inheriting from
   * `StringLikeSequence`.
   *
   * @public
   * @param {string|Array.<string>} methodName The name(s) of the method(s) to be
   *     used for constructing the new sequence. The method will be attached to
   *     the `StringLikeSequence` prototype so that it can be chained with any other
   *     methods that return string-like sequences.
   * @param {Object} overrides An object containing function overrides for this
   *     new sequence type. Has the same requirements as
   *     {@link ArrayLikeSequence.define}.
   * @returns {Function} A constructor for a new type inheriting from
   *     `StringLikeSequence`.
   *
   * @examples
   * Lazy.StringLikeSequence.define("zomg", {
   *   length: function() {
   *     return this.parent.length() + "!!ZOMG!!!1".length;
   *   },
   *
   *   get: function(i) {
   *     if (i < this.parent.length()) {
   *       return this.parent.get(i);
   *     }
   *     return "!!ZOMG!!!1".charAt(i - this.parent.length());
   *   }
   * });
   *
   * Lazy('foo').zomg() // sequence: "foo!!ZOMG!!!1"
   */
  StringLikeSequence.define = function define(methodName, overrides) {
    if (!overrides || typeof overrides.get !== 'function') {
      throw new Error("A custom string-like sequence must implement *at least* get!");
    }

    return defineSequenceType(StringLikeSequence, methodName, overrides);
  };

  StringLikeSequence.prototype.value = function value() {
    return this.toString();
  };

  /**
   * Returns an {@link IndexedIterator} that will step over each character in this
   * sequence one by one.
   *
   * @returns {IndexedIterator} The iterator.
   */
  StringLikeSequence.prototype.getIterator = function getIterator() {
    return new CharIterator(this);
  };

  /**
   * @constructor
   */
  function CharIterator(source) {
    this.source = Lazy(source);
    this.index = -1;
  }

  CharIterator.prototype.current = function current() {
    return this.source.charAt(this.index);
  };

  CharIterator.prototype.moveNext = function moveNext() {
    return (++this.index < this.source.length());
  };

  /**
   * Returns the character at the given index of this sequence, or the empty
   * string if the specified index lies outside the bounds of the sequence.
   *
   * @public
   * @param {number} i The index of this sequence.
   * @returns {string} The character at the specified index.
   *
   * @examples
   * Lazy("foo").charAt(0)  // => "f"
   * Lazy("foo").charAt(-1) // => ""
   * Lazy("foo").charAt(10) // => ""
   */
  StringLikeSequence.prototype.charAt = function charAt(i) {
    return this.get(i);
  };

  /**
   * Returns the character code at the given index of this sequence, or `NaN` if
   * the index lies outside the bounds of the sequence.
   *
   * @public
   * @param {number} i The index of the character whose character code you want.
   * @returns {number} The character code.
   *
   * @examples
   * Lazy("abc").charCodeAt(0)  // => 97
   * Lazy("abc").charCodeAt(-1) // => NaN
   * Lazy("abc").charCodeAt(10) // => NaN
   */
  StringLikeSequence.prototype.charCodeAt = function charCodeAt(i) {
    var char = this.charAt(i);
    if (!char) { return NaN; }

    return char.charCodeAt(0);
  };

  /**
   * Returns a {@link StringLikeSequence} comprising the characters from *this*
   * sequence starting at `start` and ending at `stop` (exclusive), or---if
   * `stop` is `undefined`, including the rest of the sequence.
   *
   * @public
   * @param {number} start The index where this sequence should begin.
   * @param {number=} stop The index (exclusive) where this sequence should end.
   * @returns {StringLikeSequence} The new sequence.
   *
   * @examples
   * Lazy("foo").substring(1)      // sequence: "oo"
   * Lazy("foo").substring(-1)     // sequence: "foo"
   * Lazy("hello").substring(1, 3) // sequence: "el"
   * Lazy("hello").substring(1, 9) // sequence: "ello"
   */
  StringLikeSequence.prototype.substring = function substring(start, stop) {
    return new StringSegment(this, start, stop);
  };

  /**
   * @constructor
   */
  function StringSegment(parent, start, stop) {
    this.parent = parent;
    this.start  = Math.max(0, start);
    this.stop   = stop;
  }

  StringSegment.prototype = new StringLikeSequence();

  StringSegment.prototype.get = function get(i) {
    return this.parent.get(i + this.start);
  };

  StringSegment.prototype.length = function length() {
    return (typeof this.stop === "number" ? this.stop : this.parent.length()) - this.start;
  };

  /**
   * An optimized version of {@link Sequence#first} that returns another
   * {@link StringLikeSequence} (or just the first character, if `count` is
   * undefined).
   *
   * @public
   * @examples
   * Lazy('foo').first()                // => 'f'
   * Lazy('fo').first(2)                // sequence: 'fo'
   * Lazy('foo').first(10)              // sequence: 'foo'
   * Lazy('foo').toUpperCase().first()  // => 'F'
   * Lazy('foo').toUpperCase().first(2) // sequence: 'FO'
   */
  StringLikeSequence.prototype.first = function first(count) {
    if (typeof count === "undefined") {
      return this.charAt(0);
    }

    return this.substring(0, count);
  };

  /**
   * An optimized version of {@link Sequence#last} that returns another
   * {@link StringLikeSequence} (or just the last character, if `count` is
   * undefined).
   *
   * @public
   * @examples
   * Lazy('foo').last()                // => 'o'
   * Lazy('foo').last(2)               // sequence: 'oo'
   * Lazy('foo').last(10)              // sequence: 'foo'
   * Lazy('foo').toUpperCase().last()  // => 'O'
   * Lazy('foo').toUpperCase().last(2) // sequence: 'OO'
   */
  StringLikeSequence.prototype.last = function last(count) {
    if (typeof count === "undefined") {
      return this.charAt(this.length() - 1);
    }

    return this.substring(this.length() - count);
  };

  StringLikeSequence.prototype.drop = function drop(count) {
    return this.substring(count);
  };

  /**
   * Finds the index of the first occurrence of the given substring within this
   * sequence, starting from the specified index (or the beginning of the
   * sequence).
   *
   * @public
   * @param {string} substring The substring to search for.
   * @param {number=} startIndex The index from which to start the search.
   * @returns {number} The first index where the given substring is found, or
   *     -1 if it isn't in the sequence.
   *
   * @examples
   * Lazy('canal').indexOf('a')    // => 1
   * Lazy('canal').indexOf('a', 2) // => 3
   * Lazy('canal').indexOf('ana')  // => 1
   * Lazy('canal').indexOf('andy') // => -1
   * Lazy('canal').indexOf('x')    // => -1
   */
  StringLikeSequence.prototype.indexOf = function indexOf(substring, startIndex) {
    return this.toString().indexOf(substring, startIndex);
  };

  /**
   * Finds the index of the last occurrence of the given substring within this
   * sequence, starting from the specified index (or the end of the sequence)
   * and working backwards.
   *
   * @public
   * @param {string} substring The substring to search for.
   * @param {number=} startIndex The index from which to start the search.
   * @returns {number} The last index where the given substring is found, or
   *     -1 if it isn't in the sequence.
   *
   * @examples
   * Lazy('canal').lastIndexOf('a')    // => 3
   * Lazy('canal').lastIndexOf('a', 2) // => 1
   * Lazy('canal').lastIndexOf('ana')  // => 1
   * Lazy('canal').lastIndexOf('andy') // => -1
   * Lazy('canal').lastIndexOf('x')    // => -1
   */
  StringLikeSequence.prototype.lastIndexOf = function lastIndexOf(substring, startIndex) {
    return this.toString().lastIndexOf(substring, startIndex);
  };

  /**
   * Checks if this sequence contains a given substring.
   *
   * @public
   * @param {string} substring The substring to check for.
   * @returns {boolean} Whether or not this sequence contains `substring`.
   *
   * @examples
   * Lazy('hello').contains('ell') // => true
   * Lazy('hello').contains('')    // => true
   * Lazy('hello').contains('abc') // => false
   */
  StringLikeSequence.prototype.contains = function contains(substring) {
    return this.indexOf(substring) !== -1;
  };

  /**
   * Checks if this sequence ends with a given suffix.
   *
   * @public
   * @param {string} suffix The suffix to check for.
   * @returns {boolean} Whether or not this sequence ends with `suffix`.
   *
   * @examples
   * Lazy('foo').endsWith('oo')  // => true
   * Lazy('foo').endsWith('')    // => true
   * Lazy('foo').endsWith('abc') // => false
   */
  StringLikeSequence.prototype.endsWith = function endsWith(suffix) {
    return this.substring(this.length() - suffix.length).toString() === suffix;
  };

  /**
   * Checks if this sequence starts with a given prefix.
   *
   * @public
   * @param {string} prefix The prefix to check for.
   * @returns {boolean} Whether or not this sequence starts with `prefix`.
   *
   * @examples
   * Lazy('foo').startsWith('fo')  // => true
   * Lazy('foo').startsWith('')    // => true
   * Lazy('foo').startsWith('abc') // => false
   */
  StringLikeSequence.prototype.startsWith = function startsWith(prefix) {
    return this.substring(0, prefix.length).toString() === prefix;
  };

  /**
   * Converts all of the characters in this string to uppercase.
   *
   * @public
   * @returns {StringLikeSequence} A new sequence with the same characters as
   *     this sequence, all uppercase.
   *
   * @examples
   * function nextLetter(a) {
   *   return String.fromCharCode(a.charCodeAt(0) + 1);
   * }
   *
   * Lazy('foo').toUpperCase()                       // sequence: 'FOO'
   * Lazy('foo').substring(1).toUpperCase()          // sequence: 'OO'
   * Lazy('abc').mapString(nextLetter).toUpperCase() // sequence: 'BCD'
   */
  StringLikeSequence.prototype.toUpperCase = function toUpperCase() {
    return this.mapString(function(char) { return char.toUpperCase(); });
  };

  /**
   * Converts all of the characters in this string to lowercase.
   *
   * @public
   * @returns {StringLikeSequence} A new sequence with the same characters as
   *     this sequence, all lowercase.
   *
   * @examples
   * function nextLetter(a) {
   *   return String.fromCharCode(a.charCodeAt(0) + 1);
   * }
   *
   * Lazy('FOO').toLowerCase()                       // sequence: 'foo'
   * Lazy('FOO').substring(1).toLowerCase()          // sequence: 'oo'
   * Lazy('ABC').mapString(nextLetter).toLowerCase() // sequence: 'bcd'
   */
  StringLikeSequence.prototype.toLowerCase = function toLowerCase() {
    return this.mapString(function(char) { return char.toLowerCase(); });
  };

  /**
   * Maps the characters of this sequence onto a new {@link StringLikeSequence}.
   *
   * @public
   * @param {Function} mapFn The function used to map characters from this
   *     sequence onto the new sequence.
   * @returns {StringLikeSequence} The new sequence.
   *
   * @examples
   * function upcase(char) { return char.toUpperCase(); }
   *
   * Lazy("foo").mapString(upcase)               // sequence: "FOO"
   * Lazy("foo").mapString(upcase).charAt(0)     // => "F"
   * Lazy("foo").mapString(upcase).charCodeAt(0) // => 70
   * Lazy("foo").mapString(upcase).substring(1)  // sequence: "OO"
   */
  StringLikeSequence.prototype.mapString = function mapString(mapFn) {
    return new MappedStringLikeSequence(this, mapFn);
  };

  /**
   * @constructor
   */
  function MappedStringLikeSequence(parent, mapFn) {
    this.parent = parent;
    this.mapFn  = mapFn;
  }

  MappedStringLikeSequence.prototype = new StringLikeSequence();
  MappedStringLikeSequence.prototype.get = IndexedMappedSequence.prototype.get;
  MappedStringLikeSequence.prototype.length = IndexedMappedSequence.prototype.length;

  /**
   * Returns a copy of this sequence that reads back to front.
   *
   * @public
   *
   * @examples
   * Lazy("abcdefg").reverse() // sequence: "gfedcba"
   */
  StringLikeSequence.prototype.reverse = function reverse() {
    return new ReversedStringLikeSequence(this);
  };

  /**
   * @constructor
   */
  function ReversedStringLikeSequence(parent) {
    this.parent = parent;
  }

  ReversedStringLikeSequence.prototype = new StringLikeSequence();
  ReversedStringLikeSequence.prototype.get = IndexedReversedSequence.prototype.get;
  ReversedStringLikeSequence.prototype.length = IndexedReversedSequence.prototype.length;

  StringLikeSequence.prototype.toString = function toString() {
    return this.join("");
  };

  /**
   * Creates a {@link Sequence} comprising all of the matches for the specified
   * pattern in the underlying string.
   *
   * @public
   * @param {RegExp} pattern The pattern to match.
   * @returns {Sequence} A sequence of all the matches.
   *
   * @examples
   * Lazy("abracadabra").match(/a[bcd]/) // sequence: ["ab", "ac", "ad", "ab"]
   * Lazy("fee fi fo fum").match(/\w+/)  // sequence: ["fee", "fi", "fo", "fum"]
   * Lazy("hello").match(/xyz/)          // sequence: []
   */
  StringLikeSequence.prototype.match = function match(pattern) {
    return new StringMatchSequence(this.source, pattern);
  };

  /**
   * @constructor
   */
  function StringMatchSequence(source, pattern) {
    this.source = source;
    this.pattern = pattern;
  }

  StringMatchSequence.prototype = new Sequence();

  StringMatchSequence.prototype.getIterator = function getIterator() {
    return new StringMatchIterator(this.source, this.pattern);
  };

  /**
   * @constructor
   */
  function StringMatchIterator(source, pattern) {
    this.source  = source;
    this.pattern = cloneRegex(pattern);
  }

  StringMatchIterator.prototype.current = function current() {
    return this.match[0];
  };

  StringMatchIterator.prototype.moveNext = function moveNext() {
    return !!(this.match = this.pattern.exec(this.source));
  };

  /**
   * Creates a {@link Sequence} comprising all of the substrings of this string
   * separated by the given delimiter, which can be either a string or a regular
   * expression.
   *
   * @public
   * @param {string|RegExp} delimiter The delimiter to use for recognizing
   *     substrings.
   * @returns {Sequence} A sequence of all the substrings separated by the given
   *     delimiter.
   *
   * @examples
   * Lazy("foo").split("")                      // sequence: ["f", "o", "o"]
   * Lazy("yo dawg").split(" ")                 // sequence: ["yo", "dawg"]
   * Lazy("bah bah\tblack  sheep").split(/\s+/) // sequence: ["bah", "bah", "black", "sheep"]
   */
  StringLikeSequence.prototype.split = function split(delimiter) {
    return new SplitStringSequence(this.source, delimiter);
  };

  /**
   * @constructor
   */
  function SplitStringSequence(source, pattern) {
    this.source = source;
    this.pattern = pattern;
  }

  SplitStringSequence.prototype = new Sequence();

  SplitStringSequence.prototype.getIterator = function getIterator() {
    if (this.pattern instanceof RegExp) {
      if (this.pattern.source === "" || this.pattern.source === "(?:)") {
        return new CharIterator(this.source);
      } else {
        return new SplitWithRegExpIterator(this.source, this.pattern);
      }
    } else if (this.pattern === "") {
      return new CharIterator(this.source);
    } else {
      return new SplitWithStringIterator(this.source, this.pattern);
    }
  };

  /**
   * @constructor
   */
  function SplitWithRegExpIterator(source, pattern) {
    this.source  = source;
    this.pattern = cloneRegex(pattern);
  }

  SplitWithRegExpIterator.prototype.current = function current() {
    return this.source.substring(this.start, this.end);
  };

  SplitWithRegExpIterator.prototype.moveNext = function moveNext() {
    if (!this.pattern) {
      return false;
    }

    var match = this.pattern.exec(this.source);

    if (match) {
      this.start = this.nextStart ? this.nextStart : 0;
      this.end = match.index;
      this.nextStart = match.index + match[0].length;
      return true;

    } else if (this.pattern) {
      this.start = this.nextStart;
      this.end = undefined;
      this.nextStart = undefined;
      this.pattern = undefined;
      return true;
    }

    return false;
  };

  /**
   * @constructor
   */
  function SplitWithStringIterator(source, delimiter) {
    this.source = source;
    this.delimiter = delimiter;
  }

  SplitWithStringIterator.prototype.current = function current() {
    return this.source.substring(this.leftIndex, this.rightIndex);
  };

  SplitWithStringIterator.prototype.moveNext = function moveNext() {
    if (!this.finished) {
      this.leftIndex = typeof this.leftIndex !== "undefined" ?
        this.rightIndex + this.delimiter.length :
        0;
      this.rightIndex = this.source.indexOf(this.delimiter, this.leftIndex);
    }

    if (this.rightIndex === -1) {
      this.finished = true;
      this.rightIndex = undefined;
      return true;
    }

    return !this.finished;
  };

  /**
   * Wraps a string exposing {@link #match} and {@link #split} methods that return
   * {@link Sequence} objects instead of arrays, improving on the efficiency of
   * JavaScript's built-in `String#split` and `String.match` methods and
   * supporting asynchronous iteration.
   *
   * @param {string} source The string to wrap.
   * @constructor
   */
  function StringWrapper(source) {
    this.source = source;
  }

  StringWrapper.prototype = new StringLikeSequence();

  StringWrapper.prototype.root = function root() {
    return this;
  };

  StringWrapper.prototype.isAsync = function isAsync() {
    return false;
  };

  StringWrapper.prototype.get = function get(i) {
    return this.source.charAt(i);
  };

  StringWrapper.prototype.length = function length() {
    return this.source.length;
  };

  /**
   * A `GeneratedSequence` does not wrap an in-memory colllection but rather
   * determines its elements on-the-fly during iteration according to a generator
   * function.
   *
   * You create a `GeneratedSequence` by calling {@link Lazy.generate}.
   *
   * @public
   * @constructor
   * @param {function(number):*} generatorFn A function which accepts an index
   *     and returns a value for the element at that position in the sequence.
   * @param {number=} length The length of the sequence. If this argument is
   *     omitted, the sequence will go on forever.
   */
  function GeneratedSequence(generatorFn, length) {
    this.get = generatorFn;
    this.fixedLength = length;
  }

  GeneratedSequence.prototype = new Sequence();

  GeneratedSequence.prototype.isAsync = function isAsync() {
    return false;
  };

  /**
   * Returns the length of this sequence.
   *
   * @public
   * @returns {number} The length, or `undefined` if this is an indefinite
   *     sequence.
   */
  GeneratedSequence.prototype.length = function length() {
    return this.fixedLength;
  };

  /**
   * Iterates over the sequence produced by invoking this sequence's generator
   * function up to its specified length, or, if length is `undefined`,
   * indefinitely (in which case the sequence will go on forever--you would need
   * to call, e.g., {@link Sequence#take} to limit iteration).
   *
   * @public
   * @param {Function} fn The function to call on each output from the generator
   *     function.
   */
  GeneratedSequence.prototype.each = function each(fn) {
    var generatorFn = this.get,
        length = this.fixedLength,
        i = 0;

    while (typeof length === "undefined" || i < length) {
      if (fn(generatorFn(i), i++) === false) {
        return false;
      }
    }

    return true;
  };

  GeneratedSequence.prototype.getIterator = function getIterator() {
    return new GeneratedIterator(this);
  };

  /**
   * Iterates over a generated sequence. (This allows generated sequences to be
   * iterated asynchronously.)
   *
   * @param {GeneratedSequence} sequence The generated sequence to iterate over.
   * @constructor
   */
  function GeneratedIterator(sequence) {
    this.sequence     = sequence;
    this.index        = 0;
    this.currentValue = null;
  }

  GeneratedIterator.prototype.current = function current() {
    return this.currentValue;
  };

  GeneratedIterator.prototype.moveNext = function moveNext() {
    var sequence = this.sequence;

    if (typeof sequence.fixedLength === "number" && this.index >= sequence.fixedLength) {
      return false;
    }

    this.currentValue = sequence.get(this.index++);
    return true;
  };

  /**
   * An `AsyncSequence` iterates over its elements asynchronously when
   * {@link #each} is called.
   *
   * You get an `AsyncSequence` by calling {@link Sequence#async} on any
   * sequence. Note that some sequence types may not support asynchronous
   * iteration.
   *
   * Returning values
   * ----------------
   *
   * Because of its asynchronous nature, an `AsyncSequence` cannot be used in the
   * same way as other sequences for functions that return values directly (e.g.,
   * `reduce`, `max`, `any`, even `toArray`).
   *
   * Instead, these methods return an `AsyncHandle` whose `onComplete` method
   * accepts a callback that will be called with the final result once iteration
   * has finished.
   *
   * Defining custom asynchronous sequences
   * --------------------------------------
   *
   * There are plenty of ways to define an asynchronous sequence. Here's one.
   *
   * 1. First, implement an {@link Iterator}. This is an object whose prototype
   *    has the methods {@link Iterator#moveNext} (which returns a `boolean`) and
   *    {@link current} (which returns the current value).
   * 2. Next, create a simple wrapper that inherits from `AsyncSequence`, whose
   *    `getIterator` function returns an instance of the iterator type you just
   *    defined.
   *
   * The default implementation for {@link #each} on an `AsyncSequence` is to
   * create an iterator and then asynchronously call {@link Iterator#moveNext}
   * (using `setImmediate`, if available, otherwise `setTimeout`) until the iterator
   * can't move ahead any more.
   *
   * @public
   * @constructor
   * @param {Sequence} parent A {@link Sequence} to wrap, to expose asynchronous
   *     iteration.
   * @param {number=} interval How many milliseconds should elapse between each
   *     element when iterating over this sequence. If this argument is omitted,
   *     asynchronous iteration will be executed as fast as possible.
   */
  function AsyncSequence(parent, interval) {
    if (parent instanceof AsyncSequence) {
      throw new Error("Sequence is already asynchronous!");
    }

    this.parent         = parent;
    this.interval       = interval;
    this.onNextCallback = getOnNextCallback(interval);
    this.cancelCallback = getCancelCallback(interval);
  }

  AsyncSequence.prototype = new Sequence();

  AsyncSequence.prototype.isAsync = function isAsync() {
    return true;
  };

  /**
   * Throws an exception. You cannot manually iterate over an asynchronous
   * sequence.
   *
   * @public
   * @example
   * Lazy([1, 2, 3]).async().getIterator() // throws
   */
  AsyncSequence.prototype.getIterator = function getIterator() {
    throw new Error('An AsyncSequence does not support synchronous iteration.');
  };

  /**
   * An asynchronous version of {@link Sequence#each}.
   *
   * @public
   * @param {Function} fn The function to invoke asynchronously on each element in
   *     the sequence one by one.
   * @returns {AsyncHandle} An {@link AsyncHandle} providing the ability to
   *     cancel the asynchronous iteration (by calling `cancel()`) as well as
   *     supply callback(s) for when an error is encountered (`onError`) or when
   *     iteration is complete (`onComplete`).
   */
  AsyncSequence.prototype.each = function each(fn) {
    var iterator = this.parent.getIterator(),
        onNextCallback = this.onNextCallback,
        cancelCallback = this.cancelCallback,
        i = 0;

    var handle = new AsyncHandle(function cancel() {
      if (cancellationId) {
        cancelCallback(cancellationId);
      }
    });

    var cancellationId = onNextCallback(function iterate() {
      cancellationId = null;

      try {
        if (iterator.moveNext() && fn(iterator.current(), i++) !== false) {
          cancellationId = onNextCallback(iterate);

        } else {
          handle._resolve();
        }

      } catch (e) {
        handle._reject(e);
      }
    });

    return handle;
  };

  /**
   * An `AsyncHandle` provides a [Promises/A+](http://promises-aplus.github.io/promises-spec/)
   * compliant interface for an {@link AsyncSequence} that is currently (or was)
   * iterating over its elements.
   *
   * In addition to behaving as a promise, an `AsyncHandle` provides the ability
   * to {@link AsyncHandle#cancel} iteration (if `cancelFn` is provided)
   * and also offers convenient {@link AsyncHandle#onComplete} and
   * {@link AsyncHandle#onError} methods to attach listeners for when iteration
   * is complete or an error is thrown during iteration.
   *
   * @public
   * @param {Function} cancelFn A function to cancel asynchronous iteration.
   *     This is passed in to support different cancellation mechanisms for
   *     different forms of asynchronous sequences (e.g., timeout-based
   *     sequences, sequences based on I/O, etc.).
   * @constructor
   *
   * @example
   * // Create a sequence of 100,000 random numbers, in chunks of 100.
   * var sequence = Lazy.generate(Math.random)
   *   .chunk(100)
   *   .async()
   *   .take(1000);
   *
   * // Reduce-style operations -- i.e., operations that return a *value* (as
   * // opposed to a *sequence*) -- return an AsyncHandle for async sequences.
   * var handle = sequence.toArray();
   *
   * handle.onComplete(function(array) {
   *   // Do something w/ 1,000-element array.
   * });
   *
   * // Since an AsyncHandle is a promise, you can also use it to create
   * // subsequent promises using `then` (see the Promises/A+ spec for more
   * // info).
   * var flattened = handle.then(function(array) {
   *   return Lazy(array).flatten();
   * });
   */
  function AsyncHandle(cancelFn) {
    this.resolveListeners = [];
    this.rejectListeners = [];
    this.state = PENDING;
    this.cancelFn = cancelFn;
  }

  // Async handle states
  var PENDING  = 1,
      RESOLVED = 2,
      REJECTED = 3;

  AsyncHandle.prototype.then = function then(onFulfilled, onRejected) {
    var promise = new AsyncHandle(this.cancelFn);

    this.resolveListeners.push(function(value) {
      try {
        if (typeof onFulfilled !== 'function') {
          resolve(promise, value);
          return;
        }

        resolve(promise, onFulfilled(value));

      } catch (e) {
        promise._reject(e);
      }
    });

    this.rejectListeners.push(function(reason) {
      try {
        if (typeof onRejected !== 'function') {
          promise._reject(reason);
          return;
        }

        resolve(promise, onRejected(reason));

      } catch (e) {
        promise._reject(e);
      }
    });

    if (this.state === RESOLVED) {
      this._resolve(this.value);
    }

    if (this.state === REJECTED) {
      this._reject(this.reason);
    }

    return promise;
  };

  AsyncHandle.prototype._resolve = function _resolve(value) {
    if (this.state === REJECTED) {
      return;
    }

    if (this.state === PENDING) {
      this.state = RESOLVED;
      this.value = value;
    }

    consumeListeners(this.resolveListeners, this.value);
  };

  AsyncHandle.prototype._reject = function _reject(reason) {
    if (this.state === RESOLVED) {
      return;
    }

    if (this.state === PENDING) {
      this.state = REJECTED;
      this.reason = reason;
    }

    consumeListeners(this.rejectListeners, this.reason);
  };

  /**
   * Cancels asynchronous iteration.
   *
   * @public
   */
  AsyncHandle.prototype.cancel = function cancel() {
    if (this.cancelFn) {
      this.cancelFn();
      this.cancelFn = null;
      this._resolve(false);
    }
  };

  /**
   * Updates the handle with a callback to execute when iteration is completed.
   *
   * @public
   * @param {Function} callback The function to call when the asynchronous
   *     iteration is completed.
   * @return {AsyncHandle} A reference to the handle (for chaining).
   */
  AsyncHandle.prototype.onComplete = function onComplete(callback) {
    this.resolveListeners.push(callback);
    return this;
  };

  /**
   * Updates the handle with a callback to execute if/when any error is
   * encountered during asynchronous iteration.
   *
   * @public
   * @param {Function} callback The function to call, with any associated error
   *     object, when an error occurs.
   * @return {AsyncHandle} A reference to the handle (for chaining).
   */
  AsyncHandle.prototype.onError = function onError(callback) {
    this.rejectListeners.push(callback);
    return this;
  };

  /**
   * Promise resolution procedure:
   * http://promises-aplus.github.io/promises-spec/#the_promise_resolution_procedure
   */
  function resolve(promise, x) {
    if (promise === x) {
      promise._reject(new TypeError('Cannot resolve a promise to itself'));
      return;
    }

    if (x instanceof AsyncHandle) {
      x.then(
        function(value) { resolve(promise, value); },
        function(reason) { promise._reject(reason); }
      );
      return;
    }

    var then;
    try {
      then = (/function|object/).test(typeof x) && x != null && x.then;
    } catch (e) {
      promise._reject(e);
      return;
    }

    var thenableState = PENDING;
    if (typeof then === 'function') {
      try {
        then.call(
          x,
          function resolvePromise(value) {
            if (thenableState !== PENDING) {
              return;
            }
            thenableState = RESOLVED;
            resolve(promise, value);
          },
          function rejectPromise(reason) {
            if (thenableState !== PENDING) {
              return;
            }
            thenableState = REJECTED;
            promise._reject(reason);
          }
        );
      } catch (e) {
        if (thenableState !== PENDING) {
          return;
        }

        promise._reject(e);
      }

      return;
    }

    promise._resolve(x);
  }

  function consumeListeners(listeners, value, callback) {
    callback || (callback = getOnNextCallback());

    callback(function() {
      if (listeners.length > 0) {
        listeners.shift()(value);
        consumeListeners(listeners, value, callback);
      }
    });
  }

  function getOnNextCallback(interval) {
    if (typeof interval === "undefined") {
      if (typeof setImmediate === "function") {
        return setImmediate;
      }
    }

    interval = interval || 0;
    return function(fn) {
      return setTimeout(fn, interval);
    };
  }

  function getCancelCallback(interval) {
    if (typeof interval === "undefined") {
      if (typeof clearImmediate === "function") {
        return clearImmediate;
      }
    }

    return clearTimeout;
  }

  /**
   * Transform a value, whether the value is retrieved asynchronously or directly.
   *
   * @private
   * @param {Function} fn The function that transforms the value.
   * @param {*} value The value to be transformed. This can be an {@link AsyncHandle} when the value
   *     is retrieved asynchronously, otherwise it can be anything.
   * @returns {*} An {@link AsyncHandle} when `value` is also an {@link AsyncHandle}, otherwise
   *     whatever `fn` resulted in.
   */
  function transform(fn, value) {
    if (value instanceof AsyncHandle) {
      return value.then(function() { fn(value); });
    }
    return fn(value);
  }

  /**
   * An async version of {@link Sequence#reverse}.
   */
  AsyncSequence.prototype.reverse = function reverse() {
    return this.parent.reverse().async();
  };

  /**
   * A version of {@link Sequence#find} which returns an {@link AsyncHandle}.
   *
   * @public
   * @param {Function} predicate A function to call on (potentially) every element
   *     in the sequence.
   * @returns {AsyncHandle} An {@link AsyncHandle} (promise) which resolves to
   *     the found element, once it is detected, or else `undefined`.
   */
  AsyncSequence.prototype.find = function find(predicate) {
    var found;

    var handle = this.each(function(e, i) {
      if (predicate(e, i)) {
        found = e;
        return false;
      }
    });

    return handle.then(function() { return found; });
  };

  /**
   * A version of {@link Sequence#indexOf} which returns an {@link AsyncHandle}.
   *
   * @public
   * @param {*} value The element to search for in the sequence.
   * @returns {AsyncHandle} An {@link AsyncHandle} (promise) which resolves to
   *     the found index, once it is detected, or -1.
   */
  AsyncSequence.prototype.indexOf = function indexOf(value) {
    var foundIndex = -1;

    var handle = this.each(function(e, i) {
      if (e === value) {
        foundIndex = i;
        return false;
      }
    });

    return handle.then(function() {
      return foundIndex;
    });
  };

  /**
   * A version of {@link Sequence#contains} which returns an {@link AsyncHandle}.
   *
   * @public
   * @param {*} value The element to search for in the sequence.
   * @returns {AsyncHandle} An {@link AsyncHandle} (promise) which resolves to
   *     either `true` or `false` to indicate whether the element was found.
   */
  AsyncSequence.prototype.contains = function contains(value) {
    var found = false;

    var handle = this.each(function(e) {
      if (e === value) {
        found = true;
        return false;
      }
    });

    return handle.then(function() {
      return found;
    });
  };

  /**
   * Just return the same sequence for `AsyncSequence#async` (I see no harm in this).
   */
  AsyncSequence.prototype.async = function async() {
    return this;
  };

  /**
   * See {@link ObjectLikeSequence#watch} for docs.
   */
  ObjectWrapper.prototype.watch = function watch(propertyNames) {
    return new WatchedPropertySequence(this.source, propertyNames);
  };

  function WatchedPropertySequence(object, propertyNames) {
    this.listeners = [];

    if (!propertyNames) {
      propertyNames = Lazy(object).keys().toArray();
    } else if (!(propertyNames instanceof Array)) {
      propertyNames = [propertyNames];
    }

    var listeners = this.listeners,
        index     = 0;

    Lazy(propertyNames).each(function(propertyName) {
      var propertyValue = object[propertyName];

      Object.defineProperty(object, propertyName, {
        get: function() {
          return propertyValue;
        },

        set: function(value) {
          for (var i = listeners.length - 1; i >= 0; --i) {
            if (listeners[i]({ property: propertyName, value: value }, index) === false) {
              listeners.splice(i, 1);
            }
          }
          propertyValue = value;
          ++index;
        }
      });
    });
  }

  WatchedPropertySequence.prototype = new AsyncSequence();

  WatchedPropertySequence.prototype.each = function each(fn) {
    this.listeners.push(fn);
  };

  /**
   * A StreamLikeSequence comprises a sequence of 'chunks' of data, which are
   * typically multiline strings.
   *
   * @constructor
   */
  function StreamLikeSequence() {}

  StreamLikeSequence.prototype = new AsyncSequence();

  StreamLikeSequence.prototype.isAsync = function isAsync() {
    return true;
  };

  StreamLikeSequence.prototype.split = function split(delimiter) {
    return new SplitStreamSequence(this, delimiter);
  };

  /**
   * @constructor
   */
  function SplitStreamSequence(parent, delimiter) {
    this.parent    = parent;
    this.delimiter = delimiter;
    this.each      = this.getEachForDelimiter(delimiter);
  }

  SplitStreamSequence.prototype = new Sequence();

  SplitStreamSequence.prototype.getEachForDelimiter = function getEachForDelimiter(delimiter) {
    if (delimiter instanceof RegExp) {
      return this.regexEach;
    }

    return this.stringEach;
  };

  SplitStreamSequence.prototype.regexEach = function each(fn) {
    var delimiter = cloneRegex(this.delimiter),
        buffer = '',
        start = 0, end,
        index = 0;

    var handle = this.parent.each(function(chunk) {
      buffer += chunk;

      var match;
      while (match = delimiter.exec(buffer)) {
        end = match.index;
        if (fn(buffer.substring(start, end), index++) === false) {
          return false;
        }
        start = end + match[0].length;
      }

      buffer = buffer.substring(start);
      start = 0;
    });

    handle.onComplete(function() {
      if (buffer.length > 0) {
        fn(buffer, index++);
      }
    });

    return handle;
  };

  SplitStreamSequence.prototype.stringEach = function each(fn) {
    var delimiter  = this.delimiter,
        pieceIndex = 0,
        buffer = '',
        bufferIndex = 0;

    var handle = this.parent.each(function(chunk) {
      buffer += chunk;
      var delimiterIndex;
      while ((delimiterIndex = buffer.indexOf(delimiter)) >= 0) {
        var piece = buffer.substr(0,delimiterIndex);
        buffer = buffer.substr(delimiterIndex+delimiter.length);
        if (fn(piece,pieceIndex++) === false) {
          return false;
        }
      }
      return true;
    });

    handle.onComplete(function() {
      fn(buffer, pieceIndex++);
    });

    return handle;
  };

  StreamLikeSequence.prototype.lines = function lines() {
    return this.split("\n");
  };

  StreamLikeSequence.prototype.match = function match(pattern) {
    return new MatchedStreamSequence(this, pattern);
  };

  /**
   * @constructor
   */
  function MatchedStreamSequence(parent, pattern) {
    this.parent  = parent;
    this.pattern = cloneRegex(pattern);
  }

  MatchedStreamSequence.prototype = new AsyncSequence();

  MatchedStreamSequence.prototype.each = function each(fn) {
    var pattern = this.pattern,
        done      = false,
        i         = 0;

    return this.parent.each(function(chunk) {
      Lazy(chunk).match(pattern).each(function(match) {
        if (fn(match, i++) === false) {
          done = true;
          return false;
        }
      });

      return !done;
    });
  };

  /**
   * Defines a wrapper for custom {@link StreamLikeSequence}s. This is useful
   * if you want a way to handle a stream of events as a sequence, but you can't
   * use Lazy's existing interface (i.e., you're wrapping an object from a
   * library with its own custom events).
   *
   * This method defines a *factory*: that is, it produces a function that can
   * be used to wrap objects and return a {@link Sequence}. Hopefully the
   * example will make this clear.
   *
   * @public
   * @param {Function} initializer An initialization function called on objects
   *     created by this factory. `this` will be bound to the created object,
   *     which is an instance of {@link StreamLikeSequence}. Use `emit` to
   *     generate data for the sequence.
   * @returns {Function} A function that creates a new {@link StreamLikeSequence},
   *     initializes it using the specified function, and returns it.
   *
   * @example
   * var factory = Lazy.createWrapper(function(eventSource) {
   *   var sequence = this;
   *
   *   eventSource.handleEvent(function(data) {
   *     sequence.emit(data);
   *   });
   * });
   *
   * var eventEmitter = {
   *   triggerEvent: function(data) {
   *     eventEmitter.eventHandler(data);
   *   },
   *   handleEvent: function(handler) {
   *     eventEmitter.eventHandler = handler;
   *   },
   *   eventHandler: function() {}
   * };
   *
   * var events = [];
   *
   * factory(eventEmitter).each(function(e) {
   *   events.push(e);
   * });
   *
   * eventEmitter.triggerEvent('foo');
   * eventEmitter.triggerEvent('bar');
   *
   * events // => ['foo', 'bar']
   */
  Lazy.createWrapper = function createWrapper(initializer) {
    var ctor = function() {
      this.listeners = [];
    };

    ctor.prototype = new StreamLikeSequence();

    ctor.prototype.each = function(listener) {
      this.listeners.push(listener);
    };

    ctor.prototype.emit = function(data) {
      var listeners = this.listeners;

      for (var len = listeners.length, i = len - 1; i >= 0; --i) {
        if (listeners[i](data) === false) {
          listeners.splice(i, 1);
        }
      }
    };

    return function() {
      var sequence = new ctor();
      initializer.apply(sequence, arguments);
      return sequence;
    };
  };

  /**
   * Creates a {@link GeneratedSequence} using the specified generator function
   * and (optionally) length.
   *
   * @public
   * @param {function(number):*} generatorFn The function used to generate the
   *     sequence. This function accepts an index as a parameter and should return
   *     a value for that index in the resulting sequence.
   * @param {number=} length The length of the sequence, for sequences with a
   *     definite length.
   * @returns {GeneratedSequence} The generated sequence.
   *
   * @examples
   * var randomNumbers = Lazy.generate(Math.random);
   * var countingNumbers = Lazy.generate(function(i) { return i + 1; }, 5);
   *
   * randomNumbers          // instanceof Lazy.GeneratedSequence
   * randomNumbers.length() // => undefined
   * countingNumbers          // sequence: [1, 2, 3, 4, 5]
   * countingNumbers.length() // => 5
   */
  Lazy.generate = function generate(generatorFn, length) {
    return new GeneratedSequence(generatorFn, length);
  };

  /**
   * Creates a sequence from a given starting value, up to a specified stopping
   * value, incrementing by a given step. Invalid values for any of these
   * arguments (e.g., a step of 0) result in an empty sequence.
   *
   * @public
   * @returns {GeneratedSequence} The sequence defined by the given ranges.
   *
   * @examples
   * Lazy.range(3)         // sequence: [0, 1, 2]
   * Lazy.range(1, 4)      // sequence: [1, 2, 3]
   * Lazy.range(2, 10, 2)  // sequence: [2, 4, 6, 8]
   * Lazy.range(5, 1, 2)   // sequence: []
   * Lazy.range(5, 15, -2) // sequence: []
   * Lazy.range(3, 10, 3)  // sequence: [3, 6, 9]
   * Lazy.range(5, 2)      // sequence: [5, 4, 3]
   * Lazy.range(7, 2, -2)  // sequence: [7, 5, 3]
   * Lazy.range(3, 5, 0)   // sequence: []
   */
  Lazy.range = function range() {
    var start = arguments.length > 1 ? arguments[0] : 0,
        stop  = arguments.length > 1 ? arguments[1] : arguments[0],
        step  = arguments.length > 2 && arguments[2];

    if (step === false) {
      step = stop > start ? 1 : -1;
    }

    if (step === 0) {
      return Lazy([]);
    }

    return Lazy.generate(function(i) { return start + (step * i); })
      .take(Math.ceil((stop - start) / step));
  };

  /**
   * Creates a sequence consisting of the given value repeated a specified number
   * of times.
   *
   * @public
   * @param {*} value The value to repeat.
   * @param {number=} count The number of times the value should be repeated in
   *     the sequence. If this argument is omitted, the value will repeat forever.
   * @returns {GeneratedSequence} The sequence containing the repeated value.
   *
   * @examples
   * Lazy.repeat("hi", 3)          // sequence: ["hi", "hi", "hi"]
   * Lazy.repeat("young")          // instanceof Lazy.GeneratedSequence
   * Lazy.repeat("young").length() // => undefined
   * Lazy.repeat("young").take(3)  // sequence: ["young", "young", "young"]
   */
  Lazy.repeat = function repeat(value, count) {
    return Lazy.generate(function() { return value; }, count);
  };

  Lazy.Sequence           = Sequence;
  Lazy.ArrayLikeSequence  = ArrayLikeSequence;
  Lazy.ObjectLikeSequence = ObjectLikeSequence;
  Lazy.StringLikeSequence = StringLikeSequence;
  Lazy.StreamLikeSequence = StreamLikeSequence;
  Lazy.GeneratedSequence  = GeneratedSequence;
  Lazy.AsyncSequence      = AsyncSequence;
  Lazy.AsyncHandle        = AsyncHandle;

  /*** Useful utility methods ***/

  /**
   * Creates a shallow copy of an array or object.
   *
   * @examples
   * var array  = [1, 2, 3], clonedArray,
   *     object = { foo: 1, bar: 2 }, clonedObject;
   *
   * clonedArray = Lazy.clone(array); // => [1, 2, 3]
   * clonedArray.push(4); // clonedArray == [1, 2, 3, 4]
   * array; // => [1, 2, 3]
   *
   * clonedObject = Lazy.clone(object); // => { foo: 1, bar: 2 }
   * clonedObject.baz = 3; // clonedObject == { foo: 1, bar: 2, baz: 3 }
   * object; // => { foo: 1, bar: 2 }
   */
  Lazy.clone = function clone(target) {
    return Lazy(target).value();
  };

  /**
   * Marks a method as deprecated, so calling it will issue a console warning.
   */
  Lazy.deprecate = function deprecate(message, fn) {
    return function() {
      console.warn(message);
      return fn.apply(this, arguments);
    };
  };

  var arrayPop   = Array.prototype.pop,
      arraySlice = Array.prototype.slice;

  /**
   * Creates a callback... you know, Lo-Dash style.
   *
   * - for functions, just returns the function
   * - for strings, returns a pluck-style callback
   * - for objects, returns a where-style callback
   *
   * @private
   * @param {Function|string|Object} callback A function, string, or object to
   *     convert to a callback.
   * @param {*} defaultReturn If the callback is undefined, a default return
   *     value to use for the function.
   * @returns {Function} The callback function.
   *
   * @examples
   * createCallback(function() {})                  // instanceof Function
   * createCallback('foo')                          // instanceof Function
   * createCallback('foo')({ foo: 'bar'})           // => 'bar'
   * createCallback({ foo: 'bar' })({ foo: 'bar' }) // => true
   * createCallback({ foo: 'bar' })({ foo: 'baz' }) // => false
   */
  function createCallback(callback, defaultValue) {
    switch (typeof callback) {
      case "function":
        return callback;

      case "string":
        return function(e) {
          return e[callback];
        };

      case "object":
        return function(e) {
          return Lazy(callback).all(function(value, key) {
            return e[key] === value;
          });
        };

      case "undefined":
        return defaultValue ?
          function() { return defaultValue; } :
          Lazy.identity;

      default:
        throw new Error("Don't know how to make a callback from a " + typeof callback + "!");
    }
  }

  /**
   * Takes a function that returns a value for one argument and produces a
   * function that compares two arguments.
   *
   * @private
   * @param {Function|string|Object} callback A function, string, or object to
   *     convert to a callback using `createCallback`.
   * @returns {Function} A function that accepts two values and returns 1 if
   *     the first is greater, -1 if the second is greater, or 0 if they are
   *     equivalent.
   *
   * @examples
   * createComparator('a')({ a: 1 }, { a: 2 });       // => -1
   * createComparator('a')({ a: 6 }, { a: 2 });       // => 1
   * createComparator('a')({ a: 1 }, { a: 1 });       // => 0
   * createComparator()(3, 5);                        // => -1
   * createComparator()(7, 5);                        // => 1
   * createComparator()(3, 3);                        // => 0
   */
  function createComparator(callback, descending) {
    if (!callback) { return compare; }

    callback = createCallback(callback);

    return function(x, y) {
      return compare(callback(x), callback(y));
    };
  }

  /**
   * Takes a function and returns a function with the same logic but the
   * arguments reversed. Only applies to functions w/ arity=2 as this is private
   * and I can do what I want.
   *
   * @private
   * @param {Function} fn The function to "reverse"
   * @returns {Function} The "reversed" function
   *
   * @examples
   * reverseArguments(function(x, y) { return x + y; })('a', 'b'); // => 'ba'
   */
  function reverseArguments(fn) {
    return function(x, y) { return fn(y, x); };
  }

  /**
   * Creates a Set containing the specified values.
   *
   * @param {...Array} values One or more array(s) of values used to populate the
   *     set.
   * @returns {Set} A new set containing the values passed in.
   */
  function createSet(values) {
    var set = new Set();
    Lazy(values || []).flatten().each(function(e) {
      set.add(e);
    });
    return set;
  }

  /**
   * Compares two elements for sorting purposes.
   *
   * @private
   * @param {*} x The left element to compare.
   * @param {*} y The right element to compare.
   * @returns {number} 1 if x > y, -1 if x < y, or 0 if x and y are equal.
   *
   * @examples
   * compare(1, 2)     // => -1
   * compare(1, 1)     // => 0
   * compare(2, 1)     // => 1
   * compare('a', 'b') // => -1
   */
  function compare(x, y) {
    if (x === y) {
      return 0;
    }

    return x > y ? 1 : -1;
  }

  /**
   * Iterates over every element in an array.
   *
   * @param {Array} array The array.
   * @param {Function} fn The function to call on every element, which can return
   *     false to stop the iteration early.
   * @returns {boolean} True if every element in the entire sequence was iterated,
   *     otherwise false.
   */
  function forEach(array, fn) {
    var i = -1,
        len = array.length;

    while (++i < len) {
      if (fn(array[i], i) === false) {
        return false;
      }
    }

    return true;
  }

  function getFirst(sequence) {
    var result;
    sequence.each(function(e) {
      result = e;
      return false;
    });
    return result;
  }

  /**
   * Checks if an element exists in an array.
   *
   * @private
   * @param {Array} array
   * @param {*} element
   * @returns {boolean} Whether or not the element exists in the array.
   *
   * @examples
   * arrayContains([1, 2], 2)              // => true
   * arrayContains([1, 2], 3)              // => false
   * arrayContains([undefined], undefined) // => true
   * arrayContains([NaN], NaN)             // => true
   */
  function arrayContains(array, element) {
    var i = -1,
        length = array.length;

    // Special handling for NaN
    if (element !== element) {
      while (++i < length) {
        if (array[i] !== array[i]) {
          return true;
        }
      }
      return false;
    }

    while (++i < length) {
      if (array[i] === element) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks if an element exists in an array before a given index.
   *
   * @private
   * @param {Array} array
   * @param {*} element
   * @param {number} index
   * @param {Function} keyFn
   * @returns {boolean}
   *
   * @examples
   * arrayContainsBefore([1, 2, 3], 3, 2) // => false
   * arrayContainsBefore([1, 2, 3], 3, 3) // => true
   */
  function arrayContainsBefore(array, element, index, keyFn) {
    var i = -1;

    if (keyFn) {
      keyFn = createCallback(keyFn);
      while (++i < index) {
        if (keyFn(array[i]) === keyFn(element)) {
          return true;
        }
      }

    } else {
      while (++i < index) {
        if (array[i] === element) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Swaps the elements at two specified positions of an array.
   *
   * @private
   * @param {Array} array
   * @param {number} i
   * @param {number} j
   *
   * @examples
   * var array = [1, 2, 3, 4, 5];
   *
   * swap(array, 2, 3) // array == [1, 2, 4, 3, 5]
   */
  function swap(array, i, j) {
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  /**
   * "Clones" a regular expression (but makes it always global).
   *
   * @private
   * @param {RegExp|string} pattern
   * @returns {RegExp}
   */
  function cloneRegex(pattern) {
    return eval("" + pattern + (!pattern.global ? "g" : ""));
  };

  /**
   * A collection of unique elements.
   *
   * @private
   * @constructor
   *
   * @examples
   * var set  = new Set(),
   *     obj1 = {},
   *     obj2 = {},
   *     fn1 = function fn1() {},
   *     fn2 = function fn2() {};
   *
   * set.add('foo')            // => true
   * set.add('foo')            // => false
   * set.add(1)                // => true
   * set.add(1)                // => false
   * set.add('1')              // => true
   * set.add('1')              // => false
   * set.add(obj1)             // => true
   * set.add(obj1)             // => false
   * set.add(obj2)             // => true
   * set.add(fn1)              // => true
   * set.add(fn2)              // => true
   * set.add(fn2)              // => false
   * set.contains('__proto__') // => false
   * set.add('__proto__')      // => true
   * set.add('__proto__')      // => false
   * set.contains('add')       // => false
   * set.add('add')            // => true
   * set.add('add')            // => false
   * set.contains(undefined)   // => false
   * set.add(undefined)        // => true
   * set.contains(undefined)   // => true
   * set.contains('undefined') // => false
   * set.add('undefined')      // => true
   * set.contains('undefined') // => true
   * set.contains(NaN)         // => false
   * set.add(NaN)              // => true
   * set.contains(NaN)         // => true
   * set.contains('NaN')       // => false
   * set.add('NaN')            // => true
   * set.contains('NaN')       // => true
   * set.contains('@foo')      // => false
   * set.add('@foo')           // => true
   * set.contains('@foo')      // => true
   */
  function Set() {
    this.table   = {};
    this.objects = [];
  }

  /**
   * Attempts to add a unique value to the set.
   *
   * @param {*} value The value to add.
   * @returns {boolean} True if the value was added to the set (meaning an equal
   *     value was not already present), or else false.
   */
  Set.prototype.add = function add(value) {
    var table = this.table,
        type  = typeof value,

        // only applies for strings
        firstChar,

        // only applies for objects
        objects;

    switch (type) {
      case "number":
      case "boolean":
      case "undefined":
        if (!table[value]) {
          table[value] = true;
          return true;
        }
        return false;

      case "string":
        // Essentially, escape the first character if it could possibly collide
        // with a number, boolean, or undefined (or a string that happens to start
        // with the escape character!), OR if it could override a special property
        // such as '__proto__' or 'constructor'.
        switch (value.charAt(0)) {
          case "_": // e.g., __proto__
          case "f": // for 'false'
          case "t": // for 'true'
          case "c": // for 'constructor'
          case "u": // for 'undefined'
          case "@": // escaped
          case "0":
          case "1":
          case "2":
          case "3":
          case "4":
          case "5":
          case "6":
          case "7":
          case "8":
          case "9":
          case "N": // for NaN
            value = "@" + value;
        }
        if (!table[value]) {
          table[value] = true;
          return true;
        }
        return false;

      default:
        // For objects and functions, we can't really do anything other than store
        // them in an array and do a linear search for reference equality.
        objects = this.objects;
        if (!arrayContains(objects, value)) {
          objects.push(value);
          return true;
        }
        return false;
    }
  };

  /**
   * Checks whether the set contains a value.
   *
   * @param {*} value The value to check for.
   * @returns {boolean} True if the set contains the value, or else false.
   */
  Set.prototype.contains = function contains(value) {
    var type = typeof value,

        // only applies for strings
        firstChar;

    switch (type) {
      case "number":
      case "boolean":
      case "undefined":
        return !!this.table[value];

      case "string":
        // Essentially, escape the first character if it could possibly collide
        // with a number, boolean, or undefined (or a string that happens to start
        // with the escape character!), OR if it could override a special property
        // such as '__proto__' or 'constructor'.
        switch (value.charAt(0)) {
          case "_": // e.g., __proto__
          case "f": // for 'false'
          case "t": // for 'true'
          case "c": // for 'constructor'
          case "u": // for 'undefined'
          case "@": // escaped
          case "0":
          case "1":
          case "2":
          case "3":
          case "4":
          case "5":
          case "6":
          case "7":
          case "8":
          case "9":
          case "N": // for NaN
            value = "@" + value;
        }
        return !!this.table[value];

      default:
        // For objects and functions, we can't really do anything other than store
        // them in an array and do a linear search for reference equality.
        return arrayContains(this.objects, value);
    }
  };

  /**
   * A "rolling" queue, with a fixed capacity. As items are added to the head,
   * excess items are dropped from the tail.
   *
   * @private
   * @constructor
   *
   * @examples
   * var queue = new Queue(3);
   *
   * queue.add(1).toArray()        // => [1]
   * queue.add(2).toArray()        // => [1, 2]
   * queue.add(3).toArray()        // => [1, 2, 3]
   * queue.add(4).toArray()        // => [2, 3, 4]
   * queue.add(5).add(6).toArray() // => [4, 5, 6]
   * queue.add(7).add(8).toArray() // => [6, 7, 8]
   *
   * // also want to check corner cases
   * new Queue(1).add('foo').add('bar').toArray() // => ['bar']
   * new Queue(0).add('foo').toArray()            // => []
   * new Queue(-1)                                // throws
   *
   * @benchmarks
   * function populateQueue(count, capacity) {
   *   var q = new Queue(capacity);
   *   for (var i = 0; i < count; ++i) {
   *     q.add(i);
   *   }
   * }
   *
   * function populateArray(count, capacity) {
   *   var arr = [];
   *   for (var i = 0; i < count; ++i) {
   *     if (arr.length === capacity) { arr.shift(); }
   *     arr.push(i);
   *   }
   * }
   *
   * populateQueue(100, 10); // populating a Queue
   * populateArray(100, 10); // populating an Array
   */
  function Queue(capacity) {
    this.contents = new Array(capacity);
    this.start    = 0;
    this.count    = 0;
  }

  /**
   * Adds an item to the queue, and returns the queue.
   */
  Queue.prototype.add = function add(element) {
    var contents = this.contents,
        capacity = contents.length,
        start    = this.start;

    if (this.count === capacity) {
      contents[start] = element;
      this.start = (start + 1) % capacity;

    } else {
      contents[this.count++] = element;
    }

    return this;
  };

  /**
   * Returns an array containing snapshot of the queue's contents.
   */
  Queue.prototype.toArray = function toArray() {
    var contents = this.contents,
        start    = this.start,
        count    = this.count;

    var snapshot = contents.slice(start, start + count);
    if (snapshot.length < count) {
      snapshot = snapshot.concat(contents.slice(0, count - snapshot.length));
    }

    return snapshot;
  };

  /**
   * Shared base method for defining new sequence types.
   */
  function defineSequenceType(base, name, overrides) {
    /** @constructor */
    var ctor = function ctor() {};

    // Make this type inherit from the specified base.
    ctor.prototype = new base();

    // Attach overrides to the new sequence type's prototype.
    for (var override in overrides) {
      ctor.prototype[override] = overrides[override];
    }

    // Define a factory method that sets the new sequence's parent to the caller
    // and (optionally) applies any additional initialization logic.
    // Expose this as a chainable method so that we can do:
    // Lazy(...).map(...).filter(...).blah(...);
    var factory = function factory() {
      var sequence = new ctor();

      // Every sequence needs a reference to its parent in order to work.
      sequence.parent = this;

      // If a custom init function was supplied, call it now.
      if (sequence.init) {
        sequence.init.apply(sequence, arguments);
      }

      return sequence;
    };

    var methodNames = typeof name === 'string' ? [name] : name;
    for (var i = 0; i < methodNames.length; ++i) {
      base.prototype[methodNames[i]] = factory;
    }

    return ctor;
  }

  /*** Exposing Lazy to the world ***/

  // For Node.js
  if (typeof module === "object" && module && module.exports === context) {
    module.exports = Lazy;

  // For browsers
  } else {
    context.Lazy = Lazy;
  }

}(this));

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/lazy.js/lazy.js","/../../node_modules/lazy.js")
},{"buffer":4,"oMfpAn":7}],9:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var cuid        = require('cuid'),
    pPolyfill   = require('es6-promise').polyfill(),
    Promise     = require('es6-promise').Promise,
    lazy        = require('lazy.js'),
    clone       = require('clone');

cooldb = function cooldb() {
    
    (this.hasOwnProperty('global')) ? global.Promise = Promise : window.Promise = Promise;
    (this.hasOwnProperty('global')) ? global.clone = clone : window.clone = clone;
    (this.hasOwnProperty('global')) ? global.lazy = lazy : window.lazy = lazy;
    (this.hasOwnProperty('global')) ? global.cuid = cuid : window.cuid = cuid;
    
    // Production Array
    var cdb             = [];
    // Production Change Feed 
    var changeFeedCB    = undefined;
    // History Change Feed
    var changeFeedHCB   = undefined;
    // History
    var cdbHistory      = [];
    var bufferHistory   = 0;
    // Callback time
    var callbackTimer   = 0;
    
    updateProps : function updateProps(source, dest) {

        return new Promise(function(resolve, reject){
            
            try {
                // Clone before changes
                var currentDest = JSON.parse(JSON.stringify(dest));
                // Make changes
                for (var key in source) {

                    if(dest.hasOwnProperty(key)){
                        if (key != 'cuid')
                            dest[key] = source[key];
                    }

                }
                // Clone after changes
                var updatedDest = JSON.parse(JSON.stringify(dest));

                resolve({ before: currentDest, after: updatedDest });
                
            } catch (err) {
                var msg = (err.hasOwnProperty('message')) ? err.message : err;
                reject(new Error( msg ));
            }
            
        });
        
	}
    
    addHistory: function addHistory(params) {
            
        return new Promise(function(resolve, reject) {

            try {
                // >> Validations <<

                // default param array
                params  = params || {};
                
                // item key prop
                if (!params.hasOwnProperty('item'))
                    throw '[History] -> Key => [item] was not found';

                if (!params.hasOwnProperty('action'))
                    throw '[History] -> Key => [action] was not found';
                
                if (!params.hasOwnProperty('isArray'))
                    throw '[History] -> Key => [isArray] was not found';
                
                var gblHistoryCuid  = cuid();
                var singleItem      = null;
                var interval        = null;
                
                // add
                if (!params.isArray) {
                    
                    params.new = (params.new === undefined || params.new === null) ? null : params.new;
                    params.old = (params.old === undefined || params.old === null) ? null : params.old;
                    
                    // Added
                    singleItem = { item: [{ old: params.old, new: params.new, action: params.action, hcuid: cuid() }],
                                   action: params.action,  hcuid: gblHistoryCuid };
                    
                    cdbHistory.push(singleItem);

                    // Change Feed
                    if (changeFeedHCB != undefined) { 
                        setTimeout(function() {
                            changeFeedHCB(singleItem);
                        }, callbackTimer);
                    }

                    // Job Done !
                    resolve({ item: params.item, action: params.action, isArray: false, hcuid: gblHistoryCuid });

                } else if (params.isArray){

                    //>> Track Additions
                    var newItems = [];
                    //>> add Array
                    params.item.forEach(function(item) {
                        
                        var tempNew = (item.hasOwnProperty('new')) ? item.new : null,
                            tempOld = (item.hasOwnProperty('old')) ? item.old : null;
                        tempOld = (params.action === 'Cleaned') ? item : tempOld;
                        
                        singleItem = { old: tempOld, new: tempNew, action: params.action, hcuid: cuid() };
                        // Added
                        newItems.push(singleItem);
                    });
                    
                    // Added
                    cdbHistory.push({ item: newItems, action: params.action, hcuid: gblHistoryCuid });
                    
                    // Change Feed
                    if (changeFeedHCB != undefined) { 
                        setTimeout(function() {
                            changeFeedHCB({ item: newItems, action: params.action, hcuid: gblHistoryCuid }); 
                        }, callbackTimer);
                    }
                    
                    // Job Done !
                    resolve({ item: newItems, action: params.action, isArray: true, hcuid: gblHistoryCuid });

                } else {
                    throw '[History] -> item parameter should correspond to an Object or Array.';
                }

            } catch (err) {
                var msg = (err.hasOwnProperty('message')) ? err.message : err;
                reject(new Error( msg ));
            } finally {
                // Check and Resize the history buffer
                if (cdbHistory.length > bufferHistory) {
                    cdbHistory = lazy(cdbHistory).shift().value();
                }
            }

        });

        return this;
    }
    
    return {
        
        changeFeed: function changeFeed(fn) {
            
            // Validate it is a function
            if (typeof fn === 'function') { 
                changeFeedCB = fn; 
            } else {
                throw 'Invalid change Feed function.';
            }
                
		},
        
        get: function get(params) {
            
            return new Promise(function(resolve, reject) {
                
                try {
                    // >> Validations <<

                    // default param array
                    params  = params || {};
                    var key   = null,
                        value = null;

                    // item key prop
                    if (!params.hasOwnProperty('key'))
                        throw 'Key => [key] was not found';
                    else {
                        if (params.hasOwnProperty('key')) key = params.key;
                    }

                    // item value prop
                    if (!params.hasOwnProperty('value') )
                        throw 'Key => [value] was not found';
                    else {
                        if (params.hasOwnProperty('value')) value = params.value;
                    }

                    var itemFound = cdb.filter(function(item){ return item[key] == value; });
                    
                    var result = {
                        items: itemFound,
                        count: itemFound.length
                    };

                    resolve(result);
                    
                } catch (err) {
                    var msg = (err.hasOwnProperty('message')) ? err.message : err;
                    reject(new Error( msg ));
                }
                
            });
            
        },
        
        first: function first(params) {
            
            return new Promise(function(resolve, reject) {
                try {
                    // >> Validations <<

                    // default param array
                    params  = params || {};

                    var key   = null,
                        value = null;

                    // item key prop
                    if (!params.hasOwnProperty('key'))
                        throw 'Key => [key] was not found';
                    else {
                        if (params.hasOwnProperty('key')) key = params.key;
                    }

                    // item value prop
                    if (!params.hasOwnProperty('value') )
                        throw 'Key => [value] was not found';
                    else {
                        if (params.hasOwnProperty('value')) value = params.value;
                    }

                    var itemFound = cdb.filter(function(item){ return item[key] == value; });
                    var result = {
                        item: (itemFound.length > 0) ? itemFound[0] : null,
                        count: itemFound.length
                    };

                    resolve(result);
                    
                } catch (err) {
                    var msg = (err.hasOwnProperty('message')) ? err.message : err;
                    reject(new Error( msg ));
                }
                
            });
            
        },
        
        add: function add(params) {
            
            return new Promise(function(resolve, reject) {
                
                try {
                    // >> Validations <<

                    // default param array
                    params = params || {};
                    
                    if (!params.hasOwnProperty('isHistoryNeeded'))
                        params.isHistoryNeeded = true;
                    
                    // item key prop
                    if (!params.hasOwnProperty('item'))
                        throw 'Key => [item] was not found';

                    // add
                    if (!Array.isArray(params.item)) {
                        //>> add Object
                        if (!params.item.hasOwnProperty('cuid')) params.item.cuid = cuid();
                        // Added
                        cdb.push(params.item);
                        // Change Feed
                        if (changeFeedCB != undefined) { 
                            setTimeout(function() {
                                changeFeedCB({ old: null, new: params.item, action: 'Inserted' }); 
                            }, callbackTimer);
                        }
                        // History
                        if (bufferHistory > 0 && params.isHistoryNeeded) { 
                            addHistory({ item: clone(params.item), new: clone(params.item), action: 'Inserted', isArray: false });
                        }
                        
                        // Resolve
                        resolve([{ old: null, new: params.item, action: 'Inserted' }]);

                    } else if (Array.isArray(params.item)){
                        //>> Track Additions
                        var newItems        = [];
                        //>> add Array
                        params.item.forEach(function(item) {
                            if (!item.hasOwnProperty('cuid')) item.cuid = cuid();
                            // Added
                            cdb.push(item);
                            newItems.push({ old: null, new: item, action: 'Inserted' });
                            
                            // Change Feed
                            if (changeFeedCB != undefined) {
                                setTimeout(function() {
                                    changeFeedCB({ old: null, new: item, action: 'Inserted' }); 
                                }, callbackTimer);
                            }
                        });
                        
                        // History
                        if (bufferHistory > 0 && params.isHistoryNeeded) { 
                            addHistory({ item: clone(newItems), action: 'Inserted', isArray: true });
                        }
                        
                        // Resolve
                        resolve([{ old: null, new: newItems, action: 'Inserted' }]);

                    } else {
                        throw 'item parameter should correspond to an Object or Array.';
                    }
                    
                } catch (err) {
                    var msg = (err.hasOwnProperty('message')) ? err.message : err;
                    reject(new Error( msg ));
                }
                
            });
            
            return this;
        },
        
        del: function del(params) {
            
            var $this = this;
            
            return new Promise(function(resolve, reject) {
                try {
                    // >> Validations <<
                    // default param array
                    params  = params || {};
                    
                    if (!params.hasOwnProperty('isHistoryNeeded'))
                        params.isHistoryNeeded = true;

                    var key   = null,
                        value = null;

                    // item key prop
                    if (!params.hasOwnProperty('key'))
                        throw 'Key => [key] was not found';
                    else {
                        if (params.hasOwnProperty('key')) key = params.key;
                    }

                    // item value prop
                    if (!params.hasOwnProperty('value') )
                        throw 'Key => [value] was not found';
                    else {
                        if (params.hasOwnProperty('value')) value = params.value;
                    }

                    var itemsFound = cdb.filter(function(item){ return item[key] == value; });
                    
                    //>> Track Deletions
                    var delItems = [];
                    var delItem  = null;
                    
                    for (var i = 0; i < itemsFound.length; i++) {

                        var item    = cdb.filter(function(item){ return item[key] == value; });
                        var index   = cdb.map(function(item){ return item[key]; }).indexOf(value);

                        if (index >= 0) {
                            cdb.splice(index, 1); 
                        }
                        
                        var itemDeleted = (Array.isArray(item)) ? item[0] : item;
                        
                        // Change Feed
                        if (changeFeedCB != undefined) { 
                            setTimeout(function() {
                                changeFeedCB({ old: itemDeleted, new: null, action: 'Deleted' }); 
                            }, callbackTimer);
                        }

                        if ( bufferHistory > 0 && itemsFound.length == 1 ) {
                            delItem = clone(itemDeleted);
                        }
                        
                        delItems.push({ old: itemDeleted, new: null, action: 'Deleted' });
                    }
                
                    // History
                    if (bufferHistory > 0 && params.isHistoryNeeded) { 
                        if (delItems.length > 1) {
                            addHistory({ item: clone(delItems), old: clone(delItems), action: 'Deleted', isArray: true });
                            
                        } else {
                            addHistory({ item: clone([delItem]), old: clone(delItem), action: 'Deleted', isArray: false });
                        }
                    }
                    
                    resolve(delItems);

                } catch (err) {
                    var msg = (err.hasOwnProperty('message')) ? err.message : err;
                    reject(new Error( msg ));
                }
                
            });
            
            return this;
        },
        
        db: function db() {
            
            return new Promise(function(resolve, reject) {
                try {
                    resolve(cdb);
                } catch (err) {
                    var msg = (err.hasOwnProperty('message')) ? err.message : err;
                    reject(new Error( msg ));
                }
            });
            
            return this;
        },
        
        update: function update(params) {
            
            var $this = this;
            
            return new Promise(function(resolve, reject) {
                try {
                    // >> Validations <<
                    
                    // default param array
                    params                  = params || {};
                    
                    if (!params.hasOwnProperty('isHistoryNeeded'))
                        params.isHistoryNeeded = true;

                    var key   = null,
                        value = null;

                    // item key prop
                    if (!params.hasOwnProperty('key'))
                        throw 'Key => [key] was not found';
                    else {
                        if (params.hasOwnProperty('key')) key = params.key;
                    }

                    // item value prop
                    if (!params.hasOwnProperty('value') )
                        throw 'Key => [value] was not found';
                    else {
                        if (params.hasOwnProperty('value')) value = params.value;
                    }

                    // item key prop
                    if (!params.hasOwnProperty('item'))
                        throw 'Key => [item] was not found';
                    
                    var itemsUpdated        = [];
                    var itemFound           = [];
                    var isArray             = false;
                    
                    $this.get({ key: key, value: value})
                        .then(function(itemsFound) {
                            
                            // Check if items found is an array or not
                            isArray = (itemsFound.count > 1) ? true : false;
                        
                            itemsFound.items.forEach(function(dbItem){
                                
                                updateProps(params.item, dbItem)
                                    .then(function(result){
                                                
                                        // Change Feed
                                        if (changeFeedCB != undefined) { 
                                            setTimeout(function() {
                                                changeFeedCB({ old: result.before, new: result.after, action: 'Updated' }); 
                                            }, callbackTimer);
                                        }
                                    
                                        // Append to Updated Items
                                        var item = { old: result.before, new: result.after, action: 'Updated' };
                                        itemsUpdated.push(item);
                                        
                                        if (bufferHistory > 0 && params.isHistoryNeeded && !isArray) { 
                                            itemFound = clone(item);
                                        }
                                    })
                                    .catch(function(err) { throw err; });
                            });
                        
                        })
                        .then(function(){
                            // History
                            if (bufferHistory > 0 && params.isHistoryNeeded) { 
                                if (!isArray) {
                                    addHistory({ item: clone(itemFound), old: clone(itemFound.old), 
                                                  new: clone(itemFound.new), action: 'Updated', isArray: false });
                                } else if (isArray) {
                                    addHistory({ item: clone(itemsUpdated), old: null, new: null, action: 'Updated', isArray: true });
                                }
                            }
                        
                        })
                        .then(function(){
                            resolve(itemsUpdated);
                        })
                        .catch(function(err) { throw err; });
                    
                    

                } catch (err) {
                    var msg = (err.hasOwnProperty('message')) ? err.message : err;
                    reject(new Error( msg ));
                }
                
            });
        
        },

        clone: function clone() {
            return new Promise(function(resolve, reject) {
                try {
                    resolve(JSON.parse(JSON.stringify(cdb)));
                } catch (err) {
                    var msg = (err.hasOwnProperty('message')) ? err.message : err;
                    reject(new Error( msg ));
                }
            });
        },
        
        clean: function clean(params) {
            
            return new Promise(function(resolve, reject) {
                try {
                    
                    params = params || {};
                    
                    if (!params.hasOwnProperty('isHistoryNeeded'))
                        params.isHistoryNeeded = true;
                    
                    var cdbTemp = null;
                    if (bufferHistory > 0)
                        cdbTemp = clone(cdb);
                    
                    cdb = [];
                    
                    // Change Feed
                    if (changeFeedCB != undefined) { 
                        setTimeout(function() {
                            changeFeedCB({ old: null, new: null, action: 'Cleaned' }); 
                        }, callbackTimer);
                    }
                    
                    // History
                    if (bufferHistory > 0 && params.isHistoryNeeded) { 
                        addHistory({ item: cdbTemp, action: 'Cleaned', isArray: true });
                    }
                    
                    // Resolve
                    resolve([{ old: null, new: null, action: 'Cleaned' }]);
                } catch (err) {
                    var msg = (err.hasOwnProperty('message')) ? err.message : err;
                    reject(new Error( msg ));
                }
            });
        
        },
        
        setCbTimer: function setCbTimer(timer) {
            if (typeof timer === "number")
                callbackTimer = timer;
            else
                throw 'timer should be numeric.';
        },
        
        changeFeedHistory: function changeFeedHistory(fn) {
            
            // Validate it is a function
            if (typeof fn === 'function') { 
                changeFeedHCB = fn; 
            } else {
                throw 'Invalid change Feed History function.';
            }
                
		},
        
        setBufferHistory: function setBufferHistory(buffer) {
            if (typeof buffer === "number")
                bufferHistory = buffer;
            else
                throw 'buffer should be numeric.';
        },
        
        cleanHistory: function cleanHistory() {
            
            return new Promise(function(resolve, reject) {
                try {
                    
                    cdbHistory = [];
                    
                    var singleItem = { item: [{ old: null, new: null, action: 'Cleaned', hcuid: cuid() }],
                                   action: 'Cleaned',  hcuid: cuid() };
                    
                    // Change Feed
                    if (changeFeedHCB != undefined) { 
                        setTimeout(function() {
                            changeFeedHCB(singleItem);
                        }, callbackTimer);
                    }
                    
                    // Resolve
                    resolve([{ old: null, new: null, action: 'Cleaned' }]);
                } catch (err) {
                    var msg = (err.hasOwnProperty('message')) ? err.message : err;
                    reject(new Error( msg ));
                }
            });
        
        },
        
        history: function history() {
            
            return new Promise(function(resolve, reject) {
                try {
                    resolve(cdbHistory);
                } catch (err) {
                    var msg = (err.hasOwnProperty('message')) ? err.message : err;
                    reject(new Error( msg ));
                }
            });
            
            return this;
        },
        
        undo: function undo(params) {
            
            return new Promise(function(resolve, reject){
                try {
                    // >> Validations <<

                    // default param array
                    params          = params || {};
                    params.hicuid   = params.hicuid || null;
                    
                    // item key prop
                    if (!params.hasOwnProperty('hcuid'))
                        throw 'Key => [hcuid] was not found.';
                    
                    if (cdbHistory.length === 0)
                        throw 'The history is empty.';
                    
                    var hItem = null;
                    if (params.hicuid === null) {
                        hItem = cdbHistory.filter(function(hitem){ return hitem.hcuid == params.hcuid;  });
                    } else {
                        hItem = cdbHistory.filter(function(hitem){ return hitem.hcuid == params.hcuid })
                                          [0].item
                                          .filter(function(hitem){ return hitem.hcuid == params.hicuid });
                    }
                    
                    // Validate filter output
                    if (hItem.length == 0)
                        throw 'No history item found.';
                    
                    // Standard Query for Array and Single Elements
                    hItem = hItem[0];
                    hItem = (hItem.hasOwnProperty('item')) ? hItem : { item: [hItem] };
                    
                    hItem.item.forEach(function(item) {
                        // UNDO INSERT
                        if (item.action === 'Inserted') {
                            resolve(coolDB.del({ key: 'cuid', value: item.new.cuid, isHistoryNeeded: false })._result);
                        } 
                        // UNDO UPDATE
                        else if (item.action === 'Updated') {
                            resolve(coolDB.update({ key: 'cuid', value: item.old.cuid,  
                                                    item : item.old,
                                                    isHistoryNeeded: false })._result);
                        }
                        // UNDO DELETE
                        else if (item.action === 'Deleted') {
                            resolve(coolDB.add({ item : item.old, isHistoryNeeded: false })._result);
                        }
                        // UNDO CLEANED
                        else if (item.action === 'Cleaned') {
                            resolve(coolDB.add({ item : item.old, isHistoryNeeded: false })._result);
                            return;
                        }
                    });
                    
                } catch (err) {
                    var msg = (err.hasOwnProperty('message')) ? err.message : err;
                    reject(new Error( msg ));
                }
            });
        }
        
    };
    
};

module.exports = cooldb;
}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_49b2ab5b.js","/")
},{"buffer":4,"clone":1,"cuid":2,"es6-promise":3,"lazy.js":8,"oMfpAn":7}]},{},[9])