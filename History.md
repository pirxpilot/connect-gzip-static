
5.0.0 / 2025-10-25
==================

 * transition to ESM format
 * upgrade `biome` to 2.3.0
 * update github actions
 * use `@pirxpilot/connect` in tests

4.2.2 / 2025-05-18
==================

 * upgrade `mime-types` to ~3
 * remove functionally empty index.js
 * use `biome` as a linter and formatter

4.2.1 / 2024-12-29
==================

 * optimize file cache creation
 * simplify check function
 * relax serve-static dependency
 * replace should with built-in node:assert

4.2.0 / 2024-12-03
==================

 * add support for zstd content-encoding

4.1.0 / 2024-12-03
==================

 * relax dependencies restrictions for send to include ~1

4.0.0 / 2023-10-16
==================

 * use logical assignment ||= where apropriate
 * use Set instead of Object as cache
 * use built-in fs.readdir instead of @folder/readdir

3.0.1 / 2023-10-16
==================

 * replace jshint with @pirxpilot/jshint
 * replace mocha with native node test runner

3.0.0 / 2022-05-14
==================

 * use async readdir when creating cache
 * rewrite in modern javascript

2.1.1 / 2017-08-26
==================

 * fix tests for `last-modified` and `etag` headers

2.1.0 / 2017-08-26
==================

 * fix support for `etag`, `last-modified`, `cache-control`
 * fix support for setHeaders options

2.0.1 / 2017-02-18
==================

 * transfer repository to pirxpilot

2.0.0 / 2017-02-06
==================

 * add support for brotli
 * upgrade mocha and should

1.0.0 / 2014-10-18
==================

 * update debug 0 -> 2
 * fix tests

0.4.1 / 2014-09-30
==================

 * fix maxAge option

0.4.0 / 2014-08-27
==================

 * options.hidden now options.dotfiles
 * Readme updates: debugging and "How it works" section

0.3.1 / 2014-05-13
==================

 * fix find semver range to be node 0.8 compatible

0.3.0 / 2014-05-13
==================

 * check for .gzip presence on middleware init
 * use serve-static middleware and parseurl

0.2.1 / 2014-03-05
==================

 * fix setting Content-Type for index request

0.2.0 / 2014-03-04
==================

 * support `index` option properly
 * Clarify usage in Readme
 * Tests added

0.1.1 / 2013-09-17 
==================

 * Only handle GET and HEAD methods

0.1.0 / 2013-09-17 
==================

 * Initial implementation of gzip-static middleware
