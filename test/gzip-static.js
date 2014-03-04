var gzipStatic = require('..');

var connect = require('connect');
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
    app.request()
    .get('/style.css')
    .expect('body{color:"red";}', done);
  });

  it('should set Content-Type', function(done){
    app.request()
    .get('/style.css')
    .expect('Content-Type', 'text/css; charset=UTF-8', done);
  });

  it('should send compressed index.html asked for /', function(done) {
    app.request()
      .get('/subdir/')
      .set('Accept-Encoding', 'gzip')
      .expect('compressed HTML', done);
  });

  it('should send uncompressed index.html asked for /', function(done) {
    app.request()
      .get('/subdir/')
      .expect('<p>Hello</p>', done);
  });

  it('should default max-age=0', function(done){
    app.request()
    .get('/style.css')
    .expect('Cache-Control', 'public, max-age=0', done);
  });

  it('should serve uncompressed files unless requested', function(done){
    app.request()
    .get('/print.css')
    .expect('body{color:"green";}', done);
  });

  it('should serve compressed files when requested', function(done){
    app.request()
    .set('Accept-Encoding', 'gzip')
    .get('/print.css')
    .expect('compressed', done);
  });

  it('should set Content-Type for compressed files', function(done){
    app.request()
    .set('Accept-Encoding', 'gzip')
    .get('/print.css')
    .expect('Content-Type', 'text/css; charset=UTF-8', done);
  });

  it('should set Vary for compressed files', function(done){
    app.request()
    .set('Accept-Encoding', 'gzip')
    .get('/print.css')
    .expect('Vary', 'Accept-Encoding', done);
  });

  it('should set Content-Encoding for compressed files', function(done){
    app.request()
    .set('Accept-Encoding', 'gzip')
    .get('/print.css')
    .expect('Content-Encoding', 'gzip', done);
  });

  it('should ignore POST requests', function(done){
    app.request()
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
      index: 'print.css'
    }));

    app.use(function(req, res){
      res.statusCode = 404;
      res.end('sorry!');
    });
  });

  it('should send compressed print.css asked for /', function(done) {
    app.request()
      .get('/')
      .set('Accept-Encoding', 'gzip')
      .expect('compressed', done);
  });

  it('should send uncompressed print.css asked for /', function(done) {
    app.request()
      .get('/')
      .expect('body{color:"green";}', done);
  });
});