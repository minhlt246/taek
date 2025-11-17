"use client";

import { useToast } from "@/utils/toast";
import { getSession, signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function AdminLogin() {
  const searchParams = useSearchParams();

  useEffect(() => {
    signIn("login-by-username-credentials", {
      username: searchParams.get("wallet") || "",
      redirect: false,
    }).then(async (res: any) => {
      if (res.ok) {
        const result = await getSession();
        window.location.href = "/";
      } else {
        useToast.error(res.error);
      }
    });
  }, [searchParams]);

  return <div></div>;
}
