const getDuration = (label, startTime) => {
	if (!label || !startTime) return '';

	const endTime = new Date().getTime();
	const timeDifference = Math.round(((endTime - startTime) / 1000 + Number.EPSILON) * 100) / 100;
	return `${label} finished after ${timeDifference}s`;
};

module.exports = getDuration;