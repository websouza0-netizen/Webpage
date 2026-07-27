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

export function AccountPanel({ email, hasGoogle }: { email: string; hasGoogle: boolean }) {
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
    toast.success("Password updated.");
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
        <Label>Email</Label>
        <p className="text-sm text-muted-foreground">{email}</p>
      </div>

      <div className="flex flex-col gap-1">
        <Label>Google account</Label>
        <p className="text-sm text-muted-foreground">
          {hasGoogle ? "Connected" : "Not connected"}
        </p>
      </div>

      {!hasGoogle && (
        <form className="flex flex-col gap-2" onSubmit={handlePasswordUpdate}>
          <Label htmlFor="new-password">New password</Label>
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
              {updating ? "Updating…" : "Update"}
            </Button>
          </div>
        </form>
      )}

      <div className="border-t border-border pt-6">
        <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
          Delete account
        </Button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This cancels any active subscription and permanently deletes your account, site
              records, brief, and request history. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete my account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
