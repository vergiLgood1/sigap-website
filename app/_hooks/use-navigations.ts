import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useState } from "react";

export const useNavigations = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [active, setActive] = useState<string>("");
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  return {
    isLoading,
    setIsLoading,
    open,
    setOpen,
    active,
    setActive,
    router,
    params,
    searchParams,
    pathname,
  };
};
