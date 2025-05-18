const fs = require('node:fs/promises');
const path = require('node:path');
const send = require('send');
const debug = require('debug')('connect:gzip-static');
const parseUrl = require('parseurl');
const mime = require('mime-types');

function setHeader(res, path, encoding) {
  const type = mime.lookup(path);
  const charset = mime.charset(type);

  debug('content-type %s', type);
  res.setHeader('Content-Type', type + (charset ? '; charset=' + charset : ''));
  res.setHeader('Content-Encoding', encoding);
  res.setHeader('Vary', 'Accept-Encoding');
}

/**
 * Creates caches of filenames that end with the given extensions
 * @param {String} root
 */
async function createCaches(root, methods) {
  const dirents = await fs.readdir(root, {
    recursive: true,
    withFileTypes: true
  });
  dirents.forEach(dirent => {
    if (!dirent.isFile()) {
      return;
    }
    const { name, parentPath } = dirent;
    for (const { extension, cache } of methods) {
      if (name.endsWith(extension)) {
        cache.add(path.resolve(root, parentPath, name));
      }
    }
  });
}

async function createMethods(root) {
  const methods = [
    { extension: '.zst', encoding: 'zstd', cache: new Set() },
    { extension: '.br', encoding: 'br', cache: new Set() },
    { extension: '.gz', encoding: 'gzip', cache: new Set() }
  ];
  await createCaches(root, methods);
  return methods;
}

module.exports = (root, options = {}) => {
  const methodsPromise = createMethods(root);

  options.index ??= 'index.html';

  const setHeaders = options.setHeaders;
  const serveStatic = require('serve-static')(root, options);

  return async function gzipStatic(req, res, next) {
    if ('GET' !== req.method && 'HEAD' !== req.method) {
      return next();
    }

    let name;

    checking: {
      for (const method of await methodsPromise) {
        name = check(req, method);
        if (name) {
          break checking;
        }
      }
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
    }).on('error', next);

    if (setHeaders) {
      stream.on('headers', setHeaders);
    }
    stream.pipe(res);
  };

  function check(req, { encoding, extension, cache }) {
    const acceptEncoding = req.headers['accept-encoding'] || '';
    if (!acceptEncoding.includes(encoding)) {
      return;
    }

    let orig = parseUrl(req).pathname;
    let compressed;
    let index;
    if (orig.at(-1) === '/') {
      compressed = orig;
      orig += options.index;
      index = options.index + extension;
    } else {
      compressed = orig + extension;
    }
    const full = path.join(root, orig + extension);
    debug('request %s, check for %s', req.url, full);

    if (cache.has(full)) {
      return {
        orig,
        full,
        compressed,
        encoding,
        index
      };
    }
  }
};
