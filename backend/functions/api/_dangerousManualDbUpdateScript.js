/* 
PLEASE READ CAREFULLY BEFORE USING THIS CODE
a kind note from Ryan McHenry (@ryanmarshallmc)

The following Node.js script is written as an API endpoint that can be used
as a way to run manual database updates, generally to correct for previous bugs.

Example use case: adding a field on a stop that's present on it's parent rescue
to prevent the need for expensive and repetitive join queries.

Be VERY careful using this script, because if gives you the ability to obliterate
production data. Always test carefully in a dev environment well before considering
running this in the PROD environment.

To run it, you can start the app locally using `yarn dev` or `yarn prod` from the
root directory. This will simultaneously run the front and back end apps.
This code can then be run by hitting the base API URL
(can be found in either .env.frontend.dev or .env.frontend.prod)
at the `/_dangerous_manual_db_update_script` endpoint.
Logs will appear in the terminal from which the app is running.

LATEST EDIT:
The current implementation below was used to correct for a bug where wholesale
rescue stops were missing categorized impact data. In other words, the
`impact_data_total_weight` property was properly populated, but no other impact_data
fields were. Because these were all wholesale rescues, we handled this by simply assigning
the `impact_data_total_weight` value to the `impact_data_produce` value, making the very
safe assumption that all wholesale data was most likely produce.

To use this in the future, you ABSOLUTELY will need to edit the below script to adapt it
to your needs. I'm leaving it in place because it offers a helpful framework to pull
paginated data from firestore, create batched updates, and push them with proper logging
along the way. Hopefully that's helpful, but read, debug, and run this with UTMOST CAUTION.

cheers :)

*/

// const { db } = require('../../helpers')

// async function _dangerousManualDbUpdateScriptEndpoint(_request, response) {
//   const collectionsRef = db.collection('stops')
//   // .where('rescue_type', '==', 'wholesale')
//   const pageSize = 100
//   let lastDoc = null
//   let count = 0
//   let shouldBreak
//   let batchNum = 1

//   const FOOD_CATEGORIES = [
//     'impact_data_dairy',
//     'impact_data_bakery',
//     'impact_data_produce',
//     'impact_data_meat_fish',
//     'impact_data_non_perishable',
//     'impact_data_prepared_frozen',
//     'impact_data_mixed',
//     'impact_data_other',
//   ]

//   const query = collectionsRef.orderBy('id').limit(pageSize)

//   async function getPage() {
//     const stops = []

//     // get stops
//     const currQuery = lastDoc ? query.startAfter(lastDoc) : query
//     await currQuery.get().then(snapshot => {
//       console.log('QUERY RESULT SIZE', snapshot.docs.length)
//       lastDoc = snapshot.docs[snapshot.docs.length - 1]
//       lastDoc &&
//         console.log(
//           'LAST DOC ID:',
//           snapshot.docs[snapshot.docs.length - 1].data().id
//         )
//       if (snapshot.docs.length < pageSize) shouldBreak = true
//       snapshot.forEach(doc => {
//         const stop = doc.data()
//         let has_categorized_weight = false
//         for (const category of FOOD_CATEGORIES) {
//           if (stop[category] > 0) {
//             console.log('stop', stop.id, 'has category weight:', category)
//             has_categorized_weight = true
//             break
//           }
//         }
//         if (!has_categorized_weight && stop.impact_data_total_weight > 0)
//           stops.push(stop)
//       })
//     })

//     return stops.map(i => ({
//       id: i.id,
//       impact_data_total_weight: i.impact_data_total_weight,
//     }))
//   }

//   while (true) {
//     const current_stops = await getPage()
//     const batch = db.batch()
//     let batchPopulated = false
//     for (const stop of current_stops) {
//       batchPopulated = true
//       console.log(
//         'UPDATING STOP',
//         stop.id,
//         'with produce weight:',
//         stop.impact_data_total_weight
//       )
//       batch.set(
//         db.collection('stops').doc(stop.id),
//         { impact_data_produce: stop.impact_data_total_weight },
//         { merge: true }
//       )
//     }
//     if (batchPopulated)
//       await batch.commit().then(() => console.log('completed batch update.'))

//     count += current_stops.length
//     console.log('BATCH:', batchNum, '- HANDLED:', count)
//     batchNum++
//     if (shouldBreak) break
//   }

//   console.log('done.')

//   response.status(200).send()
// }

// exports._dangerousManualDbUpdateScriptEndpoint =
//   _dangerousManualDbUpdateScriptEndpoint
