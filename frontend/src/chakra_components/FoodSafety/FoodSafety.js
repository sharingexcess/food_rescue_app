import React, { useEffect, useState } from 'react'
import {
  Button,
  Flex,
  Spacer,
  Heading,
  ListItem,
  OrderedList,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
} from '@chakra-ui/react'
import { Page } from 'chakra_components'
import { CheckCircleIcon } from '@chakra-ui/icons'
import { useAuth } from 'hooks'

export function FoodSafety({ handleNext }) {
  const { hasPermission } = useAuth()
  const [openedSections, setOpenedSections] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ])

  const allSectionsOpened = () => {
    let result = true
    for (const section of openedSections) {
      if (!section) {
        result = false
        break
      }
    }
    return result
  }

  function handleAccordionChange(index) {
    const updatedOpenedSections = [...openedSections]
    updatedOpenedSections[index] = true
    setOpenedSections(updatedOpenedSections)
  }

  return (
    <>
      <Heading mt="8" mb="8" color="se.brand.primary" size="2xl">
        Food safety is our priority
      </Heading>

      <Text color="element.secondary" mb="4">
        Our goal is to safely provide healthy food excess from our donors to
        hunger relief organizations in 30 minutes or less.
      </Text>
      <Text color="element.secondary" mb="8">
        Food safety guidelines ensure that we do our job professionally with
        integrity and compassion for all parties.
      </Text>

      <Accordion allowToggle onChange={handleAccordionChange}>
        <AccordionItem>
          <AccordionButton>
            <Flex w="100%" gap="4">
              <Heading
                mt="4"
                mb="4"
                size="md"
                color="element.secondary"
                fontWeight="600"
              >
                01
              </Heading>
              <Heading mt="4" mb="4" size="md">
                Our 3 Golden Rules
              </Heading>
            </Flex>
            {openedSections[0] && !hasPermission && (
              <CheckCircleIcon mx="2" color="se.brand.primary" h="4" w="4" />
            )}
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb="4" ml="10">
            <OrderedList spacing="4" stylePosition="inside">
              <ListItem>
                Always be consistent and courteous to partners.
              </ListItem>
              <ListItem> Never eat or take any food donations.</ListItem>
              <ListItem> Only accept good quality food.</ListItem>
            </OrderedList>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton>
            <Flex w="100%" gap="3">
              <Heading
                mt="4"
                mb="4"
                size="md"
                color="element.secondary"
                fontWeight="600"
              >
                02
              </Heading>
              <Heading mt="4" mb="4" size="md">
                Pickup and Delivery
              </Heading>
            </Flex>
            {openedSections[1] && !hasPermission && (
              <CheckCircleIcon mx="2" color="se.brand.primary" h="4" w="4" />
            )}
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb="4" ml="10">
            <Text color="element.secondary">
              Please drive safe, obey traffic laws, and avoid parking tickets.
            </Text>
            <Heading mt="8" mb="4" size="md">
              Packaging
            </Heading>
            <Text as="div">
              <OrderedList spacing="4" stylePosition="inside">
                <ListItem>
                  All food items should be properly packed in boxes or sturdy
                  bags before transportation
                </ListItem>
                <ListItem>
                  Safely pack, stack and secure food donations on top of each
                  other, always placing meat on the bottom
                </ListItem>
                <ListItem>
                  Do not overpack boxes or block road visibility
                </ListItem>
              </OrderedList>
            </Text>
            <Heading mt="8" mb="4" size="md">
              Vehicle
            </Heading>
            <Text as="div">
              <OrderedList spacing="4" stylePosition="inside">
                <ListItem>
                  Keep vehicle interior clean and free of personal items
                </ListItem>
                <ListItem>
                  You must have a valid drivers license and proof of insurance
                </ListItem>
              </OrderedList>
            </Text>
            <Heading mt="8" mb="4" size="md">
              Logging Routes
            </Heading>
            <Text>
              Be sure to fill out pickup and delivery reports in real time as
              you complete each route for food safety and data tracking purposes
            </Text>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton>
            <Flex w="100%" gap="3">
              <Heading
                mt="4"
                mb="4"
                size="md"
                color="element.secondary"
                fontWeight="600"
              >
                03
              </Heading>
              <Heading mt="4" mb="4" size="md">
                Food Temperature
              </Heading>
            </Flex>
            {openedSections[2] && !hasPermission && (
              <CheckCircleIcon mx="2" color="se.brand.primary" h="4" w="4" />
            )}
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb="4" ml="10">
            <Text mb="4">
              The <strong>“Danger Zone” </strong> for bacterial growth on food
              is <strong>between 41*F and 129*F.</strong> Food is acceptable
              within this temperature range for 3 hrs. Afterwards, Sharing
              Excess can no longer accept it due to bacterial risk.
            </Text>
            <Text mb="4">
              Proper storage temperatures for food donations are listed below.
              If you suspect donations are not complying to these food
              temperature guidelines, please contact your volunteer coordinator
              after your pickup.
            </Text>
            <Text as="div">
              <OrderedList spacing="4" stylePosition="inside" fontWeight="600">
                <ListItem>Frozen: 32*F and below</ListItem>
                <ListItem>Cold: 40*F and below</ListItem>
                <ListItem>Hot: 130*F and above</ListItem>
              </OrderedList>
            </Text>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton>
            <Flex w="100%" gap="3">
              <Heading
                mt="4"
                mb="4"
                size="md"
                color="element.secondary"
                fontWeight="600"
              >
                04
              </Heading>
              <Heading mt="4" mb="4" size="md">
                Perishables
              </Heading>
            </Flex>
            {openedSections[3] && !hasPermission && (
              <CheckCircleIcon mx="2" color="se.brand.primary" h="4" w="4" />
            )}
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb="4" ml="10">
            <Text mb="4">
              At Sharing Excess, we prioritize quality and only accept food that
              we would personally eat! Avoid making direct contact with food.
              Donations have already been checked and sorted in accordance to
              the below rules and guidelines.
            </Text>
            <Text>
              If you suspect that donations do not comply with the following,
              please contact your volunteer coordinator after your pickup.
            </Text>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton>
            <Flex w="100%" gap="3">
              <Heading
                mt="4"
                mb="4"
                size="md"
                color="element.secondary"
                fontWeight="600"
              >
                05
              </Heading>
              <Heading mt="4" mb="4" size="md" align="left">
                Food Items We Accept
              </Heading>
            </Flex>
            {openedSections[4] && !hasPermission && (
              <CheckCircleIcon mx="2" color="se.brand.primary" h="4" w="4" />
            )}
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb="4" ml="10">
            <Text as="div">
              <OrderedList spacing="4" stylePosition="inside">
                <ListItem>Frozen meat</ListItem>
                <ListItem>Poultry</ListItem>
                <ListItem>Fish</ListItem>
                <ListItem>Fresh bakery items</ListItem>
                <ListItem>Day-old items bakery items</ListItem>
                <ListItem>Whole or chopped fruits and vegetables</ListItem>
                <ListItem>Mis-shapen or bruised produce</ListItem>
                <ListItem>Milk</ListItem>
                <ListItem>Yogurt</ListItem>
                <ListItem>Eggs</ListItem>
                <ListItem>Cheese</ListItem>
                <ListItem>Mis-shapen or bruised produce</ListItem>
                <ListItem>Slightly damaged packaging</ListItem>
                <ListItem>Discontinued or returned products</ListItem>
                <ListItem>Cooking supplies or ingredients</ListItem>
                <ListItem>Properly stored room temperature items</ListItem>
                <ListItem>Body care/toiletries</ListItem>
                <ListItem>Household items and appliances</ListItem>
              </OrderedList>
            </Text>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton>
            <Flex w="100%" gap="3">
              <Heading
                mt="4"
                mb="4"
                size="md"
                color="element.secondary"
                fontWeight="600"
              >
                06
              </Heading>
              <Heading mt="4" mb="4" size="md">
                We Cannot Accept
              </Heading>
            </Flex>
            {openedSections[5] && !hasPermission && (
              <CheckCircleIcon mx="2" color="se.brand.primary" h="4" w="4" />
            )}
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb="4" ml="10">
            <Text as="div">
              <OrderedList spacing="4" stylePosition="inside">
                <ListItem>
                  Expired or out-of-date food items (use best judgement on
                  sell-by dates)
                </ListItem>
                <ListItem>
                  Food that has fallen on the floor or touched the ground
                </ListItem>
                <ListItem>Raw/unfrozen meat, fish, poultry</ListItem>
                <ListItem>
                  Food items with visible mold, rot, spoilage, or insects
                </ListItem>
                <ListItem>Alcoholic beverages</ListItem>
                <ListItem>
                  Food that has already been served to the public
                </ListItem>
                <ListItem>
                  Prepared food that has been stored above 41*F for longer than
                  3 hours
                </ListItem>
                <ListItem>Food that has been previously reheated</ListItem>
                <ListItem>
                  Improperly stored temperature sensitive food items
                </ListItem>
                <ListItem>
                  Unsealed or opened packaging on individual items
                </ListItem>
                <ListItem>Partially consumed food items</ListItem>
              </OrderedList>
            </Text>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton>
            <Flex w="100%" gap="3">
              <Heading
                mt="4"
                mb="4"
                size="md"
                color="element.secondary"
                fontWeight="600"
              >
                07
              </Heading>
              <Heading mt="4" mb="4" size="md">
                Waste and Recycling
              </Heading>
            </Flex>
            {openedSections[6] && !hasPermission && (
              <CheckCircleIcon mx="2" color="se.brand.primary" h="4" w="4" />
            )}
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb="4" ml="10">
            <Text color="element.secondary" mb="4">
              At Sharing Excess, we prioritize quality and only accept food that
              we would personally eat! Donations have already been checked and
              sorted for freshness and quality.
            </Text>
            <Text color="element.secondary" mb="4">
              However, if the food doesn't look or smell good, please contact
              your volunteer coordinator after your pickup.
            </Text>
            <Heading mt="8" mb="4" size="md">
              Our Proper Disposal Guidelines
            </Heading>
            <Text as="div">
              <OrderedList spacing="4" stylePosition="inside">
                <ListItem>
                  Throw out any food that has touched the ground, or become
                  loose during transportation
                </ListItem>
                <ListItem>
                  If at any point you notice a food item is of low quality
                  during a pickup or delivery, inform an employee to dispose of
                  it
                </ListItem>
                <ListItem>
                  Compost any organic food items whenever possible
                </ListItem>
              </OrderedList>
            </Text>
            <Heading mt="8" mb="4" size="md">
              How we Reduce and Recycle Packaging
            </Heading>
            <Text as="div">
              <OrderedList spacing="4" stylePosition="inside">
                <ListItem>
                  Try to consolidate half-filled boxes whenever possible
                </ListItem>
                <ListItem>Recycle any leftover packaging</ListItem>
              </OrderedList>
            </Text>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      {!hasPermission && (
        <Flex w="100%" justify="center" mt="8" mb="8">
          <Button
            disabled={!allSectionsOpened()}
            leftIcon={<CheckCircleIcon mx="2" />}
            onClick={handleNext}
          >
            Next
          </Button>
        </Flex>
      )}
    </>
  )
}
