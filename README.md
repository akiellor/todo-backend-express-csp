# todo-backend-express-csp

This is an example implementation of [moredip's](https://github.com/moredip) [Todo-Backend](http://todo-backend.thepete.net/) API spec, using Node.js and the Express framework.

This implementation is a fork of [dtao's](https://github.com/dtao/todo-backend-express), but uses [js-csp](https://github.com/ubolonton/js-csp) rather than promises or callbacks for asynchronous work loads.

This example saves TODOs in a PostgreSQL database and uses [node-db-migrate](https://github.com/kunklejr/node-db-migrate) for database migrations. A production instance is running on Heroku at [http://todo-backend-express.herokuapp.com](http://todo-backend-express.herokuapp.com).
