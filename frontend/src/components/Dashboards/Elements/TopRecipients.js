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

export function TopRecipients({
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

  const [selectedRecipient, setSelectedRecipient] = useState(null)
  const isEligibleOrg = orgSubtype =>
    !['holding', 'compost'].includes(orgSubtype)

  const processRescues = useMemo(() => {
    if (!rescues || rescues.length === 0) return new Map()

    const recipients = new Map()

    const updateRecipient = (orgId, weight, locationId) => {
      const org = orgsMap.get(orgId)
      if (org) {
        const current = recipients.get(org.name) || {
          total_weight: 0,
          zipcode: null,
        }
        const location = locationsMap.get(locationId)
        recipients.set(org.name, {
          name: org.name,
          total_weight: current.total_weight + weight,
          lat: location?.lat,
          lng: location?.lng,
          city: location?.city,
        })
      }
    }

    rescues.forEach(rescue => {
      if (rescue.status !== 'completed') return

      const transferIds = rescue.transfer_ids.map(id => transferMap.get(id))
      if (
        (rescue.type === 'wholesale' && transferIds.length > 0) ||
        (rescue.type === 'direct_link' && transferIds.length > 0)
      ) {
        const [parentTransfer, ...childTransfers] = transferIds
        if (parentTransfer?.organization_id === donorOrgId) {
          childTransfers.forEach(t => {
            if (
              t?.organization_id &&
              isEligibleOrg(orgsMap.get(t.organization_id).subtype)
            )
              updateRecipient(t.organization_id, t.total_weight, t.location_id)
          })
        }
      } else if (rescue.type === 'retail') {
        let isCollecting = false
        transferIds.forEach(t => {
          if (!t) return
          if (t.type === 'collection')
            isCollecting = t.organization_id === donorOrgId
          else if (
            t.type === 'distribution' &&
            isCollecting &&
            isEligibleOrg(orgsMap.get(t.organization_id)?.subtype)
          )
            updateRecipient(t.organization_id, t.total_weight, t.location_id)
        })
      }
    })

    return recipients
  }, [rescues, transferMap, orgsMap, locationsMap])

  if (
    !transfers ||
    !organizations ||
    transfers.length === 0 ||
    organizations.length === 0
  ) {
    return <div></div>
  }

  const sortedRecipients = Array.from(processRescues.values()).sort(
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
                  Top Recipient Orgs
                </Th>
                <Th textAlign="right" width="30%" fontSize={'sm'}>
                  Donated
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {sortedRecipients.map(
                ({ name, total_weight, lat, lng, city }) => (
                  <Tr
                    key={name}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'gray.600',
                        cursor: 'pointer',
                      },
                    }}
                    onClick={() => setSelectedRecipient({ name, lat, lng })}
                  >
                    <Td textAlign="left">
                      {name}{' '}
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
          selectedEntity={selectedRecipient ? selectedRecipient : null}
          sortedEntities={sortedRecipients}
          dashboardType={dashboardType}
        />
      )}
    </Flex>
  )
}
