## Setup

Bellow you will find a list of items that you must do to get the project working on your machine.

### .env

Copy `.env.dist` to `.env`.

### CouchDB

**NOTE**: You may put the `CouchDB` app into the gitignored `dev` folder while developing!

- Install [CouchDB](http://couchdb.apache.org/) and run it.
- Add user `admin` with `admin` as password by executing `curl -X PUT http://localhost:5984/_config/admins/admin -d '"admin"'`.
- After doing this, operations done in the [web interface](http://localhost:5984) require you to login (login is at bottom right corner).
- Create database named `npms` by executing `curl -X PUT http://admin:admin@localhost:5984/npm`
- Change default maximum replication retries to infinite by executing `curl -X PUT http://admin:admin@localhost:5984/_config/replicator/max_replication_retry_count -d '"infinity"'`
- Setup npm replication by executing `curl -X PUT http://admin:admin@localhost:5984/_replicator/npm -d '{ "source":  "https://skimdb.npmjs.com/registry", "target": "http://admin:admin@localhost:5984/npm", "create_target": true, "continuous": true }'`

### RabbitMQ

**NOTE**: You may put `RabbitMQ standalone` into the gitignored `dev` folder while developing!

- Install [RabbitMQ](https://www.rabbitmq.com/download.html) and run it.
- Install the [management](https://www.rabbitmq.com/management.html) plugin which is very useful by running `rabbitmq-plugins enable rabbitmq_management`
- Head to `http://localhost:15672` and login with `guest/guest` and see if everything is ok.

### Elasticsearch

TODO