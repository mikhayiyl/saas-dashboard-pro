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
      <AlertDialogContent className="border-[#e5eaf1] bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[#182840]">
            Delete {itemType}?
          </AlertDialogTitle>

          <AlertDialogDescription className="text-[#738096]">
            Are you sure you want to delete{" "}
            <span className="font-medium text-[#182840]">{itemName}</span>?
            <br />
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isDeleting}
            className="border-[#dfe5ee] bg-white text-[#526178] hover:bg-[#f5f7fb] hover:text-[#182840]"
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
