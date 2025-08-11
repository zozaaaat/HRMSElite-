import { useLocation } from "wouter";
import { 
  getItemPath, 
  hasAccessToItem, 
  getItemInfo, 
  getMenuItems, 
  getAdvancedFeatures 
} from "../lib/navigation-config";
import { useRole } from "./useRole";
import { logger } from '@utils/logger';


export const useNavigation = () => {
  const [, setLocation] = useLocation();
  const { role } = useRole();

  // التنقل إلى عنصر معين
  const navigateToItem = (itemId: string, companyId?: string, companyName?: string) => {
    // التحقق من الصلاحية قبل التنقل
    if (!hasAccessToItem(itemId, role)) {
      logger.warn(`User with role ${role} doesn't have access to ${itemId}`);
      return;
    }
    
    const path = getItemPath(itemId, role, companyId, companyName);
    setLocation(path);
  };

  // التنقل إلى لوحة التحكم
  const navigateToDashboard = (companyId?: string, companyName?: string) => {
    navigateToItem("dashboard", companyId, companyName);
  };

  // التنقل إلى إدارة الموظفين
  const navigateToEmployees = (companyId?: string) => {
    navigateToItem("employees", companyId);
  };

  // التنقل إلى التقارير
  const navigateToReports = (companyId?: string) => {
    navigateToItem("reports", companyId);
  };

  // التنقل إلى الإعدادات
  const navigateToSettings = (companyId?: string) => {
    navigateToItem("settings", companyId);
  };

  // التنقل إلى الإجازات
  const navigateToLeaves = (companyId?: string) => {
    navigateToItem("leaves", companyId);
  };

  // التنقل إلى الحضور
  const navigateToAttendance = (companyId?: string) => {
    navigateToItem("attendance", companyId);
  };

  // التنقل إلى المرتبات
  const navigateToPayroll = (companyId?: string) => {
    navigateToItem("payroll", companyId);
  };

  // التنقل إلى المستندات
  const navigateToDocuments = (companyId?: string) => {
    navigateToItem("documents", companyId);
  };

  // التنقل إلى الملف الشخصي
  const navigateToProfile = (companyId?: string) => {
    navigateToItem("profile", companyId);
  };

  // التنقل إلى الشركات (للمسؤول العام)
  const navigateToCompanies = () => {
    navigateToItem("companies");
  };

  // التنقل إلى التراخيص
  const navigateToLicenses = (companyId?: string) => {
    navigateToItem("licenses", companyId);
  };

  // التنقل إلى الصلاحيات
  const navigateToPermissions = (companyId?: string) => {
    navigateToItem("permissions", companyId);
  };

  // التنقل إلى إعدادات الشركة
  const navigateToCompanySettings = (companyId?: string) => {
    navigateToItem("company-settings", companyId);
  };

  // التنقل إلى مسار مخصص
  const navigateToPath = (path: string) => {
    setLocation(path);
  };

  // العودة للصفحة السابقة
  const goBack = () => {
    window.history.back();
  };

  // العودة للصفحة الرئيسية
  const goHome = () => {
    setLocation("/");
  };

  // الحصول على معلومات العنصر الحالي
  const getCurrentItemInfo = (itemId: string) => {
    return getItemInfo(itemId, role);
  };

  // التحقق من إمكانية الوصول لعنصر معين
  const canAccessItem = (itemId: string) => {
    return hasAccessToItem(itemId, role);
  };

  // الحصول على عناصر القائمة المتاحة للدور الحالي
  const getAvailableMenuItems = () => {
    return getMenuItems(role);
  };

  // الحصول على الميزات المتقدمة المتاحة للدور الحالي
  const getAvailableAdvancedFeatures = () => {
    return getAdvancedFeatures(role);
  };

  return {
    // دوال التنقل الأساسية
    navigateToItem,
    navigateToDashboard,
    navigateToEmployees,
    navigateToReports,
    navigateToSettings,
    navigateToLeaves,
    navigateToAttendance,
    navigateToPayroll,
    navigateToDocuments,
    navigateToProfile,
    navigateToCompanies,
    navigateToLicenses,
    navigateToPermissions,
    navigateToCompanySettings,
    navigateToPath,
    goBack,
    goHome,
    
    // دوال مساعدة
    getCurrentItemInfo,
    canAccessItem,
    getAvailableMenuItems,
    getAvailableAdvancedFeatures,
    
    // دوال النظام
    setLocation
  };
}; 