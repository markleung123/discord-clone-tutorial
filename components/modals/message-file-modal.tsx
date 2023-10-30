"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";

import { useEffect, useState } from "react";
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
import queryString from "query-string";

const formSchema = z.object({
  fileUrl: z.string().min(1, { message: "Attachment is required." }),
});

const ModalForm = ({ form, onSubmit }: { form: any; onSubmit: Function }) => {
  const isLoading = form.formState.isSubmitting;

  const fileUploadRender = ({ field }: { field: any }) => (
    <FormItem>
      <FormControl>
        <FileUpload
          endpoint="messageFile"
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
              name="fileUrl"
              render={fileUploadRender}
            />
          </div>
        </div>
        <DialogFooter className="bg-gray-100 px-6 py-4">
          <Button variant="primary" disabled={isLoading}>
            Send
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export const MessageFileModal = () => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fileUrl: "",
    },
  });

  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter();

  const isModalOpen = isOpen && type === "messageFile";
  const { apiUrl, query } = data;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = queryString.stringifyUrl({ url: apiUrl || "", query });
      await axios.post(url, { ...values, content: values.fileUrl });
      form.reset();
      router.refresh();
      handleClose();
    } catch (error) {
      console.log(error);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const Header = () => {
    return (
      <DialogHeader className="pt-8 px-6">
        <DialogTitle className="text-2xl text-center font-bold">
          Add an attachment
        </DialogTitle>
        <DialogDescription className="text-center text-zinc-500">
          Send a file as a message.
        </DialogDescription>
      </DialogHeader>
    );
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <Header />
        <ModalForm form={form} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
};
