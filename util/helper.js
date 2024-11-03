export const sm= (str) => { // string to milliseconds
	const units = {
		yr: { re: /(\d+|\d*\.\d+)\s*(Y)/i, s: 1000 * 60 * 60 * 24 * 365 },
		mo: { re: /(\d+|\d*\.\d+)\s*(M|[Mm][Oo])/, s: 1000 * 60 * 60 * 24 * 30 },
		wk: { re: /(\d+|\d*\.\d+)\s*(W)/i, s: 1000 * 60 * 60 * 24 * 7 },
		dy: { re: /(\d+|\d*\.\d+)\s*(D)/i, s: 1000 * 60 * 60 * 24 },
		hr: { re: /(\d+|\d*\.\d+)\s*(h)/i, s: 1000 * 60 * 60 },
		mn: { re: /(\d+|\d*\.\d+)\s*(m(?![so])|[Mm][Ii]?[Nn])/, s: 1000 * 60 },
		s: { re: /(\d+|\d*\.\d+)\s*(s)/i, s: 1000 },
		ms: { re: /(\d+|\d*\.\d+)\s*(ms|mil)/i, s: 1 },
	};

	return Object.values(units).reduce(
		(sum, unit) => sum + (str.match(unit.re)?.[1] * unit.s || 0),
		0,
	);
};

