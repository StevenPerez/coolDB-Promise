var express     = require('express');
var bodyParser  = require('body-parser');
var app         = express();

var cooldb 	    = require('./public/dist/node-cooldb.js'),
	coolDB 		= cooldb();

console.log(cooldb);

/****************************************/
coolDB.changeFeed(function(result){
    console.log(result);
});


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
/*
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
*/


/*
// Clone
console.log( coolDB.clone()._result );

// Clean
// console.log( coolDB.clean()._result );
*/

// DB
console.log( coolDB.db()._result );
/****************************************/

// Views
app.use(express(__dirname + 'views')); 
app.set('view engine','html');
app.engine('html', require('ejs').renderFile);

// Public
app.use(express.static(__dirname + '/public'));

// Body
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get('/', function (req, res) {
  res.render('index.html');
});

/*
				{ID: 1, Name: 'Steven', Age: 25},
				{ID: 2, Name: 'Jhon', Age: 15},
				{ID: 3, Name: 'Jane', Age: 50}
*/
var people = [

			 ];

app.get('/read', function (req, res) {
  res.send(people);
});

app.post('/read2', function (req, res) {
	console.log(req.body.name);
  res.send(people);
});

app.post('/create', function (req, res) {
	console.log(req.body);
	var item = {
		Name: req.body.Name,
		Age: req.body.Age,
		ID: people.length + 1
	};
	
	people.push(item);
  	res.send(item);
});

app.get('/create2', function (req, res) {
	console.log(req.query);
	var item = {
		Name: req.query.Name,
		Age: req.query.Age,
		ID: people.length + 1
	};
	
	people.push(item);
  	res.send(item);
});

function deleteItem(id) {

	var itemIndex = people.map(function(data) { return data.ID.toString(); }).indexOf(id);

	if (itemIndex >= 0)
		people.splice(itemIndex, 1);
	else
		throw 'Item was not found through cuid';
}

app.post('/delete', function (req, res) {
	console.log(req.body);
	deleteItem(req.body.ID);
  	res.send(people);
});

app.get('/delete2', function (req, res) {
	console.log(req.query);
	deleteItem(req.query.ID);
  	res.send(people);
});

function select(params) {
	var item = people.filter(function (x) { return x.ID == params.ID; })[0];
	return item;
}

app.post('/update', function (req, res) {
	console.log(req.body);
	var item = select({ ID: req.body.ID });
	
	item.Name 	= req.body.Name;
	item.Age 	= parseInt(req.body.Age);
	
  	res.send(people);
});

app.get('/update2', function (req, res) {
	console.log(req.query);
	var item = select({ ID: req.query.ID });
	
	item.Name 	= req.query.Name;
	item.Age 	= parseInt(req.query.Age);
	
  	res.send(people);
});

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});