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

	this.name = 'riemann';
	this.tags = opts.tags || [];
	this.serviceName = opts.name || module.parent.filename;
	this.level = opts.logLevel || 'error';
	this.host = opts.host;
	this.port = opts.port || 5555;
}

util.inherits(Riemann, winston.Transport);

Riemann.prototype._ensureClient = function ensureClient(client) {
	var self = this;
	if (self.client) {
		return;
	}

	self.client = client || riemann.createClient({
		host: self.host,
		port: self.port || 5555
	}, function connected() {
		self.client.on('disconnect', function disconnected() {
			delete self.client;
		});
	});
};

Riemann.prototype.log = function log(level, msg, meta, callback) {
	var haveMeta = !!(meta && Object.keys(meta).length > 0);
	var description = haveMeta
		? util.format('%s : %j', msg, meta)
		: util.format('%s', msg);
	var event = {
		service: this.serviceName,
		tags: ['Log', level].concat(this.tags),
		description: description,
		state: level
	};

	this._ensureClient();
	if (callback) {
		//If a callback is passed in we want guaranteed delivery, so use TCP
		this.client.send(this.client.Event(event), this.client.tcp);
		process.nextTick(function () {
			callback();
		});
	} else {
		this.client.send(this.client.Event(event));
	}
};

Riemann.prototype.disconnect = function disconnect(callback) {
	this.client.disconnect(function disconnected() {
		if (callback) {
			return callback();
		}
	});
};

winston.transports.Riemann = module.exports = exports = Riemann;
