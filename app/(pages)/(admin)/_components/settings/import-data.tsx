import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/app/_components/ui/button";
import { Card, CardContent } from "@/app/_components/ui/card";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { Separator } from "@/app/_components/ui/separator";
import { Upload } from "lucide-react";
import { Badge } from "../../../../_components/ui/badge";
import {
  IconBrandGoogleAnalytics,
  IconCsv,
  IconFileExcel,
  IconFileWord,
  IconHtml,
  IconMarkdown,
  TablerIcon,
} from "@tabler/icons-react";

// Data for import options
type ImportOption = {
  name: string;
  icon: TablerIcon;
  beta?: boolean;
  new?: boolean;
  sync?: boolean;
};

const importOptions: ImportOption[] = [
  { name: "Excel", icon: IconFileExcel },
  { name: "Google Sheets", icon: IconBrandGoogleAnalytics },
  { name: "CSV", icon: IconCsv },
  { name: "Text & Markdown", icon: IconMarkdown },
  { name: "Word", icon: IconFileWord },
];

const ImportData = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const scrollAreaHeight = "calc(100vh-140px)";

  useEffect(() => {
    const checkScrollable = () => {
      if (contentRef.current) {
        const contentHeight = contentRef.current.scrollHeight;
        const containerHeight = parseInt(
          scrollAreaHeight.replace("calc(100vh-", "").replace("px)", "")
        );
        const viewportHeight = window.innerHeight - containerHeight;

        setIsScrollable(contentHeight > viewportHeight);
      }
    };

    // Check initially
    checkScrollable();

    // Check on window resize
    window.addEventListener("resize", checkScrollable);

    // Clean up event listener
    return () => window.removeEventListener("resize", checkScrollable);
  }, []);

  return (
    <div className="space-y-14 w-full max-w-4xl mx-auto">
      <div className="space-y-14 p-8 max-w-4xl mx-auto">
        <div className="space-y-4 mb-4">
          <h1 className="font-medium">Import data</h1>
          <Separator />
          <div>
            <h2 className="text-sm font-semibold mb-2">
              Import data from other apps and files into Sigap.
            </h2>
            <p className="text-sm text-muted-foreground">
              You can import crime data from csv files, text files, and other
              apps into Sigap.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {importOptions.map((option) => (
              <Card
                key={option.name}
                className="cursor-pointer bg-secondary hover:bg-muted-foreground/15"
              >
                <CardContent className="flex items-center justify-between p-4">
                  <span className="text-lg">
                    {React.createElement(option.icon)}
                  </span>
                  <div className="flex-1 ml-3">
                    <p className="text-sm font-medium">{option.name}</p>
                  </div>
                  {option.beta && (
                    <Badge className="text-xs text-red-600 w-fit bg-secondary-foreground dark:bg-secondary-foreground hover:bg-secondary-foreground dark:hover:bg-secondary-foreground text-[10px] rounded px-1 py-0">
                      Beta
                    </Badge>
                  )}
                  {option.new && (
                    <Badge className="text-xs  text-green-500  w-fit bg-secondary-foreground dark:bg-secondary-foreground hover:bg-secondary-foreground dark:hover:bg-secondary-foreground text-[10px] rounded px-1 py-0">
                      New
                    </Badge>
                  )}
                  {option.sync && (
                    <Badge className="text-xs text-blue-500 w-fit bg-secondary-foreground dark:bg-secondary-foreground hover:bg-secondary-foreground dark:hover:bg-secondary-foreground text-[10px] rounded px-1 py-0">
                      Sync
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* <div>
          <p className="text-sm text-muted-foreground text-center mb-2">
            Don't see the app you use? Import a ZIP file, and Notion will
            convert it.
          </p>
          <div className="flex flex-col items-center gap-2">
            <label
              htmlFor="file-upload"
              className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer p-6 hover:border-gray-400"
            > 
              <Upload className="w-10 h-10 text-gray-500 mb-2" />
              <span className="text-sm text-gray-500">
                Drag and drop your ZIP files here
              </span>
              <input id="file-upload" type="file" className="hidden" />
            </label>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default ImportData;
