import { CardOverlay } from 'components'
import { Box, Button, Heading, Text } from '@chakra-ui/react'
import { CheckCircleIcon } from '@chakra-ui/icons'

export function Liability({ handleClose }) {
  return (
    <CardOverlay
      isOpen
      closeHandler={handleClose}
      CardHeader={LiabilityHeader}
      CardBody={LiabilityBody}
      CardFooter={() => <LiabilityFooter handleClose={handleClose} />}
    />
  )
}

function LiabilityHeader() {
  return (
    <Heading as="h2" size="md">
      Sharing Excess Liability Release
    </Heading>
  )
}

function LiabilityFooter({ handleClose }) {
  return (
    <Button
      w="100%"
      size="lg"
      leftIcon={<CheckCircleIcon />}
      onClick={handleClose}
    >
      Done
    </Button>
  )
}

function LiabilityBody() {
  return (
    <>
      <Text>
        I certify that I am at least 18 years of age and acknowledge that I am
        not an employee of Sharing Excess, a Non-Profit Organization, having an
        office at 3230 Market Street, Philadelphia, PA 19104 (referred to in
        this release as “Sharing Excess”). I acknowledge that I will be
        conducting Food Rescue pickups for Sharing Excess. I acknowledge that I
        will receive compensation (outlined in a separate agreement) from
        Sharing Excess for services I provide. I acknowledge that this work will
        involve hard work, including bending, stooping, reaching, kneeling,
        lifting and carrying, and I certify and agree that I am in good health
        and physically able to perform such work. I acknowledge that this work
        may involve risk of injury from such work and I agree that I am not an
        employee of Sharing Excess and that I am providing services for Sharing
        Excess at my own risk. As such, I will not be entitled to workers'
        compensation benefits in the event of any injury.
      </Text>
      <Box h="4" />
      <Text>
        I agree that, while providing services to Sharing Excess, and while
        transporting, or being transported to and from the Food Rescue site if
        transportation is provided by Sharing Excess or any of its employees,
        agents or other volunteers, I will:
      </Text>
      <Box h="4" />
      <ul>
        <li display="list-item">
          <Text>
            Observe all safety requirements of Sharing Excess or the property
            owner where the services are conducted, and;
          </Text>
        </li>
        <li>
          <Text>
            Observe all safety requirements of Sharing Excess or the property
            owner where the services are conducted, and;
          </Text>
        </li>
      </ul>
      <Box h="4" />
      <Text>
        I agree that, while using my own vehicle while providing services to
        Sharing Excess, I will:
      </Text>
      <Box h="4" />
      <ul>
        <li>
          <Text>
            Maintain a valid driver's license and active auto insurance
          </Text>
        </li>
        <li>
          <Text>
            Inspect and maintain my automobile, obey all traffic laws, drive
            safely and maintain state required minimum automobile liability
            insurance coverage, which will be primary in the event I am involved
            in an automobile accident
          </Text>
        </li>
        <li>
          <Text>
            Report to Sharing Excess officials any accidents, speeding tickets
            or other traffic violations charged during my services for Sharing
            Excess within 48 hours
          </Text>
        </li>
        <li>
          <Text>
            Pay any and all traffic violations, including parking tickets, that
            I may receive during my services for Sharing Excess
          </Text>
        </li>
      </ul>

      <Box h="4" />
      <Text>
        I acknowledge that Sharing Excess retains the right at its discretion to
        discontinue my services if I am deemed an unsafe driver or act in any
        way that is not in line with the mission and goals of the organization.
      </Text>

      <Box h="4" />
      <Text>
        I acknowledge that Sharing Excess retains the right at its discretion to
        discontinue my services if I am deemed an unsafe driver or act in any
        way that is not in line with the mission and goals of the organization.
        I acknowledge that Sharing Excess is allowing me to participate in these
        services in reliance upon statements made in this Release and upon the
        release of possible claims against them that I am providing in this
        Release. Accordingly, I do hereby, for myself, and dependents, heirs,
        executors and administrators, release, acquit, and forever discharge
        Sharing Excess, affiliated companies/programs, representatives, members,
        designees, officers, directors, board members, employees, agents,
        successors and their assigns (and the property owners where the services
        are conducted and their respective companies, directors, officers,
        employees, agents, representatives, successors and their assigns), of
        and from all, and all manner of, actions, causes of action, suits,
        controversies, damages, judgements, liabilities, claims and demands of
        any nature whatsoever whether in law or in equity, resulting from my
        services to Sharing Excess.
      </Text>
      <Box h="4" />
      <Text>
        I understand that this release is intended to prevent any and all future
        legal action or claims which I might have against Sharing Excess and/or
        property owners arising out of my services provided, including but not
        limited to, travel in my automobile and any other, to and from the
        service site.
      </Text>
      <Box h="4" />
      <Text>
        I grant full permission to Sharing Excess to use any photographs, film,
        video or audio tapes of me performing services for any purpose Sharing
        Excess deems appropriate.
      </Text>
    </>
  )
}
