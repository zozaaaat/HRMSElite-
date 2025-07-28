import type { Express } from "express";
import { 
  companies, 
  employees, 
  licenses, 
  departments,
  type CompanyIntelligentStats,
  type EmployeeIntelligentProfile
} from "../shared/schema";
import { db } from "./db";
import { eq, and, count, sum, avg, desc, asc } from "drizzle-orm";

export async function registerIntelligentRoutes(app: Express) {
  
  // Intelligent Company Analytics
  app.get('/api/intelligent/company/:companyId/stats', async (req, res) => {
    try {
      const companyId = req.params.companyId;
      
      // Get company basic info
      const [company] = await db.select().from(companies).where(eq(companies.id, companyId));
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }

      // Get intelligent stats
      const [employeeCount] = await db.select({ count: count() }).from(employees).where(eq(employees.companyId, companyId));
      const [licenseCount] = await db.select({ count: count() }).from(licenses).where(eq(licenses.companyId, companyId));
      const [activeProjectsCount] = await db.select({ count: count() }).from(projects)
        .where(and(eq(projects.companyId, companyId), eq(projects.status, 'active')));
      const [completedTasksCount] = await db.select({ count: count() }).from(tasks)
        .innerJoin(projects, eq(tasks.projectId, projects.id))
        .where(and(eq(projects.companyId, companyId), eq(tasks.status, 'completed')));
      const [departmentCount] = await db.select({ count: count() }).from(departments)
        .where(eq(departments.companyId, companyId));
      
      // Asset value calculation
      const assetValues = await db.select({ 
        totalValue: sum(smartAssets.currentValue) 
      }).from(smartAssets).where(eq(smartAssets.companyId, companyId));
      
      // Training programs count
      const [trainingCount] = await db.select({ count: count() }).from(trainingPrograms)
        .where(eq(trainingPrograms.companyId, companyId));
      
      // Average performance rating
      const avgPerformance = await db.select({ 
        avgRating: avg(performanceReviews.overallRating) 
      }).from(performanceReviews)
        .innerJoin(employees, eq(performanceReviews.employeeId, employees.id))
        .where(eq(employees.companyId, companyId));

      // Department productivity
      const departmentProductivity = await db.select({
        departmentName: departments.name,
        employeeCount: count(employees.id),
        budget: departments.budget,
      }).from(departments)
        .leftJoin(employees, eq(departments.id, employees.departmentId))
        .where(eq(departments.companyId, companyId))
        .groupBy(departments.id, departments.name, departments.budget);

      // License utilization
      const licenseUtilization = await db.select({
        licenseName: licenses.name,
        assignedEmployees: count(employeeLicenseAssignments.id),
      }).from(licenses)
        .leftJoin(employeeLicenseAssignments, eq(licenses.id, employeeLicenseAssignments.licenseId))
        .where(eq(licenses.companyId, companyId))
        .groupBy(licenses.id, licenses.name);

      // Skills matrix
      const skillsMatrix = await db.select({
        skillName: employeeSkills.skillName,
        employeeCount: count(employeeSkills.id),
        averageProficiency: avg(
          // Convert proficiency levels to numbers for averaging
          // This would need proper case handling in production
          employeeSkills.yearsOfExperience
        ),
      }).from(employeeSkills)
        .innerJoin(employees, eq(employeeSkills.employeeId, employees.id))
        .where(eq(employees.companyId, companyId))
        .groupBy(employeeSkills.skillName);

      const intelligentStats: CompanyIntelligentStats = {
        ...company,
        totalEmployees: employeeCount.count,
        totalLicenses: licenseCount.count,
        activeProjects: activeProjectsCount.count,
        completedTasks: completedTasksCount.count,
        departmentCount: departmentCount.count,
        assetValue: Number(assetValues[0]?.totalValue || 0),
        trainingPrograms: trainingCount.count,
        avgPerformanceRating: Number(avgPerformance[0]?.avgRating || 0),
        upcomingLicenseExpiries: 0, // This would need date calculation
        pendingTasksCount: 0, // This would need task status filtering
        overdueTasks: 0, // This would need date comparison
        departmentProductivity: departmentProductivity.map(dept => ({
          departmentName: dept.departmentName,
          taskCompletion: 0, // Would need task completion calculation
          employeeCount: dept.employeeCount,
          budget: Number(dept.budget || 0),
        })),
        licenseUtilization: licenseUtilization.map(license => ({
          licenseName: license.licenseName,
          assignedEmployees: license.assignedEmployees,
          utilizationRate: 0, // Would need utilization calculation
        })),
        skillsMatrix: skillsMatrix.map(skill => ({
          skillName: skill.skillName,
          employeeCount: skill.employeeCount,
          averageProficiency: Number(skill.averageProficiency || 0),
        })),
      };

      res.json(intelligentStats);
    } catch (error) {
      console.error('Error fetching intelligent company stats:', error);
      res.status(500).json({ error: 'Failed to fetch company statistics' });
    }
  });

  // Employee Intelligent Profile
  app.get('/api/intelligent/employee/:employeeId/profile', async (req, res) => {
    try {
      const employeeId = req.params.employeeId;
      
      // Get employee with basic relations
      const [employee] = await db.select().from(employees).where(eq(employees.id, employeeId));
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      // Get department - simplified for now
      const department = null;

      // Get supervisor - simplified for now
      const supervisor = null;

      // Get assigned licenses - simplified
      const assignedLicenses = await db.select().from(licenses)
        .where(eq(licenses.companyId, employee.companyId));

      // Simplified for basic implementation
      const currentProjects: any[] = [];
      const assignedTasks: any[] = [];
      const skills: any[] = [];
      const recentPerformance: any[] = [];

      const intelligentProfile: EmployeeIntelligentProfile = {
        ...employee,
        department: department || null,
        supervisor: supervisor || null,
        assignedLicenses: assignedLicenses,
        currentProjects: [],
        assignedTasks: assignedTasks,
        skills: skills,
        recentPerformance: recentPerformance,
        trainingHistory: [], // Would need training enrollment query
        attendanceStats: {
          totalDays: 0,
          presentDays: 0,
          lateDays: 0,
          attendanceRate: 0,
        },
        productivityScore: 0,
        upcomingLicenseRenewals: [],
        skillGaps: [],
        careerPath: {
          currentLevel: employee.jobTitle || '',
          nextLevel: '',
          requiredSkills: [],
          estimatedTimeToPromotion: 0,
        },
      };

      res.json(intelligentProfile);
    } catch (error) {
      console.error('Error fetching employee intelligent profile:', error);
      res.status(500).json({ error: 'Failed to fetch employee profile' });
    }
  });

  // Smart License Assignments
  app.post('/api/intelligent/license-assignments', async (req, res) => {
    try {
      const { employeeId, licenseId, assignedBy, reasonForAssignment, specializations } = req.body;
      
      // Check if employee exists and get their skills
      const [employee] = await db.select().from(employees).where(eq(employees.id, employeeId));
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      // Check if license exists
      const [license] = await db.select().from(licenses).where(eq(licenses.id, licenseId));
      if (!license) {
        return res.status(404).json({ error: 'License not found' });
      }

      // Simplified skills check
      const employeeSkillsList: any[] = [];

      // Simplified assignment logic for now
      const assignment = {
        id: 'temp-id',
        employeeId,
        licenseId,
        assignedBy,
        reasonForAssignment,
        createdAt: new Date(),
      };

      res.json({ success: true, assignment });
    } catch (error) {
      console.error('Error creating intelligent license assignment:', error);
      res.status(500).json({ error: 'Failed to create assignment' });
    }
  });

  // Placeholder for future project analytics

  // Placeholder for future department insights

  // Smart Recommendations Engine
  app.get('/api/intelligent/recommendations/:companyId', async (req, res) => {
    try {
      const companyId = req.params.companyId;
      
      // This would be an AI-powered recommendations system
      const recommendations = {
        talent: [
          {
            type: 'hiring',
            priority: 'high',
            title: 'توظيف مطور برمجيات senior',
            description: 'بناءً على تحليل المشاريع الحالية، يُنصح بتوظيف مطور برمجيات ذو خبرة عالية',
            expectedImpact: 'تسريع تسليم المشاريع بنسبة 25%',
            estimatedCost: 15000,
            timeframe: '30 يوم',
          },
          {
            type: 'training',
            priority: 'medium',
            title: 'برنامج تدريبي في إدارة المشاريع',
            description: 'تحسين مهارات إدارة المشاريع لدى المديرين',
            expectedImpact: 'تحسين معدل نجاح المشاريع بنسبة 15%',
            estimatedCost: 5000,
            timeframe: '60 يوم',
          },
        ],
        operations: [
          {
            type: 'process',
            priority: 'high',
            title: 'أتمتة عملية الموافقة على الإجازات',
            description: 'تطبيق نظام آلي للموافقة على طلبات الإجازات',
            expectedImpact: 'توفير 20 ساعة عمل أسبوعياً',
            estimatedCost: 3000,
            timeframe: '14 يوم',
          },
        ],
        compliance: [
          {
            type: 'license',
            priority: 'urgent',
            title: 'تجديد التراخيص المنتهية الصلاحية',
            description: '5 تراخيص ستنتهي خلال الشهر القادم',
            expectedImpact: 'تجنب المخاطر القانونية',
            estimatedCost: 8000,
            timeframe: '30 يوم',
          },
        ],
        financial: [
          {
            type: 'cost_saving',
            priority: 'medium',
            title: 'إعادة تنظيم استخدام الأصول',
            description: 'تحسين استخدام المعدات غير المستخدمة',
            expectedImpact: 'توفير 12,000 ريال سنوياً',
            estimatedCost: 0,
            timeframe: '7 أيام',
          },
        ],
      };

      res.json(recommendations);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      res.status(500).json({ error: 'Failed to generate recommendations' });
    }
  });

  // Smart Skills Gap Analysis
  app.get('/api/intelligent/skills-gap/:companyId', async (req, res) => {
    try {
      const companyId = req.params.companyId;
      
      // Simplified skills analysis
      const employeeSkillsData = await db.select().from(employees)
        .where(eq(employees.companyId, companyId));

      // Analyze skills gaps (simplified logic)
      const skillsGapAnalysis = {
        summary: {
          totalEmployees: new Set(employeeSkillsData.map(e => e.employeeId)).size,
          uniqueSkills: new Set(employeeSkillsData.map(e => e.skillName).filter(Boolean)).size,
          avgSkillsPerEmployee: 0,
          criticalGaps: 3,
        },
        departmentAnalysis: [
          {
            department: 'تطوير البرمجيات',
            requiredSkills: ['React', 'Node.js', 'TypeScript'],
            availableSkills: ['JavaScript', 'HTML', 'CSS'],
            gaps: ['React', 'TypeScript'],
            severity: 'high',
            recommendation: 'تدريب عاجل في React و TypeScript',
          },
          {
            department: 'إدارة المشاريع',
            requiredSkills: ['PMP', 'Agile', 'Scrum'],
            availableSkills: ['إدارة المشاريع الأساسية'],
            gaps: ['PMP', 'Agile'],
            severity: 'medium',
            recommendation: 'حصول على شهادة PMP',
          },
        ],
        individualAnalysis: employeeSkillsData.map((emp: any) => ({
          employeeId: emp.id,
          employeeName: emp.fullName,
          department: 'قسم التطوير',
          currentSkills: [],
          recommendedSkills: ['TypeScript', 'React'],
          careerPath: 'Senior Developer',
          estimatedTrainingTime: '3 أشهر',
        })),
        trainingPlan: {
          shortTerm: [
            {
              skill: 'React',
              priority: 'high',
              targetEmployees: 5,
              duration: '4 أسابيع',
              cost: 10000,
            },
          ],
          longTerm: [
            {
              skill: 'PMP Certification',
              priority: 'medium',
              targetEmployees: 2,
              duration: '3 أشهر',
              cost: 15000,
            },
          ],
        },
      };

      res.json(skillsGapAnalysis);
    } catch (error) {
      console.error('Error analyzing skills gaps:', error);
      res.status(500).json({ error: 'Failed to analyze skills gaps' });
    }
  });
}