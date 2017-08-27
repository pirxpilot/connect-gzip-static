var gzipStatic = require('..');

var connect = require('connect');
var request = require('./support/http');

var fixtures = __dirname + '/fixtures';

/* global describe, before, it */

describe('gzipStatic', function(){
  var app;

  before(function() {
    app = connect();
    app.use(gzipStatic(fixtures));

    app.use(function(req, res){
      res.statusCode = 404;
      res.end('sorry!');
    });
  });

  it('should serve static files', function(done){
    request(app)
    .get('/style.css')
    .expect('body{color:"red";}', done);
  });

  it('should set Content-Type', function(done){
    request(app)
    .get('/style.css')
    .expect('Content-Type', 'text/css; charset=UTF-8', done);
  });

  it('should send compressed index.html when asked for /', function(done) {
    request(app)
      .get('/subdir/')
      .set('Accept-Encoding', 'gzip')
      .expect('compressed HTML', done);
  });

  it('should set Content-Type when asked for /', function(done){
    request(app)
      .set('Accept-Encoding', 'gzip')
      .get('/subdir/')
      .expect('Content-Type', 'text/html; charset=UTF-8', done);
  });

  it('should send uncompressed index.html when asked for /', function(done) {
    request(app)
      .get('/subdir/')
      .expect('<p>Hello</p>', done);
  });

  it('should default max-age=0', function(done){
    request(app)
    .get('/style.css')
    .expect('Cache-Control', 'public, max-age=0', done);
  });

  it('should set ETag and Last-Modified', function(done){
    request(app)
      .get('/print.css')
      .set('Accept-Encoding', 'gzip')
      .end(function(res) {
        res.headers.should.have.property('etag');
        res.headers.should.have.property('last-modified');
        done();
      });
  });

  it('should serve uncompressed files unless requested', function(done){
    request(app)
    .get('/print.css')
    .expect('body{color:"green";}', done);
  });

  it('should serve compressed files when requested', function(done){
    request(app)
    .set('Accept-Encoding', 'gzip')
    .get('/print.css')
    .expect('gzip compressed', done);
  });

  it('should serve brotli compressed files when requested both gzip and brotli', function(done){
    request(app)
    .set('Accept-Encoding', 'gzip, br')
    .get('/print.css')
    .expect('brotli compressed', done);
  });

  it('should serve gzip compressed files when requested both gzip and brotli and only .gz is available', function(done){
    request(app)
    .set('Accept-Encoding', 'gzip, br')
    .get('/code.txt')
    .expect('gzip code', done);
  });

  it('should set Content-Type for compressed files', function(done){
    request(app)
    .set('Accept-Encoding', 'gzip')
    .get('/print.css')
    .expect('Content-Type', 'text/css; charset=UTF-8', done);
  });

  it('should set Vary for compressed files', function(done){
    request(app)
    .set('Accept-Encoding', 'gzip')
    .get('/print.css')
    .expect('Vary', 'Accept-Encoding', done);
  });

  it('should set Content-Encoding for compressed files', function(done){
    request(app)
    .set('Accept-Encoding', 'gzip')
    .get('/print.css')
    .expect('Content-Encoding', 'gzip', done);
  });

  it('should ignore POST requests', function(done){
    request(app)
    .set('Accept-Encoding', 'gzip')
    .post('/print.css')
    .expect(404, done);
  });

});


describe('gzipStatic with options', function () {
  var app;

  before(function() {
    app = connect();
    app.use(gzipStatic(fixtures, {
      index: 'print.css',
      setHeaders: setHeaders,
      etag: false,
      lastModified: false,
      cacheControl: false
    }));

    app.use(function(req, res){
      res.statusCode = 404;
      res.end('sorry!');
    });

    function setHeaders(res) {
      res.setHeader('X-Testing', 'bongo');
    }
  });

  it('should send compressed configured index when asked for /', function(done) {
    request(app)
      .get('/')
      .set('Accept-Encoding', 'gzip')
      .expect('gzip compressed', done);
  });

  it('should send compressed configured index when asked for /', function(done) {
    request(app)
      .get('/')
      .set('Accept-Encoding', 'gzip, deflate, sdch, br')
      .expect('brotli compressed', done);
  });

  it('should set Content-Type for for configured index when asked for /', function(done) {
    request(app)
      .get('/')
      .set('Accept-Encoding', 'gzip')
      .expect('Content-Type', 'text/css; charset=UTF-8', done);
  });

  it('should send uncompressed print.css asked for /', function(done) {
    request(app)
      .get('/')
      .expect('body{color:"green";}', done);
  });

  it('should set custom headers when requested', function(done) {
    request(app)
      .get('/')
      .set('Accept-Encoding', 'gzip')
      .expect('X-Testing', 'bongo', done);
  });

  it('should respect custom options', function(done) {
    request(app)
      .get('/')
      .set('Accept-Encoding', 'gzip')
      .end(function(res) {
        res.headers.should.not.have.property('etag');
        res.headers.should.not.have.property('last-modified');
        res.headers.should.not.have.property('cache-control');
        done();
      });
  });

});
