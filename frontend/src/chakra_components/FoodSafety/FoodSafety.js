import React from 'react'
import {
  Button,
  Flex,
  Heading,
  ListItem,
  OrderedList,
  Text,
} from '@chakra-ui/react'
import { Page } from 'chakra_components'
import { CheckCircleIcon } from '@chakra-ui/icons'

export function FoodSafety({ handleNext }) {
  return (
    <Page id="FoodSafety" title="Food Safety Rules">
      <Heading mt="8" mb="4">
        Food safety is our priority
      </Heading>
      <Text>
        Our goal is to safely provide healthy food excess from our donors to
        hunger relief organizations in 30 minutes or less. Food safety
        guidelines ensure that we do our job professionally with integrity and
        compassion for all parties.
      </Text>

      <Heading mt="8" mb="4">
        Our 3 Golden Rules
      </Heading>

      <Text>
        <OrderedList>
          <ListItem>Always be consistent and courteous to partners.</ListItem>
          <ListItem>Never eat or take any food donations.</ListItem>
          <ListItem>Only accept good quality food.</ListItem>
        </OrderedList>
      </Text>

      <Heading mt="8" mb="4">
        Pickup and Delivery
      </Heading>

      <Text color="element.secondary">
        Please drive safe, obey traffic laws, and avoid parking tickets.
      </Text>

      <Heading mt="8" mb="4">
        Packaging
      </Heading>
      <Text>
        <OrderedList>
          <ListItem>
            All food items should be properly packed in boxes or sturdy bags
            before transportation
          </ListItem>
          <ListItem>
            Safely pack, stack and secure food donations on top of each other,
            always placing meat on the bottom
          </ListItem>
          <ListItem>Do not overpack boxes or block road visibility</ListItem>
        </OrderedList>
      </Text>
      <Heading mt="8" mb="4">
        Vehicle
      </Heading>
      <Text>
        <OrderedList>
          <ListItem>
            Keep vehicle interior clean and free of personal items
          </ListItem>
          <ListItem>
            You must have a valid drivers license and proof of insurance
          </ListItem>
        </OrderedList>
      </Text>
      <Heading mt="8" mb="4">
        Logging Routes
      </Heading>
      <Text>
        <OrderedList>
          <ListItem>
            Be sure to fill out pickup and delivery reports in real time as you
            complete each route for food safety and data tracking purposes
          </ListItem>
        </OrderedList>
      </Text>

      <Heading mt="8" mb="4">
        Food Temperature
      </Heading>

      <Text>
        The <b>“Danger Zone” </b> for bacterial growth on food is between 41*F
        and 129*F. Food is acceptable within this temperature range for 3 hrs.
        Afterwards, Sharing Excess can no longer accept it due to bacterial
        risk.
      </Text>
      <Text>
        Proper storage temperatures for food donations are listed below. If you
        suspect donations are not complying to these food temperature
        guidelines, please contact your volunteer coordinator after your pickup.
      </Text>
      <Text>
        <OrderedList>
          <ListItem>Frozen: 32*F and below</ListItem>
          <ListItem>Cold: 40*F and below</ListItem>
          <ListItem>Hot: 130*F and above</ListItem>
        </OrderedList>
      </Text>

      <Heading mt="8" mb="4">
        Perishables
      </Heading>

      <Text>
        At Sharing Excess, we prioritize quality and only accept food that we
        would personally eat! Avoid making direct contact with food. Donations
        have already been checked and sorted in accordance to the below rules
        and guidelines. If you suspect that donations do not comply with the
        following, please contact your volunteer coordinator after your pickup.
      </Text>

      <Heading mt="8" mb="4">
        Food Items We Accept
      </Heading>

      <Text>
        <OrderedList>
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

      <Heading mt="8" mb="4">
        We Cannot Accept
      </Heading>

      <Text>
        <OrderedList>
          <ListItem>
            Expired or out-of-date food items (use best judgement on sell-by
            dates)
          </ListItem>
          <ListItem>
            Food that has fallen on the floor or touched the ground
          </ListItem>
          <ListItem>Raw/unfrozen meat, fish, poultry</ListItem>
          <ListItem>
            Food items with visible mold, rot, spoilage, or insects
          </ListItem>
          <ListItem>Alcoholic beverages</ListItem>
          <ListItem>Food that has already been served to the public</ListItem>
          <ListItem>
            Prepared food that has been stored above 41*F for longer than 3
            hours
          </ListItem>
          <ListItem>Food that has been previously reheated</ListItem>
          <ListItem>
            Improperly stored temperature sensitive food items
          </ListItem>
          <ListItem>Unsealed or opened packaging on individual items</ListItem>
          <ListItem>Partially consumed food items</ListItem>
        </OrderedList>
      </Text>

      <Heading mt="8" mb="4">
        Waste and Recycling
      </Heading>

      <Text>
        At Sharing Excess, we prioritize quality and only accept food that we
        would personally eat! Donations have already been checked and sorted for
        freshness and quality. However, if the food doesn't look or smell good,
        please contact your volunteer coordinator after your pickup.
      </Text>

      <Heading mt="8" mb="4">
        Our Proper Disposal Guidelines
      </Heading>
      <Text>
        <OrderedList>
          <ListItem>
            Throw out any food that has touched the ground, or become loose
            during transportation
          </ListItem>
          <ListItem>
            If at any point you notice a food item is of low quality during a
            pickup or delivery, inform an employee to dispose of it
          </ListItem>
          <ListItem>Compost any organic food items whenever possible</ListItem>
        </OrderedList>
      </Text>
      <Heading mt="8" mb="4">
        How we Reduce and Recycle Packaging
      </Heading>
      <Text>
        <OrderedList>
          <ListItem>
            Try to consolidate half-filled boxes whenever possible
          </ListItem>
          <ListItem>Recycle any leftover packaging</ListItem>
        </OrderedList>
      </Text>

      <Flex w="100%" justify="center" mt="8" mb="8">
        <Button leftIcon={<CheckCircleIcon />} onClick={handleNext}>
          Next
        </Button>
      </Flex>
    </Page>
  )
}
