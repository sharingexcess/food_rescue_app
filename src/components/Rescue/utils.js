export function generateDirectionsLink(addressObj) {
  const base_url = 'https://www.google.com/maps/dir/?api=1&destination='
  return `${base_url}${addressObj.address1}+${addressObj.city}+${addressObj.state}+${addressObj.zip_code}`
}

export function Spacer() {
  return (
    <div className="Spacer">
      <div></div>
      <div></div>
      <div></div>
    </div>
  )
}
