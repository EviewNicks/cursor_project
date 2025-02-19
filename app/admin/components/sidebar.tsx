"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  UserIcon,
  BeakerIcon,
  DocumentTextIcon,
  CommandLineIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Overview", href: "/", icon: HomeIcon },
  {
    name: "My Account",
    href: "/account",
    icon: UserIcon,
    children: [
      { name: "Profile", href: "/account/profile" },
      { name: "Settings", href: "/account/settings" },
      { name: "Billing", href: "/account/billing" },
    ],
  },
  { name: "Research Assistant", href: "/assistant", icon: BeakerIcon },
  { name: "Research Reports", href: "/reports", icon: DocumentTextIcon },
  { name: "API Playground", href: "/playground", icon: CommandLineIcon },
  { name: "Documentation", href: "/docs", icon: BookOpenIcon, external: true },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen flex-col gap-4 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 w-64 p-4">
      <div className="flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black dark:bg-white">
          <svg
            className="h-5 w-5 text-white dark:text-black"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4.75 19.25L12 4.75L19.25 19.25L12 15.75L4.75 19.25Z"
            />
          </svg>
        </div>
        <span className="text-lg font-semibold">Tavily</span>
      </div>

      <div className="space-y-1">
        <div className="px-2">
          <select className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm">
            <option>Personal</option>
            <option>Team</option>
          </select>
        </div>

        <nav className="flex flex-col gap-1">
          {navigation.map((item) => (
            <div key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-black dark:hover:text-white"
                )}
                {...(item.external && {
                  target: "_blank",
                  rel: "noopener noreferrer",
                })}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
              {item.children && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className={cn(
                        "block rounded-lg px-2 py-1 text-sm transition-colors",
                        pathname === child.href
                          ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-black dark:hover:text-white"
                      )}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="mt-auto">
        <div className="flex items-center gap-2 rounded-lg px-2 py-2">
          <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800" />
          <div className="flex-1">
            <div className="text-sm font-medium">Ardiansyah</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Personal Account
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
