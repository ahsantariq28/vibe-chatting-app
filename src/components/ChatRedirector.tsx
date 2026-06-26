"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface ChatRedirectorProps {
  firstConversationId?: string;
}

export default function ChatRedirector({ firstConversationId }: ChatRedirectorProps) {
  const router = useRouter();

  useEffect(() => {
    if (!firstConversationId) return;

    const checkRedirect = () => {
      const isMobile = window.innerWidth < 768; // 768px is the md breakpoint
      if (!isMobile) {
        router.replace(`/chat/${firstConversationId}`);
      }
    };

    checkRedirect();
  }, [firstConversationId, router]);

  return null;
}
