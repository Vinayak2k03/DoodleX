import { BACKEND_URL } from "@/config";
import { getVerifiedToken } from "@/lib/cookie";
import axios, { AxiosError } from "axios";
// Remove the useToast import as it can't be used in a non-component context

// Create a non-hook version of error handling
const logError = (message: string) => {
  console.error(message);
};

export async function getExistingShapes(slug: string) {
  try {
    const token = await getVerifiedToken();
    const res = await axios.get(`${BACKEND_URL}/chat/${slug}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const messages = res.data.chats || [];
    return messages.map((message: any) => JSON.parse(message?.message));
  } catch (err) {
    if (err instanceof AxiosError) {
      logError(err.response?.data?.message || "Failed to fetch shapes");
    } else {
      logError("An unexpected error occurred");
    }
    return [];
  }
}