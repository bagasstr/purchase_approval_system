import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { UserData } from '@/types/types';
import { getDepartmentByIdAction } from '@/features/departments/actions/departmentAction';
import { getRoleByIdAction } from '@/features/roles/actions/rolesAction';
import { MENU_GROUPS } from '../constants/menu.config';

export const useSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user as UserData;
  const [dept, setDept] = useState<any>(null);
  const [role, setRole] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        if (user.departmentId) {
          const resDept = await getDepartmentByIdAction(user.departmentId);
          setDept(resDept);
        }
        if (user.roleId) {
          const resRole = await getRoleByIdAction(user.roleId);
          setRole(resRole);
        }
      } catch (error) {
        console.error('Gagal mengambil data sidebar:', error);
      }
    };
    fetchData();
  }, [user, session]);

  const filteredMenuGroups = useMemo(() => {
    if (!role && !isPending) {
      return MENU_GROUPS.map((g) => ({
        ...g,
        items: g.items.filter((i) => !i.permission),
      })).filter((g) => g.items.length > 0);
    }

    return MENU_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!item.permission) return true;

        const roleName = role?.name?.toUpperCase();
        if (roleName === 'ADMIN' || roleName === 'SUPER-ADMIN') return true;

        const userPerms = role?.permissions || [];
        if (Array.isArray(item.permission)) {
          return item.permission.some((p) => userPerms.includes(p));
        }
        return userPerms.includes(item.permission);
      }),
    })).filter((group) => group.items.length > 0);
  }, [role, isPending]);

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = '/signin';
        },
      },
    });
  };

  return {
    pathname,
    user,
    dept,
    role,
    isPending,
    filteredMenuGroups,
    handleLogout,
  };
};
