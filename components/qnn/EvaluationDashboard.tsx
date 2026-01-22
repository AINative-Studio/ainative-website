import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  Download,
  Target,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { useModels } from '@/hooks/useModels';
import { useModelEvaluation } from '@/hooks/useEvaluation';

interface ConfusionMatrixData {
  predicted: string;
  actual: string;
  value: number;
}

export default function EvaluationDashboard() {
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'json'>('json');

  // Fetch available models
  const { data: modelsResponse, isLoading: modelsLoading } = useModels({
    status: ['trained', 'deployed'],
  });

  // Fetch evaluation data for selected model
  const { data: evaluation, isLoading: evaluationLoading } = useModelEvaluation(
    selectedModelId,
    !!selectedModelId
  );

  const models = modelsResponse?.items || [];
  const isLoading = modelsLoading || evaluationLoading;

  // Generate confusion matrix heatmap data
  const confusionMatrixData = useMemo(() => {
    if (!evaluation?.confusionMatrix) return [];

    const matrix: ConfusionMatrixData[] = [];
    const classes = evaluation.classNames || ['Class 0', 'Class 1'];
    const matrixValues = evaluation.confusionMatrix;

    matrixValues.forEach((row, i) => {
      row.forEach((value, j) => {
        matrix.push({
          predicted: classes[j],
          actual: classes[i],
          value,
        });
      });
    });

    return matrix;
  }, [evaluation]);

  // Generate ROC curve data
  const rocCurveData = useMemo(() => {
    if (!evaluation?.rocCurve) {
      // Generate synthetic ROC curve for demo
      const auc = evaluation?.metrics.auc || 0.85;
      const points = 100;
      return Array.from({ length: points }, (_, i) => {
        const fpr = i / (points - 1);
        const tpr = Math.min(1, fpr + (1 - fpr) * (1 - Math.exp(-5 * fpr)) * auc);
        return { fpr, tpr };
      });
    }
    return evaluation.rocCurve.map((point) => ({
      fpr: point.falsePositiveRate,
      tpr: point.truePositiveRate,
    }));
  }, [evaluation]);

  // Handle export
  const handleExport = async () => {
    if (!evaluation) return;

    if (exportFormat === 'json') {
      const dataStr = JSON.stringify(evaluation, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = `evaluation-${selectedModelId}-${Date.now()}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } else {
      // PDF export would be implemented with a library like jsPDF
      console.log('PDF export not yet implemented');
      alert('PDF export coming soon! Use JSON for now.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-gradient-to-br from-purple-500/10 to-blue-600/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Evaluation Dashboard</CardTitle>
                <CardDescription>
                  Evaluate trained models and view comprehensive performance metrics
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select
                value={selectedModelId}
                onValueChange={setSelectedModelId}
                disabled={modelsLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a model to evaluate" />
                </SelectTrigger>
                <SelectContent>
                  {models.length === 0 && !modelsLoading && (
                    <div className="px-2 py-6 text-center text-sm text-gray-500">
                      No trained models available
                    </div>
                  )}
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center gap-2">
                        <span>{model.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {model.architecture}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {evaluation && (
              <div className="flex items-center gap-2">
                <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as 'pdf' | 'json')}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleExport}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Report
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {!selectedModelId && !isLoading && (
        <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-purple-500/10 to-blue-600/10 mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Model Selected</h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                Select a trained model from the dropdown above to view its evaluation metrics and performance analysis
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && selectedModelId && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border border-primary/20">
                <CardHeader>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-24" />
                </CardHeader>
              </Card>
            ))}
          </div>
          <Card className="border border-primary/20">
            <CardContent className="py-12">
              <Skeleton className="h-[400px] w-full" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Evaluation Results */}
      {evaluation && !isLoading && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Performance Metrics Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Accuracy */}
            <Card className="border border-primary/20 bg-gradient-to-br from-purple-500/10 via-primary/10 to-blue-600/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent" />
              <CardHeader className="pb-3 relative">
                <div className="flex items-center justify-between mb-2">
                  <CardDescription className="text-xs font-medium">Accuracy</CardDescription>
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-4xl font-bold text-primary mb-2">
                  {(evaluation.metrics.accuracy * 100).toFixed(2)}%
                </CardTitle>
                {evaluation.metrics.accuracyChange !== undefined && (
                  <div className="flex items-center gap-1 text-xs">
                    {evaluation.metrics.accuracyChange >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-red-600" />
                    )}
                    <span
                      className={
                        evaluation.metrics.accuracyChange >= 0 ? 'text-green-600' : 'text-red-600'
                      }
                    >
                      {evaluation.metrics.accuracyChange >= 0 ? '+' : ''}
                      {(evaluation.metrics.accuracyChange * 100).toFixed(2)}%
                    </span>
                  </div>
                )}
              </CardHeader>
            </Card>

            {/* F1 Score */}
            <Card className="border border-primary/20 bg-gradient-to-br from-blue-500/5 to-blue-600/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <CardDescription className="text-xs font-medium">F1 Score</CardDescription>
                  <Activity className="h-4 w-4 text-blue-600" />
                </div>
                <CardTitle className="text-4xl font-bold text-blue-600">
                  {(evaluation.metrics.f1Score * 100).toFixed(2)}%
                </CardTitle>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Harmonic mean of precision and recall
                </p>
              </CardHeader>
            </Card>

            {/* Precision */}
            <Card className="border border-primary/20 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <CardDescription className="text-xs font-medium">Precision</CardDescription>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <CardTitle className="text-4xl font-bold text-emerald-600">
                  {(evaluation.metrics.precision * 100).toFixed(2)}%
                </CardTitle>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Positive predictive value
                </p>
              </CardHeader>
            </Card>

            {/* Recall */}
            <Card className="border border-primary/20 bg-gradient-to-br from-amber-500/5 to-amber-600/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <CardDescription className="text-xs font-medium">Recall</CardDescription>
                  <Activity className="h-4 w-4 text-amber-600" />
                </div>
                <CardTitle className="text-4xl font-bold text-amber-600">
                  {(evaluation.metrics.recall * 100).toFixed(2)}%
                </CardTitle>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  True positive rate
                </p>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Confusion Matrix */}
            <motion.div variants={itemVariants}>
              <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Confusion Matrix</CardTitle>
                  <CardDescription>
                    Model predictions vs actual labels
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {evaluation.confusionMatrix && (
                      <div className="grid gap-2" style={{
                        gridTemplateColumns: `repeat(${evaluation.confusionMatrix[0].length}, 1fr)`,
                      }}>
                        {evaluation.confusionMatrix.map((row, i) =>
                          row.map((value, j) => {
                            const total = row.reduce((sum, v) => sum + v, 0);
                            const percentage = total > 0 ? (value / total) * 100 : 0;
                            const isCorrect = i === j;
                            const maxValue = Math.max(
                              ...evaluation.confusionMatrix.flat()
                            );
                            const opacity = value / maxValue;

                            return (
                              <div
                                key={`${i}-${j}`}
                                className="aspect-square rounded-lg flex flex-col items-center justify-center p-3 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
                                style={{
                                  backgroundColor: isCorrect
                                    ? `rgba(34, 197, 94, ${0.1 + opacity * 0.6})`
                                    : `rgba(239, 68, 68, ${0.1 + opacity * 0.5})`,
                                }}
                                title={`Predicted: ${evaluation.classNames?.[j] || j}, Actual: ${evaluation.classNames?.[i] || i}`}
                              >
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                  {value}
                                </span>
                                <span className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                  {percentage.toFixed(1)}%
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-green-500/30" />
                        <span>Correct Predictions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-red-500/30" />
                        <span>Incorrect Predictions</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ROC Curve */}
            <motion.div variants={itemVariants}>
              <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">ROC Curve</CardTitle>
                  <CardDescription>
                    Receiver Operating Characteristic (AUC:{' '}
                    {evaluation.metrics.auc?.toFixed(3) || 'N/A'})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart
                      data={rocCurveData}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis
                        dataKey="fpr"
                        label={{
                          value: 'False Positive Rate',
                          position: 'insideBottom',
                          offset: -5,
                        }}
                        domain={[0, 1]}
                        tickFormatter={(value) => value.toFixed(1)}
                      />
                      <YAxis
                        dataKey="tpr"
                        label={{
                          value: 'True Positive Rate',
                          angle: -90,
                          position: 'insideLeft',
                        }}
                        domain={[0, 1]}
                        tickFormatter={(value) => value.toFixed(1)}
                      />
                      <Tooltip
                        formatter={(value?: number) => (value ?? 0).toFixed(3)}
                        labelFormatter={(label) => `FPR: ${label.toFixed(3)}`}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      {/* Diagonal reference line (random classifier) */}
                      <Line
                        type="linear"
                        dataKey="fpr"
                        stroke="#9ca3af"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Random Classifier"
                        isAnimationActive={false}
                      />
                      {/* Actual ROC curve */}
                      <Line
                        type="monotone"
                        dataKey="tpr"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={false}
                        name="Model ROC"
                        animationDuration={1500}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-4 p-3 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      AUC Score: {evaluation.metrics.auc?.toFixed(4) || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                      {evaluation.metrics.auc && evaluation.metrics.auc > 0.9
                        ? 'Excellent discrimination ability'
                        : evaluation.metrics.auc && evaluation.metrics.auc > 0.8
                        ? 'Good discrimination ability'
                        : evaluation.metrics.auc && evaluation.metrics.auc > 0.7
                        ? 'Acceptable discrimination ability'
                        : 'Poor discrimination ability'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Additional Metrics */}
          <motion.div variants={itemVariants}>
            <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Additional Metrics</CardTitle>
                    <CardDescription>
                      Extended performance indicators
                    </CardDescription>
                  </div>
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                    <FileText className="h-3 w-3 mr-1" />
                    Last evaluated {new Date(evaluation.evaluatedAt).toLocaleDateString()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {evaluation.metrics.specificity !== undefined && (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-300">Specificity</p>
                      <p className="text-2xl font-bold text-primary">
                        {(evaluation.metrics.specificity * 100).toFixed(2)}%
                      </p>
                    </div>
                  )}
                  {evaluation.metrics.npv !== undefined && (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-300">NPV</p>
                      <p className="text-2xl font-bold text-primary">
                        {(evaluation.metrics.npv * 100).toFixed(2)}%
                      </p>
                    </div>
                  )}
                  {evaluation.metrics.mcc !== undefined && (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Matthews Correlation
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {evaluation.metrics.mcc.toFixed(3)}
                      </p>
                    </div>
                  )}
                  {evaluation.sampleSize !== undefined && (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-300">Sample Size</p>
                      <p className="text-2xl font-bold text-primary">
                        {evaluation.sampleSize.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
