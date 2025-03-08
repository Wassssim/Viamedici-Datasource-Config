import express from 'express';
import timeout = require('connect-timeout');
import cors from 'cors';

const port = process.env.PORT || 4500;
var app = express();
var compression = require('compression');

app.use(cors());

app.get('/*', function (req, res, next) {
  res.setHeader('Last-Modified', +'-' + new Date().toUTCString());
  //No Response Caching
  res.set(
    'Cache-Control',
    'no-store, no-cache, no-transform, must-revalidate, max-age=0'
  );
  next();
});

//Response Compression
app.use(compression());

app.use(express.static(__dirname + '/dist/ExcelExportWebApp'));

var allroutes = require('./server/routes/index.ts');

app.use(timeout('600s'));
app.use(express.json());
app.use('/api', allroutes);

const server = app.listen(port, () => {
  console.log('Backend listening on port: ' + port);
});

server.setTimeout(600000);
