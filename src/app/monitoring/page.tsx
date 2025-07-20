import { ApiMonitoringDashboard } from '@/components/ApiMonitoringDashboard';
import { Navigation } from '@/components/navigation';

export default function ApiMonitoringPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <ApiMonitoringDashboard />
      </div>
    </div>
  );
}
