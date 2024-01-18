import {
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  Link,
} from '@chakra-ui/react'
import { useState } from 'react'

export function AdvancedAnalyticsTable({ real_impact_transfers }) {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const entriesPerPage = 20

  // Calculate the current entries to be shown
  const indexOfLastEntry = currentPage * entriesPerPage
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage
  const currentEntries = real_impact_transfers
    ? real_impact_transfers.slice(indexOfFirstEntry, indexOfLastEntry)
    : []

  // Change page
  const paginate = pageNumber => setCurrentPage(pageNumber)

  return (
    <>
      {real_impact_transfers ? (
        <Flex direction="column" overflowX="auto" mt={12}>
          <TableContainer>
            <Table variant="striped" size="sm">
              <Thead>
                <Tr>
                  <Th>Rescue ID</Th>
                  <Th>Completed At</Th>
                  <Th>Organization Name</Th>
                  <Th>Location Address</Th>
                  <Th>Total Weight</Th>
                  <Th>Notes</Th>
                </Tr>
              </Thead>
              <Tbody>
                {currentEntries.map(transfer => (
                  <Tr key={(Math.random() + 1).toString(36).substring(7)}>
                    <Td>
                      {transfer.rescue_id ? (
                        <Link
                          href={`/rescues/${transfer.rescue_id}`}
                          target="_blank"
                        >
                          {transfer.rescue_id}
                        </Link>
                      ) : (
                        ''
                      )}
                    </Td>
                    <Td>
                      {transfer.timestamp_completed
                        ? new Date(transfer.timestamp_completed).toLocaleString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            }
                          )
                        : ''}
                    </Td>
                    <Td>
                      {transfer.organization ? transfer.organization.name : ''}
                    </Td>
                    <Td>
                      {transfer.location ? transfer.location.address1 : ''}
                    </Td>
                    <Td>
                      {transfer.total_weight ? transfer.total_weight : ''}
                    </Td>
                    <Td>{transfer.notes ? transfer.notes : ''}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>

          <Flex justifyContent="center" marginTop="4">
            {[
              ...Array(
                Math.ceil(real_impact_transfers.length / entriesPerPage)
              ).keys(),
            ].map(number => (
              <Button
                key={number}
                onClick={() => paginate(number + 1)}
                m="1"
                size="sm"
              >
                {number + 1}
              </Button>
            ))}
          </Flex>
        </Flex>
      ) : (
        <></>
      )}
    </>
  )
}
