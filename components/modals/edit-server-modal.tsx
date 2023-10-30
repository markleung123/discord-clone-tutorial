"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import { useEffect } from "react";

const formSchema = z.object({
  name: z.string().min(1, { message: "Server name is required." }),
  imageUrl: z.string().min(1, { message: "Server image is required." }),
});

const ModalForm = ({
  form,
  onSubmit,
  isLoading,
}: {
  form: any;
  onSubmit: Function;
  isLoading: boolean;
}) => {
  const serverNameInput = ({ field }: { field: any }) => (
    <FormItem>
      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
        Server name
      </FormLabel>
      <FormControl>
        <Input
          disabled={isLoading}
          className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black forcus-visible:ring-offset-0"
          placeholder="Enter Server Name"
          {...field}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );

  const fileUploadRender = ({ field }: { field: any }) => (
    <FormItem>
      <FormControl>
        <FileUpload
          endpoint="serverImage"
          value={field.value}
          onChange={field.onChange}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-8 px-6">
          <div className="flex items-center justify-center text-center">
            <FormField
              control={form.control}
              name="imageUrl"
              render={fileUploadRender}
            />
          </div>
          <FormField
            control={form.control}
            name="name"
            render={serverNameInput}
          />
        </div>
        <DialogFooter className="bg-gray-100 px-6 py-4">
          <Button variant="primary" disabled={isLoading}>
            Save
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

const Header = () => {
  return (
    <DialogHeader className="pt-8 px-6">
      <DialogTitle className="text-2xl text-center font-bold">
        Customise your server
      </DialogTitle>
      <DialogDescription className="text-center text-zinc-500">
        Give your server a personality with name and an image.
      </DialogDescription>
    </DialogHeader>
  );
};

export const EditServerModal = () => {
  const router = useRouter();
  const { isOpen, onClose, type, data } = useModal();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
    },
  });

  const { server } = data;
  const isModalOpen = isOpen && type === "editServer";

  useEffect(() => {
    if (server) {
      form.setValue("name", server.name);
      form.setValue("imageUrl", server.imageUrl);
    }
  }, [server, form, isModalOpen]);

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/servers/${server?.id}`, values);
      form.reset();
      router.refresh(); //force rerender
      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <Header />
        <ModalForm form={form} onSubmit={onSubmit} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  );
};