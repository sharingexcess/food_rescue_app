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
