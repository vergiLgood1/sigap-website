// components/selectedUser-management/sheet/selectedUser-information-sheet.tsx
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/app/_components/ui/sheet";
import { Button } from "@/app/_components/ui/button";
import { Badge } from "@/app/_components/ui/badge";
import { Copy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/_components/ui/tabs";
import { IUserSchema } from "@/src/entities/models/users/users.model";
import { useUserDetailSheetHandlers } from "../../_handlers/use-detail-sheet";
import { UserDetailsTab } from "../tabs/user-detail-tab";
import { UserLogsTab } from "../tabs/user-log-tab";
import { UserOverviewTab } from "../tabs/user-overview-tab";


interface UserInformationSheetProps {
  open: boolean;
  selectedUser: IUserSchema;
  onOpenChange: (open: boolean) => void;
}

export function UserInformationSheet({
  open,
  onOpenChange,
  selectedUser,
}: UserInformationSheetProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const {
    handleCopyItem,
  } = useUserDetailSheetHandlers({ open, selectedUser, onOpenChange });

  const getUserStatusBadge = () => {
    if (selectedUser.banned_until) {
      return <Badge variant="destructive">Banned</Badge>;
    }
    if (!selectedUser.email_confirmed_at) {
      return <Badge variant="outline">Unconfirmed</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md md:max-w-xl overflow-y-auto">
        <SheetHeader className="space-y-1">
          <SheetTitle className="text-xl flex items-center gap-2">
            {selectedUser.email}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4"
              onClick={() => handleCopyItem(selectedUser.email ?? "", "Email")}
            >
              <Copy className="h-4 w-4" />
            </Button>
            {getUserStatusBadge()}
          </SheetTitle>
        </SheetHeader>

        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-6"
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <UserOverviewTab
              selectedUser={selectedUser}
              handleCopyItem={handleCopyItem}
            />
          </TabsContent>

          <TabsContent value="logs">
            <UserLogsTab selectedUser={selectedUser} />
          </TabsContent>

          <TabsContent value="details">
            <UserDetailsTab selectedUser={selectedUser} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}