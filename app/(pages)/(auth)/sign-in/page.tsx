import { SignInForm } from "@/app/(pages)/(auth)/sign-in/_components/signin-form";
import { Message } from "@/app/_components/form-message";
import { Button } from "@/app/_components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/app/_components/ui/carousal";
import { IconQuoteFilled } from "@tabler/icons-react";
import { GalleryVerticalEnd, Globe, QuoteIcon } from "lucide-react";
import { CarousalQuotes } from "./_components/carousal-quote";
import { SignInWithPasswordForm } from "./_components/sign-in-with-password-form";

export default async function Login(props: { searchParams: Promise<Message> }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-5">
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-[#171717] lg:col-span-2 relative border border-r-2 border-r-gray-400 border-opacity-20">
        <div className="flex justify-between items-center">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Sigap Tech.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <SignInWithPasswordForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-[#0a0a0a] lg:flex items-center justify-center lg:col-span-3">
        <Button
          variant="outline"
          size="sm"
          className="absolute top-6 right-6 text-white bg-[#242424] border-gray-700 hover:bg-gray-800"
        >
          <Globe className="mr-0 h-4 w-4" />
          Showcase
        </Button>
        <CarousalQuotes />
      </div>
    </div>
  );
}
