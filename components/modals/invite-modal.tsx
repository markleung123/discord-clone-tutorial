"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useModal } from "@/hooks/use-modal-store";
import { useOrigin } from "@/hooks/use-origin";
import axios from "axios";
import { Check, Copy, RefreshCw } from "lucide-react";
import { useState } from "react";

const Header = () => (
  <DialogHeader className="pt-8 px-6">
    <DialogTitle className="text-2xl text-center font-bold">
      Invite Friends
    </DialogTitle>
  </DialogHeader>
);

const Body = ({
  copied,
  inviteUrl,
  isLoading,
  onCopy,
  onNew,
}: {
  copied: boolean;
  inviteUrl: string;
  isLoading: boolean;
  onCopy: () => void;
  onNew: () => void;
}) => {
  return (
    <div className="p-6">
      <Label className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
        Server invite link
      </Label>
      <div className="flex items-center mt-2 gap-x-2">
        <Input
          className="bg-zinc-500/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
          value={inviteUrl}
          disabled={isLoading}
          readOnly
        />
        <Button size="icon" onClick={() => onCopy()}>
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>
      <Button
        disabled={isLoading}
        onClick={onNew}
        className="text-xs text-zinc-500 mt-4"
        variant="link"
        size="sm"
      >
        Generate a new link
        <RefreshCw className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};

export const InviteModal = () => {
  const { isOpen, onOpen, onClose, type, data } = useModal();
  const origin = useOrigin();

  const isModalOpen = isOpen && type === "invite";
  const { server } = data;

  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const inviteUrl = `${origin}/invite/${server?.inviteCode}`;

  const onCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  const onNew = async () => {
    try {
      setIsLoading(true);
      const response = await axios.patch(
        `/api/servers/${server?.id}/invite-code`
      );
      onOpen("invite", { server: response.data });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <Header />
        <Body
          isLoading={isLoading}
          copied={copied}
          inviteUrl={inviteUrl}
          onCopy={onCopy}
          onNew={onNew}
        />
      </DialogContent>
    </Dialog>
  );
};
