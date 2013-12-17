'use strict';

var util = require('util');
var winston = require('winston');
var riemann = require('riemann');

function Riemann(opts) {
	if (!opts.host) {
		throw new Error('Riemann host is required');
	}

	if (!opts.name && !module.parent) {
		throw new Error('Name is required');
	}

	if (opts.tags) {
		if (Array.isArray(opts.tags)) {
			opts.tags.forEach(function checkTag(tag) {
				if (typeof tag !== 'string') {
					throw new Error('Tags must be strings');
				}
			});
		} else {
			if (typeof opts.tags !== 'string') {
				throw new Error('Tags must be strings');
			}
			opts.tags = [opts.tags];
		}
	}

	winston.Transport.call(this, opts);

	this.name = opts.name || module.parent.filename;
	this.tags = opts.tags || [];
	this.serviceName = opts.name || module.parent.filename;
	this.level = opts.logLevel || 'error';
	this.host = opts.host;
	this.port = opts.port || 5555;
}

util.inherits(Riemann, winston.Transport);

Riemann.prototype._ensureClient = function _ensureClient(client) {
	if (this.client) {
		return;
	}

	this.client = client || riemann.createClient({
		host: this.host,
		port: this.port || 5555
	});
};

Riemann.prototype.log = function log(level, msg, meta, callback) {
	var haveMeta = !!(meta && Object.keys(meta).length > 0);
	var description = haveMeta
		? util.format('%s : %j' , msg, meta)
		: util.format('%s', msg);
	var event = {
		service: this.serviceName,
		tags: [ 'Log', level ].concat(this.tags),
		description: description,
		state: level,
	};

	this.client.send(this.client.Event(event));

	if (callback) {
		process.nextTick(function () {
			callback();
		});
	}
};

winston.transports.Riemann = module.exports = exports = Riemann;
