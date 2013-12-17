function createSpy(fn) {
	function spy() {
		var spyArgs = [].slice.call(arguments);
		spy.calls.push(spyArgs);
		spy.context = this;
		return fn && fn(spyArgs);
	}
	spy.calls = [];
	spy.reset = function reset() {
		spy.calls = [];
	};
	spy.wasCalled = function wasCalled() {
		return spy.calls.length > 0;
	};

	return spy;
}

module.exports = exports = {
	createSpy: createSpy
};
