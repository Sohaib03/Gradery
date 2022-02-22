const express = require("express");
const router = express.Router();
const auth = require("../routes/auth");
const teams = require("../database/teams");
const resourceDB = require("../database/resource");

router.route("/:team_id/").get(auth.authMiddleware, async (req, res) => {
	const team_id = req.params.team_id;
	const team_role = await teams.checkUserInTeam(req.session.user_id, team_id);
	const allResource = await resourceDB.getAllResource(team_id);

	let context = {
		title: "Resources",
		username: req.session.username,
		role: req.session.role,
		team_role: team_role[0].ROLE,
		team_id,
		allResource,
	};
    if (req.session.notification) {
        context.notification = req.session.notification;
        req.session.notification = undefined;
    }

	res.render("resource", context);
});

router.route("/delete/:res_id/:team_id").get(auth.authMiddleware, async (req, res)=>{
	const team_id = req.params.team_id;
	const team_role = await teams.checkUserInTeam(req.session.user_id, team_id);
	if (team_role  === "student") {
		res.redirect("/");
		return;
	}
	const res_id = req.params.res_id;
	await resourceDB.deleteResource(res_id);
	res.redirect("/resource/" + team_id);
})

router.route("/:team_id/").post(auth.authMiddleware, async (req, res) => {
	const team_id = req.params.team_id;
	const team_role = await teams.checkUserInTeam(req.session.user_id, team_id);
	if (team_role[0].ROLE === "student") res.redirect("/resource/" + team_id);

	const title = req.body.title;
	const desc = req.body.desc;
	if (req.files && req.files.file) {
		const file = req.files.file;
		const file_name =
			"./uploads/" +
			req.session.username +
			"_" +
			new Date().getTime() +
			"_" +
			file.name;
		await file.mv(file_name, (err) => {
			if (err) {
				req.session.notification = {
					status: "is-danger is-light",
					content: "Error while uploading file",
				};
			} else {
				req.session.notification = {
					status: "is-success is-light",
					content: "Successfully Added Resource",
				};
			}
		});

		await resourceDB.createResource(title, desc, file_name, team_id);
		res.redirect("/resource/" + team_id);
	}
	else {
				req.session.notification = {
					status: "is-warning is-light",
					content: "No File was selected",
				};
		res.redirect("/resource/" + team_id);
	}
});

module.exports = {
	router,
};
