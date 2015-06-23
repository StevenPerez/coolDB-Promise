var cuid        = require('cuid'),
    pPolyfill   = require('es6-promise').polyfill(),
    Promise     = require('es6-promise').Promise,
    lazy        = require('lazy.js'),
    copy        = require('deepcopy');

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

                // Check history buffer
                if (cdbHistory.length > bufferHistory) {
                    lazy(cdbHistory).shift();
                }
                
                // add
                if (!Array.isArray(params.item)) {
                    console.log('NOT ARRAY');
                    //>> add hcuid Property
                    if (!params.item.hasOwnProperty('hcuid')) params.item.hcuid = cuid();

                    // Added
                    cdbHistory.push({ item: params.item, action: 'Inserted', isArray: false });

                    // Change Feed
                    if (changeFeedHCB != undefined) { 
                        setTimeout(function() {
                            changeFeedHCB({ item: params.item, action: 'Inserted', isArray: true }); 
                        }, 0);
                    }

                    // Job Done !
                    resolve({ item: params.item, action: 'Inserted', isArray: false });

                } else if (Array.isArray(params.item)){
                    console.log('ARRAY');
                    //>> Track Additions
                    var newItems = [];
                    //>> add Array
                    params.item.forEach(function(item) {
                        if (!item.hasOwnProperty('hcuid')) item.hcuid = cuid();
                        // Added
                        newItems.push(item);
                    });
                    
                    // Added
                    cdbHistory.push({ item: newItems, action: 'Inserted', isArray: true });
                    
                    // Change Feed
                    if (changeFeedHCB != undefined) { 
                        setTimeout(function() {
                            changeFeedHCB({ item: newItems, action: 'Inserted', isArray: true }); 
                        }, 0);
                    }
                    // Job Done !
                    resolve({ item: newItems, action: 'Inserted', isArray: true });

                } else {
                    throw '[History] -> item parameter should correspond to an Object or Array.';
                }

            } catch (err) {
                var msg = (err.hasOwnProperty('message')) ? err.message : err;
                reject(new Error( msg ));
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
                    params  = params || {};

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
                            }, 0);
                        }
                        // History
                        if (bufferHistory > 0 ) { 
                            setTimeout(function() {
                                addHistory({ item: copy(params.item) }); 
                            }, 0);
                        }
                        // Resolve
                        resolve([{ old: null, new: params.item, action: 'Inserted' }]);

                    } else if (Array.isArray(params.item)){
                        //>> Track Additions
                        var newItems = [];
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
                                }, 0);
                            }
                        });
                        
                        // History
                        if (bufferHistory > 0 ) { 
                            setTimeout(function() {
                                addHistory({ item: copy(newItems) }); 
                            }, 0);
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
                            }, 0);
                        }

                        delItems.push({ old: itemDeleted, new: null, action: 'Deleted' });
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

                    // item key prop
                    if (!params.hasOwnProperty('item'))
                        throw 'Key => [item] was not found';
                    
                    var itemsUpdated = [];
                    
                    $this.get({ key: key, value: value})
                        .then(function(itemsFound) {
                            
                            itemsFound.items.forEach(function(dbItem){
                                
                                updateProps(params.item, dbItem)
                                    .then(function(result){
                                                
                                        // Change Feed
                                        if (changeFeedCB != undefined) { 
                                            setTimeout(function() {
                                                changeFeedCB({ old: result.before, new: result.after, action: 'Updated' }); 
                                            }, 0);
                                        }
                                        // Append to Updated Items
                                        itemsUpdated.push({ old: result.before, new: result.after, action: 'Updated' });
                                    })
                                    .then(function() { resolve(itemsUpdated) })
                                    .catch(function(err) { throw err; });
                            });
                        
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
        
        clean: function clean() {
            
            return new Promise(function(resolve, reject) {
                try {
                    cdb = [];
                    // Change Feed
                    if (changeFeedCB != undefined) { 
                        setTimeout(function() {
                            changeFeedCB({ old: null, new: null, action: 'Cleaned' }); 
                        }, 0);
                    }
                    // Resolve
                    resolve([{ old: null, new: null, action: 'Cleaned' }]);
                } catch (err) {
                    var msg = (err.hasOwnProperty('message')) ? err.message : err;
                    reject(new Error( msg ));
                }
            });
        
        },
        
        changeFeedHistory: function changeFeedHistory(fn) {
            
            // Validate it is a function
            if (typeof fn === 'function') { 
                changeFeedHCB = fn; 
            } else {
                throw 'Invalid change Feed History function.';
            }
                
		},
        
        setHistory: function setHistory(buffer) {
            if (typeof buffer === "number")
                bufferHistory = buffer;
            else
                throw 'buffer should be numeric.';
        },
        
        history: function history() {
            
            return new Promise(function(resolve, reject) {
                try {
                    cdbHistory.push({});
                    lazy(cdbHistory).shift();
                    resolve(cdbHistory);
                } catch (err) {
                    var msg = (err.hasOwnProperty('message')) ? err.message : err;
                    reject(new Error( msg ));
                }
            });
            
            return this;
        },
        
    };
    
};

module.exports = cooldb;