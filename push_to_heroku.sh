#!/bin/bash
cp cred/ivona_cred.txt cred/ivona_cred_backup.txt
git add -f cred/ivona_cred.txt
git commit -m "temp"
git push -f heroku master
git reset --hard origin/master
mv cred/ivona_cred_backup.txt cred/ivona_cred.txt
