import ServerChannel from "@/components/server/server-channel";
import ServerHeader from "@/components/server/server-header";
import ServerMember from "@/components/server/server-member";
import ServerSearch from "@/components/server/server-search";
import ServerSection from "@/components/server/server-section";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { ChannelType, MemberRole } from "@prisma/client";
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

interface ServerSidebarProps {
  serverId: string;
}

const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: (
    <ShieldCheck className="h-4 w-4 mr-2 text-indigo-500" />
  ),
  [MemberRole.ADMIN]: <ShieldAlert className="h-4 w-4 mr-2 text-rose-500" />,
};

const ServerSidebar = async ({ serverId }: ServerSidebarProps) => {
  const profile = await currentProfile();

  if (!profile) {
    console.log("no profile, redirect");
    return redirect("/");
  }

  const server = await db.server.findUnique({
    where: { id: serverId },
    include: {
      channels: { orderBy: { createdAt: "asc" } },
      members: { include: { profile: true }, orderBy: { role: "asc" } },
    },
  });

  if (!server) {
    console.log(serverId);
    console.log(server);
    console.log("no server, redirect");
    return redirect("/");
  }

  const channelMap = {
    [ChannelType.TEXT]: {
      label: "Text Channels",
      icon: <Hash className="mr-2 h-4 w-4" />,
      channel: server?.channels.filter(
        (channel) => channel.type === ChannelType.TEXT
      ),
    },
    [ChannelType.AUDIO]: {
      label: "Voice Channels",
      icon: <Mic className="mr-2 h-4 w-4" />,
      channel: server?.channels.filter(
        (channel) => channel.type === ChannelType.AUDIO
      ),
    },
    [ChannelType.VIDEO]: {
      label: "Video Channels",
      icon: <Video className="mr-2 h-4 w-4" />,
      channel: server?.channels.filter(
        (channel) => channel.type === ChannelType.VIDEO
      ),
    },
  };

  const members = server?.members.filter(
    (member) => member.profileId !== profile.id
  );

  const role = server.members.find(
    (member) => member.profileId === profile.id
  )?.role;

  const serverSearchData: {
    label: string;
    type: "channel" | "member";
    data: { icon: ReactNode; name: string; id: string }[] | undefined;
  }[] = Object.values(channelMap).map((value) => ({
    label: value.label,
    type: "channel",
    data: value.channel?.map((channel) => ({
      id: channel.id,
      name: channel.name,
      icon: value.icon,
    })),
  }));

  serverSearchData.push({
    label: "Member Channels",
    type: "member",
    data: members?.map((member) => ({
      id: member.id,
      name: member.profile.name,
      icon: roleIconMap[member.role],
    })),
  });

  return (
    <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
      <ServerHeader server={server} role={role} />
      <ScrollArea className="flex-1 px-3">
        <div className="mt-2">
          <ServerSearch data={serverSearchData} />
        </div>
        <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2" />

        {Object.entries(channelMap)?.map(([key, value]) => {
          return (
            !!value.channel?.length && (
              <div className="mb-2" key={value.label}>
                <ServerSection
                  sectionType="channels"
                  channelType={key as ChannelType}
                  role={role}
                  label={value.label}
                />
                <div className="space-y-[2px]">
                  {value.channel.map((channel) => (
                    <ServerChannel
                      key={channel.id}
                      channel={channel}
                      role={role}
                      server={server}
                    />
                  ))}
                </div>
              </div>
            )
          );
        })}
        {!!members?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="members"
              role={role}
              label="Members"
              server={server}
            />
            <div className="space-x-[2px]">
              {members.map((member) => (
                <ServerMember key={member.id} member={member} server={server} />
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ServerSidebar;
