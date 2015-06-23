var coolDb = cooldb,
    coolDB = coolDb();

coolDB.changeFeed(function(result){
    //console.log(result);
});

coolDB.setHistory(2);

coolDB.changeFeedHistory(function(result){
    console.log('CHANGE FEED');
    console.log(result);
    console.log('=======================');
});



coolDB.add({ item: { name: 'Mary' } })
    .then(function(result) {
        //console.log(result);
        console.log( coolDB.db()._result );
        console.log( coolDB.history()._result );
    })
    .catch(function(err) {
        console.log(err);
    });

/*
coolDB.history()
        .then(function (a) {
            console.log(a);
        })
        .catch(function(err){
            console.log(err);
        });
*/

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