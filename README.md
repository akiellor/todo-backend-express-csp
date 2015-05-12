# todo-backend-express-csp

This is an example implementation of [moredip's](https://github.com/moredip) [Todo-Backend](http://todobackend.com/) API spec, using Node.js and the Express framework.

This implementation is a fork of [dtao's](https://github.com/dtao/todo-backend-express), but uses [js-csp](https://github.com/ubolonton/js-csp) rather than promises or callbacks for asynchronous work loads.

This example saves TODOs in a PostgreSQL database and uses [node-db-migrate](https://github.com/kunklejr/node-db-migrate) for database migrations. A production instance is running on Heroku at [http://todo-backend-express-csp.herokuapp.com](http://todo-backend-express-csp.herokuapp.com).

## CSP Resources
[Original Paper by Tony Hoare](http://spinroot.com/courses/summer/Papers/hoare_1978.pdf)
[2004 Book by Tony Hoare](http://www.usingcsp.com/cspbook.pdf)

## CSP Implementations
[golang (goroutines and channels)](http://www.golang-book.com/10/index.htm)
[core.async (clojure/script)](https://github.com/clojure/core.async)
[js-csp (javascript)](https://github.com/ubolonton/js-csp)
