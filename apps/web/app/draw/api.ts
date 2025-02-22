import { BACKEND_URL } from "@/config";
import { getVerifiedToken } from "@/lib/cookie";
import axios, { AxiosError } from "axios";
import { useToast } from "@repo/ui/hooks/use-toast";

const { toast } = useToast();

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
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to fetch shapes",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
    return [];
  }
}
