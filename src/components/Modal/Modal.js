import React from 'react'
import { Button, Modal as ModalWrapper } from '@sharingexcess/designsystem'
import { useApp } from 'hooks'
import {
  CancelRoute,
  CancelStop,
  ContactAdmin,
  DropRoute,
  FinishRoute,
  RouteMenu,
  StopMenu,
} from 'components/Route/Route.children'
import { PickupReportInstructions } from 'components/PickupReportInstructions/PickupReportInstructions'
import { Caluculator } from 'components'

export function Modal() {
  const { modal, setModal } = useApp()

  const renderContent = () => {
    switch (modal) {
      case 'RouteMenu':
        return <RouteMenu />
      case 'StopMenu':
        return <StopMenu />
      case 'DropRoute':
        return <DropRoute />
      case 'CancelRoute':
        return <CancelRoute />
      case 'FinishRoute':
        return <FinishRoute />
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
        id="Route-modal-close"
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
