var app = require('express')(),
    bodyParser = require('body-parser'),
    csp = require('js-csp'),
    backend = require('./backend');

// ----- Parse JSON requests

app.use(bodyParser.json());

// ----- Allow CORS

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// ----- The API implementation

var todos = backend(process.env.DATABASE_URL);

function createTodo(req, data) {
  return {
    title: data.title,
    order: data.order,
    completed: data.completed || false,
    url: req.protocol + '://' + req.get('host') + '/' + data.id
  };
}

function getCreateTodo(req) {
  return function(data) {
    return createTodo(req, data);
  };
}

function createResponse(res, chans, xform) {
  var err = chans[0],
      data = chans[1];

  csp.go(function *() {
    var result = yield csp.alts([err, data]);

    if (result.channel === err) {
      res.send(500, err);
    } else if (result.channel === data) {
      res.send(xform(result.value));
    }
  });
}

app.get('/', function(req, res) {
  createResponse(res, todos.all(), data => data.map(getCreateTodo(req)));
});

app.get('/:id', function(req, res) {
  createResponse(res, todos.get(req.params.id), d => createTodo(req, d));
});

app.post('/', function(req, res) {
  createResponse(res, todos.create(req.body.title, req.body.order), d => createTodo(req, d));
});

app.patch('/:id', function(req, res) {
  createResponse(res, todos.update(req.params.id, req.body), d => createTodo(req, d));
});

app.delete('/', function(req, res) {
  createResponse(res, todos.clear(), d => d.map(getCreateTodo(req)));
});

app.delete('/:id', function(req, res) {
  createResponse(res, todos.delete(req.params.id), d => createTodo(req, d));
});

app.listen(Number(process.env.PORT || 5000));
