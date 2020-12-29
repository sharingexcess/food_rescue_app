export function isValidRescue(rescue) {
  return rescue.id && rescue.pickup_org_id && rescue.delivery_org_id
}
