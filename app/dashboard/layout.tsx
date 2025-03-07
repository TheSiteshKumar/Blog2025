import { ReactNode } from 'react';
import Link from 'next/link';
import { 
  FileText,
  Image, 
  MessageSquare, 
  Mail,
  ChevronRight,
  Users
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    title: 'Posts',
    href: '/dashboard/posts',
    icon: <FileText className="h-5 w-5" />
  },
  {
    title: 'Media',
    href: '/dashboard/media',
    icon: <Image className="h-5 w-5" />
  },
  {
    title: 'Comments',
    href: '/dashboard/comments',
    icon: <MessageSquare className="h-5 w-5" />
  },
  {
    title: 'Contact Form',
    href: '/dashboard/contact-form',
    icon: <Mail className="h-5 w-5" />
  },
];

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r">
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors hover:bg-gray-100"
            >
              {item.icon}
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-8">
        {children}
      </div>
    </div>
  );
}