const globalVars = require('../../helpers/globalVars');

module.exports = {
	ifEquals: function(arg1, arg2, options) {
		return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
	},

	compare: function(v1, operator, v2) {
		switch (operator) {
			case '==': return v1 === v2;
			case '===': return v1 === v2;
			case '!=': return v1 !== v2;
			case '!==': return v1 !== v2;
			case '<': return v1 < v2;
			case '<=': return v1 <= v2;
			case '>': return v1 > v2;
			case '>=': return v1 >= v2;
			case '&&': return v1 && v2;
			case '||': return v1 || v2;
			default: throw new Error('helper {{compare}}: invalid operator ' + operator);
		}
	},

	isProduction: function() {
		return globalVars.mode === 'production';
	},

	isBeta: function() {
		return globalVars.isBeta;
	},

	getBodyClass: function() {
		return globalVars.bodyClass;
	},

	setBodyClass: function(input) {
		globalVars.bodyClass = input;
	},

	getPath: function() {
		return globalVars.isMultilanguage ? globalVars.path : '';
	},

	getVersion: function() {
		return globalVars.mode === 'production' ? '' : `?v=${new Date().getTime()}`;
	},

	isMultilanguage: function() {
		return globalVars.isMultilanguage;
	}
};
