const express = require("express");
const router = express.Router();
const auth = require("../routes/auth");
const teams = require("../database/teams");
const assignmentDB = require("../database/assignments");

router
    .route("/create/:team_code")
    .get(auth.authMiddleware, async (req, res) => {
        const team_code = req.params.team_code;
        const team_info = await teams.getTeamByCode(team_code);

        if (team_info.length === 0) {
            res.redirect("/");
            return;
        }

        const team_id = team_info[0].TEAM_ID;
        const team_name = team_info[0].TEAM_NAME;
        const team_desc = team_info[0].TEAM_DESC;
        const team_role = await teams.checkUserInTeam(
            req.session.user_id,
            team_id
        );

        if (team_role.length === 0 || team_role[0].ROLE === "student") {
            res.redirect("/");
            return;
        }

        let context = {
            title: "Create Assignment",
            username: req.session.username,
            role: req.session.role,
            team_name: team_name,
            team_desc: team_desc,
            team_code: team_code,
        };
        res.render("createAssignment", context);
    });

router.route("/delete/:ass_id").get(auth.authMiddleware, async (req, res) => {
    const ass_id = req.params.ass_id;
    const ass_info = await assignmentDB.getAssignmentById(ass_id);
    if (ass_info.length === 0) {
        redirect("/");
        return;
    }
    const team_id = ass_info[0].TEAM_ID;
    const team_info = await teams.getTeamInfo(team_id);

    if (team_info.length === 0) {
        res.redirect("/");
        return;
    }

    const team_role = await teams.checkUserInTeam(req.session.user_id, team_id);

    if (team_role.length === 0 || team_role[0].ROLE === "student") {
        res.redirect("/");
        return;
    }

    const team_code = team_info[0].TEAM_CODE;
    await assignmentDB.deleteAssignment(ass_id);
    res.redirect("/teams/code/" + team_code);
});

router.route("/:ass_id").get(auth.authMiddleware, async (req, res) => {
    const ass_id = req.params.ass_id;
    const ass_info = await assignmentDB.getAssignmentById(ass_id);
    if (ass_info.length === 0) {
        redirect("/");
        return;
    }

    const team_id = ass_info[0].TEAM_ID;
    const team_info = await teams.getTeamInfo(team_id);

    if (team_info.length === 0) {
        res.redirect("/");
        return;
    }

    const team_role = await teams.checkUserInTeam(req.session.user_id, team_id);

    if (team_role.length === 0) {
        res.redirect("/");
        return;
    }

    const submissionStatus = await assignmentDB.getSubmissionStatus(
        ass_id,
        req.session.user_id
    );

    let context = {
        title: "Create Assignment",
        username: req.session.username,
        role: req.session.role,
        team_code: team_info[0].TEAM_CODE,
        team_name: team_info[0].TEAM_NAME,
        team_desc: team_info[0].TEAM_DESC,
        team_role: team_role[0].ROLE,
        ass_info: ass_info ? ass_info[0] : undefined,
        is_submitted:
            submissionStatus.length !== 0
                ? submissionStatus[0].SUBMISSION_STATUS
                : 0,
        score:
            submissionStatus.length !== 0
                ? submissionStatus[0].SCORE
                : undefined,
    };
    console.log(req.session.notification);
    if (req.session.notification) {
        context.notification = req.session.notification;
        req.session.notification = undefined;
    }
    console.log(context);
    res.render("showAssignment", context);
});

router.route("/submit/:ass_id").post(auth.authMiddleware, async (req, res) => {
    const ass_id = req.params.ass_id;
    const ass_info = await assignmentDB.getAssignmentById(ass_id);

    if (ass_info.length === 0) {
        redirect("/");
        return;
    }

    const team_id = ass_info[0].TEAM_ID;
    const team_info = await teams.getTeamInfo(team_id);

    if (team_info.length === 0) {
        res.redirect("/");
        return;
    }

    const team_role = await teams.checkUserInTeam(req.session.user_id, team_id);

    if (team_role.length === 0) {
        res.redirect("/");
        return;
    }

    console.log({ team_role });
    if (team_role[0].ROLE === "student" && req.files && req.files.file) {
        const file = req.files.file;
        let file_name =
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
                    content: "Successfully Submitted assignment",
                };
                assignmentDB.submitAssignment(
                    ass_id,
                    req.session.user_id,
                    file_name
                );
            }
            res.redirect("/assignment/" + ass_id);
        });
    } else {
        res.redirect("/assignment/" + ass_id);
    }
});

router.route("/").get(auth.authMiddleware, async (req, res) => {
    let assignmentList = [],
        completed_ass = [];

    assignmentList = await assignmentDB.getAllNewAssignmentsForStudent(
        req.session.user_id
    );
    completed_ass = await assignmentDB.getAllCompletedAssignmentsForStudent(
        req.session.user_id
    );

    console.log(completed_ass);

    let context = {
        title: "Assignments",
        username: req.session.username,
        role: req.session.role,
        assignments: assignmentList,
        completed_assignments: completed_ass,
    };
    res.render("userAssignments", context);
});

router
    .route("/create/:team_code")
    .post(auth.authMiddleware, async (req, res) => {
        const team_code = req.params.team_code;
        const team_info = await teams.getTeamByCode(team_code);

        if (team_info.length === 0) {
            res.redirect("/");
            return;
        }

        const team_id = team_info[0].TEAM_ID;
        const team_role = await teams.checkUserInTeam(
            req.session.user_id,
            team_id
        );

        if (team_role.length === 0 || team_role[0].ROLE === "student") {
            res.redirect("/");
            return;
        }

        const title = req.body.title;
        const desc = req.body.desc;
        const deadline_date = req.body.deadline;
        let file, file_name;
        if (req.files) file = req.files.file;
        const [d_date, d_time] = deadline_date.split("T");
        console.log({ title, desc, d_date, d_time, file });

        if (file) {
            file_name =
                "./uploads/" +
                req.session.username +
                "_" +
                new Date().getTime() +
                "_" +
                file.name;
            file.mv(file_name, (err) => {
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
            });
        }
        assignmentDB.createAssignment(
            team_id,
            title,
            desc,
            req.session.user_id,
            file_name,
            d_date + " " + d_time
        );
        res.redirect("/teams/code/" + team_code);
    });

module.exports = {
    router,
};
