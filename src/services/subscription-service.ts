import { fetchWithAuth } from "./base-service";

export async function getUserSubscription() {
  return fetchWithAuth(`/subscriptions`);
}

export async function createPaypalOrder() {
  return fetchWithAuth(`/subscriptions/create-order`, {
    method: "post",
  });
}

export async function capturePaypalOrder(orderId) {
  return fetchWithAuth(`/subscriptions/capture-order`, {
    method: "post",
    body: {
      orderId,
    },
  });
}
