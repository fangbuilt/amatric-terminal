import { useState, useCallback } from 'react'
import {
  DrawerBackdrop, DrawerContent, DrawerDialog, DrawerHandle,
  DrawerCloseTrigger, DrawerHeader, DrawerHeading, DrawerBody,
  TextArea,
} from '@heroui/react'
import { NotebookPen } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const NOTES_KEY = 'amatric_notes'

export default function NotesDrawer({ isOpen, onClose }: Props) {
  const [notes, setNotes] = useState(() => localStorage.getItem(NOTES_KEY) || '')

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setNotes(value)
    localStorage.setItem(NOTES_KEY, value)
  }, [])

  return (
    <DrawerBackdrop isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent placement="bottom">
        <DrawerDialog>
          <DrawerHandle />
          <DrawerCloseTrigger />
          <DrawerHeader>
            <DrawerHeading className="flex items-center gap-2">
              <NotebookPen className="size-5 text-amber-500" />
              My Notes
            </DrawerHeading>
          </DrawerHeader>
          <DrawerBody className="bg-[#f3f2ef] dark:bg-[#0f0f0f] p-6 rounded-md">
            <p className="text-muted mb-2">
              Jot down shopping math, daily targets, expiry reminders, whatever helps you run your cafe.
            </p>
            <TextArea
              value={notes}
              onChange={handleChange}
              placeholder="..."
              className="min-h-[200px] w-full"
              aria-label="Player notes"
            />
          </DrawerBody>
        </DrawerDialog>
      </DrawerContent>
    </DrawerBackdrop>
  )
}
