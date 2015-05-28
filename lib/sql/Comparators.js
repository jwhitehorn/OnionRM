exports.between = function (a, b) {
	return createSpecialObject({ from: a, to: b }, 'between');
};
exports.not_between = function (a, b) {
	return createSpecialObject({ from: a, to: b }, 'not_between');
};
exports.like = function (expr) {
	return createSpecialObject({ expr: expr }, 'like');
};
exports.not_like = function (expr) {
	return createSpecialObject({ expr: expr }, 'not_like');
};

exports.eq = function (v) {
	return createSpecialObject({ val: v }, 'eq');
};
exports.ne = function (v) {
	return createSpecialObject({ val: v }, 'ne');
};
exports.gt = function (v) {
	return createSpecialObject({ val: v }, 'gt');
};
exports.gte = function (v) {
	return createSpecialObject({ val: v }, 'gte');
};
exports.lt = function (v) {
	return createSpecialObject({ val: v }, 'lt');
};
exports.lte = function (v) {
	return createSpecialObject({ val: v }, 'lte');
};
exports.not_in = function (v) {
	return createSpecialObject({ val: v }, 'not_in');
};
exports.any = function(v) {
	return createSpecialObject({ val: v }, 'any');
};
exports.not_any = function(v) {
	return createSpecialObject({ val: v }, 'not_any');
};
exports.mod = function(v) {
	return createSpecialObject({ val: v }, 'mod');
};

// ltree extension: http://www.postgresql.org/docs/9.3/static/ltree.html
exports.lta = function(v) { // ltree ancestor
	return createSpecialObject({ val: v }, 'lta');
};
exports.ltd = function(v) { // ltree descendant
	return createSpecialObject({ val: v }, 'ltd');
};
exports.ltm = function(v) { // ltree match
	return createSpecialObject({ val: v }, 'ltm');
};
exports.date = function(field, tz) {
	return createSpecialObject({ field: v, tz: tz }, 'date');
};

function createSpecialObject(obj, tag) {
	Object.defineProperty(obj, "sql_comparator", {
		configurable : false,
		enumerable   : false,
		value        : function () { return tag; }
	});

	return obj;
}
