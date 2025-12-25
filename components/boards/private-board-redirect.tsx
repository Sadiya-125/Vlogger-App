"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function PrivateBoardRedirect() {
  const router = useRouter();

  useEffect(() => {
    toast.error("This board is private");
    router.push("/boards");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  );
}
