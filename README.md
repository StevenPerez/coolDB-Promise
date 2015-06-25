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
## Methods
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
// Sync
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
