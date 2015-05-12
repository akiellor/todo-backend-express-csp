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

function createCallback(res, onSuccess) {
  return function callback(err, data) {
    if (err || !data) {
      res.send(500, 'Something bad happened!');
      return;
    }

    onSuccess(data);
  }
}

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

function get(route, gen) {
  app.get(route, function(req, res) {
    csp.go(gen, [req, res]);
  });
}

get('/', function* (req, res) {
  var r = todos.all(),
      err = r[0],
      all = r[1];

  var result = yield csp.alts([err, all]);

  if (result.channel === err) {
    res.send(500, err);
  } else if (result.channel === all) {
    res.send(result.value.map(getCreateTodo(req)));
  }
});

app.get('/:id', function(req, res) {
  todos.get(req.params.id, createCallback(res, function(todo) {
    res.send(createTodo(req, todo));
  }));
});

app.post('/', function(req, res) {
  todos.create(req.body.title, req.body.order, createCallback(res, function(todo) {
    res.send(createTodo(req, todo));
  }));
});

app.patch('/:id', function(req, res) {
  todos.update(req.params.id, req.body, createCallback(res, function(todo) {
    res.send(createTodo(req, todo));
  }));
});

app.delete('/', function(req, res) {
  todos.clear(createCallback(res, function(todos) {
    res.send(todos.map(getCreateTodo(req)));
  }));
});

app.delete('/:id', function(req, res) {
  todos.delete(req.params.id, createCallback(res, function(todo) {
    res.send(createTodo(req, todo));
  }));
});

app.listen(Number(process.env.PORT || 5000));
