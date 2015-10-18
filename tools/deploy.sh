#!/usr/bin/env sh

set -e
set -x

cd _build/html

if [ -d ".git" ]; then
    rm -rf .git
fi

git init

git config --global user.email 'maxime.horcholle@gmail.com'
git config --global user.name 'mhor'

touch .nojekyll

git add .
git commit -m "Build website"
git checkout -b "gh-pages"

git push "https://github.com/mhor/personal-library" -f gh-pages