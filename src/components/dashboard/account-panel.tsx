"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { deleteAccount } from "@/app/dashboard/account/actions";
import type { en } from "@/lib/i18n/en";

type AccountDict = (typeof en)["dashboard"]["account"];

export function AccountPanel({
  email,
  hasGoogle,
  t,
}: {
  email: string;
  hasGoogle: boolean;
  t: AccountDict;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [updating, setUpdating] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    setUpdating(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setUpdating(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setPassword("");
    toast.success(t.passwordUpdated);
  }

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteAccount();
    if (result?.error) {
      toast.error(result.error);
      setDeleting(false);
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Label>{t.email}</Label>
        <p className="text-sm text-muted-foreground">{email}</p>
      </div>

      <div className="flex flex-col gap-1">
        <Label>{t.googleAccount}</Label>
        <p className="text-sm text-muted-foreground">{hasGoogle ? t.connected : t.notConnected}</p>
      </div>

      {!hasGoogle && (
        <form className="flex flex-col gap-2" onSubmit={handlePasswordUpdate}>
          <Label htmlFor="new-password">{t.newPassword}</Label>
          <div className="flex gap-2">
            <Input
              id="new-password"
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" disabled={updating}>
              {updating ? t.updating : t.update}
            </Button>
          </div>
        </form>
      )}

      <div className="border-t border-border pt-6">
        <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
          {t.deleteAccount}
        </Button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.deleteDialogTitle}</DialogTitle>
            <DialogDescription>{t.deleteDialogDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              {t.cancel}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? t.deleting : t.deleteMyAccount}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
