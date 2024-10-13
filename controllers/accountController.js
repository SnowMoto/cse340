const accountModel = require("../models/account-model")
const utilities = require("../utilities/")
const bcrypt = require("bcryptjs")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver default account view 
*  (get (route = account/) == (view = account/account))
* *************************************** */
async function buildAccount(req, res, next) {
  let nav = await utilities.getNav()
  let unreadMessages = await messageModel.getUnreadMessageCountByAccountId(res.locals.accountData.account_id)
  res.render("account/account", {
    title: "Account",
    nav,
    errors: null,
    unreadMessages,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process Registration (post /register)
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
  
  // pass (fname, lname, email, hashpass) to model INSERT statement
  const regResult = await accountModel.registerAccount(account_firstname, account_lastname, account_email, hashedPassword)

  if (regResult) {
    req.flash(
      "success",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    // continue to login view
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors:null,
    })
  } else {
    req.flash("error", "Sorry, the registration failed.")
    // render registration view again
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
}

/* ****************************************
 *  NEW Process login request (post /login)
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    // no account data? do not pass go, do not collect $200
    return
  }
  try {
    let match = await bcrypt.compare(account_password, accountData.account_password);
    if (match) {
      // delete password from accountData array
      // create jwt with payload containing remaining data
      delete accountData.account_password

      // use .env secret key to sign, expires in one hour
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })

      // can only be passed through http requests, maximum age is 1 hour
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      return res.redirect("/account/")
    } else {
      throw new Error('Access forbidden')
    }
  } catch (error) {
    // return new Error('Access Forbidden')
    req.flash("notice", "Please check your credentials and try again.")
    res.redirect("/account/login")
    return error
  }
}

module.exports = { buildLogin, buildRegister, buildAccount, registerAccount, accountLogin}