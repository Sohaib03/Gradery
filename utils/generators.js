var crypto = require("crypto");

function random8Gen() {
	return crypto.randomBytes(6).toString("hex");
}

module.exports = {
	random8Gen,
};
