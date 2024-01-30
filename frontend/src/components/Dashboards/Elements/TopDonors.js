import { useMemo, useState } from 'react'
import {
  Box,
  Table,
  Thead,
  Tr,
  Th,
  Td,
  Tbody,
  Flex,
  Text,
} from '@chakra-ui/react'
import { formatLargeNumber } from 'helpers'
import ImpactMap from './ImpactMap'

export function TopDonors({
  transfers,
  rescues,
  donorOrgId,
  organizations,
  locations,
  isStatsLoading,
  dashboardType,
}) {
  const transferMap = useMemo(
    () => new Map(transfers?.map(t => [t.id, t])),
    [transfers]
  )
  const orgsMap = useMemo(
    () => new Map(organizations?.map(o => [o.id, o])),
    [organizations]
  )
  const locationsMap = useMemo(
    () => new Map(locations?.map(l => [l.id, l])),
    [locations]
  )

  const [selectedDonor, setSelectedDonor] = useState(null)

  function findCollectionsForDistribution(transfers, donorOrgId) {
    const result = []
    let collectionBuffer = []
    let distributionBuffer = []

    function processCollections() {
      const targetDistributions = distributionBuffer.filter(
        dist => dist.organization_id === donorOrgId
      )
      if (targetDistributions.length > 0) {
        const totalDistributedWeight = targetDistributions.reduce(
          (total, dist) => total + dist.total_weight,
          0
        )
        const totalCollectionWeight = collectionBuffer.reduce(
          (total, collection) => total + collection.total_weight,
          0
        )

        collectionBuffer.forEach(collection => {
          const proportion = collection.total_weight / totalCollectionWeight
          collection.distributed_weight = Math.round(
            totalDistributedWeight * proportion
          )
          result.push(collection)
        })
      }

      collectionBuffer = []
      distributionBuffer = []
    }

    transfers.forEach(item => {
      if (item?.type === 'collection') {
        if (distributionBuffer.length > 0) {
          processCollections()
        }
        collectionBuffer.push(item)
      } else if (item?.type === 'distribution') {
        distributionBuffer.push(item)
      }
    })

    if (collectionBuffer.length > 0) {
      processCollections()
    }

    return result
  }

  const processRescues = useMemo(() => {
    if (!rescues || rescues.length === 0) return new Map()

    const donors = new Map()

    const updateDonors = collections => {
      collections.forEach(collection => {
        const org = orgsMap.get(collection.organization_id)
        const orgName = org.name
        const weight = collection.distributed_weight
        const lat = locationsMap.get(collection.location_id).lat
        const lng = locationsMap.get(collection.location_id).lng
        const locationId = collection.location_id
        const city = locationsMap.get(collection.location_id).city

        if (org) {
          const current = donors.get(locationId) || {
            total_weight: 0,
            zipcode: null,
          }
          donors.set(locationId, {
            name: orgName,
            total_weight: current.total_weight + weight,
            lat: lat,
            lng: lng,
            key: locationId,
            city: city,
          })
        }
      })
    }

    rescues.forEach(rescue => {
      if (rescue.status !== 'completed') return

      const transfers = rescue.transfer_ids.map(id => transferMap.get(id))

      const collections = findCollectionsForDistribution(transfers, donorOrgId)

      if (collections.length > 0) {
        updateDonors(collections)
      }
    })

    return donors
  }, [rescues, transferMap, orgsMap, locationsMap])

  if (
    !transfers ||
    !organizations ||
    transfers.length === 0 ||
    organizations.length === 0
  ) {
    return <div></div>
  }

  const sortedDonors = Array.from(processRescues.values()).sort(
    (a, b) => b.total_weight - a.total_weight
  )

  return (
    <Flex flexDirection={'column'} w={'100%'}>
      {isStatsLoading ? null : (
        <Box
          maxH="500px"
          w={'100%'}
          overflowY="auto"
          boxShadow="base"
          borderRadius="md"
          mb={6}
        >
          <Table variant="simple" colorScheme={'gray'} borderRadius={'md'}>
            <Thead backdropBlur={'green'} borderRadius={'md'}>
              <Tr>
                <Th textAlign="left" width="70%" fontSize={'sm'}>
                  Top Donor Orgs
                </Th>
                <Th textAlign="right" width="30%" fontSize={'sm'}>
                  Received
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {sortedDonors.map(
                ({ name, total_weight, lat, lng, key, city }) => (
                  <Tr
                    key={key}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'gray.600',
                        cursor: 'pointer',
                      },
                    }}
                    onClick={() => setSelectedDonor({ name, lat, lng, key })}
                  >
                    <Td textAlign="left">
                      {name}
                      <Text fontSize={'xs'} color={'grey'}>
                        {city}
                      </Text>
                    </Td>
                    <Td textAlign="right">
                      {formatLargeNumber(total_weight)} lbs.
                    </Td>
                  </Tr>
                )
              )}
            </Tbody>
          </Table>
        </Box>
      )}

      {isStatsLoading ? null : (
        <ImpactMap
          selectedEntity={selectedDonor ? selectedDonor : null}
          sortedEntities={sortedDonors}
          dashboardType={dashboardType}
        />
      )}
    </Flex>
  )
}
