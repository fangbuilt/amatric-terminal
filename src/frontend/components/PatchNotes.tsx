import {
  ModalBackdrop, ModalContainer, ModalDialog, ModalCloseTrigger,
  ModalHeader, ModalHeading, ModalBody, ModalFooter,
  Button,
} from '@heroui/react'

interface Props {
  isOpen: boolean
  onClose: () => void
  notes: string
  version: number
}

export default function PatchNotes({ isOpen, onClose, notes, version }: Props) {
  return (
    <ModalBackdrop isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContainer>
        <ModalDialog>
          <ModalCloseTrigger />
          <ModalHeader>
            <ModalHeading>Patch Notes — v{version}</ModalHeading>
          </ModalHeader>
          <ModalBody>
            <p className="whitespace-pre-wrap text-muted">{notes}</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="primary" className="w-full" onPress={onClose}>
              Got it
            </Button>
          </ModalFooter>
        </ModalDialog>
      </ModalContainer>
    </ModalBackdrop>
  )
}
