import { apiServices, handleAxiosError } from "./apiServices";

const path = "/payments";

// Asks the backend to create a Mercado Pago preference and returns its init_point.
export const createPreference = async (products: number[]) => {
  try {
    const response = await apiServices.post(`${path}/create-preference`, {
      products,
    });
    return response.data; // { id, init_point }
  } catch (error) {
    handleAxiosError(error, "Error creating the payment preference");
  }
};

// Confirms a payment by id and returns the created order.
export const confirmPayment = async (paymentId: string) => {
  try {
    const response = await apiServices.get(`${path}/confirm`, {
      params: { payment_id: paymentId },
    });
    return response.data; // the created order
  } catch (error) {
    handleAxiosError(error, "Error confirming the payment");
  }
};
