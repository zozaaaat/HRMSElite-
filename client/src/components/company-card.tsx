import React from 'react';
import {Card, CardContent} from './ui/card';
import {Button} from './ui/button';
import {Badge} from './ui/badge';
import {useState} from 'react';
import {LoginModal} from './login-modal';
import type {CompanyWithStats} from '@shared/schema';

interface CompanyCardProps {
  company: CompanyWithStats;
}

export const CompanyCard = React.memo(({company}: CompanyCardProps) => {

  const [showLoginModal, setShowLoginModal] = useState(false);

  const getStatusBadge = (status: boolean | null) => {

    if (status) {

      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">ساري</Badge>;

    }
    return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">قريب الانتهاء</Badge>;

  };

  const getCompanyInitials = (name: string) => {

    const words = name.split(' ');
    return words.slice(0, 2).map(word => word.charAt(0)).join(' ');

  };

  const getGradientColor = (index: number) => {

    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-orange-500 to-orange-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600'
    ];
    return colors[index % colors.length];

  };

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <div className={
  `w-16 h-16 bg-gradient-to-br ${
  getGradientColor(0)
} rounded-lg flex items-center justify-center`
}>
              <span className="text-white font-bold text-xl">
                {getCompanyInitials(company.name)}
              </span>
            </div>
            <div className="mr-4 flex-1">
              <h3 className="text-lg font-bold text-foreground truncate">{company.name}</h3>
              <p className="text-sm text-muted-foreground">{
  company.classification ?? "غير محدد"
}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">عدد العمال:</span>
              <span className="text-sm font-medium text-foreground">{company.totalEmployees}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">التراخيص:</span>
              <span className="text-sm font-medium text-foreground">{company.totalLicenses}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">حالة الملف:</span>
              {getStatusBadge(company.commercialFileStatus)}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <Button
              className="w-full"
              onClick={() => setShowLoginModal(true)}
            >
              دخول إلى النظام
            </Button>
          </div>
        </CardContent>
      </Card>

      <LoginModal
        company={company}
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );

});
