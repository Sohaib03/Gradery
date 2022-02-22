const express = require("express");
const router = express.Router();
const auth = require("../routes/auth");
const genUtils = require("../utils/generators");
const teams = require("../database/teams");
const users = require("../database/users");
const invitation = require("../database/invitation");
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

router
    .route("/join/:code/:notif_id/accept")
    .post(auth.authMiddleware, async (req, res) => {
        const team_code = req.params.code;
        const notif_id = req.params.notif_id;
        const team_id = (await teams.getTeamByCode(team_code))[0].TEAM_ID;
        const user_id = req.session.user_id;

        console.log({ user_id, team_id });
        const userAlreadyInTeam = !(
            (await teams.checkUserInTeam(user_id, team_id)).length === 0
        );
        const userDoesntHaveInvitation =
            (await invitation.invitationDoesntExist(user_id, team_id))
                .length === 0;

        if (userAlreadyInTeam) {
            console.log("Already in team");
            await notification.deleteNotification(notif_id);
            res.redirect("/teams/code/" + team_code);
        } else if (userDoesntHaveInvitation) {
            console.log("User doesn't have invitation");
            await notification.deleteNotification(notif_id);
            res.redirect("/");
        } else {
            const invitationRole = (
                await invitation.getInvitation(user_id, team_id)
            )[0].ROLE;
            let r = await teams.addParticipant(
                user_id,
                team_id,
                invitationRole
            );
            await notification.deleteNotification(notif_id);
            res.redirect("/teams/code/" + team_code);
        }
    });

router
    .route("/join/:code/:notif_id/decline")
    .post(auth.authMiddleware, async (req, res) => {
        const team_code = req.params.code;
        const notif_id = req.params.notif_id;
        const team_id = (await teams.getTeamByCode(team_code))[0].TEAM_ID;
        const user_id = req.session.user_id;

        console.log({ user_id, team_id });
        const userAlreadyInTeam = !(
            (await teams.checkUserInTeam(user_id, team_id)).length === 0
        );
        const userDoesntHaveInvitation =
            (await invitation.invitationDoesntExist(user_id, team_id))
                .length === 0;

        if (userAlreadyInTeam) {
            console.log("Already in team");
            await notification.deleteNotification(notif_id);
            res.redirect("/teams/code/" + team_code);
        } else if (userDoesntHaveInvitation) {
            console.log("User doesn't have invitation");
            await notification.deleteNotification(notif_id);
            res.redirect("/");
        } else {
            await invitation.deleteInvitation(user_id, team_id);
            await notification.deleteNotification(notif_id);
            res.redirect("/");
        }
    });

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

    const user_id = req.session.user_id;
    const team_id = (await teams.getTeamByCode(team_code))[0].TEAM_ID;

    const userAlreadyInTeam = !(
        (await teams.checkUserInTeam(user_id, team_id)).length === 0
    );

    if (userAlreadyInTeam) {
        res.redirect("/teams/code/" + team_code);
        return;
    }

    let joiningRole = "student";
    const invitationInfo = await invitation.getInvitation(user_id, team_id);
    if (invitationInfo.length != 0) {
        joiningRole = invitationInfo[0].ROLE;
    }

    let r = await teams.addParticipantWithCode(
        req.session.user_id,
        team_code,
        joiningRole
    );
    res.redirect("/teams/code/" + team_code);
});

router
    .route("/code/:code/notify")
    .post(auth.authMiddleware, async (req, res) => {
        const team_code = req.params.code;
        console.log("Here");

        // Check if team_exists
        let team_info = await teams.getTeamByCode(team_code);
        if (team_info.length === 0) {
            // Team Doesnt exist. Notify User
            res.redirect("/");
            return;
        }

        const user_team_info = await teams.checkUserInTeam(
            req.session.user_id,
            team_info[0].TEAM_ID
        );
        // Check if user is in given team
        if (user_team_info.length === 0) {
            // Team Exists but User has not joined team
            res.redirect("/teams/join");
            return;
        }
        const user_role_in_team = user_team_info[0].ROLE;

        if (user_role_in_team === "student") {
            res.redirect("/teams/code/" + team_code);
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
    });

router
    .route("/code/:code/invite")
    .post(auth.authMiddleware, async (req, res) => {
        const team_code = req.params.code;
        // Check if team_exists
        let team_info = await teams.getTeamByCode(team_code);
        if (team_info.length === 0) {
            // Team Doesnt exist. Notify User
            res.redirect("/");
            return;
        }
        const team_id = team_info[0].TEAM_ID;
        const user_team_info = await teams.checkUserInTeam(
            req.session.user_id,
            team_id
        );
        console.log(user_team_info);
        // Check if user is in given team
        if (user_team_info.length === 0) {
            // Team Exists but User has not joined team
            res.redirect("/teams/join");
            return;
        }
        const user_role_in_team = user_team_info[0].ROLE;

        if (user_role_in_team === "student") {
            res.redirect("/teams/code/" + team_code);
            return;
        }

        const invitedUserName = req.body.invitedUserName;
        const invitedUserRole = req.body.invitedUserRole;
        const invitedUserID = (await users.getUser(invitedUserName))[0].USER_ID;
        const invitedBy = req.session.user_id;

        let userAlreadyInTeam =
            (await teams.checkUserInTeam(invitedUserID, team_info[0].TEAM_ID))
                .length !== 0;

        if (userAlreadyInTeam) {
            res.redirect("/teams/code/" + team_code);
            return;
        }

        let r = await invitation.sendInvitation(
            invitedUserID,
            team_info[0].TEAM_ID,
            invitedUserRole,
            invitedBy
        );

        res.redirect("/teams/code/" + team_code);
    });

router
    .route("/code/:code/leave")
    .post(auth.authMiddleware, async (req, res) => {
        const team_code = req.params.code;

        // Check if team_exists
        let team_info = await teams.getTeamByCode(team_code);
        if (team_info.length === 0) {
            // Team Doesnt exist. Notify User
            res.redirect("/");
            return;
        }

        let r = await teams.deleteParticipant(
            req.session.user_id,
            team_info[0].TEAM_ID
        );

        res.redirect("/");
    });

router.route("/code/:code/edit").get(auth.authMiddleware, async (req, res) => {
    const team_code = req.params.code;
    // Check if team_exists
    let team_info = await teams.getTeamByCode(team_code);
    if (team_info.length === 0) {
        // Team Doesnt exist. Notify User
        res.redirect("/");
        return;
    }
    const team_id = team_info[0].TEAM_ID;
    const user_team_info = await teams.checkUserInTeam(
        req.session.user_id,
        team_id
    );
    console.log(user_team_info);
    // Check if user is in given team
    if (user_team_info.length === 0) {
        // Team Exists but User has not joined team
        res.redirect("/teams/join");
        return;
    }
    const user_role_in_team = user_team_info[0].ROLE;

    if (user_role_in_team !== "admin") {
        res.redirect("/teams/code/" + team_code);
        return;
    }

    let allCourses = await course.getAllCourses();
    let course_id = team_info[0].COURSE_ID;
    let context = {
        title: team_info[0].TEAM_NAME,
        username: req.session.username,
        role: req.session.role,
        team_code: team_code,
        team_name: team_info[0].TEAM_NAME,
        team_id: team_info[0].TEAM_ID,
        team_desc: team_info[0].TEAM_DESC,
        team_role: user_role_in_team,
        allCourses: allCourses,
        course_id: course_id,
    };

    res.render("editTeam", context);
});

router.route("/code/:code/edit").post(auth.authMiddleware, async (req, res) => {
    const team_code = req.params.code;
    // Check if team_exists
    let team_info = await teams.getTeamByCode(team_code);
    if (team_info.length === 0) {
        // Team Doesnt exist. Notify User
        res.redirect("/");
        return;
    }
    const team_id = team_info[0].TEAM_ID;
    const user_team_info = await teams.checkUserInTeam(
        req.session.user_id,
        team_id
    );
    console.log(user_team_info);
    // Check if user is in given team
    if (user_team_info.length === 0) {
        // Team Exists but User has not joined team
        res.redirect("/teams/join");
        return;
    }
    const user_role_in_team = user_team_info[0].ROLE;

    if (user_role_in_team !== "admin") {
        res.redirect("/teams/code/" + team_code);
        return;
    }

    let r = await teams.setTeamInfo(
        team_id,
        req.body.team_name,
        req.body.team_desc,
        req.body.course
    );
    res.redirect("/teams/code/" + team_code);
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
    const user_team_info = await teams.checkUserInTeam(
        req.session.user_id,
        team_id
    );
    console.log(user_team_info);
    // Check if user is in given team
    if (user_team_info.length === 0) {
        // Team Exists but User has not joined team
        res.redirect("/teams/join");
        return;
    }
    const user_role_in_team = user_team_info[0].ROLE;

    const cur_notifications = await notification.getNotificationOfTeam(
        team_info[0].TEAM_ID
    );

    const cur_discussions = await discussionDB.getDefaultDiscussion(
        team_info[0].TEAM_ID
    );
    const all_discussions = await discussionDB.getAllDiscussion(
        team_info[0].TEAM_ID
    );
    const dis_id = await discussionDB.getTeamDiscussion(team_info[0].TEAM_ID);

    let assignmentList = [],
        completed_ass = [];

    if (user_role_in_team === "student") {
        assignmentList = await assignments.getAllNewAssignmentsForStudentInTeam(
            req.session.user_id,
            team_id
        );
        completed_ass =
            await assignments.getAllCompletedAssignmentsForStudentInTeam(
                req.session.user_id,
                team_id
            );
    } else {
        assignmentList = await assignments.getAssignmentUngradedInTeam(team_id);
        completed_ass = await assignments.getAssignmentGradedInTeam(team_id);
    }

    let context = {
        title: team_info[0].TEAM_NAME,
        username: req.session.username,
        role: req.session.role,
        team_code: team_code,
        team_name: team_info[0].TEAM_NAME,
        team_id: team_info[0].TEAM_ID,
        team_desc: team_info[0].TEAM_DESC,
        participants: await teams.getParticipantsOfTeam(team_id),
        notifications: cur_notifications,
        assignments: assignmentList,
        discussion: cur_discussions,
        team_role: user_role_in_team,
        completed_assignments: completed_ass,
        dis_id: dis_id[0].DISCUSSION_ID,
        all_discussions,
    };
    if (req.session.notification)
        context.notification = req.session.notification;
    res.render("teamHome", context);
});
module.exports = {
    router,
};
