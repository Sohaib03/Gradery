const crypto = require("crypto");
const util = require("util");

const scrypt = util.promisify(crypto.scrypt);

async function hash(password) {
	return new Promise((resolve, reject) => {
		const salt = crypto.randomBytes(8).toString("hex");

		crypto.scrypt(password, salt, 64, (err, derivedKey) => {
			if (err) reject(err);
			resolve(salt + ":" + derivedKey.toString("hex"));
		});
	});
}

async function verify(password, hash) {
	const [salt, key] = hash.split(":");
	if (salt === undefined || key === undefined) {
		return false;
	}
	const keyBuffer = Buffer.from(key, "hex");
	const derivedKey = await scrypt(password, salt, 64);
	return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

module.exports = {
	hash,
	verify,
};
