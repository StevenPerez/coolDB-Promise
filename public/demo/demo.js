var coolDb = cooldb,
    coolDB = coolDb({ libs: ['All'] });

//coolDB.activeGlobalLibs({ libs:['All'] });

coolDB.changeFeed(function(result){
    /*
    console.log('PROD CHANGE FEED');
    console.log(result);
    console.log('=======================');
    */
});

/*
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

// *** get ***
coolDB.get({ key:'name', value: 'Blue'})
    .then(function(result) {
        console.log(result);
    })
    .catch(function(err) {
        console.log(err);
    });

// *** first ***
coolDB.first({ key:'name', value: 'Blue'})
    .then(function(result) {
        console.log(result);
    })
    .catch(function(err) {
        console.log(err);
    });

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

setTimeout( function() {

// *** Delete Single / Multiple ***
coolDB.del({ key: 'name', value: 'Pacman' })
    .then(function(result) {
        console.log(result);
    })
    .catch(function(err) {
        console.log(err);
    });

}, 500);

// Clone
console.log( coolDB.clone()._result );
*/

// Clean
// console.log( coolDB.clean()._result );

// DB
//console.log( coolDB.db()._result );

// HISTORY

coolDB.setBufferHistory(5);

coolDB.changeFeedHistory(function(result){
    console.log('HISTORY CHANGE FEED');
    console.log(result);
    console.log('=======================');
});

/* ADD */
/*
coolDB.add({ item: { name: 'Jhon' } })
    .then(function(result) {

        //console.log( coolDB.db()._result );
        //console.log( coolDB.history()._result );

    })
    .catch(function(err) {
        console.log(err);
    });

coolDB.add({ item: [{ name: 'Mary' }, { name: 'Yorle' }, { name: 'Samantha' } ] })
    .then(function(result) {

        //console.log( coolDB.db()._result );
        //console.log( coolDB.history()._result );

    })
    .catch(function(err) {
        console.log(err);
    });

coolDB.add({ item: { name: 'Jane' } })
    .then(function(result) {

        //console.log( coolDB.db()._result );
        //console.log( coolDB.history()._result );

    })
    .catch(function(err) {
        console.log(err);
    });
*/

/* UPDATE */
/*
coolDB.add({ item: { name: 'Jhon' } })
    .then()
    .then(function (){

            coolDB.update({ key: 'cuid', value: coolDB.db()._result[0].cuid, item: { name: 'abc' } })
                  .then(function(result) {

                    console.log( coolDB.db()._result );
                    console.log( coolDB.history()._result );

                  })
                  .catch(function(err){
                    console.log(err);
                  });

    })
    .catch(function(err) {
        console.log(err);
    });
*/
/* DELETE */
/*
coolDB.add({ item: { name: 'Jhon' } })
    .then()
    .then(function (){

            coolDB.del({ key: 'cuid', value: coolDB.db()._result[0].cuid })
                  .then(function(result) {

                    console.log( coolDB.db()._result );
                    console.log( coolDB.history()._result );

                  })
                  .catch(function(err){
                    console.log(err);
                  });

    })
    .catch(function(err) {
        console.log(err);
    });
*/

/* CLEAN */
/*
coolDB.add({ item: { name: 'Jhon' } })
    .then()
    .then(function (){

            coolDB.clean()
                  .then(function(result) {

                    console.log( coolDB.db()._result );
                    console.log( coolDB.history()._result );

                  })
                  .catch(function(err){
                    console.log(err);
                  });

    })
    .catch(function(err) {
        console.log(err);
    });
*/

/* UNDO */

/* UNDO INSERT */
/*
function displayDbItems(){
    console.log('DB ITEMS');
    console.log( clone(coolDB.db()._result) );
    return coolDB.history()._result[0];
}

function UndoSpecific(item){
    // Undo Specific Item from a bunch of Inserts
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

*/

/* UNDO INSERTS */
/*
function displayDbItems(){
    console.log('DB ITEMS');
    console.log( clone(coolDB.db()._result) );
    return coolDB.history()._result[0];
}

function UndoSpecific(item){
    // Undo Specific Item from a bunch of Inserts
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
*/

/* UNDO SPECIFIC INSERT */
/*
function displayDbItems(){
    console.log('DB ITEMS');
    console.log( clone(coolDB.db()._result) );
    return coolDB.history()._result[0];
}

function UndoSpecificFromBunch(item){
    // Undo Specific Item from a bunch of Inserts
    coolDB.undo({ hcuid: item.hcuid, hicuid: item.item[0].hcuid })
            .then(function(hItem){
                console.log('RESULT -> DB WITHOUT SPECIFIC ITEM DELETED BY UNDO');
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
*/

/* UNDO UPDATE */
/*
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
}

coolDB.add({ item: { name: 'Jhon' } })
        .then(displayDbItems)
        .then(changeJhon)
        .then(UndoSpecific)
        .catch(function(err){
            console.log(err);
        });
*/

/* UNDO UPDATES */
/*
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
*/

/* UNDO A SPECIFIC UPDATE UPDATES */
/*
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
                        console.log('RESULT -> DB WITHOUT SPECIFIC ITEM DELETED BY UNDO');
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
*/

/* UNDO DELETE */
/*
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
*/

/* UNDO DELETES */
/*
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

    // Undo Specific Item from a bunch of Inserts
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
*/

/* UNDO SPECIFIC DELETE */
/*
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

    // Undo Specific Item from a bunch of Inserts
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
*/

/* UNDO CLEAN */
/*
function UndoSpecific(){

    // Undo Specific Item from a bunch of Inserts
    coolDB.undo({ hcuid: coolDB.history()._result[1].hcuid })
            .then(function(hItem){
                console.log('RESULT -> DB UNDO SPECIFIC DELETE');
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
*/

/* UNDO SPECIFIC CLEAN */
/*
function UndoSpecific(){
    var item = coolDB.history()._result[1];

    // Undo Specific Item from a bunch of Inserts
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
        .then(coolDB.clean)
        .then(UndoSpecific)
        .catch(function(err){
            console.log(err);
        });
*/

/* CLEAN HISTORY */
/*
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
*/

/* AJAX */

/* POST CUID */

/*
// Simple
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
*/

/*
// Encrypted
function postCuidEncryptedDemo() {

    var itemCuid = coolDB.db()._result[0].cuid;

    coolDB.postCuid({ url: '/postEncryptedUrl', cuid: itemCuid, json: false, encrypt: true })
          .then(function(success){
            console.log( success );
          })
          .catch(function(err){
            console.log( err );
          });
}

coolDB.add({ item: [{ name: 'Jhon', age: 20 }, { name: 'Jane', age: 20 }] })
        .then(postCuidEncryptedDemo)
        .catch(function(err){
            console.log(err);
        });
*/

/* GET CUID */
/*
// Simple
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

*/

/*
// Encrypted
function getCuidEncryptedDemo() {

    var itemCuid = coolDB.db()._result[0].cuid;

    coolDB.getCuid({ url: '/getEncryptedUrl', cuid: itemCuid, json: false, encrypt: true })
          .then(function(success){
            console.log( success );
          })
          .catch(function(err){
            console.log( err );
          });
}

coolDB.add({ item: [{ name: 'Jhon', age: 20 }, { name: 'Jane', age: 20 }] })
        .then(getCuidEncryptedDemo)
        .catch(function(err){
            console.log(err);
        });
*/

/* ACTIVE GLOBAL LIBS */
//coolDB.activeGlobalLibs({ libs: ['Axios', 'Clone', 'Cuid', 'jQuery', 'Lazy', 'Validate'] });
//coolDB.activeGlobalLibs({ libs: ['All'] });

/* ENCRYPT / DECRYPT */
/*
var people = [
          { name: 'steven', age: 29, birthday: { month: 12, day:10, year:1903 }, salary: 12.25, today: new Date() },
          { name: 'mochi', age: 27, birthday: { month: 12, day:11, year:1904 }, salary: 1125.35, today: new Date() }
        ];

var i, k;

coolDB.encrypt({ item: people, seconds: 15 })
  .then(function(res){
    console.log(res);
    i = res.item;
    k = res.key;
    return { item: res.item, key: res.key };
  })
  .then(function(encrypted){
    console.log( coolDB.decrypt({ item: encrypted.item, key: encrypted.key })._result );
  })
  .catch(function(result) {
    console.log( result );
  });
*/