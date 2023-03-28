const firebaseAdmin = require('firebase-admin')
const { db } = require('../../../helpers')

exports.duplicateCollectionEndpoint = async (_request, response) => {
  const srcCollectionName = 'legacy_rescues_2'
  const destCollectionName = 'legacy_rescues'

  const src = await db.collection(srcCollectionName).count().get()
  const dest = await db.collection(destCollectionName).count().get()
  console.log(src.data().count, 'total src', dest.data().count, 'total dest')

  const documents = await db.collection(srcCollectionName).get()
  let writeBatch = db.batch()
  const destCollection = db.collection(destCollectionName)
  let i = 0
  for (const doc of documents.docs) {
    writeBatch.set(destCollection.doc(doc.id), doc.data())
    i++
    if (i > 400) {
      // write batch only allows maximum 500 writes per batch
      i = 0
      console.log('Intermediate committing of batch operation')
      await writeBatch.commit()
      writeBatch = firebaseAdmin.firestore().batch()
    }
  }
  if (i > 0) {
    console.log(
      'Firebase batch operation completed. Doing final committing of batch operation.'
    )
    await writeBatch.commit()
  } else {
    console.log('Firebase batch operation completed.')
  }
  console.log('copy complete')

  response.status(200).send('done')
}
