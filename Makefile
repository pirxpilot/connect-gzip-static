check: lint test

lint:
	./node_modules/.bin/jshint *.js lib test

test:
	node --test

.PHONY: check lint test
