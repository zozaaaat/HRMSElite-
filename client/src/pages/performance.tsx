import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {Button} from '../components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../components/ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '../components/ui/tabs';
import {Badge} from '../components/ui/badge';
import {Progress} from '../components/ui/progress';
import {
  Target,
  TrendingUp,
  Users,
  Star,
  Calendar,
  Award,
  BarChart3,
  Activity,
  CheckCircle,
  Plus,
  Search,
  Eye
} from 'lucide-react';
import {SharedLayout} from '../components/shared-layout';
import {LoadingSpinner, ErrorMessage} from '../components/shared';
import { t } from "i18next";

export default function Performance () {

  return (
    <SharedLayout
      userRole="company_manager"
      userName={t('auto.performance.43')}
      companyName={t('auto.performance.44')}
    >
      <PerformanceContent />
    </SharedLayout>
  );

}

function PerformanceContent () {

  const [activeTab, setActiveTab] = useState('overview');

  const {'data': _performanceData, isLoading, error} = useQuery({
    'queryKey': ['/api/performance']
  });

  const mockEmployeesPerformance = [
    {
      'id': '1',
      'name': 'أحمد محمد علي',
      'department': 'المبيعات',
      'position': 'مسؤول مبيعات أول',
      'overallScore': 4.8,
      'goals': {'completed': 9, 'total': 10},
      'lastReview': '2025-01-15',
      'categories': {
        'productivity': 4.9,
        'quality': 4.7,
        'teamwork': 4.8,
        'leadership': 4.6
      },
      'trend': 'up'
    },
    {
      'id': '2',
      'name': 'فاطمة سالم أحمد',
      'department': 'المحاسبة',
      'position': 'محاسب أول',
      'overallScore': 4.5,
      'goals': {'completed': 8, 'total': 10},
      'lastReview': '2025-01-10',
      'categories': {
        'productivity': 4.6,
        'quality': 4.8,
        'teamwork': 4.3,
        'leadership': 4.2
      },
      'trend': 'up'
    },
    {
      'id': '3',
      'name': 'خالد عبدالرحمن',
      'department': 'التكنولوجيا',
      'position': 'مطور أول',
      'overallScore': 4.2,
      'goals': {'completed': 7, 'total': 10},
      'lastReview': '2025-01-05',
      'categories': {
        'productivity': 4.1,
        'quality': 4.5,
        'teamwork': 4.0,
        'leadership': 3.8
      },
      'trend': 'stable'
    }
  ];

  const mockTeamPerformance = [
    {
      'team': 'فريق المبيعات',
      'manager': 'أحمد محمد علي',
      'members': 8,
      'avgScore': 4.3,
      'goalsCompleted': 85,
      'trend': 'up',
      'topPerformers': 3
    },
    {
      'team': 'فريق المحاسبة',
      'manager': 'فاطمة سالم',
      'members': 6,
      'avgScore': 4.1,
      'goalsCompleted': 78,
      'trend': 'stable',
      'topPerformers': 2
    },
    {
      'team': 'فريق التكنولوجيا',
      'manager': 'خالد عبدالرحمن',
      'members': 5,
      'avgScore': 4.0,
      'goalsCompleted': 72,
      'trend': 'down',
      'topPerformers': 1
    }
  ];

  const getScoreColor = (score: number) => {

    if (score >= 4.5) {

      return 'text-green-600';

    }
    if (score >= 4.0) {

      return 'text-yellow-600';

    }
    return 'text-red-600';

  };

  const getScoreBadgeColor = (score: number) => {

    if (score >= 4.5) {

      return 'bg-green-100 text-green-800';

    }
    if (score >= 4.0) {

      return 'bg-yellow-100 text-yellow-800';

    }
    return 'bg-red-100 text-red-800';

  };

  const getTrendIcon = (trend: string) => {

    if (trend === 'up') {

      return <TrendingUp className="h-4 w-4 text-green-500" />;

    }
    if (trend === 'down') {

      return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;

    }
    return <Activity className="h-4 w-4 text-yellow-500" />;

  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('auto.performance.1')}</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {t('auto.performance.2')}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Search className="h-4 w-4 ml-2" />
              {t('auto.performance.3')}</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 ml-2" />
              {t('auto.performance.4')}</Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t('auto.performance.5')}</TabsTrigger>
            <TabsTrigger value="individual" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t('auto.performance.6')}</TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              {t('auto.performance.7')}</TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t('auto.performance.8')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Loading and Error States */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner text={t('auto.performance.45')} />
              </div>
            )}

            {error && (
              <div className="py-8">
                <ErrorMessage
                  error={error}
                  title={t('auto.performance.46')}
                  onRetry={() => window.location.reload()}
                />
              </div>
            )}

            {/* KPI Cards */}
            {!isLoading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <Star className="h-8 w-8 text-yellow-500" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('auto.performance.9')}</p>
                        <p className="text-2xl font-bold">4.3</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <Target className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('auto.performance.10')}</p>
                        <p className="text-2xl font-bold">78%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <Award className="h-8 w-8 text-purple-500" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('auto.performance.11')}</p>
                        <p className="text-2xl font-bold">24</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('auto.performance.12')}</p>
                        <p className="text-2xl font-bold">+12%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Performance Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('auto.performance.13')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-green-500 rounded" />
                        <span>{t('auto.performance.14')}</span>
                      </div>
                      <span className="font-bold">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-blue-500 rounded" />
                        <span>{t('auto.performance.15')}</span>
                      </div>
                      <span className="font-bold">35%</span>
                    </div>
                    <Progress value={35} className="h-2" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-yellow-500 rounded" />
                        <span>{t('auto.performance.16')}</span>
                      </div>
                      <span className="font-bold">15%</span>
                    </div>
                    <Progress value={15} className="h-2" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-red-500 rounded" />
                        <span>{t('auto.performance.17')}</span>
                      </div>
                      <span className="font-bold">5%</span>
                    </div>
                    <Progress value={5} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('auto.performance.18')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {'department': 'المبيعات', 'score': 4.3, 'employees': 15},
                      {'department': 'المحاسبة', 'score': 4.1, 'employees': 8},
                      {'department': 'التكنولوجيا', 'score': 4.0, 'employees': 6},
                      {'department': 'الموارد البشرية', 'score': 4.2, 'employees': 5}
                    ].map((dept, index) => (
                      <div key={
  index
} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <div className="font-medium">{dept.department}</div>
                          <div className="text-sm text-gray-600">{dept.employees} {t('auto.performance.19')}</div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold text-lg ${getScoreColor(dept.score)}`}>
                            {dept.score}
                          </div>
                          <div className="text-sm text-gray-600">{t('auto.performance.20')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="individual" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {mockEmployeesPerformance.map((employee) => (
                <Card key={employee.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold">{employee.name}</h3>
                          <Badge className={getScoreBadgeColor(employee.overallScore)}>
                            {employee.overallScore} {t('auto.performance.21')}</Badge>
                          {getTrendIcon(employee.trend)}
                        </div>
                        <p className="text-gray-600">{employee.position} - {employee.department}</p>
                        <p className="text-sm text-gray-500">{t('auto.performance.22')}{employee.lastReview}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 ml-1" />
                        {t('auto.performance.23')}</Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">{t('auto.performance.24')}</h4>
                        <div className="space-y-3">
                          {Object.entries(employee.categories).map(([category, score]) => (
                            <div key={category} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="capitalize">{
                                  category === 'productivity' ? 'الإنتاجية'
                                    : category === 'quality' ? 'الجودة'
                                      : category === 'teamwork' ? 'العمل الجماعي'
                                        : category === 'leadership' ? 'القيادة' : category
                                }</span>
                                <span className="font-medium">{score}</span>
                              </div>
                              <Progress value={score * 20} className="h-2" />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">{t('auto.performance.25')}</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{t('auto.performance.26')}</span>
                            <span className="font-bold">
                              {employee.goals.completed}/{employee.goals.total}
                            </span>
                          </div>
                          <Progress
                            value={(employee.goals.completed / employee.goals.total) * 100}
                            className="h-2"
                          />
                          <div className="text-sm text-gray-600">
                            {t('auto.performance.27')}{
  Math.round((employee.goals.completed / employee.goals.total) * 100)
}%
                          </div>
                        </div>

                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">{t('auto.performance.28')}</span>
                          </div>
                          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                            {t('auto.performance.29')}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="teams" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockTeamPerformance.map((team, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{team.team}</CardTitle>
                      {getTrendIcon(team.trend)}
                    </div>
                    <CardDescription>{t('auto.performance.30')}{team.manager}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${getScoreColor(team.avgScore)}`}>
                            {team.avgScore}
                          </div>
                          <div className="text-sm text-gray-600">{t('auto.performance.31')}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {team.members}
                          </div>
                          <div className="text-sm text-gray-600">{t('auto.performance.32')}</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{t('auto.performance.33')}</span>
                          <span className="font-medium">{team.goalsCompleted}%</span>
                        </div>
                        <Progress value={team.goalsCompleted} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{t('auto.performance.34')}</span>
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{team.topPerformers} {t('auto.performance.35')}</span>
                        </div>
                      </div>

                      <Button size="sm" variant="outline" className="w-full">
                        <Eye className="h-4 w-4 ml-1" />
                        {t('auto.performance.36')}</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {[
                {
                  'employee': 'أحمد محمد علي',
                  'reviewer': 'مدير المبيعات',
                  'date': '2025-01-15',
                  'period': 'الربع الأول 2025',
                  'status': 'completed',
                  'score': 4.8,
                  'nextReview': '2025-04-15'
                },
                {
                  'employee': 'فاطمة سالم أحمد',
                  'reviewer': 'مدير المحاسبة',
                  'date': '2025-01-10',
                  'period': 'سنوي 2024',
                  'status': 'pending',
                  'score': null,
                  'nextReview': '2025-01-25'
                },
                {
                  'employee': 'خالد عبدالرحمن',
                  'reviewer': 'مدير التكنولوجيا',
                  'date': '2025-01-05',
                  'period': 'الربع الرابع 2024',
                  'status': 'completed',
                  'score': 4.2,
                  'nextReview': '2025-04-05'
                }
              ].map((review, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold">{review.employee}</h3>
                          <Badge className={
                            review.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }>
                            {review.status === 'completed' ? 'مكتملة' : 'قيد المراجعة'}
                          </Badge>
                          {review.score && (
                            <Badge className={getScoreBadgeColor(review.score)}>
                              {review.score} {t('auto.performance.37')}</Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">{t('auto.performance.38')}</span>
                            <p className="font-medium">{review.reviewer}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">{t('auto.performance.39')}</span>
                            <p className="font-medium">{review.period}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">{t('auto.performance.40')}</span>
                            <p className="font-medium">{review.date}</p>
                          </div>
                        </div>

                        <div className="mt-3 text-sm">
                          <span className="text-gray-600">{t('auto.performance.41')}</span>
                          <span className="font-medium mr-2">{review.nextReview}</span>
                        </div>
                      </div>

                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 ml-1" />
                        {t('auto.performance.42')}</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

}
