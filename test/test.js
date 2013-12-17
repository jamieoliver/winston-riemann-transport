var testUtils = require('./utils.js');
var assert = require('chai').assert;
var RiemannTransport = require('../');

describe('Winston Riemann Transport', function () {

	describe('options', function () {

		it('defaults the service name to the parent filename', function () {
			var transport = new RiemannTransport({
				host: 'riemann.acme.com'
			});
			assert.equal(transport.serviceName, __filename);
		});

		it('defaults the port to 5555', function () {
			var transport = new RiemannTransport({
				host: 'riemann.acme.com'
			});
			assert.equal(transport.port, 5555);
		});

		it('sets the logger name to riemann', function () {
			var transport = new RiemannTransport({
				host: 'riemann.acme.com'
			});
			assert.equal(transport.name, 'riemann');
		});

		it('defaults tags to an empty array', function () {
			var transport = new RiemannTransport({
				host: 'riemann.acme.com'
			});
			assert.deepEqual(transport.tags, []);
		});

		it('accepts a string for tags', function () {
			var transport = new RiemannTransport({
				host: 'riemann.acme.com',
				tags: 'foo'
			});
			assert.deepEqual(transport.tags, [ 'foo' ]);
		});

		it('accepts an array of strings for tags', function () {
			var transport = new RiemannTransport({
				host: 'riemann.acme.com',
				tags: [ 'foo', 'bar' ]
			});
			assert.deepEqual(transport.tags, [ 'foo', 'bar' ]);
		});

		it('throws when tags not array or string', function () {
			assert.throws(function () {
				var transport = new RiemannTransport({
					host: 'riemann.acme.com',
					tags: {}
				});
			}, 'Tags must be strings');
		});

		it('throws when tags array contains non-string', function () {
			assert.throws(function () {
				var transport = new RiemannTransport({
					host: 'riemann.acme.com',
					tags: [ 'foo', {} ]
				});
			}, 'Tags must be strings');
		});

		it('throws when no host is supplied', function () {
			assert.throws(function () {
				var transport = new RiemannTransport({});
			}, 'Riemann host is required');
		});

	});

	describe('log', function () {
		var fakeClient = {
			send: testUtils.createSpy(),
			Event: function (opts) { return opts;  }
		};

		beforeEach(function () {
			fakeClient.send.reset();
		});

		it('formats the description with the message and meta', function () {
			var transport = new RiemannTransport({
				host: 'riemann.acme.com'
			});
			transport._ensureClient(fakeClient);
			transport.log('error', 'foo', { bar: 'baz' });
			assert(fakeClient.send.wasCalled());
			assert.equal(fakeClient.send.calls[0][0].description,
				'foo : {"bar":"baz"}'
			);
		});

		it('sends the message as the description', function () {
			var transport = new RiemannTransport({
				host: 'riemann.acme.com'
			});
			transport._ensureClient(fakeClient);
			transport.log('error', 'foo');
			assert(fakeClient.send.wasCalled());
			assert.equal(fakeClient.send.calls[0][0].description,
				'foo'
			);
		});

		it('sends using the provided options', function () {
			var transport = new RiemannTransport({
				host: 'riemann.acme.com',
				name: 'some-name',
				tags: [ 'first', 'second' ]
			});
			transport._ensureClient(fakeClient);
			transport.log('error', 'foo');
			assert(fakeClient.send.wasCalled());
			assert.deepEqual(fakeClient.send.calls[0][0],{
				service: 'some-name',
				tags: [ 'Log', 'error', 'first', 'second' ],
				description: 'foo',
				state: 'error'
			}
			);
		});

	});

});
