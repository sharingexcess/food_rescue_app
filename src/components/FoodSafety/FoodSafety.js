import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { setFirestoreData } from 'helpers'
import { useAuth } from 'hooks'
import { Button, Text } from '@sharingexcess/designsystem'

export function FoodSafety() {
  const navigate = useNavigate()
  const { user } = useAuth()

  function handleComplete() {
    setFirestoreData(['users', user.id], { completed_food_safety: true })
    navigate('/')
  }

  return (
    <main id="FoodSafety">
      <section id="intro">
        <div className="sectionHeader">
          <Text type="section-header" color="black">
            Food safety is our priority
          </Text>
        </div>
        <div className="subheader">
          <Text type="subheader" color="green">
            Our goal is to safely provide healthy food excess from our donors to
            hunger relief organizations in 30 minutes or less. Food safety
            guidelines ensure that we do our job professionally with integrity
            and compassion for all parties.
          </Text>
        </div>
      </section>
      <section id="goldenrules">
        <div className="sectionHeader">
          <Text type="section-header" color="black">
            Our 3 Golden Rules
          </Text>
        </div>
        <Text type="paragraph" color="black">
          <ol>
            <li>Always be consistent and courteous to partners.</li>
            <li>Never eat or take any food donations.</li>
            <li>Only accept good quality food.</li>
          </ol>
        </Text>
      </section>
      <section id="pickups">
        <div className="sectionHeader">
          <Text type="section-header" color="black">
            Pickup and Delivery
          </Text>
        </div>
        <div className="subheader">
          <Text type="subheader" color="grey">
            Please drive safe, obey traffic laws, and avoid parking tickets.
          </Text>
        </div>
        <Text type="small-header" color="green">
          Packaging
        </Text>
        <Text type="paragraph" color="black">
          <ol>
            <li>
              All food items should be properly packed in boxes or sturdy bags
              before transportation
            </li>
            <li>
              Safely pack, stack and secure food donations on top of each other,
              always placing meat on the bottom
            </li>
            <li>Do not overpack boxes or block road visibility</li>
          </ol>
        </Text>
        <Text type="small-header" color="green">
          Vehicle
        </Text>
        <Text type="paragraph" color="black">
          <ol>
            <li>Keep vehicle interior clean and free of personal items</li>
            <li>
              You must have a valid drivers license and proof of insurance
            </li>
          </ol>
        </Text>
        <Text type="small-header" color="green">
          Logging Routes
        </Text>
        <Text type="paragraph" color="black">
          <ol>
            <li>
              Be sure to fill out pickup and delivery reports in real time as
              you complete each route for food safety and data tracking purposes
            </li>
          </ol>
        </Text>
      </section>
      <section id="foodtemp">
        <div className="sectionHeader">
          <Text type="section-header" color="black">
            Food Temperature
          </Text>
        </div>
        <Text type="paragraph" color="black">
          The <b>“Danger Zone” </b> for bacterial growth on food is between 41*F
          and 129*F. Food is acceptable within this temperature range for 3 hrs.
          Afterwards, Sharing Excess can no longer accept it due to bacterial
          risk.
        </Text>
        <Text type="paragraph" color="black">
          Proper storage temperatures for food donations are listed below. If
          you suspect donations are not complying to these food temperature
          guidelines, please contact your volunteer coordinator after your
          pickup.
        </Text>
        <Text type="paragraph" color="black">
          <ol>
            <li>Frozen: 32*F and below</li>
            <li>Cold: 40*F and below</li>
            <li>Hot: 130*F and above</li>
          </ol>
        </Text>
      </section>
      <section id="perishables">
        <div className="sectionHeader">
          <Text type="section-header" color="black">
            Perishables
          </Text>
        </div>
        <Text type="paragraph" color="black">
          At Sharing Excess, we prioritize quality and only accept food that we
          would personally eat! Avoid making direct contact with food. Donations
          have already been checked and sorted in accordance to the below rules
          and guidelines. If you suspect that donations do not comply with the
          following, please contact your volunteer coordinator after your
          pickup.
        </Text>
      </section>
      <section id="weaccept">
        <div className="sectionHeader">
          <Text type="section-header" color="black">
            Food Items We Accept
          </Text>
        </div>
        <Text type="paragraph" color="black">
          <ol>
            <li>Frozen meat</li>
            <li>Poultry</li>
            <li>Fish</li>
            <li>Fresh bakery items</li>
            <li>Day-old items bakery items</li>
            <li>Whole or chopped fruits and vegetables</li>
            <li>Mis-shapen or bruised produce</li>
            <li>Milk</li>
            <li>Yogurt</li>
            <li>Eggs</li>
            <li>Cheese</li>
            <li>Mis-shapen or bruised produce</li>
            <li>Slightly damaged packaging</li>
            <li>Discontinued or returned products</li>
            <li>Cooking supplies or ingredients</li>
            <li>Properly stored room temperature items</li>
            <li>Body care/toiletries</li>
            <li>Household items and appliances</li>
          </ol>
        </Text>
      </section>
      <section id="cannotaccept">
        <div className="sectionHeader">
          <Text type="section-header" color="black">
            We Cannot Accept
          </Text>
        </div>
        <Text type="paragraph" color="black">
          <ol>
            <li>
              Expired or out-of-date food items (use best judgement on sell-by
              dates)
            </li>
            <li>Food that has fallen on the floor or touched the ground</li>
            <li>Raw/unfrozen meat, fish, poultry</li>
            <li>Food items with visible mold, rot, spoilage, or insects</li>
            <li>Alcoholic beverages</li>
            <li>Food that has already been served to the public</li>
            <li>
              Prepared food that has been stored above 41*F for longer than 3
              hours
            </li>
            <li>Food that has been previously reheated</li>
            <li>Improperly stored temperature sensitive food items</li>
            <li>Unsealed or opened packaging on individual items</li>
            <li>Partially consumed food items</li>
          </ol>
        </Text>
      </section>

      <section id="waste">
        <div className="sectionHeader">
          <Text type="section-header" color="black">
            Waste and Recycling
          </Text>
        </div>
        <div className="subheader">
          <Text type="subheader" color="black">
            At Sharing Excess, we prioritize quality and only accept food that
            we would personally eat! Donations have already been checked and
            sorted for freshness and quality. However, if the food doesn't look
            or smell good, please contact your volunteer coordinator after your
            pickup.
          </Text>
        </div>
        <Text type="small-header" color="green">
          Our Proper Disposal Guidelines
        </Text>
        <Text type="paragraph" color="black">
          <ol>
            <li>
              Throw out any food that has touched the ground, or become loose
              during transportation
            </li>
            <li>
              If at any point you notice a food item is of low quality during a
              pickup or delivery, inform an employee to dispose of it
            </li>
            <li>Compost any organic food items whenever possible</li>
          </ol>
        </Text>
        <Text type="small-header" color="green">
          How we Reduce and Recycle Packaging
        </Text>
        <Text type="paragraph" color="black">
          <ol>
            <li>Try to consolidate half-filled boxes whenever possible</li>
            <li>Recycle any leftover packaging</li>
          </ol>
        </Text>
      </section>
      {user && !user.completed_food_safety ? (
        <Button type="primary" color="white" handler={handleComplete}>
          I've read the Food Safety Guidelines
        </Button>
      ) : (
        <Link to="/">
          <Button type="primary" color="white">
            Back to Home
          </Button>
        </Link>
      )}
    </main>
  )
}
