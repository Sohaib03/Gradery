const teams = require("../database/teams");
const users = require("../database/users");
const notification = require("../database/notification");
async function homeEndpoint(req, res) {
    const userTeamIDs = await teams.getAllTeams(req.session.user_id);
    let userTeams = [];
    for (let i = 0; i < userTeamIDs.length; i++) {
        userTeams.push((await teams.getTeamInfo(userTeamIDs[i].TEAM_ID))[0]);
    }

    console.log(userTeams);

    userTeams.sort(function (a, b) {
        var nameA = a.TEAM_NAME.toUpperCase();
        var nameB = b.TEAM_NAME.toUpperCase();
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        return 0;
    });

    const cur_notifications = await notification.getNotificationOfUser(
        req.session.user_id
    );

    const context = {
        title: "Homepage",
        username: req.session.username,
        role: req.session.role,
        teamsID: userTeamIDs,
        teamsInfo: userTeams,
        userNotifications: cur_notifications,
    };
    console.log(context);
    if (req.session.notification) {
        context.notification = req.session.notification;
        req.session.notification = undefined;
    }
    res.render("home", context);
}

module.exports = {
    homeEndpoint,
};
