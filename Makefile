check: lint test

lint:
	./node_modules/.bin/jshint *.js lib test

test:
	./node_modules/.bin/mocha --require should --require test/support/http --exit

.PHONY: check lint test
