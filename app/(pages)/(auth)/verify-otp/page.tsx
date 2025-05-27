import { VerifyOtpForm } from "@/app/(pages)/(auth)/verify-otp/_components/verify-otp-form";
import { GalleryVerticalEnd } from "lucide-react";

export default async function VerifyOtpPage() {
  return (
    <div className="grid min-h-svh">
      <div className="flex flex-col gap-4 p-6 md:p-10 relative">
        <div className="flex justify-between items-center">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Sigap Tech.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-lg">
            <VerifyOtpForm />
          </div>
        </div>
      </div>
    </div>
  );
}
