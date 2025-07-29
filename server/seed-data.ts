import { db } from "./db";
import { companies, users, employees, licenses, companyUsers } from "@shared/schema";

export async function seedDatabase() {
  try {
    console.log("🌱 Seeding database with sample data...");

    // Create sample company
    const [company] = await db.insert(companies).values({
      id: "company-1",
      name: "شركة الكويت للتقنية المتقدمة",
      commercialFileNumber: "123456789",
      commercialFileName: "شركة الكويت للتقنية المتقدمة ذ.م.م",
      establishmentDate: "2020-01-15",
      commercialRegistrationNumber: "CR-2020-001",
      classification: "تقنية المعلومات",
      department: "الخدمات التقنية",
      fileType: "شركة ذات مسؤولية محدودة",
      legalEntity: "شركة ذات مسؤولية محدودة",
      ownershipCategory: "قطاع خاص",
      address: "الكويت، مدينة الكويت، شارع الخليج العربي، مجمع الأعمال",
      phone: "+965 2245 5500",
      email: "info@kuwait-tech.com",
      website: "https://kuwait-tech.com",
      totalEmployees: 45,
      totalLicenses: 3,
      industryType: "تقنية المعلومات",
      businessActivity: "تطوير البرمجيات وحلول تقنية المعلومات",
      location: "مدينة الكويت",
      taxNumber: "TAX-123456789",
      chambers: "غرفة تجارة وصناعة الكويت"
    }).returning();

    console.log("✅ Created sample company:", company.name);

    // Create sample users
    const sampleUsers = await db.insert(users).values([
      {
        id: "user-1",
        email: "admin@kuwait-tech.com",
        firstName: "أحمد",
        lastName: "المدير",
        role: "company_manager",
        companyId: "company-1"
      },
      {
        id: "user-2", 
        email: "hr@kuwait-tech.com",
        firstName: "فاطمة",
        lastName: "الموارد البشرية",
        role: "administrative_employee",
        companyId: "company-1"
      },
      {
        id: "user-3",
        email: "supervisor@kuwait-tech.com", 
        firstName: "خالد",
        lastName: "المشرف",
        role: "supervisor",
        companyId: "company-1"
      }
    ]).returning();

    console.log("✅ Created sample users:", sampleUsers.length);

    // Create sample licenses
    const sampleLicenses = await db.insert(licenses).values([
      {
        id: "license-1",
        companyId: "company-1",
        licenseNumber: "LIC-2020-001",
        name: "رخصة تقنية المعلومات الرئيسية",
        holderCivilId: "285123456789",
        issuingAuthority: "وزارة التجارة والصناعة",
        type: "commercial",
        status: "active",
        issueDate: "2020-01-20",
        expiryDate: "2025-01-20",
        address: "الكويت، مدينة الكويت، شارع الخليج العربي",
        description: "رخصة تجارية لمزاولة أنشطة تقنية المعلومات",
        licenseCategory: "تجاري",
        businessType: "تقنية المعلومات",
        shopNumber: "A-101",
        floor: "الطابق الأول",
        marketName: "مجمع الأعمال",
        municipality: "محافظة العاصمة",
        associatedEmployees: 45
      },
      {
        id: "license-2", 
        companyId: "company-1",
        licenseNumber: "LIC-2021-002",
        name: "رخصة فرع الجهراء",
        holderCivilId: "285123456789",
        issuingAuthority: "وزارة التجارة والصناعة",
        type: "branch",
        status: "active", 
        issueDate: "2021-06-15",
        expiryDate: "2026-06-15",
        address: "الجهراء، مجمع الجهراء التجاري",
        description: "رخصة فرع للخدمات التقنية في محافظة الجهراء",
        licenseCategory: "تجاري",
        businessType: "خدمات تقنية",
        shopNumber: "B-205", 
        floor: "الطابق الثاني",
        marketName: "مجمع الجهراء التجاري",
        municipality: "محافظة الجهراء",
        associatedEmployees: 12
      }
    ]).returning();

    console.log("✅ Created sample licenses:", sampleLicenses.length);

    // Create sample employees
    const sampleEmployees = await db.insert(employees).values([
      {
        id: "emp-1",
        companyId: "company-1",
        licenseId: "license-1",
        civilId: "285987654321",
        fullName: "أحمد محمد علي الكندري",
        nationality: "كويتي",
        type: "citizen",
        jobTitle: "مطور أول",
        actualJobTitle: "مطور تطبيقات الويب",
        hireDate: "2022-03-01",
        monthlySalary: "2800.00",
        actualSalary: "2800.00",
        status: "active",
        phone: "+965 9999 1111",
        email: "ahmed.ali@kuwait-tech.com",
        address: "الكويت، السالمية، شارع سالم المبارك",
        emergencyContact: "فاطمة علي الكندري - +965 9999 2222",
        department: "تقنية المعلومات",
        contractType: "دائم",
        workLocation: "المكتب الرئيسي"
      },
      {
        id: "emp-2",
        companyId: "company-1", 
        licenseId: "license-1",
        civilId: "195876543210",
        fullName: "محمد عبدالله أحمد",
        nationality: "مصري",
        type: "expatriate",
        jobTitle: "محاسب",
        actualJobTitle: "محاسب عام",
        hireDate: "2021-09-15",
        workPermitStart: "2021-09-15",
        workPermitEnd: "2024-09-15",
        monthlySalary: "2200.00",
        actualSalary: "2200.00", 
        status: "active",
        phone: "+965 9888 3333",
        email: "mohamed.ahmed@kuwait-tech.com",
        address: "الكويت، حولي، شارع تونس",
        emergencyContact: "عبدالله محمد أحمد - +20 100 123 4567",
        passportNumber: "A12345678",
        passportExpiry: "2026-05-20",
        residenceNumber: "123456789",
        residenceExpiry: "2024-09-15",
        department: "المحاسبة",
        contractType: "محدد المدة",
        workLocation: "المكتب الرئيسي"
      },
      {
        id: "emp-3",
        companyId: "company-1",
        licenseId: "license-2", 
        civilId: "275123987654",
        fullName: "فاطمة سالم محمد العتيبي",
        nationality: "كويتية",
        type: "citizen",
        jobTitle: "مديرة فرع",
        actualJobTitle: "مديرة فرع الجهراء",
        hireDate: "2020-11-10",
        monthlySalary: "3200.00",
        actualSalary: "3200.00",
        status: "active",
        phone: "+965 9777 4444",
        email: "fatima.salem@kuwait-tech.com",
        address: "الجهراء، مدينة الجهراء، شارع الملك فهد",
        emergencyContact: "سالم محمد العتيبي - +965 9777 5555",
        department: "الإدارة",
        contractType: "دائم",
        workLocation: "فرع الجهراء"
      },
      {
        id: "emp-4",
        companyId: "company-1",
        licenseId: "license-1",
        civilId: "185432167890",
        fullName: "راجا كومار شارما",
        nationality: "هندي",
        type: "expatriate",
        jobTitle: "مطور",
        actualJobTitle: "مطور تطبيقات الجوال",
        hireDate: "2023-01-20",
        workPermitStart: "2023-01-20", 
        workPermitEnd: "2026-01-20",
        monthlySalary: "2500.00",
        actualSalary: "2500.00",
        status: "active",
        phone: "+965 9666 5555",
        email: "raja.kumar@kuwait-tech.com",
        address: "الكويت، الفروانية، شارع الرقعي",
        emergencyContact: "سونيتا شارما - +91 98765 43210",
        passportNumber: "H9876543",
        passportExpiry: "2028-03-15",
        residenceNumber: "987654321",
        residenceExpiry: "2026-01-20",
        department: "تقنية المعلومات",
        contractType: "محدد المدة",
        workLocation: "المكتب الرئيسي"
      },
      {
        id: "emp-5",
        companyId: "company-1",
        licenseId: "license-1",
        civilId: "295147258369",
        fullName: "نوال خالد الرشيد",
        nationality: "كويتية", 
        type: "citizen",
        jobTitle: "موظفة موارد بشرية",
        actualJobTitle: "أخصائية موارد بشرية",
        hireDate: "2022-08-01",
        monthlySalary: "2400.00",
        actualSalary: "2400.00",
        status: "active",
        phone: "+965 9555 6666",
        email: "nawal.khalid@kuwait-tech.com",
        address: "الكويت، الأحمدي، مدينة صباح الأحمد",
        emergencyContact: "خالد محمد الرشيد - +965 9555 7777",
        department: "الموارد البشرية",
        contractType: "دائم",
        workLocation: "المكتب الرئيسي"
      }
    ]).returning();

    console.log("✅ Created sample employees:", sampleEmployees.length);

    // Create company user relationships
    const companyUserRelations = await db.insert(companyUsers).values([
      {
        userId: "user-1",
        companyId: "company-1", 
        role: "company_manager",
        permissions: ["all"]
      },
      {
        userId: "user-2",
        companyId: "company-1",
        role: "administrative_employee", 
        permissions: ["employees_view", "employees_create", "leaves_approve"]
      },
      {
        userId: "user-3",
        companyId: "company-1",
        role: "supervisor",
        permissions: ["employees_view", "attendance_manage"],
        supervisedWorkers: ["emp-4", "emp-5"]
      }
    ]).returning();

    console.log("✅ Created company user relations:", companyUserRelations.length);
    console.log("🎉 Database seeding completed successfully!");

    return {
      companies: [company],
      users: sampleUsers,
      licenses: sampleLicenses,
      employees: sampleEmployees,
      relations: companyUserRelations
    };

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}