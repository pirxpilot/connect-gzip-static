[![NPM version][npm-image]][npm-url]
[![Build Status][build-image]][build-url]
[![Dependency Status][deps-image]][deps-url]

# connect-gzip-static

Middleware for [connect]: serves compressed files if they exist, falls through to connect-static
if they don't, or if browser does not send 'Accept-Encoding' header.

You should use `connect-gzip-static` if your build process already creates compressed (using gzip, 
[brotli], or [zstd]) files. If you want to compress your data on the fly use [compression]
middleware. And if you want to compress your files dynamically you may want to look up [connect
gzip].

## Installation

	  $ npm install connect-gzip-static

## Options

gzip-static is meant to be a drop in replacement for [connect static] middleware. Use the same
options as you would with [connect static].


## Usage

```javascript
var gzipStatic = require('connect-gzip-static');
var oneDay = 86400000;

connect()
  .use(gzipStatic(__dirname + '/public'))

connect()
  .use(gzipStatic(__dirname + '/public', { maxAge: oneDay }))
```

## How it works

We start by locating all compressed files (ie. _files with .gz and .br extensions_) in `root`
directory. All HTTP GET and HTTP HEAD requests with Accept-Encoding header set to gzip are checked
against the list of compressed files and, if possible, fulfilled by returning the compressed
versions. If compressed version is not found or if the request does not have an appropriate Accept-
Encoding header, the request is processed in the same way as standard static middleware would
handle it.

## Debugging

This project uses [debug] module. To enable the debug log, just set the debug enviromental variable:

    DEBUG="connect:gzip-static"

# License

MIT © [Damian Krzeminski](https://pirxpilot.me)

[brotli]: https://en.wikipedia.org/wiki/Brotli
[zstd]: https://en.wikipedia.org/wiki/Zstd

[debug]: https://github.com/visionmedia/debug
[connect]: https://github.com/senchalabs/connect
[connect static]: https://github.com/expressjs
[compression]: https://github.com/expressjs/compression
[connect gzip]: https://github.com/tikonen/connect-gzip

[npm-image]: https://img.shields.io/npm/v/connect-gzip-static
[npm-url]: https://npmjs.org/package/connect-gzip-static

[build-url]: https://github.com/pirxpilot/connect-gzip-static/actions/workflows/check.yaml
[build-image]: https://img.shields.io/github/actions/workflow/status/pirxpilot/connect-gzip-static/check.yaml?branch=main
 
[deps-image]: https://img.shields.io/librariesio/release/npm/connect-gzip-static
[deps-url]: https://libraries.io/npm/connect-gzip-static
