import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Info } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage platform configuration</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-500" />
            Platform Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Platform Name</span>
            <span className="font-medium">QR E-Menu Builder</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Version</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Environment</span>
            <span className="font-medium">Production</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Default Currency</span>
            <span className="font-medium">DA (Algerian Dinar)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Default Payment Mode</span>
            <span className="font-medium">Cash After Service</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500" />
            About
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 leading-relaxed">
            QR E-Menu Builder is a SaaS platform for restaurants in Algeria to create digital menus,
            generate QR codes, and manage customer orders. The platform supports multiple restaurants
            with customizable designs, real-time analytics, and order management.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
