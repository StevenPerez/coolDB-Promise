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

coolDB.setHistory(2);

coolDB.changeFeedHistory(function(result){
    console.log('HISTORY CHANGE FEED');
    console.log(result);
    console.log('=======================');
});

/* Add one */

coolDB.add({ item: { name: 'Jhon' } })
    .then(function(result) {
        var inter = setInterval(function() {
            clearInterval(inter);
            console.log( coolDB.db()._result );
            console.log( coolDB.history()._result );
        }, 100);
    })
    .catch(function(err) {
        console.log(err);
    });


coolDB.add({ item: [{ name: 'Mary' }, { name: 'Yorle' }, { name: 'Samantha' } ] })
    .then(function(result) {
        var inter = setInterval(function() {
            clearInterval(inter);
            console.log( coolDB.db()._result );
            console.log( coolDB.history()._result );
        }, 100);
    })
    .catch(function(err) {
        console.log(err);
    });