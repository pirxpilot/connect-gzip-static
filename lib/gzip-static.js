const send = require('send');
const debug = require('debug')('connect:gzip-static');
const parseUrl = require('parseurl');
const path = require('path');
const mime = send.mime;
const find = require('find');

function setHeader(res, path, encoding) {
  const type = mime.lookup(path);
  const charset = mime.charsets.lookup(type);

  debug('content-type %s', type);
  res.setHeader('Content-Type', type + (charset ? '; charset=' + charset : ''));
  res.setHeader('Content-Encoding', encoding);
  res.setHeader('Vary', 'Accept-Encoding');
}

function createCache(root, regex) {
  const cache = Object.create(null);
  find.fileSync(regex, root).forEach(function (file) {
    cache[file] = true;
  });
  debug('Found %d compressed files', Object.keys(cache).length);
  return cache;
}

module.exports = function (root, options) {

  const methods = [
    { extension: '.br', encoding: 'br', cache: createCache(root, /\.br$/) },
    { extension: '.gz', encoding: 'gzip', cache: createCache(root, /\.gz$/) },
  ];

  options = options || {};
  options.index = options.index || 'index.html';

  const setHeaders = options.setHeaders;
  const serveStatic = require('serve-static')(root, options);

  function check(req, method) {

    const acceptEncoding = req.headers['accept-encoding'] || '';
    if (!~acceptEncoding.indexOf(method.encoding)) {
      return;
    }

    const name = {
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

    let name;
    for (let i = 0; !name && i < methods.length; i++) {
      name = check(req, methods[i]);
    }
    if (!name) {
      debug('Passing %s', req.url);
      return serveStatic(req, res, next);
    }

    debug('Sending %s', name.full);
    setHeader(res, name.orig, name.encoding);

    const stream = send(req, name.compressed, {
        maxAge: options.maxAge || 0,
        root,
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
