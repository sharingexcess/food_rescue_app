const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
exports.addAdminRole = functions.https.onRequest((req, res) => {
  console.log('\nGOT REQ:\n', req.query.email)
  return admin
    .auth()
    .getUserByEmail(req.query.email)
    .then(user => {
      console.log('got user')
      return admin
        .auth()
        .setCustomUserClaims(user.uid, {
          admin: true,
        })
        .then(data => console.log('successfully created new admin'))
        .catch(e => console.log('error creating new admin:', e))
    })
    .catch(e => console.log('could not find user:', e))
    .then(() => {
      console.log('returning success')
      res.json({
        message: `created new admin user: ${req.email}`,
      })
    })
    .catch(e => {
      console.log('returning error')
      res.send(e)
    })
})

exports.isUserAdminByEmail = functions.https.onRequest((req, res) => {
  console.log('\nGOT REQ:\n', req.query.email)
  admin
    .auth()
    .getUserByEmail(req.query.email)
    .then(userRecord => {
      // See the UserRecord reference doc for the contents of userRecord.
      console.log(
        `Successfully fetched user data:`,
        userRecord,
        userRecord.customClaims
      )
      res.json(userRecord.toJSON())
    })
    .catch(error => {
      console.log('Error fetching user data:', error)
      res.send('could not find user')
    })
})
