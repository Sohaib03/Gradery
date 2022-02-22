const express = require("express");
const router = express.Router();
const auth = require("../routes/auth");
const user_middleware = require("../middlewares/user_middleware");
const teams = require("../database/teams");
const assignmentDB = require("../database/assignments");
const compression = require("../utils/compression");

router
	.route("/:ass_id")
	.get(
		auth.authMiddleware,
		user_middleware.isInstructor,
		async (req, res) => {
			const ass_id = req.params.ass_id;
			const ass_info = await assignmentDB.getAssignmentById(ass_id);
			if (ass_info.length === 0) {
				res.redirect("/");
				return;
			}
			let allSubs = await assignmentDB.allSubs(ass_id);
			let subData = await assignmentDB.getSubmissionData(ass_id);
			console.log({ subData });

			let context = {
				title: "Create Assignment",
				username: req.session.username,
				role: req.session.role,
				submissions: allSubs,
				ass_info: ass_info[0],
				sub_info: subData[0],
			};
			res.render("grading", context);
		}
	);

router
	.route("/download/:ass_id")
	.get(
		auth.authMiddleware,
		user_middleware.isInstructor,
		async (req, res) => {
			const ass_id = req.params.ass_id;
			const ass_info = await assignmentDB.getAssignmentById(ass_id);
			if (ass_info.length === 0) {
				res.redirect("/");
				return;
			}
			let allSubs = await assignmentDB.allSubs(ass_id);
			let fileList = [];
			for (let i = 0; i < allSubs.length; i++) {
				if (allSubs[i].SUBMISSION_FILE)
					fileList.push(allSubs[i].SUBMISSION_FILE);
			}
			let result = await compression.createZipArchive(fileList);
			res.redirect("/file/" + result);
		}
	);

router
	.route("/submit/:ass_id/:std_id")
	.post(
		auth.authMiddleware,
		user_middleware.isInstructor,
		async (req, res) => {
			const ass_id = req.params.ass_id;
			const std_id = req.params.std_id;

			const score = req.body.score;

			await assignmentDB.gradeSubmission(ass_id, std_id, score);
			res.redirect("/grading/" + ass_id);
		}
	);

module.exports = {
	router,
};