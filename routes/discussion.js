const express = require("express");
const router = express.Router();
const auth = require("../routes/auth");
const discussionDB = require("../database/discussion");
const teams = require("../database/teams");

router
    .route("/:team_code/delete/:dis_id")
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

        const dis_id = req.params.dis_id;

        let r = await discussionDB.deleteDiscussion(dis_id);
        res.redirect("/teams/code/" + team_code);
    });

router
    .route("/:team_code/:dis_id/:def")
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

        if (team_role.length === 0) {
            res.redirect("/");
            return;
        }

        const dis_id = req.params.dis_id;

        const def = req.params.def;

        const message = req.body.message;
        const user_id = req.session.user_id;

        discussionDB.createNewMessage(dis_id, user_id, message);

        if (def === "1") res.redirect("/teams/code/" + team_code);
        else res.redirect("/dis/" + team_code + "/" + dis_id);
    });

router
    .route("/:team_code/create")
    .get(auth.authMiddleware, async (req, res) => {
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

        if (team_role.length === 0) {
            res.redirect("/");
            return;
        }

        let context = {
            title: "Create Discussion",
            username: req.session.username,
            role: req.session.ROLE,
            team_name: team_info[0].TEAM_NAME,
            team_code,
        };

        res.render("newDiscussion", context);
    });

router
    .route("/:team_code/create")
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

        if (team_role.length === 0) {
            res.redirect("/");
            return;
        }

        const discussion_title = req.body.dis_title;
        const discussion_body = req.body.dis_content;
        console.log({ team_id, discussion_body, discussion_title });
        await discussionDB.createDiscussion(
            discussion_title,
            discussion_body,
            team_id
        );
        res.redirect("/teams/code/" + team_code);
    });

router
    .route("/:team_code/:dis_id")
    .get(auth.authMiddleware, async (req, res) => {
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

        if (team_role.length === 0) {
            res.redirect("/");
            return;
        }

        const dis_id = req.params.dis_id;
        const cur_discussion = await discussionDB.getDiscussionMessage(dis_id);
        const dis_info = await discussionDB.getDiscussionInfo(dis_id);
        let context = {
            title: dis_info[0].TITLE,
            username: req.session.username,
            role: req.session.role,
            discussion: cur_discussion,
            dis_id: dis_id,
            team_code: team_info[0].TEAM_CODE,
            team_role: team_role[0].ROLE,
            team_name: team_info[0].TEAM_NAME,
            team_desc: team_info[0].TEAM_DESC,
            dis_status: dis_info[0].STATUS,
            team_id: team_id,
            dis_title: dis_info[0].TITLE,
            dis_content: dis_info[0].BODY,
        };

        res.render("discussionPage", context);
    });

module.exports = {
    router,
};
