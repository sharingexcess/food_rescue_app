import { Box, Flex } from '@chakra-ui/react'
import { useApi, useIsMobile } from 'hooks'
import { useParams } from 'react-router-dom'
import { useEffect, useState, useMemo } from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import { startOfDay, endOfDay } from '../Analytics/helper'
import { Header, Stats, TopRecipients, TopDonors } from './Elements'

export function Dashboard() {
  const { donor_id } = useParams()
  const isMobile = useIsMobile()
  const currentDate = new Date()

  const [startDate, setStartDate] = useState(
    new Date(currentDate.setMonth(currentDate.getMonth() - 1))
  )
  const [endDate, setEndDate] = useState(new Date())

  const [rescues, setRescues] = useState([])
  const [collections, setCollections] = useState([])
  const [distributions, setDistributions] = useState([])
  const [organizations, setOrganizations] = useState([])
  const [locations, setLocations] = useState([])
  const [transfers, setTransfers] = useState([])

  const params = useMemo(
    () => ({
      date_range_start: startOfDay(startDate),
      date_range_end: endOfDay(endDate),
      analyticsType: 'basicAnalytics',
    }),
    [startDate, endDate, 'food_category']
  )

  const { data: advanedApiData } = useApi('/analytics', params)
  const { data: organization } = useApi(
    `/organizations/get/${donor_id}`,
    useMemo(() => ({}), [donor_id])
  )

  useEffect(() => {
    if (advanedApiData) {
      setRescues(advanedApiData.rescues)
      setCollections(advanedApiData.collections)
      setDistributions(advanedApiData.distributions)
      setOrganizations(advanedApiData.organizations)
      setLocations(advanedApiData.locations)
      setTransfers(advanedApiData.transfers)
    }
  }, [advanedApiData])

  useEffect(() => {
    if (startDate && endDate) {
      // console.log(startDate, endDate);
    }
  }, [startDate, endDate])

  return (
    <>
      <Box
        display={'flex'}
        justifyContent={'center'}
        flexDirection={'column'}
        alignItems={'center'}
        w={'100%'}
      >
        <Header
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          currOrg={organization ? organization : null}
        />

        <Flex
          direction={isMobile ? 'column' : 'row'}
          width={'100%'}
          justifyContent={'space-between'}
          alignItems={'center'}
        >
          <Stats
            transfers={
              organization?.type === 'donor' ? collections : distributions
            }
            organizations={organizations}
            orgId={donor_id}
            isStatsLoading={!advanedApiData}
            orgType={organization?.type}
          />
        </Flex>
        <Flex
          mt={4}
          direction={isMobile ? 'column' : 'row'}
          width={'100%'}
          justifyContent={'space-between'}
          alignItems={'center'}
        >
          {rescues && organization?.type === 'donor' && (
            <TopRecipients
              rescues={rescues ? rescues : []}
              transfers={transfers ? transfers : []}
              donorOrgId={donor_id ? donor_id : null}
              organizations={organizations ? organizations : []}
              locations={locations ? locations : []}
              isStatsLoading={!advanedApiData}
              isMobile={isMobile}
              dashboardType={organization?.type}
            />
          )}
          {rescues && organization?.type === 'recipient' && (
            <TopDonors
              rescues={rescues ? rescues : []}
              transfers={transfers ? transfers : []}
              donorOrgId={donor_id ? donor_id : null}
              organizations={organizations ? organizations : []}
              locations={locations ? locations : []}
              isStatsLoading={!advanedApiData}
              isMobile={isMobile}
              dashboardType={organization?.type}
            />
          )}
        </Flex>
      </Box>
    </>
  )
}
