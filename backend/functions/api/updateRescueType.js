// const { db } = require('../../helpers')

// async function updateRescueTypeEndpoint(_request, response) {
//   const collectionsRef = db.collection('rescues')
//   const field = 'type'
//   const pageSize = 100
//   let lastDoc = null
//   let count = 0
//   let shouldBreak
//   let batchNum = 1

//   const query = collectionsRef.orderBy(field).limit(pageSize)

//   async function getPage() {
//     const rescues = []

//     // get rescues
//     const currQuery = lastDoc ? query.startAfter(lastDoc) : query
//     await currQuery.get().then(snapshot => {
//       console.log('QUERY RESULT SIZE', snapshot.docs.length)
//       lastDoc = snapshot.docs[snapshot.docs.length - 1]
//       if (snapshot.docs.length < pageSize) shouldBreak = true
//       snapshot.forEach(doc => {
//         const rescue = doc.data()
//         if (!rescue.type) rescues.push(doc.data())
//       })
//     })

//     // add data from first stop
//     const stop_promises = []
//     for (const rescue of rescues) {
//       const stop_promise = db
//         .collection('stops')
//         .doc(rescue.stop_ids[0])
//         .get()
//         .then(doc => doc.data())
//         .then(stop => {
//           rescue.stop = stop
//         })
//       stop_promises.push(stop_promise)
//     }
//     await Promise.all(stop_promises)

//     // add org to first stop
//     const org_promises = []
//     for (const rescue of rescues) {
//       const org_promise = db
//         .collection('organizations')
//         .doc(rescue.stop.organization_id)
//         .get()
//         .then(doc => doc.data())
//         .then(org => {
//           rescue.organization = org
//         })
//       org_promises.push(org_promise)
//     }
//     await Promise.all(org_promises)

//     return rescues.map(i => ({
//       id: i.id,
//       org_type: i.organization.subtype,
//       type: i.type,
//     }))
//   }

//   while (true) {
//     const current_rescues = await getPage()
//     console.log('LAST DOC ID:', current_rescues[current_rescues.length - 1]?.id)
//     const batch = db.batch()
//     let batchPopulated = false
//     for (const rescue of current_rescues) {
//       if (!rescue.type) {
//         batchPopulated = true
//         const type = rescue.org_type === 'wholesale' ? 'wholesale' : 'retail'
//         // console.log(rescue, ` => `, type)
//         batch.set(
//           db.collection('rescues').doc(rescue.id),
//           { type },
//           { merge: true }
//         )
//       }
//     }
//     if (batchPopulated)
//       await batch.commit().then(() => console.log('completed batch update.'))

//     count += current_rescues.length
//     console.log('BATCH:', batchNum, '- HANDLED:', count)
//     batchNum++
//     if (shouldBreak) break
//   }

//   console.log('done.')

//   response.status(200).send()
// }

// exports.updateRescueTypeEndpoint = updateRescueTypeEndpoint
