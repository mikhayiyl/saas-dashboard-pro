import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

type ConfirmDeleteModalProps = {
  open: boolean;
  itemName: string;
  itemType?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

function ConfirmDeleteModal({
  open,
  itemName,
  itemType = "item",
  isDeleting = false,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent className="border-white/10 bg-[#0C0D0F]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">
            Delete {itemType}?
          </AlertDialogTitle>

          <AlertDialogDescription className="text-white/50">
            Are you sure you want to delete{" "}
            <span className="font-medium text-white">{itemName}</span>?
            <br />
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isDeleting}
            className="border-white/10 bg-transparent text-white/70 hover:bg-white/5 hover:text-white"
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ConfirmDeleteModal;
