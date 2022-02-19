const express = require("express");
const router = express.Router();
const auth = require("../routes/auth");
const genUtils = require("../utils/generators");
const teams = require("../database/teams");
const course = require("../database/course");
const notification = require("../database/notification");
const user_middleware = require("../middlewares/user_middleware");
const discussionDB = require("../database/discussion");
const assignments = require("../database/assignments");

router
	.route("/create")
	.get(
		auth.authMiddleware,
		user_middleware.isInstructor,
		async (req, res) => {
			let allCourses = await course.getAllCourses();
			let context = {
				title: "Create a New Team",
				username: req.session.username,
				role: req.session.role,
				allCourses,
			};
			console.log(context);
			res.render("createTeam", context);
		}
	);

router
	.route("/create")
	.post(
		auth.authMiddleware,
		user_middleware.isInstructor,
		async (req, res) => {
			const team_name = req.body.team_name;
			const team_desc = req.body.team_desc;
			const course_id = req.body.course;

			let random_team_code = genUtils.random8Gen();
			let team_query = await teams.getTeamByCode(random_team_code);
			while (team_query.length != 0) {
				random_team_code = genUtils.random8Gen();
				team_query = await teams.getTeamByCode(random_team_code);
			}

			let r = await teams.createNewTeam(
				req.session.user_id,
				team_name,
				random_team_code,
				team_desc,
				course_id
			);
			r = await teams.addParticipantWithCode(
				req.session.user_id,
				random_team_code,
				"admin"
			);

			req.session.notification = {
				status: " is-success is-light ",
				content: "Team Successfully Created",
			};
			res.redirect("/");
		}
	);

router.route("/join").get(auth.authMiddleware, async (req, res) => {
	let context = {
		title: "Join a New Team",
		username: req.session.username,
		role: req.session.role,
	};
	res.render("joinTeam", context);
});

router.route("/join").post(auth.authMiddleware, async (req, res) => {
	const team_code = req.body.team_code;
	console.log(team_code);
	let r = await teams.addParticipantWithCode(
		req.session.user_id,
		team_code,
		"general"
	);
	res.redirect("/");
});

router.route("/code/:code").get(auth.authMiddleware, async (req, res) => {
	const team_code = req.params.code;
	// Check if team_exists
	let team_info = await teams.getTeamByCode(team_code);
	if (team_info.length === 0) {
		// Team Doesnt exist. Notify User
		res.redirect("/");
		return;
	}
	const team_id = team_info[0].TEAM_ID;
	// Check if user is in given team
	if ((await teams.checkUserInTeam(req.session.user_id, team_id)) === 0) {
		// Team Exists but User has not joined team
		res.redirect("/teams/join");
		return;
	}

	const cur_notifications = await notification.getNotificationOfTeam(
		team_info[0].TEAM_ID
	);

	const cur_discussions = await discussionDB.getDefaultDiscussion(
		team_info[0].TEAM_ID
	);

	let assignmentList;
	if (req.session.role == 1) {
		assignmentList = await assignments.getAllNewAssignmentsForStudentInTeam(
			req.session.user_id,
			team_id
		);
	} else if (req.session.role == 0) {
		assignmentList = await assignments.getAllAssignmentsForInstructorInTeam(
			req.session.user_id,
			team_id
		);
	}

	let context = {
		title: team_info[0].TEAM_NAME,
		username: req.session.username,
		role: req.session.role,
		team_code: team_code,
		team_name: team_info[0].TEAM_NAME,
		team_id: team_info[0].TEAM_ID,
		participants: await teams.getParticipantsOfTeam(team_id),
		notifications: cur_notifications,
		assignments: assignmentList,
		discussion: cur_discussions,
	};
	if (req.session.notification)
		context.notification = req.session.notification;
	res.render("teamHome", context);
});

router
	.route("/code/:code/notify")
	.post(
		user_middleware.isInstructor,
		auth.authMiddleware,
		async (req, res) => {
			const team_code = req.params.code;

			// Check if team_exists
			let team_info = await teams.getTeamByCode(team_code);
			if (team_info.length === 0) {
				// Team Doesnt exist. Notify User
				res.redirect("/");
				return;
			}

			const notif_title = req.body.notif_title;
			const notif_content = req.body.notif_content;
			console.log(notif_content.trim().length);

			if (
				notif_title.trim().length === 0 ||
				notif_content.trim().length === 0
			) {
				res.redirect("/teams/code/" + team_code);
				return;
			}

			await notification.sendNotificationToTeam(
				team_info[0].TEAM_ID,
				notif_title,
				notif_content
			);

			console.log({ notif_title, notif_content });
			res.redirect("/teams/code/" + team_code);
		}
	);

module.exports = {
	router,
};
