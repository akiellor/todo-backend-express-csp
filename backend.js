var pg = require('pg.js'),
    csp = require('js-csp');

module.exports = function createTodoBackend(connectionString) {
  function query(query, params, callback) {
    pg.connect(connectionString, function(err, client, done) {
      done();

      if (err) {
        callback(err);
        return;
      }

      client.query(query, params, function(err, result) {
        if (err) {
          callback(err);
          return;
        }

        callback(null, result.rows);
      });
    });
  }

  function cquery(query, params) {
    var resultChan = csp.chan();
    var errChan = csp.chan();

    pg.connect(connectionString, function(err, client, done) {
      done();

      if (err) {
        csp.go(function* (){
          yield csp.put(errChan, err);
        });
        return;
      }

      client.query(query, params, function(err, result) {
        if (err) {
          csp.go(function* (){
            yield csp.put(errChan, err);
          });
          return;
        }

        csp.go(function* (){
          yield csp.put(resultChan, result.rows);
        });
      });
    });

    return [errChan, resultChan];
  }

  return {
    all: function() {
      return cquery('SELECT * FROM todos', []);
    },

    get: function(id, callback) {
      query('SELECT * FROM todos WHERE id = $1', [id], function(err, rows) {
        callback(err, rows && rows[0]);
      });
    },

    create: function(title, order, callback) {
      query('INSERT INTO todos ("title", "order", "completed") VALUES ($1, $2, false) RETURNING *', [title, order], function(err, rows) {
        callback(err, rows && rows[0]);
      });
    },

    update: function(id, properties, callback) {
      var assigns = [], values = [];
      if ('title' in properties) {
        assigns.push('"title"=$' + (assigns.length + 1));
        values.push(properties.title);
      }
      if ('order' in properties) {
        assigns.push('"order"=$' + (assigns.length + 1));
        values.push(properties.order);
      }
      if ('completed' in properties) {
        assigns.push('"completed"=$' + (assigns.length + 1));
        values.push(properties.completed);
      }

      var updateQuery = [
        'UPDATE todos',
        'SET ' + assigns.join(', '),
        'WHERE id = $' + (assigns.length + 1),
        'RETURNING *'
      ];

      query(updateQuery.join(' '), values.concat([id]), function(err, rows) {
        callback(err, rows && rows[0]);
      });
    },

    delete: function(id, callback) {
      query('DELETE FROM todos WHERE id = $1 RETURNING *', [id], function(err, rows) {
        callback(err, rows && rows[0]);
      });
    },

    clear: function(callback) {
      query('DELETE FROM todos RETURNING *', [], callback);
    }
  };
};
