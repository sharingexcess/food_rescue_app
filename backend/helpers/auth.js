const admin = require('firebase-admin')
const { performance } = require('perf_hooks')

// defined as a global variable to persist over multiple invocations.
// this should speed up validation time by not re-verifying tokens repeatedly.
const cached_approved_tokens = {}

/**
 * function authenticateRequst(token, permissionCallback)
 *
 * Summary:
 * Used to approve or deny API requests based on user permission
 *
 * Description:
 * This function approves or denies an API request by looking up a user based on the provided access token,
 * and calling the permissionCallback with the acquired user record.
 *
 * @param token: string
 * The access or id token provided in the request header from the client
 *
 * @param permissionCallback: (userObj) => boolean
 * A callback function that accepts a userObj, and returns a boolean to accept or deny the request
 * based on the contents of the userObj.
 */
exports.authenticateRequest = async (token, permissionCallback) => {
  try {
    const start = performance.now()
    console.log('INVOKING FUNCTION: authenticateRequest():', '\nparams:', {
      token: `${token.substring(0, 10)}...`,
      permissionCallback: permissionCallback.toString(),
    })

    // Check if this is a special case that we want to handle uniquely
    if (token === process.env.RETOOL_AUTH_KEY) {
      console.log('Request Authentication: Approved as Retool integration.')
      return true
    }

    // Check if we have already approved this token for faster response
    const cached_user = cached_approved_tokens[token]
    if (cached_user) {
      console.log('Found existing user record in cache:', cached_user)
      return handleValidateAuthentication(cached_user, permissionCallback)
    }

    // if no cached user is available, look up the user to validate permission
    else {
      console.log('No user record matching this token found in cache.')
      const userId = await getUserIdFromToken(token)
      const user = await getUserRecordFromId(userId)
      cacheUserRecordByToken(token, user)
      const response = handleValidateAuthentication(user, permissionCallback)

      console.log(
        'authenticateRequest execution time:',
        (performance.now() - start) / 1000,
        'seconds'
      )
      return response
    }
  } catch (error) {
    console.error('Caught error while authenticating request:', error)
    return false
  }
}

function handleValidateAuthentication(user, permissionCallback) {
  const response = permissionCallback(user)
  console.log(
    'Running permissionCallback():',
    permissionCallback.toString(),
    ' => ',
    response
  )
  if (response === true) {
    console.log('Request Authentication: Approved.')
  } else {
    console.log('Request Authentication: Denied.')
  }
  return response
}

async function getUserIdFromToken(token) {
  console.log('Verifying token with Firebase Auth...')
  const uid = await admin
    .auth()
    .verifyIdToken(token)
    .then(decodedToken => decodedToken.uid)
    .catch(error => {
      throw new Error('Error while verfying token:', error)
    })

  if (!uid) {
    throw new Error('No User Id found matching token:', token)
  } else {
    console.log('Recevied User Id from verified token:', uid)
    return uid
  }
}

async function getUserRecordFromId(uid) {
  console.log(`Getting User Record for id ${uid} from Firestore...`)
  const { email, id, is_driver, is_admin } = await admin
    .firestore()
    .collection('users')
    .doc(uid)
    .get()
    .then(doc => doc.data())
    .catch(error => {
      throw new Error('Error while fetching from Firestore:', error)
    })

  const user = { email, id, is_driver, is_admin }

  if (!user) {
    throw new Error(`No user found matching uid: ${uid}`)
  } else {
    console.log('Recevied User Record from Firestore:', user)
    return user
  }
}

function cacheUserRecordByToken(token, userRecord) {
  cached_approved_tokens[token] = userRecord
  console.log('Cached User Record for future requests.')
}
