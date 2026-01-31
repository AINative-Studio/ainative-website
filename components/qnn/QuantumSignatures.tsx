/**
 * Quantum Signature Management Component
 *
 * CRITICAL SECURITY FEATURE for model authentication and integrity verification.
 * This component provides quantum-resistant signature management for QNN models.
 *
 * Features:
 * - Tab 1: Sign Model - Generate quantum signatures for trained models
 * - Tab 2: Verify Signature - Validate model signatures and detect tampering
 * - Tab 3: Apply Signature - Apply existing signatures to models
 *
 * Security Best Practices:
 * - Quantum-resistant cryptographic signatures
 * - Expiration timestamps for time-limited validity
 * - Tampering detection through hash verification
 * - Secure signature export and import
 *
 * @see GitHub Issue #129
 * @see /Users/aideveloper/core/qnn-app/ui/components/model_manager.py (Lines 901-1077)
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { qnnApiClient } from '@/services/qnnApiClient';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Copy,
  Download,
  Upload,
  Clock,
  AlertTriangle,
  Loader2,
  FileSignature,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { format } from 'date-fns';

// ============================================================================
// Type Definitions
// ============================================================================

interface Model {
  id: string;
  name: string;
  status: string;
  is_signed?: boolean;
  signature?: string;
  signed_at?: string;
  expires_at?: string;
}

interface SignatureResponse {
  model_id: string;
  signature: string;
  signature_id: string;
  signed_at: string;
  expires_at: string;
}

interface VerificationResponse {
  model_id: string;
  is_valid: boolean;
  is_expired: boolean;
  signature_id: string;
  signed_at: string;
  expires_at: string;
  verification_time?: string;
}

interface ApplySignatureResponse {
  model_id: string;
  signature_id: string;
  applied_at: string;
  status: string;
  is_verified: boolean;
}

// ============================================================================
// Main Component
// ============================================================================

export default function QuantumSignatures() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('sign');

  // Models state
  const [models, setModels] = useState<Model[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  // Sign tab state
  const [selectedSignModel, setSelectedSignModel] = useState('');
  const [signing, setSigning] = useState(false);
  const [signatureResult, setSignatureResult] = useState<SignatureResponse | null>(null);

  // Verify tab state
  const [selectedVerifyModel, setSelectedVerifyModel] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResponse | null>(null);

  // Apply tab state
  const [selectedApplyModel, setSelectedApplyModel] = useState('');
  const [signatureToApply, setSignatureToApply] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyResult, setApplyResult] = useState<ApplySignatureResponse | null>(null);

  // ============================================================================
  // Effects
  // ============================================================================

  useEffect(() => {
    loadModels();
  }, []);

  // ============================================================================
  // API Methods
  // ============================================================================

  const loadModels = async () => {
    setLoadingModels(true);
    try {
      const modelsData = await qnnApiClient.listModels();
      setModels(modelsData as any);
    } catch (error: any) {
      toast({
        title: 'Error Loading Models',
        description: error.message || 'Failed to load models',
        variant: 'destructive',
      });
    } finally {
      setLoadingModels(false);
    }
  };

  const handleSignModel = async () => {
    if (!selectedSignModel) {
      toast({
        title: 'No Model Selected',
        description: 'Please select a model to sign',
        variant: 'destructive',
      });
      return;
    }

    setSigning(true);
    setSignatureResult(null);

    try {
      // Call the signing endpoint
      const response = await fetch(`${qnnApiClient['baseURL']}/v1/signing/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          model_id: selectedSignModel,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to sign model');
      }

      const result: SignatureResponse = await response.json();
      setSignatureResult(result);

      toast({
        title: 'Model Signed Successfully',
        description: `Quantum signature generated for model ${selectedSignModel}`,
      });

      // Reload models to update signature status
      await loadModels();
    } catch (error: any) {
      toast({
        title: 'Signing Failed',
        description: error.message || 'Failed to generate quantum signature',
        variant: 'destructive',
      });
    } finally {
      setSigning(false);
    }
  };

  const handleVerifySignature = async () => {
    if (!selectedVerifyModel) {
      toast({
        title: 'No Model Selected',
        description: 'Please select a signed model to verify',
        variant: 'destructive',
      });
      return;
    }

    const model = models.find(m => m.id === selectedVerifyModel);
    if (!model || !model.signature) {
      toast({
        title: 'No Signature Found',
        description: 'Selected model does not have a signature',
        variant: 'destructive',
      });
      return;
    }

    setVerifying(true);
    setVerificationResult(null);

    try {
      const response = await fetch(`${qnnApiClient['baseURL']}/v1/signing/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          model_id: selectedVerifyModel,
          signature: model.signature,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to verify signature');
      }

      const result: VerificationResponse = await response.json();
      setVerificationResult(result);

      if (result.is_valid && !result.is_expired) {
        toast({
          title: 'Signature Valid',
          description: 'Model signature verified successfully',
        });
      } else if (result.is_expired) {
        toast({
          title: 'Signature Expired',
          description: 'The signature is valid but has expired',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Signature Invalid',
          description: 'Model may have been tampered with',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: error.message || 'Failed to verify signature',
        variant: 'destructive',
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleApplySignature = async () => {
    if (!selectedApplyModel) {
      toast({
        title: 'No Model Selected',
        description: 'Please select a model to apply the signature to',
        variant: 'destructive',
      });
      return;
    }

    if (!signatureToApply.trim()) {
      toast({
        title: 'No Signature Provided',
        description: 'Please enter a valid signature to apply',
        variant: 'destructive',
      });
      return;
    }

    setApplying(true);
    setApplyResult(null);

    try {
      // Parse the signature if it's JSON
      let signatureData;
      try {
        signatureData = JSON.parse(signatureToApply);
      } catch {
        // If not JSON, treat as raw signature string
        signatureData = { signature: signatureToApply };
      }

      const response = await fetch(`${qnnApiClient['baseURL']}/v1/signing/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          model_id: selectedApplyModel,
          signature_id: signatureData.signature_id || signatureData.signature,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to apply signature');
      }

      const result: ApplySignatureResponse = await response.json();
      setApplyResult(result);

      toast({
        title: 'Signature Applied',
        description: `Signature successfully applied to model ${selectedApplyModel}`,
      });

      // Reload models to update signature status
      await loadModels();
    } catch (error: any) {
      toast({
        title: 'Apply Failed',
        description: error.message || 'Failed to apply signature',
        variant: 'destructive',
      });
    } finally {
      setApplying(false);
    }
  };

  // ============================================================================
  // Utility Functions
  // ============================================================================

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to Clipboard',
      description: 'Signature hash copied successfully',
    });
  };

  const exportSignature = (signature: SignatureResponse) => {
    const dataStr = JSON.stringify(signature, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `signature-${signature.model_id}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Signature Exported',
      description: 'Signature downloaded as JSON file',
    });
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'PPpp');
    } catch {
      return timestamp;
    }
  };

  // Filter models by signature status
  const signableModels = models.filter(m =>
    m.status === 'trained' && !m.is_signed
  );
  const signedModels = models.filter(m => m.is_signed || m.signature);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-gradient-to-br from-purple-500/10 to-blue-600/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>Quantum Signature Management</CardTitle>
            <CardDescription>
              Sign, verify, and manage quantum-resistant signatures for model authentication
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sign" className="flex items-center gap-2">
              <FileSignature className="h-4 w-4" />
              Sign Model
            </TabsTrigger>
            <TabsTrigger value="verify" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Verify Signature
            </TabsTrigger>
            <TabsTrigger value="apply" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Apply Signature
            </TabsTrigger>
          </TabsList>

          {/* ============================================================ */}
          {/* Tab 1: Sign Model */}
          {/* ============================================================ */}
          <TabsContent value="sign" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="sign-model-select">Select Model to Sign</Label>
                <Select
                  value={selectedSignModel}
                  onValueChange={setSelectedSignModel}
                  disabled={loadingModels || signing}
                >
                  <SelectTrigger id="sign-model-select" className="mt-2">
                    <SelectValue placeholder="Choose a trained model..." />
                  </SelectTrigger>
                  <SelectContent>
                    {signableModels.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500 text-center">
                        No models available for signing
                      </div>
                    ) : (
                      signableModels.map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name} (ID: {model.id})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-2">
                  Only trained models that haven't been signed are available
                </p>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>About Quantum Signatures</AlertTitle>
                <AlertDescription>
                  Quantum signatures use post-quantum cryptographic algorithms to ensure
                  model integrity and authenticity. Once signed, any tampering with the
                  model will be detected during verification.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleSignModel}
                disabled={!selectedSignModel || signing || loadingModels}
                className="w-full"
                size="lg"
              >
                {signing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Quantum Signature...
                  </>
                ) : (
                  <>
                    <FileSignature className="mr-2 h-4 w-4" />
                    Generate Quantum Signature
                  </>
                )}
              </Button>

              {signatureResult && (
                <Card className="border-green-500/50 bg-green-500/5">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <CardTitle className="text-lg">Signature Generated Successfully</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm text-gray-600">Signature Hash</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 p-3 bg-gray-900 text-green-400 rounded text-xs font-mono break-all">
                          {signatureResult.signature}
                        </code>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(signatureResult.signature)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-600 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Signed At
                        </Label>
                        <p className="text-sm font-medium mt-1">
                          {formatTimestamp(signatureResult.signed_at)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Expires At
                        </Label>
                        <p className="text-sm font-medium mt-1">
                          {formatTimestamp(signatureResult.expires_at)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm text-gray-600">Signature ID</Label>
                      <p className="text-sm font-mono mt-1">{signatureResult.signature_id}</p>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => exportSignature(signatureResult)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export Signature (JSON)
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* ============================================================ */}
          {/* Tab 2: Verify Signature */}
          {/* ============================================================ */}
          <TabsContent value="verify" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="verify-model-select">Select Signed Model</Label>
                <Select
                  value={selectedVerifyModel}
                  onValueChange={setSelectedVerifyModel}
                  disabled={loadingModels || verifying}
                >
                  <SelectTrigger id="verify-model-select" className="mt-2">
                    <SelectValue placeholder="Choose a signed model..." />
                  </SelectTrigger>
                  <SelectContent>
                    {signedModels.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500 text-center">
                        No signed models available
                      </div>
                    ) : (
                      signedModels.map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name} (ID: {model.id})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-2">
                  Only models with existing signatures can be verified
                </p>
              </div>

              {selectedVerifyModel && (() => {
                const model = models.find(m => m.id === selectedVerifyModel);
                return model?.signature ? (
                  <div>
                    <Label className="text-sm text-gray-600">Current Signature</Label>
                    <code className="block p-3 bg-gray-900 text-gray-400 rounded text-xs font-mono break-all mt-1">
                      {model.signature}
                    </code>
                  </div>
                ) : null;
              })()}

              <Alert>
                <ShieldCheck className="h-4 w-4" />
                <AlertTitle>Signature Verification</AlertTitle>
                <AlertDescription>
                  Verification will check if the model has been tampered with since signing,
                  validate the signature expiration, and confirm the cryptographic integrity.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleVerifySignature}
                disabled={!selectedVerifyModel || verifying || loadingModels}
                className="w-full"
                size="lg"
              >
                {verifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying Signature...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Verify Signature
                  </>
                )}
              </Button>

              {verificationResult && (
                <Card
                  className={
                    verificationResult.is_valid && !verificationResult.is_expired
                      ? 'border-green-500/50 bg-green-500/5'
                      : 'border-red-500/50 bg-red-500/5'
                  }
                >
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      {verificationResult.is_valid && !verificationResult.is_expired ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <CardTitle className="text-lg text-green-600">
                            Signature Valid
                          </CardTitle>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-600" />
                          <CardTitle className="text-lg text-red-600">
                            Signature Invalid
                          </CardTitle>
                        </>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-600">Validity Status</Label>
                        <div className="mt-2">
                          {verificationResult.is_valid ? (
                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Valid
                            </Badge>
                          ) : (
                            <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
                              <XCircle className="mr-1 h-3 w-3" />
                              Invalid
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Expiration Status</Label>
                        <div className="mt-2">
                          {verificationResult.is_expired ? (
                            <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              Expired
                            </Badge>
                          ) : (
                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Active
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {verificationResult.verification_time && (
                      <div>
                        <Label className="text-sm text-gray-600 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Verified At
                        </Label>
                        <p className="text-sm font-medium mt-1">
                          {formatTimestamp(verificationResult.verification_time)}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-600">Signed At</Label>
                        <p className="text-sm font-medium mt-1">
                          {formatTimestamp(verificationResult.signed_at)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Expires At</Label>
                        <p className="text-sm font-medium mt-1">
                          {formatTimestamp(verificationResult.expires_at)}
                        </p>
                      </div>
                    </div>

                    {!verificationResult.is_valid && (
                      <Alert variant="destructive">
                        <ShieldAlert className="h-4 w-4" />
                        <AlertTitle>Tampering Detected</AlertTitle>
                        <AlertDescription>
                          The model appears to have been modified since signing. Do not use
                          this model in production environments without re-training and re-signing.
                        </AlertDescription>
                      </Alert>
                    )}

                    {verificationResult.is_expired && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Signature Expired</AlertTitle>
                        <AlertDescription>
                          This signature has expired. Generate a new signature to continue
                          using this model in production.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* ============================================================ */}
          {/* Tab 3: Apply Signature */}
          {/* ============================================================ */}
          <TabsContent value="apply" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="apply-model-select">Select Target Model</Label>
                <Select
                  value={selectedApplyModel}
                  onValueChange={setSelectedApplyModel}
                  disabled={loadingModels || applying}
                >
                  <SelectTrigger id="apply-model-select" className="mt-2">
                    <SelectValue placeholder="Choose a model..." />
                  </SelectTrigger>
                  <SelectContent>
                    {models.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500 text-center">
                        No models available
                      </div>
                    ) : (
                      models.map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name} (ID: {model.id})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="signature-input">
                  Quantum Signature
                  <span className="text-gray-500 text-xs ml-2">
                    (Paste signature hash or JSON)
                  </span>
                </Label>
                <Textarea
                  id="signature-input"
                  value={signatureToApply}
                  onChange={(e) => setSignatureToApply(e.target.value)}
                  placeholder="Paste signature hash or exported JSON here..."
                  className="mt-2 font-mono text-sm"
                  rows={8}
                  disabled={applying}
                />
                <p className="text-sm text-gray-500 mt-2">
                  You can paste either the raw signature hash or the exported JSON file contents
                </p>
              </div>

              <Alert>
                <Upload className="h-4 w-4" />
                <AlertTitle>Applying Signatures</AlertTitle>
                <AlertDescription>
                  Use this feature to apply validated signatures when transferring models
                  between environments or restoring from backups. The signature will be
                  validated before being applied.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleApplySignature}
                disabled={!selectedApplyModel || !signatureToApply.trim() || applying || loadingModels}
                className="w-full"
                size="lg"
              >
                {applying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Applying Signature...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Apply Signature
                  </>
                )}
              </Button>

              {applyResult && (
                <Card
                  className={
                    applyResult.status === 'applied' && applyResult.is_verified
                      ? 'border-green-500/50 bg-green-500/5'
                      : 'border-red-500/50 bg-red-500/5'
                  }
                >
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      {applyResult.status === 'applied' && applyResult.is_verified ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <CardTitle className="text-lg text-green-600">
                            Signature Applied Successfully
                          </CardTitle>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-600" />
                          <CardTitle className="text-lg text-red-600">
                            Failed to Apply Signature
                          </CardTitle>
                        </>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-600">Model ID</Label>
                        <p className="text-sm font-mono mt-1">{applyResult.model_id}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Signature ID</Label>
                        <p className="text-sm font-mono mt-1">{applyResult.signature_id}</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm text-gray-600 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Applied At
                      </Label>
                      <p className="text-sm font-medium mt-1">
                        {formatTimestamp(applyResult.applied_at)}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm text-gray-600">Status</Label>
                      <div className="mt-2">
                        <Badge
                          className={
                            applyResult.status === 'applied'
                              ? 'bg-green-500/10 text-green-600 border-green-500/20'
                              : 'bg-red-500/10 text-red-600 border-red-500/20'
                          }
                        >
                          {applyResult.status === 'applied' ? (
                            <>
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Applied
                            </>
                          ) : (
                            <>
                              <XCircle className="mr-1 h-3 w-3" />
                              Failed
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
