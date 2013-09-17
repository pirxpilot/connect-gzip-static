var gzipStatic = require('..');

var connect = require('connect');
var fixtures = __dirname + '/fixtures';
var app = connect();

/* global describe, it */


app.use(gzipStatic(fixtures));

app.use(function(req, res){
  res.statusCode = 404;
  res.end('sorry!');
});

describe('gzipStatic', function(){
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
