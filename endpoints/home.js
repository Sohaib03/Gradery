function homeEndpoint(req, res) {
	if (req.session.username === undefined) {
		res.redirect("/auth/login");
		return;
	}
	const context = {
		title: "Homepage",
		username: req.session.username,
	};
	if (req.session.notification) {
		context.notification = req.session.notification;
		req.session.notification = undefined;
	}
	res.render("home", context);
}

module.exports = {
	homeEndpoint,
};
