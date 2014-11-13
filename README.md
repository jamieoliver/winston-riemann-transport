# Winston Riemann Transport

[![Build Status](https://travis-ci.org/7digital/winston-riemann-transport.png?branch=master)](http://travis-ci.org/7digital/winston-riemann-transport)

A [riemann][0] transport for [winston][1]

## Usage
``` js
  var winston = require('winston');
  
  //
  // Requiring `winston-riemann-transport` will expose 
  // `winston.transports.Riemann`
  //
  require('winston-riemann-riemann');
  
  winston.add(winston.transports.Riemann, options);
```
* __logLevel:__ Level of messages that this transport should log.
* __host:__ The hostname of your riemann server. *[required]*
* __port__: The port your riemann server is listening on. Defaults to 5555.
* __name:__ The service name for your log messages (see riemann docs). Defaults
to the filename of the module that required the transport.
* __tags__: A string or array of strings to send as tags with the log message.
The transport will also add 'Log' and the log level as tags with the message.

### Installing winston-riemann-transport

``` bash
  $ npm install winston
  $ npm install winston-riemann-transport
```

[0]: http://riemann.io
[1]: https://github.com/flatiron/winston

