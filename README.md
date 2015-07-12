# coolDB-Promise
This is a lightweight library for Client | Server which helps the CRUD actions in memory over objects / data stored in an internal JS Array using Promise.

<br />
## Implementation

#### Browser
``` html
<script src="dist/browser-cooldb.js"></script>
```
``` javascript
var cooldb = cooldb,
    coolDB = cooldb();
```

#### Node
```
npm install cooldb-promise
```
``` javascript
var cooldb 	= require('cooldb-promise'),
	coolDB 	= cooldb();
```
<br />
#### CoolDB and Global Scope Libraries
This library contains dependencies from the objects: Axios, Clone, Cuid and Lazy JS, in the other hand, it contains non-dependencies from the objects: jQuery and Validate. The reason why I did include all of those (dependencies & non-dependencies) objects, it is because most of the times I use those libraries and I would like to avoid to implement individual JS files which impacts the loading performance of the page. However in order to use those libraries in global scope, you will need to activate using a method included in the version 2.x, in this way, you can avoid libraries conflicts with just choose the libraries you would like to activate.

``` javascript
// Activate Individual Libraries
coolDB.activeGlobalLibs({ libs: ['Axios', 'Clone', 'Cuid', 'jQuery', 'Lazy', 'Validate'] });

// Activate All Libraries
coolDB.activeGlobalLibs({ libs: ['All'] });
```
<strong>Note:</strong> The compression was made using packer so the cooldb library has a size of 150.8kb (min).
<br />
# API
<br />
### add
Add an object / array to the internal cooldb Array. It also includes automatically an unique id to each object through [CUID by Eric Elliot](https://github.com/ericelliott/cuid).
```
function add(params)
params: { item (Object / Array) }
returns: Array => [ Object {old: null, new: Object, action: "Inserted"}, ... ]
```
``` javascript
// *** Insert Single ***
coolDB.add({ item: { name: 'Mary' } })
    .then(function(result) {
        console.log(result);
    })
    .catch(function(err) {
        console.log(err);
    });

// *** Insert Multiple ***
coolDB.add({ item: [{ name: 'Blue' }, { name: 'Trunk' }, { name: 'Blue'}] })
    .then(function(result) {
        console.log(result);
    })
    .catch(function(err) {
        console.log(err);
    });

```
### del
Delete the items where a key + value match with the items stored inside the cooldb Array
```
function del(params)
params: { key (Property name) | value (Property value) }
returns: Array => [ Object {old: Object, new: null, action: "Deleted"}, ... ]
```
``` javascript
// *** Delete Single & Multiple ***
coolDB.del({ key: 'name', value: 'Pacman' })
    .then(function(result) {
        console.log(result);
    })
    .catch(function(err) {
        console.log(err);
    });

```
### update
Update the items where a key + value match with the items stored inside the cooldb Array
```
function update(params)
params: { key (Property name) | value (Property value) | item (New Property values) }
returns: Array => [ Object {old: Object, new: Object, action: "Updated"}, ... ]
```
``` javascript
// *** Update Single ***
coolDB.update({ key: 'name', value: 'Mary', item: { name: 'Pingui' } })
    .then(function(result) {
        console.log(result);
    })
    .catch(function(err) {
        console.log(err);
    });

// *** Update Multiple ***
coolDB.update({ key: 'name', value: 'Blue', item: { name: 'Pacman' } })
    .then(function(result) {
        console.log(result);
    })
    .catch(function(err) {
        console.log(err);
    });

```
### first
Return the first item where a key + value match with the items stored inside the cooldb Array
```
function first(params)
params: { key (Property name) | value (Property value) }
returns: Object { item (First object found) | count (Number of objects found) }
```
``` javascript
coolDB.first({ key:'name', value: 'Blue'})
    .then(function(result) {
        console.log(result);
    })
    .catch(function(err) {
        console.log(err);
    });

```
### get
Get the items where a key + value match with the items stored inside the cooldb Array
```
function get(params)
params: { key (Property name) | value (Property value) }
returns: Object { items (Array of objects found) | count (Number of objects found) }
```
``` javascript
coolDB.get({ key:'name', value: 'Blue'})
    .then(function(result) {
        console.log(result);
    })
    .catch(function(err) {
        console.log(err);
    });

```
### db
Get the cooldb Array Mirror.
```
function db()
returns: Array
```
``` javascript
coolDB.db()._result; // [Object, Object, Object, Object]

```
### clone
Get the cooldb Array Clone.
```
function clone()
returns: Array
```
``` javascript
coolDB.clone()._result; // [Object, Object, Object, Object]

```
### clean
Reset to empty Array the internal cooldb Array.
```
function clean()
returns: Array => [ Object {old: null, new: null, action: "Cleaned"} ]
```
``` javascript
coolDB.clean()._result;

```
### changeFeed
Subscribe to the internal cooldb Array's CRUD change events.
```
function changeFeed(fn)
returns: Object
```
``` javascript
coolDB.changeFeed(function(change){
    console.log(change);
    // Object {old: null, new: Object, action: "Inserted"}
    // Object {old: Object, new: null, action: "Deleted"}
    // Object {old: Object, new: Object, action: "Updated"}
    // Object {old: null, new: null, action: "Cleaned"}
});

```
<br />
## History
### Introduction
CoolDB-Promise performs CRUD actions over an internal array, however it contains methods that helps you to store 'X' number of changes in an internal secondary History array, each action has its own id (hcuid) or history cuid, so you can <strong>UNDO</strong> <i>CRUD</i> actions by:
<ul>
<li>Entire action: Undo <strong>all</strong> the item(s) contained in a history record.<br/>(param -> hcuid [ history cuid ]).</li>
<li>Item action: Undo the action over an <strong>specific item</strong> contained in history record.<br/>(param -> hcuid [ history cuid ] + hicuid [ history item cuid ]).</li>
</ul>
<br />
<strong>Note:</strong>History is activated once you set the History Buffer through setBufferHistory(X) method where X is the number of history records that will be able to <strong>Undo.</strong>. This option is just available for <i>plain objects</i>, it uses the clone module available in npm.
<br />

### history
Get the cooldb History Array Mirror.
```
function history()
returns: Array
```
``` javascript
coolDB.history()._result; // [Object, Object, Object, Object]

```
<br />
### setBufferHistory
Set the X number of History changes to be tracked.
```
function setBufferHistory(buffer)
returns: number
```
``` javascript
// Sync
coolDB.setBufferHistory(3); // Example of a buffer for three history changes

```
<br />
### Undo multiple insert types
Examples:
```
function undo(params)
params: { hcuid, hicuid }
returns: Standard Object according to the action => {old: ?, new: ?, action: ?}
```
#### Undo simple insert
``` javascript
function displayDbItems(){
         console.log('DB ITEMS');
         console.log( clone(coolDB.db()._result) );
         return coolDB.history()._result[0];  
}

function UndoSpecific(item){

    coolDB.undo({ hcuid: item.hcuid })
            .then(function(hItem){ 
                console.log('RESULT -> DB UNDO INSERT');
                console.log( coolDB.db()._result );
            })
            .catch(function(err){
                console.log(err);
            });
}

coolDB.add({ item: { name: 'Jhon' } })
         .then(displayDbItems)
         .then(UndoSpecific)
         .catch(function(err){
            console.log(err);
        });

```
#### Undo all inserts
``` javascript
function displayDbItems(){
         console.log('DB ITEMS');
         console.log( clone(coolDB.db()._result) );
         return coolDB.history()._result[0];  
}

function UndoSpecific(item){
    
    coolDB.undo({ hcuid: item.hcuid })
            .then(function(hItem){ 
                console.log('RESULT -> DB UNDO BUNCH OF INSERTS ');
                console.log( coolDB.db()._result );
            })
            .catch(function(err){
                console.log(err);
            });
}

coolDB.add({ item: [{ name: 'Jhon' }, { name: 'Jane' }] })
         .then(displayDbItems)
         .then(UndoSpecific)
         .catch(function(err){
            console.log(err);
         });

```
#### Undo specific insert from bunch
``` javascript
function displayDbItems(){
    console.log('DB ITEMS');
    console.log( clone(coolDB.db()._result) );
    return coolDB.history()._result[0];  
}

function UndoSpecificFromBunch(item){

    coolDB.undo({ hcuid: item.hcuid, hicuid: item.item[0].hcuid })
            .then(function(hItem){ 
                console.log('RESULT -> DB UNDO INSERT OVER A SPECIFIC ITEM');
                console.log( coolDB.db()._result );
            })
            .catch(function(err){
                console.log(err);
            });
}

coolDB.add({ item: [{ name: 'Jhon' }, { name: 'Jane' }] })
        .then(displayDbItems)
        .then(UndoSpecificFromBunch)
        .catch(function(err){
            console.log(err);
        });

```
<br />
### Undo multiple update types
Examples:
```
function undo(params)
params: { hcuid, hicuid }
returns: Standard Object according to the action => {old: ?, new: ?, action: ?}
```
#### Undo simple update
``` javascript
function displayDbItems(){
    console.log('DB ITEMS');
    console.log( clone(coolDB.db()._result) );
    
    return clone(coolDB.db()._result[0]);
}

function changeJhon(item) {
    coolDB.update({ key: 'cuid', value: item.cuid, item: { name: 'Yolo'} })
          .then(function(item){
            console.log('RESULT -> DB ITEM UPDATE');
            console.log( clone(item[0].new ) );                
          });
}

function UndoSpecific(){
    
    coolDB.history().then(function(item){
    
        coolDB.undo({ hcuid: item[1].hcuid })
                .then(function(hItem){ 
                    console.log('RESULT -> DB UNDO UPDATE');
                    console.log( coolDB.db()._result );
                })
                .catch(function(err){
                    console.log(err);
                });
    });
    
coolDB.add({ item: { name: 'Jhon' } })
        .then(displayDbItems)
        .then(changeJhon)
        .then(UndoSpecific)
        .catch(function(err){
            console.log(err);
        });

```
#### Undo all updates
``` javascript
function displayDbItems(){
    console.log('DB ITEMS');
    console.log( clone(coolDB.db()._result) );
    
    return clone(coolDB.db()._result[0]);
}

function changeByAge(item) {
    coolDB.update({ key: 'age', value: 20, item: { name: 'Yolo'} })
          .then(function(item){
            console.log('RESULT -> DB ITEM UPDATE');
            console.log( clone(item ) );                
          });
}

function UndoSpecific(){
    
    coolDB.history().then(function(item){
        
        coolDB.undo({ hcuid: item[1].hcuid })
                .then(function(hItem){ 
                    console.log('RESULT -> DB UNDO UPDATE');
                    console.log( coolDB.db()._result );
                })
                .catch(function(err){
                    console.log(err);
                });

    });
}

coolDB.add({ item: [{ name: 'Jhon', age: 20 }, { name: 'Jane', age: 20 }] })
        .then(displayDbItems)
        .then(changeByAge)
        .then(UndoSpecific)
        .catch(function(err){
            console.log(err);
        });

```
#### Undo specific update from bunch
``` javascript
function displayDbItems(){
    console.log('DB ITEMS');
    console.log( clone(coolDB.db()._result) );
    
    return clone(coolDB.db()._result[0]);
}

function changeByAge(item) {
    coolDB.update({ key: 'age', value: 20, item: { name: 'Yolo'} })
          .then(function(item){
            console.log('RESULT -> DB ITEM UPDATE');
            console.log( clone(item ) );                
          });
}

function UndoSpecificFromBunch(){
    
    coolDB.history()
          .then(function(item){
        
            coolDB.undo({ hcuid: item[1].hcuid, hicuid: item[1].item[1].hcuid })
                    .then(function(hItem){ 
                        console.log('RESULT -> DB UNDO UPDATE OVER A SPECIFIC ITEM');
                        console.log( coolDB.db()._result );
                    })
                    .catch(function(err){
                        console.log(err);
                    });
        });
}

coolDB.add({ item: [{ name: 'Jhon', age: 20 }, { name: 'Jane', age: 20 }] })
        .then(displayDbItems)
        .then(changeByAge)
        .then(UndoSpecificFromBunch)
        .catch(function(err){
            console.log(err);
        });

```
<br />
### Undo multiple delete types
Examples:
```
function undo(params)
params: { hcuid, hicuid }
returns: Standard Object according to the action => {old: ?, new: ?, action: ?}
```
#### Undo simple delete
``` javascript
function deleteItem() {
    var item = coolDB.db()._result[0];
    coolDB.del({ key: 'cuid', value: item.cuid })
          .catch(function(err){
            console.log(err);
          });
    
    return clone(item);
}

function displayDbItems(){
    console.log('DB ITEMS');
    console.log( clone(coolDB.db()._result) );
    return coolDB.history()._result[1];  
}

function UndoSpecific(item){

    // Undo Specific Item from a bunch of Inserts
    coolDB.undo({ hcuid: item.hcuid })
            .then(function(hItem){ 
                console.log('RESULT -> DB UNDO DELETE');
                console.log( coolDB.db()._result );
            })
            .catch(function(err){
                console.log(err);
            });
}

coolDB.add({ item: { name: 'Jhon' } })
        .then(deleteItem)
        .then(displayDbItems)
        .then(UndoSpecific)
        .catch(function(err){
            console.log(err);
        });

```
#### Undo all deletes
``` javascript
function deleteItem() {
    var item = coolDB.db()._result[0];
    coolDB.del({ key: 'age', value: 20 })
          .catch(function(err){
            console.log(err);
          });
    
    return clone(item);
}

function displayDbItems(){
    console.log('DB ITEMS');
    console.log( clone(coolDB.db()._result) );
    return coolDB.history()._result[1];  
}

function UndoSpecific(item){

    coolDB.undo({ hcuid: item.hcuid })
            .then(function(hItem){ 
                console.log('RESULT -> DB UNDO DELETES');
                console.log( coolDB.db()._result );
            })
            .catch(function(err){
                console.log(err);
            });
}

coolDB.add({ item: [{ name: 'Jhon', age: 20 }, { name: 'Jane', age: 20 }] })
        .then(deleteItem)
        .then(displayDbItems)
        .then(UndoSpecific)
        .catch(function(err){
            console.log(err);
        });

```
#### Undo specific delete from bunch
``` javascript
function deleteItem() {
    var item = coolDB.db()._result[0];
    coolDB.del({ key: 'age', value: 20 })
          .catch(function(err){
            console.log(err);
          });
    
    return clone(item);
}

function displayDbItems(){
    console.log('DB ITEMS');
    console.log( clone(coolDB.db()._result) );
    return coolDB.history()._result[1];  
}

function UndoSpecific(item){

    coolDB.undo({ hcuid: item.hcuid, hicuid: item.item[1].hcuid })
            .then(function(hItem){ 
                console.log('RESULT -> DB UNDO SPECIFIC DELETE');
                console.log( coolDB.db()._result );
            })
            .catch(function(err){
                console.log(err);
            });
}

coolDB.add({ item: [{ name: 'Jhon', age: 20 }, { name: 'Jane', age: 20 }] })
        .then(deleteItem)
        .then(displayDbItems)
        .then(UndoSpecific)
        .catch(function(err){
            console.log(err);
        });

```

<br />
### Undo clean delete types
Examples:
```
function undo(params)
params: { hcuid, hicuid }
returns: Standard Object according to the action => {old: ?, new: ?, action: ?}
```
#### Undo simple internal array clean
``` javascript
function UndoSpecific(){
    
    coolDB.undo({ hcuid: coolDB.history()._result[1].hcuid })
            .then(function(hItem){ 
                console.log('RESULT -> DB UNDO CLEAN');
                console.log( coolDB.db()._result );
            })
            .catch(function(err){
                console.log(err);
            });
}

coolDB.add({ item: [{ name: 'Jhon', age: 20 }, { name: 'Jane', age: 20 }] })
        .then(coolDB.clean)
        .then(UndoSpecific)
        .catch(function(err){
            console.log(err);
        });

```
#### Undo specific clean from bunch
``` javascript
function UndoSpecific(){
    var item = coolDB.history()._result[1];
    
    coolDB.undo({ hcuid: item.hcuid, hicuid: item.item[1].hcuid })
            .then(function(hItem){ 
                console.log('RESULT -> DB UNDO SPECIFIC CLEAN');
                console.log( coolDB.db()._result );
            })
            .catch(function(err){
                console.log(err);
            });
}

coolDB.add({ item: [{ name: 'Jhon', age: 20 }, { name: 'Jane', age: 20 }] })
        .then(coolDB.clean)
        .then(UndoSpecific)
        .catch(function(err){
            console.log(err);
        });

```
<br />
### Clean History
Examples:
```
function cleanHistory()
returns: Object => {old: null, new: null, action: 'Cleaned'}
```
``` javascript
function cleanHistory() {
    console.log('HISTORY ITEMS');
    console.log( clone(coolDB.history()._result) );
    
    coolDB.cleanHistory();
    
    console.log('AFTER HISTORY CLEAN');
    console.log( coolDB.history()._result );
}

coolDB.add({ item: [{ name: 'Jhon', age: 20 }, { name: 'Jane', age: 20 }] })
        .then(cleanHistory)
        .catch(function(err){
            console.log(err);
        });

```
<br />
### changeFeedHistory
Subscribe to the internal cooldb Array's History events.
```
function changeFeedHistory(fn)
returns: Object
```
``` javascript
coolDB.changeFeedHistory(function(change){
    console.log(change);
    // { item: [{ old: ?, new: ?, action: ?, hcuid: CUID }], action: X,  hcuid: CUID }
    // action => "Inserted" | "Deleted" | "Updated" | "Cleaned".
    // ?      => Object / Array
});

```
<br />
## Ajax
### Introduction
CoolDB-Promise provides an easy way to send items via post / get requests to the server using the axios module, in this way, just specify the url, cuid and json (defaul false) to send a non history plain object by cuid.
<br />
### postCuid
Ajax post request, send an internal non history item to the server by cuid.
```
function postCuid({ url | cuid | json (default false) })
returns: Ajax server response
```
``` javascript
// Example:
function postCuidDemo() {
    
    var itemCuid = coolDB.db()._result[0].cuid;
    
    coolDB.postCuid({ url: '/postUrl', cuid: itemCuid, json: false }) 
          .then(function(success){
            console.log( success );
          })
          .catch(function(err){
            console.log( err );
          });
}

coolDB.add({ item: [{ name: 'Jhon', age: 20 }, { name: 'Jane', age: 20 }] })
        .then(postCuidDemo)
        .catch(function(err){
            console.log(err);
        });

```
<br />
### getCuid
Ajax get request, send an internal non history item to the server by cuid.
```
function getCuid({ url | cuid | json (default false) })
returns: Ajax server response
```
``` javascript
// Example:
function getCuidDemo() {
    
    var itemCuid = coolDB.db()._result[0].cuid;

    coolDB.getCuid({ url: '/getUrl', cuid: itemCuid, json: false }) 
          .then(function(success){
            console.log( success );
          })
          .catch(function(err){
            console.log( err );
          });
}

coolDB.add({ item: [{ name: 'Jhon', age: 20 }, { name: 'Jane', age: 20 }] })
        .then(getCuidDemo)
        .catch(function(err){
            console.log(err);
        });

```
