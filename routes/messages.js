var express = require("express");
var router = express.Router();
let messageController = require("../controllers/messages");
const { checkLogin } = require("../utils/authHandler");
let { uploadFile } = require('../utils/uploadHandler');

// GET "/" - lấy message cuối cùng của mỗi user mà user hiện tại nhắn tin hoặc user khác nhắn cho user hiện tại
router.get("/", checkLogin, async function (req, res, next) {
  try {
    let currentUserId = req.user._id;
    let latestMessages = await messageController.getLatestMessagesForUser(currentUserId);
    res.send(latestMessages);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// GET "/:userID" - lấy toàn bộ message giữa user hiện tại và userID
router.get("/:userID", checkLogin, async function (req, res, next) {
  try {
    let currentUserId = req.user._id;
    let partnerId = req.params.userID;
    
    let messages = await messageController.getMessagesBetweenUsers(currentUserId, partnerId);
    res.send(messages);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// POST "/" - Gửi message mới (có thể chữ hoặc file)
router.post("/", checkLogin, uploadFile.single('file'), async function (req, res, next) {
  try {
    let fromId = req.user._id;
    let toId = req.body.to;
    let type = 'text';
    let text = req.body.text;

    if (req.file) {
      type = 'file';
      text = req.file.path.replace(/\\/g, '/'); // Định dạng path đa nền tảng
    }

    if (!text && type === 'text') {
       return res.status(400).send({ message: "Nội dung tin nhắn không được để trống" });
    }

    if (!toId) {
      return res.status(400).send({ message: "Thiếu ID người nhận (to)" });
    }

    let newMessage = await messageController.createMessage(fromId, toId, type, text);
    res.status(201).send(newMessage);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
