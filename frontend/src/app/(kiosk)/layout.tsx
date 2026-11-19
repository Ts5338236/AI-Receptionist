import React from "react";

export default function KioskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="touchscreen-kiosk fixed inset-0 w-screen h-screen overflow-hidden bg-black text-white flex flex-col justify-between">
      {children}
    </div>
  );
}
