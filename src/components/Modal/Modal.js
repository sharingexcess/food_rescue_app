import React from 'react'
import { Button, Modal as ModalWrapper } from '@sharingexcess/designsystem'
import { useApp } from 'hooks'
import { AddToCategory, PickupReportInstructions, NeedHelp } from 'components'
import {
  DropRescue,
  FinishRescue,
  RescueMenu,
  StopMenu,
  ContactAdmin,
  CancelStop,
  CancelRescue,
  AddRescueNotes,
} from 'components/Rescue/Rescue.children'

export function Modal() {
  const { modal, setModal } = useApp()

  const renderContent = () => {
    switch (modal) {
      case 'RescueMenu':
        return <RescueMenu />
      case 'StopMenu':
        return <StopMenu />
      case 'DropRescue':
        return <DropRescue />
      case 'CancelRescue':
        return <CancelRescue />
      case 'FinishRescue':
        return <FinishRescue />
      case 'CancelStop':
        return <CancelStop />
      case 'ContactAdmin':
        return <ContactAdmin />
      case 'AddToCategory':
        return <AddToCategory />
      case 'AddRescueNotes':
        return <AddRescueNotes />
      case 'PickupReportInstructions':
        return <PickupReportInstructions />
      case 'NeedHelp':
        return <NeedHelp />
      default:
        return null
    }
  }

  const close = () => setModal()

  return modal ? (
    <ModalWrapper id="Modal" close={close}>
      {renderContent()}
      <Button
        id="Rescue-modal-close"
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
