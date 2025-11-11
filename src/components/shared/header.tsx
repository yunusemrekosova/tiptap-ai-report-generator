"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const Header = () => {
  const pathname = usePathname();
  const isEditPage = pathname === "/";
  
  return (
    <header className="sticky z-50 top-0 px-6 border-b border-neutral-300 dark:border-neutral-700 bg-white/20 dark:bg-[#0d101820] backdrop-blur-lg">
      <div className="h-16 max-w-screen-xl w-full mx-auto flex items-center justify-between gap-6">
        {/* 3Horizons Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/3horizons-logo.png" 
            alt="3Horizons" 
            width={180} 
            height={40}
            className="object-contain"
          />
        </Link>
        
        {/* View/Edit Toggle */}
        <Link
          href={isEditPage ? "/post-csr" : "/"}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          {isEditPage ? "View Report" : "Edit Report"}
        </Link>
        
        {/* Empty div for spacing (or remove this section entirely) */}
        <div className="w-5"></div>
      </div>
    </header>
  );
};

export default Header;