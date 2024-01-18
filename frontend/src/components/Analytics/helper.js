export const aggregateWeightsByOrganization = transfers => {
  return transfers.reduce((acc, transfer) => {
    if (!acc[transfer.organization_id]) {
      acc[transfer.organization_id] = 0
    }
    acc[transfer.organization_id] += transfer.total_weight
    return acc
  }, {})
}

export const sortedOrganizationsByWeight = aggregatedWeights => {
  return Object.keys(aggregatedWeights)
    .sort((a, b) => aggregatedWeights[b] - aggregatedWeights[a])
    .map(orgId => ({ orgId, weight: aggregatedWeights[orgId] }))
}

export const getOrganizationsBySortedWeights = (sortedOrgs, organizations) => {
  return sortedOrgs.map(entry => {
    const org = organizations.find(org => org.id === entry.orgId)
    return { ...org, total_weight_donated: entry.weight }
  })
}

export const aggregateWeightsByLocation = (
  transfers,
  locations,
  organizations
) => {
  const locationWeights = {}

  // Aggregating weights by location_id
  transfers.forEach(transfer => {
    const totalWeight = Object.values(transfer.categorized_weight).reduce(
      (a, b) => a + b,
      0
    )
    if (!locationWeights[transfer.location_id]) {
      locationWeights[transfer.location_id] = totalWeight
    } else {
      locationWeights[transfer.location_id] += totalWeight
    }
  })

  // Fetch the corresponding locations based on the location_id from the aggregated weights
  const fetchedLocations = Object.keys(locationWeights).map(locationId => {
    const correspondingLocation = locations.find(loc => loc.id === locationId)
    const org = organizations.find(
      org => org.id === correspondingLocation.organization_id
    )

    return {
      ...correspondingLocation,
      total_weight_received: locationWeights[locationId],
      organization: org,
    }
  })

  return fetchedLocations
}

export const startOfDay = date => {
  const newDate = new Date(date)
  newDate.setHours(0, 0, 0, 0)

  // Adjust for timezone offset to get to UTC
  const timezoneOffset = newDate.getTimezoneOffset() * 60000
  const adjustedDate = new Date(newDate.getTime() - timezoneOffset)

  return adjustedDate
}

export const endOfDay = date => {
  const newDate = new Date(date)
  newDate.setHours(23, 59, 59, 999)

  // Adjust for timezone offset to get to UTC
  const timezoneOffset = newDate.getTimezoneOffset() * 60000
  const adjustedDate = new Date(newDate.getTime() - timezoneOffset)

  return adjustedDate
}

// export function convertToEST(utcTimestamp) {
//   // add 5 hours to get to EST
//   const estTimestamp = new Date(utcTimestamp).getTime() + 18000000
//   return new Date(estTimestamp)
// }
