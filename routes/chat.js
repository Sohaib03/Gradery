const express = require("express");
const router = express.Router();
const auth = require("../routes/auth");
const user = require("../database/users");
const user_middleware = require("../middlewares/user_middleware");
const teams = require("../database/teams");
const chatDB = require("../database/chat");
const { route } = require("express/lib/application");

router.route("/:to_user").get(auth.authMiddleware,async (req, res) => {
	const user_info = await user.getUser(req.params.to_user);
	if (user_info.length === 0) {
		req.session.notification = {
			status: "is-warning is-light",
			content: "No such user found",
		};

		res.redirect("/");
	}
    const allChats = await chatDB.getAllMessages(req.session.user_id, user_info[0].USER_ID);
    console.log(allChats);
	let context = {
		title: "Chat - " + user_info[0].USERNAME,
		username: req.session.username,
		role: req.session.role,
        other_user: req.params.to_user,
        user_id: req.session.user_id,
        allChats,
	};

	res.render("chat", context);
});

router.route("/send/:to_user").post(auth.authMiddleware, async (req, res) => {
	const user_info = await user.getUser(req.params.to_user);
	if (user_info.length === 0) {
		req.session.notification = {
			status: "is-warning is-light",
			content: "No such user found",
		};

		res.redirect("/");
	}
	const to_user = req.params.to_user;
    const message = req.body.message;

    chatDB.sendMessage(req.session.user_id, user_info[0].USER_ID, req.session.username, user_info[0].USERNAME, message);

	res.redirect("/chat/" + to_user);
});

router.route("/create").post(auth.authMiddleware, async (req, res)=> {
    const other_user = req.body.other_user;
    res.redirect("/chat/" + other_user);
})

module.exports = {
	router,
};
