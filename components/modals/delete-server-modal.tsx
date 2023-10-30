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
import { Server } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Header = ({ server }: { server: Server | undefined }) => (
  <DialogHeader className="pt-8 px-6">
    <DialogTitle className="text-2xl text-center font-bold">
      Delete Server
    </DialogTitle>
    <DialogDescription className="text-center text-zinc-500 ">
      Are you sure you want to do this? <br />
      <span className="text-indigo-500 font-semibold">{server?.name}</span> will
      be permanently deleted.
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

export const DeleteServerModal = () => {
  const { isOpen, onOpen, onClose, type, data } = useModal();
  const router = useRouter();

  const isModalOpen = isOpen && type === "deleteServer";
  const { server } = data;

  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);
      await axios.delete(`/api/servers/${server?.id}`);
      onClose();
      router.refresh();
      router.push("/");
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <Header server={server} />
        <Footer isLoading={isLoading} onClose={onClose} onClick={onClick} />
      </DialogContent>
    </Dialog>
  );
};
