import Swal from "sweetalert2";

export const confirmAction = async ({
  title = "Are you sure?",
  text = "This action cannot be undone.",
  confirmButtonText = "Yes, continue",
  cancelButtonText = "Cancel",
  icon = "warning",
}: {
  title?: string;
  text?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  icon?: "warning" | "info" | "success" | "error" | "question";
}) => {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    customClass: {
      confirmButton: "btn btn-primary mr-3",
      cancelButton: "btn btn-outline ml-3",
    },
    buttonsStyling: false,
  });

  return result.isConfirmed;
};

export const showSuccess = (title: string, text = "") => {
  return Swal.fire({
    title,
    text,
    icon: "success",
    confirmButtonText: "Close",
    customClass: {
      confirmButton: "btn btn-primary",
    },
    buttonsStyling: false,
  });
};

export const showError = (title: string, text = "") => {
  return Swal.fire({
    title,
    text,
    icon: "error",
    confirmButtonText: "Close",
    customClass: {
      confirmButton: "btn btn-primary",
    },
    buttonsStyling: false,
  });
};
