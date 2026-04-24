import { toast } from "react-hot-toast";

export const notifSuccess = (message: string) => {
  toast.success(message);
};

export const notifError = (message: string) => {
  toast.error(message);
};
