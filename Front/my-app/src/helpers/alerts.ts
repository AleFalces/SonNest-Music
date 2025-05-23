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
      confirmButton:
        "mr-3 bg-amber-800 hover:bg-amber-700 text-white px-6 py-3 rounded-2xl shadow-md transition-colors duration-300",
      cancelButton:
        "ml-3 bg-red-900 hover:bg-red-800 text-white px-6 py-3 rounded-2xl shadow-md transition-colors duration-300",
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
      confirmButton:
        "bg-amber-600  hover:bg-amber-200 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-amber-300",
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
      confirmButton:
        "bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-amber-300",
    },
    buttonsStyling: false,
  });
};
