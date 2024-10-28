const messageModel = require("../models/messages-model")
const utilities = require("../utilities/")
require("dotenv").config()

/* ****************************************
*  Deliver inbox view 
* *************************************** */
async function inboxView(req, res, next) {
  let nav = await utilities.getNav()
  let inboxMessages = await utilities.getAccountMessages(res.locals.accountData.account_id)
  let archivedMessageCount = await messageModel.getArchivedMessageCountByAccountId(res.locals.accountData.account_id)
  res.render("inbox/inbox", {
    title: "Inbox",
    nav,
    errors: null,
    archivedMessageCount,
    inboxMessages,
  })
}

/* ****************************************
*  Deliver archived messages view
* *************************************** */
async function archivedView(req, res, next) {
  let nav = await utilities.getNav()
  let archivedMessages = await utilities.getArchivedMessages(res.locals.accountData.account_id)
  res.render("inbox/archive", {
    title: "Inbox",
    nav,
    errors: null,
    archivedMessages
  })
}

/* ****************************************
*  Deliver send message view
* *************************************** */
async function sendView(req, res, next) {
  let nav = await utilities.getNav()
  let accountSelect = await utilities.getAccountSelect()
  res.render("inbox/send", {
    title: "New Message",
    nav,
    accountSelect,
    errors: null,
  })
}

/* ****************************************
*  Process and send new message
* *************************************** */
async function sendMessage(req, res) {
  let nav = await utilities.getNav()
  const { message_to, message_from, message_subject, message_body } = req.body
  const regResult = await messageModel.sendNewMessage(message_to, message_from, message_subject, message_body)
  if (regResult) {
    let archivedMessageCount = await messageModel.getArchivedMessageCountByAccountId(res.locals.accountData.account_id)
    let inboxMessages = await utilities.getAccountMessages(res.locals.accountData.account_id)
    req.flash("success", `Your message was sent successfully.`)
    res.status(201).render("inbox/inbox", {
      title: "Inbox",
      nav,
      errors: null,
      archivedMessageCount,
      inboxMessages,
    })
  } else {
    let accountSelect = await utilities.getAccountSelect(message_to)
    req.flash("error", "Your message got lost in delivery.")
    res.status(501).render("inbox/send", {
      title: "New Message",
      nav,
      errors: null,
      accountSelect: accountSelect, 
      message_from: message_from, 
      message_subject: message_subject, 
      message_body: message_body,
    })
  }
}

/* ****************************************
*  Deliver read message view
* *************************************** */
async function readMessageView(req, res, next) {
  let message_id = parseInt(req.params.message_id)
  let message = await messageModel.getMessageById(message_id)
  let messageData = message.rows[0]
  let nav = await utilities.getNav()
  res.render("inbox/read", {
    title: `${messageData.message_subject}`,
    nav,
    errors: null,
    message_id: messageData.message_id,
    account_firstname: messageData.account_firstname,
    account_lastname: messageData.account_lastname,
    message_subject: messageData.message_subject,
    message_body: messageData.message_body,
  })
}

/* ****************************************
*  Deliver reply message view (get /reply/:message_id, inbox/replymessage)
* *************************************** */
async function replyMessageView(req, res, next) {
  let message_id = parseInt(req.params.message_id)
  let message = await messageModel.getMessageById(message_id)
  let messageData = message.rows[0]
  let nav = await utilities.getNav()
  res.render("inbox/reply", {
    title: "Reply",
    nav,
    errors: null,
    account_firstname: messageData.account_firstname,
    account_lastname: messageData.account_lastname,
    message_to: messageData.message_to,
    message_from: messageData.message_from,
    message_subject: messageData.message_subject,
    message_body: messageData.message_body,
  })
}

/* ****************************************
*  Process and send new reply 
* *************************************** */
async function replyMessage(req, res) {
  let nav = await utilities.getNav()
  const { message_to, message_from, message_subject, message_body, reply_message } = req.body
  const newSubject = `Re:${message_subject}`
  const newMessageBody = `${message_body} Re:${reply_message}`
  const regResult = await messageModel.sendNewMessage(message_from, message_to, newSubject, newMessageBody)
  if (regResult) {
    let archivedMessageCount = await messageModel.getArchivedMessageCountByAccountId(res.locals.accountData.account_id)
    let inboxMessages = await utilities.getAccountMessages(res.locals.accountData.account_id)
    req.flash("success", `Your reply was sent successfully.`)
    res.status(201).render("inbox/inbox", {
      title: "Inbox",
      nav,
      errors: null,
      archivedMessageCount,
      inboxMessages,
    })
  } else {
    req.flash("error", "Your reply got lost in delivery.")
    res.status(501).render("inbox/reply", {
      title: "Reply",
      nav,
      errors: null,
      account_firstname: account_firstname,
      account_lastname: account_lastname,
      message_to: message_to,
      message_from: message_from,
      message_subject: message_subject,
      message_body: message_body,
      reply_message: reply_message,
    })
  }
}

/* ****************************************
*  process message_read update (get /read/:message_id)
* *************************************** */
async function readMessage(req, res, next) {
  let nav = await utilities.getNav()
  let message_id = parseInt(req.params.message_id)
  let regResult = await messageModel.readMessage(message_id)

  if (regResult) {
    let archivedMessageCount = await messageModel.getArchivedMessageCountByAccountId(res.locals.accountData.account_id)
    let inboxMessages = await utilities.getAccountMessages(res.locals.accountData.account_id)
    req.flash("success", "Message marked as read.")
    res.render("inbox/inbox", {
      title: "Inbox",
      nav,
      errors: null,
      archivedMessageCount,
      inboxMessages,
    })
  } else {
    let message = await messageModel.getMessageById(message_id)
    let messageData = message.rows[0]
    req.flash("error", "Mark as read failed.")
    res.status(501).render("inbox/read", {
      title: `${messageData.message_subject}`,
      nav,
      errors: null,
      message_id: messageData.message_id,
      account_firstname: messageData.account_firstname,
      account_lastname: messageData.account_lastname,
      message_subject: messageData.message_subject,
      message_body: messageData.message_body,
    })
  }
}

/* ****************************************
*  process message_archived update 
* *************************************** */
async function archiveMessage(req, res, next) {
  let nav = await utilities.getNav()
  let message_id = parseInt(req.params.message_id)
  let regResult = await messageModel.archiveMessage(message_id)

  if (regResult) {
    let archivedMessageCount = await messageModel.getArchivedMessageCountByAccountId(res.locals.accountData.account_id)
    let inboxMessages = await utilities.getAccountMessages(res.locals.accountData.account_id)
    req.flash("success", "Message successflly archived.")
    res.render("inbox/inbox", {
      title: "Inbox",
      nav,
      errors: null,
      archivedMessageCount,
      inboxMessages,
    })
  } else {
    let message = await messageModel.getMessageById(message_id)
    let messageData = message.rows[0]
    req.flash("error", "Message archive failed.")
    res.status(501).render("inbox/read", {
      title: `${messageData.message_subject}`,
      nav,
      errors: null,
      message_id: messageData.message_id,
      account_firstname: messageData.account_firstname,
      account_lastname: messageData.account_lastname,
      message_subject: messageData.message_subject,
      message_body: messageData.message_body,
    })
  }
}

/* ****************************************
*  process message deletion (get /delete/:message_id)
* *************************************** */
async function deleteMessage(req, res, next) {
  let nav = await utilities.getNav()
  let message_id = parseInt(req.params.message_id)
  let regResult = await messageModel.deleteMessage(message_id)

  if (regResult) {
    let archivedMessageCount = await messageModel.getArchivedMessageCountByAccountId(res.locals.accountData.account_id)
    let inboxMessages = await utilities.getAccountMessages(res.locals.accountData.account_id)
    req.flash("success", "Message successfully deleted.")
    res.render("inbox/inbox", {
      title: "Inbox",
      nav,
      errors: null,
      archivedMessageCount,
      inboxMessages,
    })
  } else {
    let message = await messageModel.getMessageById(message_id)
    let messageData = message.rows[0]
    req.flash("error", "Message deletion failed.")
    // render view message view again
    res.status(501).render("inbox/read", {
      title: `${messageData.message_subject}`,
      nav,
      errors: null,
      message_id: messageData.message_id,
      account_firstname: messageData.account_firstname,
      account_lastname: messageData.account_lastname,
      message_subject: messageData.message_subject,
      message_body: messageData.message_body,
    })
  }
}

module.exports = { inboxView, archivedView, sendView, sendMessage, readMessageView, replyMessageView, replyMessage, readMessage, archiveMessage, deleteMessage }