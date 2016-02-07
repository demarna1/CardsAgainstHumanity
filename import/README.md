## Importing cards to the database

This readme describes the process of importing cards into a remote PostgreSQL database residing on Heroku.

### Creating the PostgreSQL Database
```
sudo apt-get install postgresql
sudo -u postgres createuser noah
sudo -u postgres createdb cah-node
psql cah-node
```

### Database Schema
```
alter user noah with password '1234';
create table black_cards (id bigserial primary key, text varchar(200) not null, pick integer not null, used boolean not null, set varchar(30) not null, mp3 bytea);
create table white_cards (id bigserial primary key, text varchar(200) not null, used boolean not null, set varchar(30) not null, mp3 bytea);
```

### Import cards to local database
```
heroku config -s
export DATABASE_URL=`heroku config -s | grep DATABASE_URL | cut -f2 -d"'"`
node import.js
```

### Push to remote database
```
heroku pg:push noah HEROKU_POSTGRESQL_COPPER
```
