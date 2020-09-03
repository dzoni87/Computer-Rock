const fs = require('fs');

const makeFolderIfMissing = (inputPath) => {
	if (!fs.existsSync(inputPath)) {
		fs.mkdirSync(inputPath, { recursive: true });
	}
};

module.exports = {
	makeFolderIfMissing
};