"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";

import {
  Dialog,
  DialogContent,
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
import { useParams, useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import { ChannelType } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import queryString from "query-string";
import { useEffect } from "react";

const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Channel name is required." })
    .refine((name) => name !== "general", {
      message: "Channel name cannot be 'general'",
    }),

  type: z.nativeEnum(ChannelType),
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
        Channel name
      </FormLabel>
      <FormControl>
        <Input
          disabled={isLoading}
          className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black forcus-visible:ring-offset-0"
          placeholder="Enter Channel Name"
          {...field}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );

  const changeChannelType = ({ field }: { field: any }) => (
    <FormItem>
      <FormLabel>Channel Type</FormLabel>
      <Select
        disabled={isLoading}
        onValueChange={field.onChange}
        defaultValue={field.value}
      >
        <FormControl>
          <SelectTrigger className="bg-zinc-300/50 border-0 focus:ring-0 text-black ring-offset-0 focus:ring-offset-0 capitalize outline-none">
            <SelectValue placeholder="Select a channel type" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {Object.values(ChannelType).map((type) => (
            <SelectItem
              key={type}
              value={type}
              className="capitalize cursor-pointer hover:bg-zinc-700/50"
            >
              {type.toLowerCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-8 px-6">
          <FormField
            control={form.control}
            name="name"
            render={serverNameInput}
          />
          <FormField
            control={form.control}
            name="type"
            render={changeChannelType}
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
        Edit Channel
      </DialogTitle>
    </DialogHeader>
  );
};

export const EditChannelModal = () => {
  const router = useRouter();
  const params = useParams();
  const { isOpen, onClose, type, data } = useModal();

  const { channel, server } = data;
  const isModalOpen = isOpen && type === "editChannel";

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: channel?.type || ChannelType.TEXT,
    },
  });

  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    if (channel) {
      form.setValue("name", channel.name);
      form.setValue("type", channel.type);
    }
  }, [form, channel]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = queryString.stringifyUrl({
        url: `/api/channels/${channel?.id}`,
        query: {
          serverId: server?.id,
        },
      });
      await axios.patch(url, values);

      form.reset();
      router.refresh();
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
