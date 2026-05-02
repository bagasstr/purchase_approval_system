import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Users,
  Settings,
  Building2,
  Shield,
  FileChartColumn,
} from 'lucide-react';

export interface MenuItem {
  title: string;
  icon: any;
  href: string;
  permission?: string[] | string;
}

export interface MenuGroup {
  label: string;
  items: MenuItem[];
}

export const MENU_GROUPS: MenuGroup[] = [
  {
    label: 'Utama',
    items: [
      { title: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
      {
        title: 'Statistik',
        icon: FileChartColumn,
        href: '/dashboard/analytics',
        permission: ['purchase-request:view-all', 'role:all'],
      },
    ],
  },
  {
    label: 'Operasional',
    items: [
      {
        title: 'Permintaan',
        icon: FileText,
        href: '/dashboard/requests',
        permission: 'purchase-request:create',
      },
      {
        title: 'Pusat Persetujuan',
        icon: CheckSquare,
        href: '/dashboard/approvals',
        permission: [
          'purchase-request:approve-manager',
          'purchase-request:approve-procurement-survey',
          'purchase-request:approve-finance',
          'purchase-request:approve-procurement-purchase',
        ],
      },
      {
        title: 'Manajemen Tim',
        icon: Users,
        href: '/dashboard/team',
        permission: ['purchase-request:approve-manager', 'user:all'],
      },
    ],
  },
  {
    label: 'Administrasi',
    items: [
      {
        title: 'Daftar Pengguna',
        icon: Users,
        href: '/dashboard/user-management',
        permission: 'user:all',
      },
      {
        title: 'Manajemen Divisi',
        icon: Building2,
        href: '/dashboard/departments',
        permission: 'department:all',
      },
      {
        title: 'Pengaturan Role',
        icon: Shield,
        href: '/dashboard/roles',
        permission: 'role:all',
      },
    ],
  },
  {
    label: 'Sistem',
    items: [
      { title: 'Pengaturan', icon: Settings, href: '/dashboard/settings' },
    ],
  },
];
