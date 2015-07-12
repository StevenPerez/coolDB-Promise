require('es6-promise').polyfill();

var cuid        = require('cuid'),
    Promise     = require('es6-promise').Promise,
    lazy        = require('lazy.js'),
    clone       = require('clone'),
    axios       = require('axios'),
    validate    = require('validate.js'),
    jQuery      = require('jquery'),
    $           = jQuery;

cooldb = function cooldb() {

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

    // >> Production <<

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

    // >> History <<

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
    },

    // >> Ajax <<

    postCuid: function postCuid(params) {

      var $this = this;

      return new Promise(function(resolve, reject) {
        try {

          params      = params || {};
          params.json = params.json || false;

          if (!params.hasOwnProperty('url'))
            throw 'url property not found.';

          if (!params.hasOwnProperty('cuid'))
            throw 'cuid property not found.';

          $this.get({ key: 'cuid', value: params.cuid })
            .then(function(response){

            if (response.count > 0) {

              var item = null;
              if (!params.json)
                item = clone( response.items[0] );
              else
                item = JSON.stringify(clone( response.items[0] ));

              axios.post(params.url, item)
                .then(function(success){ resolve(success); })
                .catch(function(err){ reject(err); });

            } else {
              throw 'No item found for cuid [ ' + params.cuid + ' ]';
            }

          })
            .catch(function(err){
            reject(err);
          });

        } catch (err) {
          var msg = (err.hasOwnProperty('message')) ? err.message : err;
          reject(new Error( msg ));
        }
      });
    },

    getCuid: function getCuid(params) {

      var $this = this;

      return new Promise(function(resolve, reject) {
        try {

          params = params || {};

          if (!params.hasOwnProperty('url'))
            throw 'url property not found.';

          if (!params.hasOwnProperty('cuid'))
            throw 'cuid property not found.';

          $this.get({ key: 'cuid', value: params.cuid })
            .then(function(response){

            if (response.count > 0) {

              var item = null;
              if (!params.json)
                item = clone( response.items[0] );
              else
                item = JSON.stringify(clone( response.items[0] ));

              axios.get(params.url, { params: item })
                .then(function(success){ resolve(success); })
                .catch(function(err){ reject(err); });

            } else {
              throw 'No item found for cuid [ ' + params.cuid + ' ]';
            }

          })
            .catch(function(err){
            reject(err);
          });

        } catch (err) {
          var msg = (err.hasOwnProperty('message')) ? err.message : err;
          reject(new Error( msg ));
        }
      });
    },

    activeGlobalLibs: function activeGlobalLibs(params) {

      params = params || {};

      if (!params.hasOwnProperty('libs'))
        throw 'libs property not found.';

      if (!Array.isArray(params.libs))
        throw 'libs property should be an Array.';

      params.libs.forEach(function (lib){
        if (typeof lib === 'string') {

          switch (lib.toString().toLowerCase()) {
            case 'promise':
              (this.hasOwnProperty('global')) ? global.Promise = Promise : window.Promise = Promise;
              break;
            case 'clone':
              (this.hasOwnProperty('global')) ? global.clone = clone : window.clone = clone;
              break;
            case 'lazy':
              (this.hasOwnProperty('global')) ? global.lazy = lazy : window.lazy = lazy;
              break;
            case 'axios':
              (this.hasOwnProperty('global')) ? global.axios = axios : window.axios = axios;
              break;
            case 'cuid':
              (this.hasOwnProperty('global')) ? global.cuid = cuid : window.cuid = cuid;
              break;
            case 'validate':
              (this.hasOwnProperty('global')) ? global.validate = validate : window.validate = validate;
              break;
            case 'jquery':
              {
                (this.hasOwnProperty('global')) ? global.jQuery = jQuery : window.jQuery = jQuery;
                (this.hasOwnProperty('global')) ? global.$ = $ : window.$ = $;
              }
              
              break;
              
            case 'all':
              {
                (this.hasOwnProperty('global')) ? global.Promise = Promise : window.Promise = Promise;
                (this.hasOwnProperty('global')) ? global.clone = clone : window.clone = clone;
                (this.hasOwnProperty('global')) ? global.lazy = lazy : window.lazy = lazy;
                (this.hasOwnProperty('global')) ? global.axios = axios : window.axios = axios;
                (this.hasOwnProperty('global')) ? global.cuid = cuid : window.cuid = cuid;
                (this.hasOwnProperty('global')) ? global.validate = validate : window.validate = validate;
                (this.hasOwnProperty('global')) ? global.jQuery = jQuery : window.jQuery = jQuery;
                (this.hasOwnProperty('global')) ? global.$ = $ : window.$ = $;
              }
              break;

            default:

          }

        } else {
          throw 'Library list available: ["All", "Axios", "Clone", "Cuid", "Promise", "Lazy", "Validate"]';
        }
      });

    }

  };

};

module.exports = cooldb;
