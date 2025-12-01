import React from "react";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Landing page có header và footer riêng trong component
  // Không dùng layout chung của (client)
  return <>{children}</>;
}

