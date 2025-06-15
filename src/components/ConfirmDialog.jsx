import { AlertDialog, Button, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter } from "@chakra-ui/react";

export default function ({ isOpen, onClose, onConfirm, title, description }) {

  return (
    <AlertDialog
      isOpen={isOpen}
      onClose={onClose}
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {title || 'Konfirmasi'}
          </AlertDialogHeader>
          <AlertDialogBody>
            {description || 'Apakah kamu yakin ingin?'}
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button onClick={onClose}>
              Batal
            </Button>
            <Button colorScheme="red" onClick={onConfirm} ml={3}>
              Hapus
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}
