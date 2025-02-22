"use client"

import { WS_URL } from "@/config";
import { getVerifiedToken } from "@/lib/cookie";
import { useEffect, useState } from "react";

export function useSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let wsInstance: WebSocket | null = null;

    const connect = async () => {
      try {
        const token = await getVerifiedToken();
        const ws = new WebSocket(`${WS_URL}?token=${token}`);
        wsInstance = ws;

        ws.onopen = () => {
          console.log("WebSocket connection established");
          setLoading(false);
          setSocket(ws);
        };

        ws.onerror = (error) => {
          console.error("WebSocket error", error);
          setLoading(false);
        };
      } catch (err) {
        console.error("Failed to initialize WebSocket connection: ", err);
        setLoading(false);
      }
    }
    connect();

      return ()=>{
        if(wsInstance){
            wsInstance.close();
        }
    }
  }, []);

  return {socket,loading};
}
