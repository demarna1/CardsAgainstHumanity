#!/bin/bash
cp cred/ivona_cred.txt cred/ivona_cred_backup.txt
git add -f cred/ivona_cred.txt
git commit -m "temp"
branch=$(git rev-parse --symbolic-full-name --abbrev-ref HEAD)
echo "Pushing $branch branch to heroku"
git push -f heroku $branch:master
git reset --hard origin/$branch
mv cred/ivona_cred_backup.txt cred/ivona_cred.txt
echo "Done!"
