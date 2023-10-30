"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import { Channel, Server } from "@prisma/client";
import axios from "axios";
import {  useRouter } from "next/navigation";
import queryString from "query-string";
import { useState } from "react";

const Header = ({ channel }: { channel: Channel }) => (
  <DialogHeader className="pt-8 px-6">
    <DialogTitle className="text-2xl text-center font-bold">
      Delete Channel
    </DialogTitle>
    <DialogDescription className="text-center text-zinc-500 ">
      Are you sure you want to do this? <br />
      <span className="text-indigo-500 font-semibold">
        #{channel?.name}
      </span>{" "}
      will be permanently deleted.
    </DialogDescription>
  </DialogHeader>
);

const Footer = ({
  isLoading,
  onClose,
  onClick,
}: {
  isLoading: boolean;
  onClose: () => void;
  onClick: () => void;
}) => {
  return (
    <DialogFooter className="bg-gray-100 px-6 py-4">
      <div className="flex items-center justify-between w-full">
        <Button disabled={isLoading} onClick={onClose} variant="ghost">
          Cancel
        </Button>

        <Button disabled={isLoading} onClick={onClick} variant="primary">
          Confirm
        </Button>
      </div>
    </DialogFooter>
  );
};

export const DeleteChannelModal = () => {
  const { isOpen, onOpen, onClose, type, data } = useModal();
  const router = useRouter();

  const isModalOpen = isOpen && type === "deleteChannel";
  const { server, channel } = data;

  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);
      const url = queryString.stringifyUrl({
        url: `/api/channels/${channel?.id}`,
        query: { serverId: server?.id },
      });
      await axios.delete(url);
      onClose();
      router.refresh();
      router.push(`/servers/${server?.id}`);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <Header channel={channel as Channel} />
        <Footer isLoading={isLoading} onClose={onClose} onClick={onClick} />
      </DialogContent>
    </Dialog>
  );
};
