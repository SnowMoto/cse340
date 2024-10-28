const express = require("express")
const router = new express.Router() 
const messageController = require("../controllers/messageController")
const { handleErrors } = require("../utilities")
const validate = require("../utilities/message-validation")

// Route to build inbox/inbox view
router.get("/inbox", handleErrors(messageController.inboxView));

// Route to build inbox/archived view
router.get("/archive", handleErrors(messageController.archivedView));

// Route to build inbox/sent view
router.get("/send", handleErrors(messageController.sendView));

// Route to build inbox/sent view
router.post("/send", validate.messageRules(), validate.checkMessageData,
  handleErrors(messageController.sendMessage));

// Route to build inbox/read message view
router.get("/read/:message_id", handleErrors(messageController.readMessageView));

// Route to build account reply message view
router.get("/reply/:message_id", handleErrors(messageController.replyMessageView));

// Route to build account reply message view
router.post("/reply", validate.replyRules(), validate.checkReplyData, 
    handleErrors(messageController.replyMessage));

// Route to set message_read = true
router.get("/read/:message_id", handleErrors(messageController.readMessage));

// ARCHIVE
// Route to set message_archived = true
router.get("/archive/:message_id", handleErrors(messageController.archiveMessage));

// DELETE
// Route to delete a message
router.get("/delete/:message_id", handleErrors(messageController.deleteMessage));

module.exports = router