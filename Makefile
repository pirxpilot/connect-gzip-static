check: lint test

lint:
	./node_modules/.bin/eslint ./
	
test:
	node --import tsx --require should --test

.PHONY: check lint test
