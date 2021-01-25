import React from 'react'
import { GoBack } from '../../helpers/components'
import './FoodSafety.scss'

export default function FoodSafety() {
  return (
    <main id="FoodSafety">
      <GoBack />
      <h1>Food Safety</h1>
      <section id="intro">
        <h2>Food safety is our priority</h2>
        <p>
          Our goal is to safely provide healthy food excess from our donors to
          hunger relief organizations in 30 minutes or less. Food safety
          guidelines ensure that we do our job professionally with integrity and
          compassion for all parties.
        </p>
      </section>
      <section id="goldenrules">
        <h2>Our 3 Golden Rules</h2>
        <ol>
          <li>Always be consistent and courteous to partners.</li>
          <li>Never eat or take any food donations.</li>
          <li>Only accept good quality food.</li>
        </ol>
      </section>
      <section id="foodtemp">
        <h2>Food Temperature</h2>
        <p>
          The <b>“Danger Zone” </b> for bacterial growth on food is between 41*F
          and 129*F. Food is acceptable within this temperature range for 3 hrs.
          Afterwards, Sharing Excess can no longer accept it due to bacterial
          risk.
        </p>
        <p>
          Ensure all food donations were stored at the proper temperature to
          pickup:
        </p>
        <ol>
          <li>Frozen: 32*F and below</li>
          <li>Cold: 40*F and below</li>
          <li>Hot: 130*F and above</li>
        </ol>
      </section>
      <section id="perishables">
        <h2>Perishables</h2>
        <p>
          For perishable items, use your best judgment, but prioritize quality.
          As a general rule, only accept food that you would personally eat.
          Avoid making direct contact with food.
        </p>
        <h3>Meat</h3>
        <div className="row">
          <div className="column-50">
            <h4 className="green">We Accept:</h4>
            <ol>
              <li>Frozen meat</li>
              <li>Poultry</li>
              <li>Fish</li>
            </ol>
            <p>In sealed or undamaged packaging (unless frozen before date)</p>
          </div>
          <div className="column-50">
            <h4 className="red">We don't accept:</h4>
            <ol>
              <li>Raw meat</li>
              <li>Damaged or opened packaging</li>
              <li>Expired or out-of-date items (unless frozen before date)</li>
            </ol>
          </div>
        </div>
        <h3>Bakery</h3>
        <div className="row">
          <div className="column-50">
            <h4 className="green">We Accept:</h4>
            <ol>
              <li>Fresh bakery items</li>
              <li>Day-old items</li>
            </ol>
            <p>(in proper storage or packaging)</p>
          </div>
          <div className="column-50">
            <h4 className="red">We don't accept:</h4>
            <ol>
              <li>Moldy or stale bakery items</li>
              <li>Damaged/opened packaging</li>
              <li>Expired or out-of-date items (unless frozen before date)</li>
            </ol>
          </div>
        </div>
        <h3>Produce</h3>
        <div className="row">
          <div className="column-50">
            <h4 className="green">We Accept:</h4>
            <ol>
              <li>Whole or chopped fruits and vegetables</li>
              <li>Mis-shapen or bruised produce</li>
            </ol>
          </div>
          <div className="column-50">
            <h4 className="red">We don't accept:</h4>
            <ol>
              <li>Moldy or rotten produce</li>
              <li>Peeled or dirty exterior</li>
              <li>Expired or out-of-date items (unless frozen before date)</li>
            </ol>
          </div>
        </div>
        <h3>Dairy</h3>
        <div className="row">
          <div className="column-50">
            <h4 className="green">We Accept:</h4>
            <ol>
              <li>Milk</li>
              <li>Yogurt</li>
              <li>Eggs</li>
              <li>Cheese</li>
            </ol>
            <p>(properly stored below 41*F)</p>
          </div>
          <div className="column-50">
            <h4 className="red">We don't accept:</h4>
            <ol>
              <li>Discolored, bloated, or moldy items</li>
              <li>Damaged/opened packaging</li>
              <li>Expired or out-of-date items (unless frozen before date)</li>
            </ol>
          </div>
        </div>
      </section>
      <section id="nonperishables">
        <h2>Non-Perishables and Groceries</h2>
        <h4 className="green">We accept:</h4>
        <ol>
          <li>Dented or imperfect cans</li>
          <li>Slightly damaged packaging</li>
          <li>Discontinued or returned products</li>
          <li>Cooking supplies or ingredients</li>
          <li>Properly stored room temperature items</li>
          <li>Body care/toiletries</li>
          <li>Household items and appliances</li>
        </ol>
        <h4 className="red">We don't accept:</h4>
        <ol>
          <li>Items with opened seals</li>
          <li>Partially consumed or used items</li>
          <li>Expired or out-of-date items</li>
          <li>Recalled items</li>
          <li>Items with sharp edges </li>
        </ol>
      </section>
      <section id="prepared">
        <h2>Prepared Foods</h2>
        <p>
          Prepared trays of food should be properly labeled with the
          description/cook date and stored at the proper temperature.
        </p>
        <h3 className="green">We accept:</h3>
        <ol>
          <li>Prepared food that has not left the kitchen or staging area</li>
          <li>
            Pre-packaged and sealed meals stored at the proper temperature
          </li>
          <li>Frozen meals</li>
          <li>Cooking supplies or ingredients</li>
          <li>Individually packaged sandwiches, salads, and deli items</li>
          <li>Unopened bottles, chips, and snacks</li>
        </ol>
        <h3 className="red">We don't accept:</h3>
        <ol>
          <li>Any food that has already been served for public consumption</li>
          <li>
            Prepared food that has been stored above 41*F for longer than 3
            hours
          </li>
          <li>Untouched food in partially consumed trays</li>
          <li>Prepared food that has been previously reheated</li>
          <li>Food items with a bad smell or spoilage</li>
          <li>Partially opened or leaky packaging</li>
        </ol>
      </section>
      <section id="cannotaccept">
        <h2>We Cannot Accept</h2>
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
      </section>
      <section id="pickups">
        <h2>Pickup and Delivery</h2>
        <p>Please drive safe, obey traffic laws, and avoid parking tickets.</p>
        <h3>Packaging</h3>
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
        <h3>Vehicle</h3>
        <ol>
          <li>You may transport donations using a car, bike, or on-foot</li>
          <li>Keep vehicle interior clean and free of personal items</li>
          <li>You must have a valid drivers license and proof of insurance</li>
        </ol>
        <h3>Clothing</h3>
        <ol>
          <li>
            Wear a Sharing Excess t-shirt, hat or have a bag with our logo on it
            to be properly identified by our partners
          </li>
          <li>Wear closed toe shoes</li>
        </ol>
      </section>
      <section id="waste">
        <h2>Waste and Recycling</h2>
        <p>
          If the food doesn’t look or smell good, don’t hesitate to throw it
          out. Use your best judgement, and always lean on the safe side.
        </p>
        <h3>Proper Disposal</h3>
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
        <h3>Reduce and Recycle Packaging</h3>
        <ol>
          <li>Try to consolidate half-filled boxes whenever possible</li>
          <li>Recycle any leftover packaging</li>
        </ol>
      </section>
    </main>
  )
}
