const express = require("express");
const router = express.Router();
const auth = require("../routes/auth");
const user_middleware = require("../middlewares/user_middleware");

router
	.route("/create/:team_id/:team_code")
	.get(
		auth.authMiddleware,
		user_middleware.isInstructor,
		async (req, res) => {
			let context = {
				title: "Create Assignment",
				username: req.session.username,
				role: req.session.role,
			};
			res.render("createAssignment", context);
		}
	);

router
	.route("/create/:team_id/:team_code")
	.post(
		auth.authMiddleware,
		user_middleware.isInstructor,
		async (req, res) => {
			const team_id = req.params.team_id;
			const team_code = req.params.team_code;

			const title = req.body.title;
			const desc = req.body.desc;
			const deadline_date = req.body.deadline;

			const file = req.files.file;
			console.log({ title, desc, deadline_date, file });
			file.mv(
				"./uploads/" +
					req.session.username +
					"_" +
					new Date().getTime() +
					file.name,
				(err) => {
					if (err) {
						req.session.notification = {
							status: "is-danger is-light",
							content: "Error while uploading file",
						};
					} else {
						req.session.notification = {
							status: "is-success is-light",
							content: "Successfully Created assignment",
						};
					}
				}
			);

			res.redirect("/teams/code/" + team_code);
		}
	);

module.exports = {
	router,
};
