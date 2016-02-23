## Cards Against Humanity

The Cards Against Humanity game as an online application using Node.js and socket.io.

### How to use

Clone and get dependencies:
```
$ git clone https://github.com/demarna1/CardsAgainstHumanity.git
$ cd CardsAgainstHumanity
$ npm install
```

Download Ivona credentials from here: https://www.ivona.com/us/account/speechcloud/credentials

Place credentials in proper location:
```
$ mkdir cred
$ mv ~/Downloads/credentials_*.txt cred/ivona_cred.txt
```

Start the server with:
```
$ node server.js
```

The server will be started at `http://localhost:3000`.

### Deploy to heroku

```
$ heroku login
$ ./push_to_heroku.sh
$ heroku open
```

The page is hosted at `https://cah-node.herokuapp.com`

