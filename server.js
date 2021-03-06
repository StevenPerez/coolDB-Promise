var express     = require('express');
var bodyParser  = require('body-parser');
var app         = express();

var cooldb 	    = require('./public/dist/node-cooldb.js'),
	coolDB 		= cooldb();

coolDB.activeGlobalLibs({ libs: ['Axios', 'Clone', 'Cuid', 'jQuery', 'Lazy', 'Validate'] });

console.log(cuid());
console.log(cooldb);

/****************************************/
coolDB.changeFeed(function(result){
    console.log(result);
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
*/

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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
var Routes = express.Router();

Routes.get('/', function (req, res) {
  res.render('index.html');
});

/*
				{ID: 1, Name: 'Steven', Age: 25},
				{ID: 2, Name: 'Jhon', Age: 15},
				{ID: 3, Name: 'Jane', Age: 50}
*/
var people = [

			 ];

Routes.get('/read', function (req, res) {
  res.send(people);
});

Routes.post('/read2', function (req, res) {
	console.log(req.body.name);
  res.send(people);
});

Routes.post('/create', function (req, res) {
	console.log(req.body);
	var item = {
		Name: req.body.Name,
		Age: req.body.Age,
		ID: people.length + 1
	};

	people.push(item);
  	res.send(item);
});

Routes.get('/create2', function (req, res) {
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

Routes.post('/delete', function (req, res) {
	console.log(req.body);
	deleteItem(req.body.ID);
  	res.send(people);
});

Routes.get('/delete2', function (req, res) {
	console.log(req.query);
	deleteItem(req.query.ID);
  	res.send(people);
});

function select(params) {
	var item = people.filter(function (x) { return x.ID == params.ID; })[0];
	return item;
}

Routes.post('/update', function (req, res) {
	console.log(req.body);
	var item = select({ ID: req.body.ID });

	item.Name 	= req.body.Name;
	item.Age 	= parseInt(req.body.Age);

  	res.send(people);
});

Routes.get('/update2', function (req, res) {
	console.log(req.query);
	var item = select({ ID: req.query.ID });

	item.Name 	= req.query.Name;
	item.Age 	= parseInt(req.query.Age);

  	res.send(people);
});


Routes.post('/postUrl', function (req, res) {
    console.log(req.body);
    res.send('Item received -> ' + JSON.stringify(req.body));
});

Routes.post('/postEncryptedUrl', function (req, res) {
    console.log(req.body);
    res.send('Item received -> ' + JSON.stringify(req.body.item));
});

Routes.get('/getUrl', function (req, res) {
    console.log(req.query);
    res.send('Item received -> ' + JSON.stringify(req.query));
});

Routes.get('/getEncryptedUrl', function (req, res) {
    console.log(req.query);
    res.send('Item received -> ' + JSON.stringify(req.query.item));
});

app.use('/', Routes);

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});
