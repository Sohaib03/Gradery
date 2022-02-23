const express = require("express");
const router = express.Router();
const auth = require("../routes/auth");
const teams = require("../database/teams");
const assignmentDB = require("../database/assignments");
const compression = require("../utils/compression");

router.route("/:ass_id").get(auth.authMiddleware, async (req, res) => {
    const ass_id = req.params.ass_id;
    const ass_info = await assignmentDB.getAssignmentById(ass_id);
    if (ass_info.length === 0) {
        res.redirect("/");
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

    if (team_role[0].ROLE === "student") {
        res.redirect("/assignment/" + ass_id);
        return;
    }

    const team_code = team_info[0].TEAM_CODE;
    const team_name = team_info[0].TEAM_NAME;
    const team_desc = team_info[0].TEAM_DESC;

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
        team_code: team_code,
        team_name: team_name,
        team_desc: team_desc,
    };
    res.render("grading", context);
});

router.route("/download/:ass_id").get(auth.authMiddleware, async (req, res) => {
    const ass_id = req.params.ass_id;
    const ass_info = await assignmentDB.getAssignmentById(ass_id);
    if (ass_info.length === 0) {
        res.redirect("/");
        return;
    }

    const team_id = ass_info[0].TEAM_ID;
    const team_info = await teams.getTeamInfo(team_id);

    if (team_info.length === 0) {
        res.redirect("/");
        return;
    }

    const team_role = await teams.checkUserInTeam(req.session.user_id);
    if (team_role.length === 0 || team_role[0].ROLE === "student") {
        req.redirect("/");
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
});

router
    .route("/submit/:ass_id/:std_id")
    .post(auth.authMiddleware, async (req, res) => {
        const ass_id = req.params.ass_id;
        const std_id = req.params.std_id;

        const ass_info = await assignmentDB.getAssignmentById(ass_id);
        if (ass_info.length === 0) {
            res.redirect("/");
            return;
        }

        const team_id = ass_info[0].TEAM_ID;
        const team_info = await teams.getTeamInfo(team_id);

        if (team_info.length === 0) {
            res.redirect("/");
            return;
        }

        const team_role = await teams.checkUserInTeam(req.session.user_id);
        if (team_role.length === 0 || team_role[0].ROLE === "student") {
            req.redirect("/");
            return;
        }

        const score = req.body.score;

        await assignmentDB.gradeSubmission(ass_id, std_id, score);
        res.redirect("/grading/" + ass_id);
    });

module.exports = {
    router,
};
