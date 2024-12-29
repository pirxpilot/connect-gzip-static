const assert = require('node:assert/strict');
const { EventEmitter } = require('events');

const methods = ['get', 'post', 'put', 'delete', 'head'];
const http = require('http');

module.exports = request;

function request(app) {
  return new Request(app);
}

function Request(app) {
  const self = this;
  this.data = [];
  this.header = {};
  this.app = app;
  if (!this.server) {
    this.server = http.Server(app);
    this.server.listen(0, '0.0.0.0', function () {
      self.addr = self.server.address();
      self.listening = true;
    });
  }
}

/**
 * Inherit from `EventEmitter.prototype`.
 */

Request.prototype.__proto__ = EventEmitter.prototype;

methods.forEach(function (method) {
  Request.prototype[method] = function (path) {
    return this.request(method, path);
  };
});

Request.prototype.set = function (field, val) {
  this.header[field] = val;
  return this;
};

Request.prototype.write = function (data) {
  this.data.push(data);
  return this;
};

Request.prototype.request = function (method, path) {
  this.method = method;
  this.path = path;
  return this;
};

Request.prototype.expect = function (body, fn) {
  const args = arguments;
  this.end(function (res) {
    switch (args.length) {
      case 3:
        assert.equal(res.headers[body.toLowerCase()], args[1]);
        args[2]();
        break;
      default:
        if ('number' == typeof body) {
          assert.equal(res.statusCode, body);
        } else {
          assert.deepEqual(res.body, body);
        }
        fn();
    }
  });
  return this;
};

Request.prototype.end = function (fn) {
  const self = this;

  if (this.listening) {
    const req = http.request({
      method: this.method,
      port: this.addr.port,
      host: this.addr.address,
      path: this.path,
      headers: this.header
    });

    this.data.forEach(function (chunk) {
      req.write(chunk);
    });

    req.on('response', function (res) {
      let buf = '';
      res.setEncoding('utf8');
      res.on('data', function (chunk) { buf += chunk; });
      res.on('end', function () {
        res.body = buf;
        fn(res);
      });
    });

    req.end();
  } else {
    this.server.on('listening', function () {
      self.end(fn);
    });
  }

  return this;
};

Request.prototype.close = function (fn) {
  const { server } = this;
  delete this.server;
  return server ? server.close(fn) : fn();
};
