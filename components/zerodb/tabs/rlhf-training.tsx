import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { GraduationCap, Database } from 'lucide-react';

interface RLHFTrainingProps {
  className?: string;
}

export const RLHFTraining: React.FC<RLHFTrainingProps> = ({ className }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            RLHF & Training
          </CardTitle>
          <CardDescription>
            Dataset management and model training
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Database className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Training Dashboard</h3>
            <p>RLHF datasets, training jobs, and model evaluation</p>
            <p className="text-sm mt-2">Coming soon - integrate with RLHFService API</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};