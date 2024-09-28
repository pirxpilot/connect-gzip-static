check: lint test

lint:
	./node_modules/.bin/tsc --noemit && ./node_modules/.bin/eslint ./

format:
	./node_modules/.bin/eslint ./ --fix
	
test:
	node --import tsx --require should --test

build:
	./node_modules/.bin/ts-packager -e lib

.PHONY: check lint test build
