import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import http from 'node:http';

const methods = ['get', 'post', 'put', 'delete', 'head'];

export default function request(app) {
  return new Request(app);
}

function Request(app) {
  this.data = [];
  this.header = {};
  this.app = app;
  if (!this.server) {
    this.server = http.Server(app);
    this.server.listen(0, '0.0.0.0', () => {
      this.addr = this.server.address();
      this.listening = true;
    });
  }
}

/**
 * Inherit from `EventEmitter.prototype`.
 */

Request.prototype.__proto__ = EventEmitter.prototype;

methods.forEach(method => {
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

Request.prototype.expect = function (body, ...args) {
  const fn = args.pop();
  this.end(res => {
    switch (args.length) {
      case 1: {
        const header = res.headers[body.toLowerCase()];
        assert.equal(header.toLowerCase(), args[0].toLowerCase());
        break;
      }
      default:
        if ('number' === typeof body) {
          assert.equal(res.statusCode, body);
        } else {
          assert.deepEqual(res.body, body);
        }
    }
    fn();
  });
  return this;
};

Request.prototype.end = function (fn) {
  if (this.listening) {
    const req = http.request({
      method: this.method,
      port: this.addr.port,
      host: this.addr.address,
      path: this.path,
      headers: this.header
    });

    this.data.forEach(chunk => {
      req.write(chunk);
    });

    req.on('response', res => {
      let buf = '';
      res.setEncoding('utf8');
      res.on('data', chunk => {
        buf += chunk;
      });
      res.on('end', () => {
        res.body = buf;
        fn(res);
      });
    });

    req.end();
  } else {
    this.server.on('listening', () => {
      this.end(fn);
    });
  }

  return this;
};

Request.prototype.close = function (fn) {
  const { server } = this;
  delete this.server;
  return server ? server.close(fn) : fn();
};
