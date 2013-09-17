[![Build Status](https://secure.travis-ci.org/code42day/connect-gzip-static.png)](http://travis-ci.org/code42day/connect-gzip-static)
[![Dependency Status](https://gemnasium.com/code42day/connect-gzip-static.png)](https://gemnasium.com/code42day/connect-gzip-static)
[![NPM version](https://badge.fury.io/js/connect-gzip-static.png)](http://badge.fury.io/js/connect-gzip-static)

# connect-gzip-static

Middleware for [connect][]: serves compressed files if they exist, falls through to connect-static
if they don't, or if browser does not send 'Accept-Encoding' header.

You should use `connect-gzip-static` if your build process already creates gzipped files. If you
want to gzip your data on the fly use built-in [connect compress][] middleware. And if you want to
gzip your files dynamically you may want to look up [connect gzip][].

## Installation

	  $ npm install connect-gzip-static

## Options

gzip-static is meant to be a drop in replacement for [connect static][] middleware. Use the same
options as you would with [connect static][].


## Usage

```javascript
var gzipStatic = require('connect-gzip-static');
var oneDay = 86400000;

connect()
  .use(gzipStatic(__dirname + '/public'))

connect()
  .use(gzipStatic(__dirname + '/public', { maxAge: oneDay }))
```

# License

MIT

[connect]: http://www.senchalabs.org/connect
[connect static]: http://www.senchalabs.org/connect/static.html
[connect compress]: http://www.senchalabs.org/connect/compress.html
[connect gzip]: https://github.com/tikonen/connect-gzip
