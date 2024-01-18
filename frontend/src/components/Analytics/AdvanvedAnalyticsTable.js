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
  Image,
} from '@chakra-ui/react'
import { useEffect, useState, useRef } from 'react'
import { DownloadIcon } from '@chakra-ui/icons'

export function AdvancedAnalyticsTable({
  real_impact_transfers,
  organizations,
  locations,
  handlers,
}) {
  const [currentPage, setCurrentPage] = useState(1)
  const entriesPerPage = 20

  const indexOfLastEntry = currentPage * entriesPerPage
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage
  const currentEntries = real_impact_transfers
    ? real_impact_transfers.slice(indexOfFirstEntry, indexOfLastEntry)
    : []
  const [organizationMap, setOrganizationMap] = useState(null)
  const [locationMap, setLocationMap] = useState(null)
  const [handlerMap, setHandlerMap] = useState(null)

  const tableRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    if (tableRef.current) {
      setIsFullscreen(true)
      if (!document.fullscreenElement) {
        tableRef.current.requestFullscreen().catch(err => {
          alert(
            `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
          )
        })
      } else {
        if (document.exitFullscreen) {
          setIsFullscreen(false)
          document.exitFullscreen()
        }
      }
    } else {
      console.error('Table reference is null')
    }
  }

  useEffect(() => {
    if (organizations) {
      const map = new Map()
      organizations.forEach(organization => {
        map.set(organization.id, organization)
      })
      setOrganizationMap(map)
    }
  }, [organizations])

  useEffect(() => {
    if (locations) {
      const map = new Map()

      locations.forEach(location => {
        map.set(location.id, location)
      })
      setLocationMap(map)
    }
  }, [locations])

  useEffect(() => {
    if (handlers) {
      const map = new Map()

      handlers.forEach(handler => {
        map.set(handler.id, handler.name)
      })
      setHandlerMap(map)
    }
  }, [handlers])

  // Change page
  const paginate = pageNumber => setCurrentPage(pageNumber)

  const getPageNumbers = () => {
    const totalPageNumbers = 5
    const pages = []
    let startPage, endPage

    if (totalPages <= totalPageNumbers) {
      startPage = 1
      endPage = totalPages
    } else {
      const maxPagesBeforeCurrentPage = Math.floor(totalPageNumbers / 2)
      const maxPagesAfterCurrentPage = Math.ceil(totalPageNumbers / 2) - 1
      if (currentPage <= maxPagesBeforeCurrentPage) {
        startPage = 1
        endPage = totalPageNumbers
      } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
        startPage = totalPages - totalPageNumbers + 1
        endPage = totalPages
      } else {
        startPage = currentPage - maxPagesBeforeCurrentPage
        endPage = currentPage + maxPagesAfterCurrentPage
      }
    }

    for (let number = startPage; number <= endPage; number++) {
      pages.push(number)
    }

    return pages
  }

  const totalPages = real_impact_transfers
    ? Math.ceil(real_impact_transfers.length / entriesPerPage)
    : 0

  const downloadCsv = async () => {
    if (
      !real_impact_transfers ||
      !organizationMap ||
      !locationMap ||
      !handlerMap
    ) {
      alert('Data is still loading, please wait.')
      return
    }

    let csvContent = 'data:text/csv;charset=utf-8,'
    const headers = [
      'ID',
      'Organization Name',
      'Total Weight (lbs)',
      'Completed At',
      'Location Address',
      'Handler',
      'Impact Zip',
      'Notes',
      'Bakery (lbs)',
      'Dairy (lbs)',
      'Produce (lbs)',
      'Meat/Fish (lbs)',
      'Non-perishable (lbs)',
      'Prepared/Frozen (lbs)',
      'Mixed (lbs)',
      'Other (lbs)',
    ]

    csvContent += headers.join(',') + '\r\n'

    await real_impact_transfers.forEach(transfer => {
      const organizationName =
        organizationMap?.get(transfer.organization_id)?.name || ''
      const locationAddress =
        locationMap?.get(transfer.location_id)?.address1 || ''

      const row = [
        transfer.id.replace(/,/g, '') || '',
        '"' + organizationName.replace(/"/g, '""').substring(0, 500) + '"',
        transfer.total_weight || '',
        transfer.timestamp_completed
          ? new Date(transfer.timestamp_completed)
              .toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
              .replace(/,/g, '')
          : '',
        '"' + locationAddress.replace(/"/g, '""').substring(0, 500) + '"',
        handlerMap?.get(transfer.handler_id).replace(/,/g, '') || '',
        locationMap?.get(transfer.location_id)?.zip.replace(/,/g, '') || '',
        '"' +
          (transfer.notes || '').replace(/"/g, '""').substring(0, 1000) +
          '"',
        transfer.categorized_weight?.bakery || 0,
        transfer.categorized_weight?.dairy || 0,
        transfer.categorized_weight?.produce || 0,
        transfer.categorized_weight?.meat_fish || 0,
        transfer.categorized_weight?.non_perishable || 0,
        transfer.categorized_weight?.prepared_frozen || 0,
        transfer.categorized_weight?.mixed || 0,
        transfer.categorized_weight?.other || 0,
      ]
      csvContent += row.join(',') + '\r\n'
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'Impact Data.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      {real_impact_transfers ? (
        <Flex direction="column" overflowX="auto" mt={6} width="128%">
          <TableContainer
            borderRadius={'md'}
            ref={tableRef}
            backgroundColor={isFullscreen ? 'white' : ''}
            textColor={isFullscreen ? 'black' : ''}
          >
            <Table variant={isFullscreen ? 'simple' : 'striped'} size="sm">
              <Thead>
                <Tr>
                  <Th>ID</Th>
                  <Th>Organization Name</Th>
                  <Th>Completed At</Th>
                  <Th>Location Address</Th>
                  <Th>Total Weight</Th>
                  <Th>Handler</Th>
                  <Th>Impact Zip</Th>
                  <Th>Notes</Th>
                  <Th>Bakery</Th>
                  <Th>Dairy</Th>
                  <Th>Produce</Th>
                  <Th>Meat/Fish</Th>
                  <Th>Non-perishable</Th>
                  <Th>Prepared/Frozen</Th>
                  <Th>Mixed</Th>
                  <Th>Other</Th>
                </Tr>
              </Thead>
              <Tbody>
                {currentEntries.map(transfer => (
                  <Tr key={(Math.random() + 1).toString(36).substring(7)}>
                    <Td>
                      {transfer.rescue_id && (
                        <Link
                          href={`/rescues/${transfer.rescue_id}`}
                          target="_blank"
                        >
                          {transfer.id}
                        </Link>
                      )}
                    </Td>
                    <Td>
                      {organizationMap && (
                        <Link
                          href={`/organizations/${transfer.organization_id}`}
                          target="_blank"
                        >
                          {organizationMap.get(transfer.organization_id)
                            ?.name || ''}
                        </Link>
                      )}
                    </Td>
                    <Td>
                      {transfer.timestamp_completed
                        ? new Date(transfer.timestamp_completed).toLocaleString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )
                        : ''}
                    </Td>
                    <Td>
                      {locationMap?.get(transfer.location_id)?.address1 || null}
                    </Td>
                    <Td>{transfer.total_weight || ''}</Td>
                    <Td>
                      {handlerMap && (
                        <Link
                          href={`/people/${transfer.handler_id}`}
                          target="_blank"
                        >
                          {handlerMap.get(transfer.handler_id) || ''}
                        </Link>
                      )}
                    </Td>
                    <Td>{locationMap?.get(transfer.location_id)?.zip || ''}</Td>
                    <Td>{transfer.notes || ''}</Td>
                    <Td>{transfer.categorized_weight?.bakery}</Td>
                    <Td>{transfer.categorized_weight?.dairy || 0}</Td>
                    <Td>{transfer.categorized_weight?.produce || 0}</Td>
                    <Td>{transfer.categorized_weight?.meat_fish || 0}</Td>
                    <Td>{transfer.categorized_weight?.non_perishable || 0}</Td>
                    <Td>{transfer.categorized_weight?.prepared_frozen || 0}</Td>
                    <Td>{transfer.categorized_weight?.mixed || 0}</Td>
                    <Td>{transfer.categorized_weight?.other || 0}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            {isFullscreen ? (
              <Flex justifyContent="center" marginTop="4">
                <Button
                  onClick={() => paginate(1)}
                  m="1"
                  size="sm"
                  disabled={currentPage === 1}
                >
                  First
                </Button>
                <Button
                  onClick={() => paginate(currentPage - 1)}
                  m="1"
                  size="sm"
                  disabled={currentPage === 1}
                >
                  Prev
                </Button>
                {getPageNumbers().map(number => (
                  <Button
                    key={number}
                    onClick={() => paginate(number)}
                    m="1"
                    size="sm"
                    bg={currentPage === number ? 'blue.500' : 'gray.100'}
                    color={currentPage === number ? 'white' : 'black'}
                  >
                    {number}
                  </Button>
                ))}
                <Button
                  onClick={() => paginate(currentPage + 1)}
                  m="1"
                  size="sm"
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
                <Button
                  onClick={() => paginate(totalPages)}
                  m="1"
                  size="sm"
                  disabled={currentPage === totalPages}
                >
                  Last
                </Button>
                <Button onClick={toggleFullscreen} m="1" size="sm">
                  <Image src={'/Menu/dark/fullscreen.png'} boxSize="20px" />
                </Button>
                <Button onClick={downloadCsv} m="1" size="sm">
                  <DownloadIcon />
                </Button>
              </Flex>
            ) : (
              <></>
            )}
          </TableContainer>
          {!isFullscreen ? (
            <Flex justifyContent="center" marginTop="4">
              <Button
                onClick={() => paginate(1)}
                m="1"
                size="sm"
                disabled={currentPage === 1}
              >
                First
              </Button>
              <Button
                onClick={() => paginate(currentPage - 1)}
                m="1"
                size="sm"
                disabled={currentPage === 1}
              >
                Prev
              </Button>
              {getPageNumbers().map(number => (
                <Button
                  key={number}
                  onClick={() => paginate(number)}
                  m="1"
                  size="sm"
                  bg={currentPage === number ? 'blue.500' : 'gray.100'}
                  color={currentPage === number ? 'white' : 'black'}
                >
                  {number}
                </Button>
              ))}
              <Button
                onClick={() => paginate(currentPage + 1)}
                m="1"
                size="sm"
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
              <Button
                onClick={() => paginate(totalPages)}
                m="1"
                size="sm"
                disabled={currentPage === totalPages}
              >
                Last
              </Button>
              <Button onClick={toggleFullscreen} m="1" size="sm">
                <Image
                  w={32}
                  h={32}
                  src={'/Menu/dark/fullscreen.png'}
                  boxSize="20px"
                />
              </Button>
              <Button onClick={downloadCsv} m="1" size="sm">
                <DownloadIcon />
              </Button>
            </Flex>
          ) : (
            <></>
          )}
        </Flex>
      ) : (
        <></>
      )}
    </>
  )
}
