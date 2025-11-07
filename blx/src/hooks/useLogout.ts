"use client";

import { useRouter } from "next/navigation";
import { useAccountStore } from "@/stores/account";

export function useLogout() {
  const router = useRouter();
  const { logout } = useAccountStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return handleLogout;
}

