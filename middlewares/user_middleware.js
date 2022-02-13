function isInstructor(req, res, next) {
	if (req.session.role !== 0) {
		res.redirect("/");
	} else {
		next();
	}
}

module.exports = {
	isInstructor,
};
