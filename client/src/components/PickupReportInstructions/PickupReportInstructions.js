import { Button, Spacer, Text } from '@sharingexcess/designsystem'
import { useApp } from 'hooks'

export function PickupReportInstructions() {
  const { setModal } = useApp()
  return (
    <div id="PickUpReportInstructions">
      <Text type="section-header">Reporting Instructions</Text>
      <Spacer height={16} />
      <Text type="small" color="black" align="left">
        <ol>
          <li>
            Acquire Sharing Excess scale from Donor Location. The scales have a
            green SE sticker on the bottom.
          </li>
          <li>
            Place the scale on the ground only. Please do not put the scale in
            the vehicle.
          </li>
          <li>Ensure the scale is zeroed (see button on scale).</li>
          <li>
            Place donations atop the scale. If you are weighing multiple boxes
            at once, do NOT weigh more than two at one time. Ensure the contents
            are within the same food category as listed on the weight entry
            form.
          </li>
          <li>
            Record box weights in the weight entry form as described by
            category. Each category should host the total weight of all boxes
            within that category.
          </li>
          <li>
            The pickup's total weight will automatically fill in under "Total
            Weight"
          </li>
          <li>Return scale to Donor location once weighing is complete.</li>
        </ol>
      </Text>
      <Spacer height={16} />
      <Button
        type="primary"
        color="green"
        fullWidth
        handler={() => setModal(false)}
      >
        Cool, thanks!
      </Button>
    </div>
  )
}
