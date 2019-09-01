install:
	npm install

start:
	npx babel-node -- src/bin/pageloader.js

publish:
	npm publish

lint:
	npx eslint .

build:
	rm -rf dist
	npm run build

test:
	DEBUG=page-loader npm test

test-watch:
	npm test --watch
