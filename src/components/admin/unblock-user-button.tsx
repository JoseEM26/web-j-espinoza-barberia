"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { api, ApiClientError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

export function UnblockUserButton({
  userId,
  onUnblocked,
}: {
  userId: string;
  onUnblocked: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  async function handleClick() {
    setSubmitting(true);
    try {
      await api.post(`/admin/users/${userId}/unblock`);
      toast.success("Usuario desbloqueado.");
      onUnblocked();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "No se pudo desbloquear.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={submitting}>
      {submitting ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
      Desbloquear
    </Button>
  );
}
