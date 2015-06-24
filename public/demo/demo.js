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

coolDB.setHistory(3);

coolDB.changeFeedHistory(function(result){
    console.log('HISTORY CHANGE FEED');
    console.log(result);
    //console.log(result.item[0].new);
    console.log('=======================');
});

/* ADD */

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


/* UPDATE */

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