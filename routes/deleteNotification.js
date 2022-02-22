const express = require("express");
const router = express.Router();
const auth = require("../routes/auth");
const notification = require("../database/notification");

router.route("/:notif_id").get(auth.authMiddleware, async (req, res) => {
    const user_id = req.session.user_id;
    const notif_id = req.params.notif_id;
    const notificationForUser = await notification.getUserNotificationById(
        user_id,
        notif_id
    );

    if (notificationForUser.length === 0) {
        res.redirect("/");
        return;
    }
    let r = await notification.deleteNotification(notif_id);
    res.redirect("/");
});

module.exports = {
    router,
};
