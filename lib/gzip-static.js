var send = require('send');
var debug = require('debug')('connect:gzip-static');
var parseUrl = require('parseurl');
var fs = require('fs');
var path = require('path');
var mime = send.mime;


function setHeader(res, path) {
  var type = mime.lookup(path);
  var charset = mime.charsets.lookup(type);

  debug('content-type %s', type);
  res.setHeader('Content-Type', type + (charset ? '; charset=' + charset : ''));
  res.setHeader('Content-Encoding', 'gzip');
  res.setHeader('Vary', 'Accept-Encoding');
}

module.exports = function(root, options) {
  var serveStatic;

  options = options || {};
  options.index = options.index || 'index.html';
  serveStatic = require('serve-static')(root, options);

  return function gzipStatic(req, res, next) {
    var acceptEncoding, passToStatic, name = {};

    if ('GET' != req.method && 'HEAD' != req.method) {
      return next();
    }

    passToStatic = serveStatic.bind(this, req, res, next);

    acceptEncoding = req.headers['accept-encoding'] || '';
    if (!~acceptEncoding.indexOf('gzip')) {
      debug('Passing %s', req.url);
      return passToStatic();
    }

    name.orig = parseUrl(req).pathname;
    if (name.orig[name.orig.length - 1] === '/') {
      name.gz = name.orig;
      name.orig += options.index;
      name.index = options.index + '.gz';
    } else {
      name.gz = name.orig + '.gz';
    }
    name.full = path.join(root, name.orig + '.gz');
    debug('request %s, check for %s', req.url, name.full);

    fs.stat(name.full, function(err, stat) {
      var exists = !err && stat.isFile();
      if (!exists) {
        debug('Passing %s', req.url);
        return passToStatic();
      }
      debug('Sending %s', name.full);
      setHeader(res, name.orig);
      send(req, name.gz)
        .maxage(options.maxAge || 0)
        .root(root)
        .index(name.index)
        .hidden(options.hidden)
        .on('error', next)
        .pipe(res);
    });
  };
};
