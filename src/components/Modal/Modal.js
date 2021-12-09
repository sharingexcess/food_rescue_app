import React from 'react'
import { Button, Modal as ModalWrapper } from '@sharingexcess/designsystem'
import { useApp } from 'hooks'
import {
  CancelRetailRescue,
  CancelStop,
  ContactAdmin,
  DropRetailRescue,
  FinishRetailRescue,
  RetailRescueMenu,
  StopMenu,
  Caluculator,
} from 'components/Route/Route.children'
import { PickupReportInstructions } from 'components/PickupReportInstructions/PickupReportInstructions'

export function Modal() {
  const { modal, setModal } = useApp()

  const renderContent = () => {
    switch (modal) {
      case 'RetailRescueMenu':
        return <RetailRescueMenu />
      case 'StopMenu':
        return <StopMenu />
      case 'DropRetailRescue':
        return <DropRetailRescue />
      case 'CancelRetailRescue':
        return <CancelRetailRescue />
      case 'FinishRetailRescue':
        return <FinishRetailRescue />
      case 'CancelStop':
        return <CancelStop />
      case 'ContactAdmin':
        return <ContactAdmin />
      case 'Calculator':
        return <Caluculator />
      case 'PickupReportInstructions':
        return <PickupReportInstructions />
      default:
        return null
    }
  }

  const close = () => setModal()

  return modal ? (
    <ModalWrapper id="Modal" close={close}>
      {renderContent()}
      <Button
        id="RetailRescue-modal-close"
        type="tertiary"
        color="black"
        size="large"
        handler={() => setModal()}
      >
        <i className="fa fa-times" />
      </Button>
    </ModalWrapper>
  ) : null
}
