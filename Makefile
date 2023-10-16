check: lint test

lint:
	./node_modules/.bin/jshint *.js lib test

test:
	node --require should --test

.PHONY: check lint test
