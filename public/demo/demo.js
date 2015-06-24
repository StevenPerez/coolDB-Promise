var coolDb = cooldb,
    coolDB = coolDb();

coolDB.changeFeed(function(result){
    console.log('PROD CHANGE FEED');
    console.log(result);
    console.log('=======================');
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

coolDB.setBufferHistory(2);

coolDB.changeFeedHistory(function(result){
    console.log('HISTORY CHANGE FEED');
    console.log(result);
    //console.log(result.item[0].new);
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
        
        console.log(item);
        
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