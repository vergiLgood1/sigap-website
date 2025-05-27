"use client";

import * as React from "react";
import { Inbox, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/app/_components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/_components/ui/sheet";
import { Input } from "@/app/_components/ui/input";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { Badge } from "@/app/_components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/_components/ui/avatar";

interface InboxDrawerProps {
  showTitle?: boolean;
  showAvatar?: boolean;
}

interface MailMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  teaser: string;
  content: string;
  date: string;
  read: boolean;
}

const ICON_SIZE = 20;

// Sample data
const sampleMails: MailMessage[] = [
  {
    id: "1",
    name: "William Smith",
    email: "williamsmith@example.com",
    subject: "Meeting Tomorrow",
    teaser:
      "Hi team, just a reminder about our meeting tomorrow at 10 AM. Please come prepared with your project updates.",
    content:
      "Hi team,\n\nJust a reminder about our meeting tomorrow at 10 AM. Please come prepared with your project updates. We'll be discussing the progress of Project X and setting goals for the next sprint.\n\nIf you have any questions or need to reschedule, please let me know as soon as possible.\n\nBest regards,\nWilliam",
    date: "09:34 AM",
    read: false,
  },
  {
    id: "2",
    name: "Alice Johnson",
    email: "alicejohnson@example.com",
    subject: "Re: Project Update",
    teaser:
      "Thanks for the update. The progress looks great so far. Let's schedule a call to discuss the next steps.",
    content:
      "Hi team,\n\nThanks for the update. The progress looks great so far. I'm impressed with the work you've done on the new feature.\n\nLet's schedule a call to discuss the next steps. How does tomorrow at 2 PM sound? We can go over any challenges you're facing and plan out the rest of the sprint.\n\nLooking forward to our discussion.\n\nBest,\nAlice",
    date: "Yesterday",
    read: true,
  },
  {
    id: "3",
    name: "Bob Davis",
    email: "bobdavis@example.com",
    subject: "Weekend Plans",
    teaser:
      "Hey everyone! I'm thinking of organizing a team outing this weekend. Would you be interested in a hiking trip or a beach day?",
    content:
      "Hey everyone!\n\nI hope this email finds you well. I'm thinking of organizing a team outing this weekend to boost morale and have some fun outside of work.\n\nWould you be interested in a hiking trip or a beach day? I'm open to other suggestions as well. Let me know your preferences, and we can plan accordingly.\n\nLooking forward to spending some quality time with the team!\n\nCheers,\nBob",
    date: "2 days ago",
    read: false,
  },
  {
    id: "4",
    name: "Charlie Brown",
    email: "charliebrown@example.com",
    subject: "Client Feedback",
    teaser:
      "The client has provided feedback on the recent deliverables. Please review and make the necessary adjustments.",
    content:
      "Hi team,\n\nThe client has provided feedback on the recent deliverables. Please review the attached document and make the necessary adjustments.\n\nLet's aim to have the revisions completed by the end of the week so we can send the updated version to the client.\n\nThanks,\nCharlie",
    date: "3 days ago",
    read: false,
  },
  {
    id: "5",
    name: "Diana Prince",
    email: "dianaprince@example.com",
    subject: "Team Lunch",
    teaser:
      "We're planning a team lunch this Friday at 1 PM. Please RSVP by tomorrow.",
    content:
      "Hello team,\n\nWe're planning a team lunch this Friday at 1 PM at the new Italian restaurant downtown. Please RSVP by tomorrow so we can make a reservation.\n\nLooking forward to seeing you all there!\n\nBest,\nDiana",
    date: "4 days ago",
    read: true,
  },
];

const InboxDrawerComponent: React.FC<InboxDrawerProps> = ({
  showTitle = false,
  showAvatar = false,
}) => {
  const [messages, setMessages] = React.useState<MailMessage[]>(sampleMails);
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedMessage, setSelectedMessage] =
    React.useState<MailMessage | null>(null);

  const unreadCount = React.useMemo(() => {
    return messages.filter((message) => !message.read).length;
  }, [messages]);

  const filteredMessages = React.useMemo(() => {
    return messages.filter(
      (message) =>
        message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.teaser.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [messages, searchTerm]);

  const markAsRead = React.useCallback((id: string) => {
    setMessages((prevMessages) =>
      prevMessages.map((message) =>
        message.id === id ? { ...message, read: true } : message
      )
    );
  }, []);

  const handleMessageClick = (message: MailMessage) => {
    setSelectedMessage(message);
    markAsRead(message.id);
  };

  const handleBackToList = () => {
    setSelectedMessage(null);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size={showTitle ? "sm" : "icon"}
          className={`relative border-2  ${showTitle ? "flex items-center" : ""}`}
          aria-label="Open inbox"
        >
          <Inbox
            className={`h-${ICON_SIZE} w-${ICON_SIZE} text-muted-foreground`}
          />
          {showTitle && (
            <span className="text-muted-foreground font-medium">Inbox</span>
          )}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1.5 -right-1.5 text-[10px] h-3 w-3 rounded-full p-0 flex items-center justify-center"
            ></Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
        {selectedMessage ? (
          <div className="flex flex-col h-full">
            <SheetHeader className="p-4 border-b">
              <Button
                variant="outline"
                onClick={handleBackToList}
                className="w-fit px-2"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Inbox
              </Button>
            </SheetHeader>
            <ScrollArea className="flex-grow p-4">
              <h2 className="text-xl font-bold mb-2">
                {selectedMessage.subject}
              </h2>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  {/* {showAvatar && ( */}
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src={`https://api.dicebear.com/6.x/initials/svg?seed=${selectedMessage.name}`}
                      alt={selectedMessage.name}
                    />
                    <AvatarFallback>
                      {selectedMessage.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {/* )} */}
                  <div>
                    <p className="font-medium">{selectedMessage.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedMessage.email}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedMessage.date}
                </p>
              </div>
              <div className="whitespace-pre-wrap">
                {selectedMessage.content}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <>
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="text-left">Inbox</SheetTitle>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search emails..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-120px)]">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 border-b p-4 text-sm leading-tight hover:bg-accent cursor-pointer ${
                    message.read ? "opacity-60" : ""
                  }`}
                  onClick={() => handleMessageClick(message)}
                >
                  {showAvatar && (
                    <Avatar className="w-10 h-10">
                      <AvatarImage
                        src={`https://api.dicebear.com/6.x/initials/svg?seed=${message.name}`}
                        alt={message.name}
                      />
                      <AvatarFallback>
                        {message.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1">
                    <div className="flex w-full items-center justify-between">
                      <span className="font-medium">{message.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {message.date}
                      </span>
                    </div>
                    <span className="font-medium">{message.subject}</span>
                    <span className="line-clamp-2 text-xs text-muted-foreground">
                      {message.teaser}
                    </span>
                    {!message.read && (
                      <Badge variant="secondary" className="mt-1">
                        New
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </ScrollArea>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export const InboxDrawer = React.memo(InboxDrawerComponent);
