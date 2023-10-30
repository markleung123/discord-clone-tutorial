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

const formSchema = z.object({
  name: z.string().min(1, { message: "Server name is required." }),
  imageUrl: z.string().min(1, { message: "Server image is required." }),
});

const ModalForm = ({ form, onSubmit }: { form: any; onSubmit: Function }) => {
  const isLoading = form.formState.isSubmitting;
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
            Create
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export const InitialModal = () => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
    },
  });

  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post("/api/servers", values);
      form.reset();
      router.refresh();
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
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

  return (
    <Dialog open>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <Header />
        <ModalForm form={form} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
};
