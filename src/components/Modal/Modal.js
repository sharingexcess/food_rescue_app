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
