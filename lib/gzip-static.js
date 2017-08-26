var send = require('send');
var debug = require('debug')('connect:gzip-static');
var parseUrl = require('parseurl');
var path = require('path');
var mime = send.mime;
var find = require('find');

function setHeader(res, path, encoding) {
  var type = mime.lookup(path);
  var charset = mime.charsets.lookup(type);

  debug('content-type %s', type);
  res.setHeader('Content-Type', type + (charset ? '; charset=' + charset : ''));
  res.setHeader('Content-Encoding', encoding);
  res.setHeader('Vary', 'Accept-Encoding');
}

function createCache(root, regex) {
  var cache = Object.create(null);
  find.fileSync(regex, root).forEach(function(file) {
    cache[file] = true;
  });
  debug('Found %d compressed files', Object.keys(cache).length);
  return cache;
}

module.exports = function(root, options) {

  var methods = [
    { extension: '.br', encoding: 'br', cache: createCache(root, /\.br$/) },
    { extension: '.gz', encoding: 'gzip', cache: createCache(root, /\.gz$/) },
  ];

  options = options || {};
  options.index = options.index || 'index.html';

  var setHeaders = options.setHeaders;
  var serveStatic = require('serve-static')(root, options);

  function check(req, method) {

    var acceptEncoding = req.headers['accept-encoding'] || '';
    if (!~acceptEncoding.indexOf(method.encoding)) {
      return;
    }

    var name = {
      orig: parseUrl(req).pathname
    };

    if (name.orig[name.orig.length - 1] === '/') {
      name.compressed = name.orig;
      name.orig += options.index;
      name.index = options.index + method.extension;
    } else {
      name.compressed = name.orig + method.extension;
    }
    name.full = path.join(root, name.orig + method.extension);
    debug('request %s, check for %s', req.url, name.full);

    if (!method.cache[name.full]) {
      return;
    }

    name.encoding = method.encoding;
    return name;
  }

  return function gzipStatic(req, res, next) {
    if ('GET' != req.method && 'HEAD' != req.method) {
      return next();
    }

    var name;
    for (var i = 0; !name && i < methods.length; i++) {
      name = check(req, methods[i]);
    }
    if (!name) {
      debug('Passing %s', req.url);
      return serveStatic(req, res, next);
    }

    debug('Sending %s', name.full);
    setHeader(res, name.orig, name.encoding);

    var stream = send(req, name.compressed, {
        maxAge: options.maxAge || 0,
        root:  root,
        index: name.index,
        cacheControl: options.cacheControl,
        lastModified: options.lastModified,
        etag: options.etag,
        dotfiles: options.dotfiles
      })
      .on('error', next);

    if (setHeaders) {
       stream.on('headers', setHeaders);
    }
    stream.pipe(res);
  };
};
