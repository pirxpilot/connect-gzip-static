const test = require('node:test');

const gzipStatic = require('..');

const connect = require('connect');
const request = require('./support/http');

const fixtures = __dirname + '/fixtures';

test('gzipStatic', async function (t) {
  let app;

  t.before(function () {
    app = connect();
    app.use(gzipStatic(fixtures));

    app.use(function (req, res) {
      res.statusCode = 404;
      res.end('sorry!');
    });
  });

  t.afterEach(function (t, done) {
    t.request.close(done);
  });

  await t.test('should serve static files', function (t, done) {
    t.request = request(app)
      .get('/style.css')
      .expect('body{color:"red";}', done);
  });

  await t.test('should set Content-Type', function (t, done) {
    t.request = request(app)
      .get('/style.css')
      .expect('Content-Type', 'text/css; charset=UTF-8', done);
  });

  await t.test('should send compressed index.html when asked for /', function (t, done) {
    t.request = request(app)
      .get('/subdir/')
      .set('Accept-Encoding', 'gzip')
      .expect('compressed HTML', done);
  });

  await t.test('should set Content-Type when asked for /', function (t, done) {
    t.request = request(app)
      .set('Accept-Encoding', 'gzip')
      .get('/subdir/')
      .expect('Content-Type', 'text/html; charset=UTF-8', done);
  });

  await t.test('should send uncompressed index.html when asked for /', function (t, done) {
    t.request = request(app)
      .get('/subdir/')
      .expect('<p>Hello</p>', done);
  });

  await t.test('should default max-age=0', function (t, done) {
    t.request = request(app)
      .get('/style.css')
      .expect('Cache-Control', 'public, max-age=0', done);
  });

  await t.test('should set ETag and Last-Modified', function (t, done) {
    t.request = request(app)
      .get('/print.css')
      .set('Accept-Encoding', 'gzip')
      .end(function (res) {
        res.headers.should.have.property('etag');
        res.headers.should.have.property('last-modified');
        done();
      });
  });

  await t.test('should serve uncompressed files unless requested', function (t, done) {
    t.request = request(app)
      .get('/print.css')
      .expect('body{color:"green";}', done);
  });

  await t.test('should serve compressed files when requested', function (t, done) {
    t.request = request(app)
      .set('Accept-Encoding', 'gzip')
      .get('/print.css')
      .expect('gzip compressed', done);
  });

  await t.test('should serve brotli compressed files when requested both gzip and brotli', function (t, done) {
    t.request = request(app)
      .set('Accept-Encoding', 'gzip, br')
      .get('/print.css')
      .expect('brotli compressed', done);
  });

  await t.test('should serve gzip compressed files when requested both gzip and brotli and only .gz is available', function (t, done) {
    t.request = request(app)
      .set('Accept-Encoding', 'gzip, br')
      .get('/code.txt')
      .expect('gzip code', done);
  });

  await t.test('should set Content-Type for compressed files', function (t, done) {
    t.request = request(app)
      .set('Accept-Encoding', 'gzip')
      .get('/print.css')
      .expect('Content-Type', 'text/css; charset=UTF-8', done);
  });

  await t.test('should set Vary for compressed files', function (t, done) {
    t.request = request(app)
      .set('Accept-Encoding', 'gzip')
      .get('/print.css')
      .expect('Vary', 'Accept-Encoding', done);
  });

  await t.test('should set Content-Encoding for compressed files', function (t, done) {
    t.request = request(app)
      .set('Accept-Encoding', 'gzip')
      .get('/print.css')
      .expect('Content-Encoding', 'gzip', done);
  });

  await t.test('should ignore POST requests', function (t, done) {
    t.request = request(app)
      .set('Accept-Encoding', 'gzip')
      .post('/print.css')
      .expect(404, done);
  });

});


test('gzipStatic with options', async function (t) {
  let app;

  t.before(function () {
    app = connect();
    app.use(gzipStatic(fixtures, {
      index: 'print.css',
      setHeaders,
      etag: false,
      lastModified: false,
      cacheControl: false
    }));

    app.use(function (req, res) {
      res.statusCode = 404;
      res.end('sorry!');
    });

    function setHeaders(res) {
      res.setHeader('X-Testing', 'bongo');
    }
  });

  t.afterEach(function (t, done) {
    t.request.close(done);
  });

  await t.test('should send compressed configured index when asked for /', function (t, done) {
    t.request = request(app)
      .get('/')
      .set('Accept-Encoding', 'gzip')
      .expect('gzip compressed', done);
  });

  await t.test('should send compressed configured index when asked for /', function (t, done) {
    t.request = request(app)
      .get('/')
      .set('Accept-Encoding', 'gzip, deflate, sdch, br')
      .expect('brotli compressed', done);
  });

  await t.test('should set Content-Type for for configured index when asked for /', function (t, done) {
    t.request = request(app)
      .get('/')
      .set('Accept-Encoding', 'gzip')
      .expect('Content-Type', 'text/css; charset=UTF-8', done);
  });

  await t.test('should send uncompressed print.css asked for /', function (t, done) {
    t.request = request(app)
      .get('/')
      .expect('body{color:"green";}', done);
  });

  await t.test('should set custom headers when requested', function (t, done) {
    t.request = request(app)
      .get('/')
      .set('Accept-Encoding', 'gzip')
      .expect('X-Testing', 'bongo', done);
  });

  await t.test('should respect custom options', function (t, done) {
    t.request = request(app)
      .get('/')
      .set('Accept-Encoding', 'gzip')
      .end(function (res) {
        res.headers.should.not.have.property('etag');
        res.headers.should.not.have.property('last-modified');
        res.headers.should.not.have.property('cache-control');
        done();
      });
  });

});
