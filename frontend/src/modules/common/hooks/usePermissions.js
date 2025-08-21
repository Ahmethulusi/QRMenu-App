import { useState, useEffect } from 'react';
import { getCurrentUser } from '../utils/permissions';

const API_URL = import.meta.env.VITE_API_URL;

// API fonksiyonları
const checkPermissionAPI = async (resource, action, businessId = null, branchId = null) => {
  try {
    const response = await fetch(`${API_URL}/api/permissions/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        resource,
        action,
        business_id: businessId,
        branch_id: branchId
      })
    });

    if (response.ok) {
      const result = await response.json();
      return result.hasPermission;
    }
    return false;
  } catch (error) {
    console.error('Yetki kontrolü hatası:', error);
    return false;
  }
};

const getUserPermissionsAPI = async () => {
  try {
    const response = await fetch(`${API_URL}/api/permissions/user`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.ok) {
      const result = await response.json();
      return result.permissions;
    }
    return [];
  } catch (error) {
    console.error('Yetki getirme hatası:', error);
    return [];
  }
};

export const usePermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  useEffect(() => {
    const loadPermissions = async () => {
      if (user) {
        try {
          const userPermissions = await getUserPermissionsAPI();
          setPermissions(userPermissions);
        } catch (error) {
          console.error('Yetki yükleme hatası:', error);
        }
      }
      setLoading(false);
    };

    loadPermissions();
  }, [user]);

  const hasPermission = (resource, action) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    
    return permissions.some(p => p.resource === resource && p.action === action);
  };

  const canPerformAction = (action) => {
    const actionPermissions = {
      'create_product': hasPermission('products', 'create'),
      'edit_product': hasPermission('products', 'update'),
      'delete_product': hasPermission('products', 'delete'),
      'sort_product': hasPermission('products', 'sort'),
      'create_category': hasPermission('categories', 'create'),
      'edit_category': hasPermission('categories', 'update'),
      'delete_category': hasPermission('categories', 'delete'),
      'sort_category': hasPermission('categories', 'sort'),
      'create_user': hasPermission('users', 'create'),
      'edit_user': hasPermission('users', 'update'),
      'delete_user': hasPermission('users', 'delete'),
      'create_branch': hasPermission('branches', 'create'),
      'edit_branch': hasPermission('branches', 'update'),
      'delete_branch': hasPermission('branches', 'delete'),
      'create_qr': hasPermission('qr', 'create'),
      'edit_qr': hasPermission('qr', 'update'),
      'delete_qr': hasPermission('qr', 'delete'),
      'create_table': hasPermission('tables', 'create'),
      'edit_table': hasPermission('tables', 'update'),
      'delete_table': hasPermission('tables', 'delete'),
      'view_permissions': hasPermission('permissions', 'read'),
      'update_permissions': hasPermission('permissions', 'update'),
    };

    return actionPermissions[action] || false;
  };

  const checkPermissionAsync = async (resource, action, businessId = null, branchId = null) => {
    return await checkPermissionAPI(resource, action, businessId, branchId);
  };

  return {
    permissions,
    loading,
    hasPermission,
    canPerformAction,
    checkPermissionAsync,
    user
  };
}; 