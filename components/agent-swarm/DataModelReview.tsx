'use client';

/**
 * Data Model Review Component with Chat Interface, Diff Preview, and Export
 *
 * Features:
 * - Split view: data model visualization on left, chat on right
 * - Interactive chat for editing and refining the model
 * - ZeroDB-friendly vector field support
 * - Diff preview before applying changes
 * - Version history with rollback capability
 * - Export options (SQL, JSON, ZeroDB schema)
 * - RLHF feedback integration
 *
 * @issue #309 - Review Data Model with chat editing and ZeroDB integration
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ThumbsUp,
    ThumbsDown,
    Check,
    Loader2,
    Database,
    AlertCircle,
    CheckCircle2,
    Send,
    MessageSquare,
    Sparkles,
    Zap,
    ChevronRight,
    Bot,
    User,
    History,
    Download,
    FileJson,
    FileCode,
    Table,
    Eye,
    Plus,
    Minus,
    Copy,
    CheckCheck,
    X,
    RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { rlhfService } from '@/services/RLHFService';
import {
    dataModelChatService,
    ChatMessage,
    DataModel,
    DataModelEntity,
} from '@/services/DataModelChatService';

// Types for internal component state
interface DataModelVersion {
    id: string;
    version: number;
    dataModel: DataModel;
    timestamp: string;
    description: string;
    changeType: 'initial' | 'chat_edit' | 'manual_edit' | 'rollback';
}

interface DiffChange {
    type: 'added' | 'removed' | 'modified';
    entityName: string;
    fieldName?: string;
    oldValue?: string;
    newValue?: string;
}

interface DataModelReviewProps {
    dataModel: {
        entities: DataModelEntity[];
        relationships?: string[];
        notes?: string;
        version?: number;
        zerodbConfig?: {
            enableVectorSearch: boolean;
            defaultVectorDimensions: number;
            indexType: 'hnsw' | 'ivf' | 'flat';
        };
    } | null;
    isGenerating?: boolean;
    projectId: string;
    onApprove?: () => void;
    onDataModelUpdate?: (updatedModel: DataModel) => void;
    className?: string;
}

type FeedbackState = 'idle' | 'thumbs-up' | 'thumbs-down' | 'loading' | 'success' | 'error';
type ExportFormat = 'json' | 'sql' | 'zerodb';

// Quick action suggestions for the chat
const QUICK_ACTIONS = [
    { label: 'Add timestamp', prompt: 'Add a created_at timestamp field to all entities' },
    { label: 'Add vector search', prompt: 'Add vector embedding fields for ZeroDB semantic search' },
    { label: 'Add soft delete', prompt: 'Add a deleted_at field for soft deletes' },
    { label: 'Add audit fields', prompt: 'Add created_by and updated_by audit fields' },
];

/**
 * Generate diff between two data models
 */
function generateDiff(oldModel: DataModel | null, newModel: DataModel): DiffChange[] {
    const changes: DiffChange[] = [];

    if (!oldModel) {
        // All entities are new
        newModel.entities.forEach(entity => {
            changes.push({
                type: 'added',
                entityName: entity.name,
            });
        });
        return changes;
    }

    const oldEntityMap = new Map(oldModel.entities.map(e => [e.name, e]));
    const newEntityMap = new Map(newModel.entities.map(e => [e.name, e]));

    // Check for added entities
    newModel.entities.forEach(entity => {
        if (!oldEntityMap.has(entity.name)) {
            changes.push({
                type: 'added',
                entityName: entity.name,
            });
        }
    });

    // Check for removed entities
    oldModel.entities.forEach(entity => {
        if (!newEntityMap.has(entity.name)) {
            changes.push({
                type: 'removed',
                entityName: entity.name,
            });
        }
    });

    // Check for modified entities (field changes)
    newModel.entities.forEach(newEntity => {
        const oldEntity = oldEntityMap.get(newEntity.name);
        if (oldEntity) {
            const oldFields = new Set(
                oldEntity.fields.map(f => (typeof f === 'string' ? f : `${f.name}: ${f.type}`))
            );
            const newFields = new Set(
                newEntity.fields.map(f => (typeof f === 'string' ? f : `${f.name}: ${f.type}`))
            );

            // Added fields
            newEntity.fields.forEach(field => {
                const fieldStr = typeof field === 'string' ? field : `${field.name}: ${field.type}`;
                if (!oldFields.has(fieldStr)) {
                    changes.push({
                        type: 'added',
                        entityName: newEntity.name,
                        fieldName: typeof field === 'string' ? field.split(':')[0] : field.name,
                        newValue: fieldStr,
                    });
                }
            });

            // Removed fields
            oldEntity.fields.forEach(field => {
                const fieldStr = typeof field === 'string' ? field : `${field.name}: ${field.type}`;
                if (!newFields.has(fieldStr)) {
                    changes.push({
                        type: 'removed',
                        entityName: newEntity.name,
                        fieldName: typeof field === 'string' ? field.split(':')[0] : field.name,
                        oldValue: fieldStr,
                    });
                }
            });
        }
    });

    return changes;
}

/**
 * Generate SQL schema from data model
 */
function generateSQL(model: DataModel): string {
    const lines: string[] = [
        '-- Generated SQL Schema',
        '-- ZeroDB Compatible',
        '',
    ];

    model.entities.forEach(entity => {
        lines.push(`CREATE TABLE ${entity.name.toLowerCase()} (`);
        const fieldLines = entity.fields.map((field, idx) => {
            let fieldStr: string;
            if (typeof field === 'string') {
                const [name, type] = field.split(':').map(s => s.trim());
                const sqlType = mapToSQLType(type || 'TEXT');
                fieldStr = `    ${name} ${sqlType}`;
            } else {
                const sqlType = mapToSQLType(field.type);
                fieldStr = `    ${field.name} ${sqlType}`;
                if (field.isRequired) fieldStr += ' NOT NULL';
                if (field.isUnique) fieldStr += ' UNIQUE';
            }
            return fieldStr + (idx < entity.fields.length - 1 ? ',' : '');
        });
        lines.push(...fieldLines);
        lines.push(');');
        lines.push('');
    });

    // Add vector index creation if ZeroDB config is present
    if (model.zerodbConfig?.enableVectorSearch) {
        lines.push('-- ZeroDB Vector Indexes');
        model.entities.forEach(entity => {
            if (entity.vectorFields && entity.vectorFields.length > 0) {
                entity.vectorFields.forEach(vectorField => {
                    lines.push(
                        `CREATE INDEX idx_${entity.name.toLowerCase()}_${vectorField}_vector ON ${entity.name.toLowerCase()} USING ${model.zerodbConfig?.indexType || 'hnsw'} (${vectorField});`
                    );
                });
            }
        });
    }

    return lines.join('\n');
}

/**
 * Map field type to SQL type
 */
function mapToSQLType(type: string): string {
    const typeMap: Record<string, string> = {
        'string': 'VARCHAR(255)',
        'text': 'TEXT',
        'int': 'INTEGER',
        'integer': 'INTEGER',
        'float': 'FLOAT',
        'double': 'DOUBLE PRECISION',
        'boolean': 'BOOLEAN',
        'bool': 'BOOLEAN',
        'date': 'DATE',
        'datetime': 'TIMESTAMP',
        'timestamp': 'TIMESTAMP WITH TIME ZONE',
        'uuid': 'UUID',
        'json': 'JSONB',
        'vector': 'VECTOR',
    };

    // Handle vector type with dimensions
    if (type.startsWith('vector')) {
        const match = type.match(/vector\((\d+)\)/);
        if (match) {
            return `VECTOR(${match[1]})`;
        }
        return 'VECTOR(384)';
    }

    return typeMap[type.toLowerCase()] || 'TEXT';
}

/**
 * Generate ZeroDB schema configuration
 */
function generateZeroDBSchema(model: DataModel): string {
    const schema = {
        tables: model.entities.map(entity => ({
            name: entity.name,
            description: entity.description,
            fields: entity.fields.map(field => {
                if (typeof field === 'string') {
                    const [name, type] = field.split(':').map(s => s.trim());
                    return {
                        name,
                        type: type || 'string',
                        vector: type?.includes('vector'),
                    };
                }
                return {
                    name: field.name,
                    type: field.type,
                    required: field.isRequired,
                    unique: field.isUnique,
                    vector: field.isVector,
                    vectorDimensions: field.vectorDimensions,
                };
            }),
            vectorFields: entity.vectorFields || [],
        })),
        relationships: model.relationships || [],
        vectorConfig: model.zerodbConfig || {
            enableVectorSearch: false,
            defaultVectorDimensions: 384,
            indexType: 'hnsw',
        },
        version: model.version || 1,
    };

    return JSON.stringify(schema, null, 2);
}

/**
 * Diff Preview Component
 */
function DiffPreview({
    changes,
    onApply,
    onCancel,
    isApplying,
}: {
    changes: DiffChange[];
    onApply: () => void;
    onCancel: () => void;
    isApplying: boolean;
}) {
    if (changes.length === 0) {
        return (
            <div className="p-4 text-center text-gray-400">
                No changes to preview
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <Eye className="w-4 h-4" />
                <span>Preview Changes ({changes.length})</span>
            </div>

            <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                    {changes.map((change, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={cn(
                                'p-3 rounded-lg border flex items-start gap-3',
                                change.type === 'added' && 'bg-green-500/10 border-green-500/30',
                                change.type === 'removed' && 'bg-red-500/10 border-red-500/30',
                                change.type === 'modified' && 'bg-yellow-500/10 border-yellow-500/30'
                            )}
                        >
                            {change.type === 'added' && <Plus className="w-4 h-4 text-green-400 mt-0.5" />}
                            {change.type === 'removed' && <Minus className="w-4 h-4 text-red-400 mt-0.5" />}
                            {change.type === 'modified' && <History className="w-4 h-4 text-yellow-400 mt-0.5" />}

                            <div className="flex-1">
                                <div className="font-medium text-sm">
                                    {change.entityName}
                                    {change.fieldName && (
                                        <span className="text-gray-400 font-normal">
                                            .{change.fieldName}
                                        </span>
                                    )}
                                </div>
                                {change.newValue && (
                                    <div className="text-xs text-green-400 mt-1">
                                        + {change.newValue}
                                    </div>
                                )}
                                {change.oldValue && (
                                    <div className="text-xs text-red-400 mt-1">
                                        - {change.oldValue}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </ScrollArea>

            <div className="flex gap-2 pt-2 border-t border-gray-800">
                <Button
                    onClick={onCancel}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={isApplying}
                >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                </Button>
                <Button
                    onClick={onApply}
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={isApplying}
                >
                    {isApplying ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                        <Check className="w-4 h-4 mr-1" />
                    )}
                    Apply Changes
                </Button>
            </div>
        </div>
    );
}

/**
 * Version History Component
 */
function VersionHistory({
    versions,
    currentVersion,
    onRestore,
    isRestoring,
}: {
    versions: DataModelVersion[];
    currentVersion: number;
    onRestore: (version: DataModelVersion) => void;
    isRestoring: boolean;
}) {
    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getChangeTypeIcon = (type: DataModelVersion['changeType']) => {
        switch (type) {
            case 'initial':
                return <Database className="w-3 h-3" />;
            case 'chat_edit':
                return <MessageSquare className="w-3 h-3" />;
            case 'manual_edit':
                return <FileCode className="w-3 h-3" />;
            case 'rollback':
                return <RotateCcw className="w-3 h-3" />;
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                <History className="w-4 h-4" />
                <span>Version History ({versions.length})</span>
            </div>

            <ScrollArea className="h-[250px]">
                <div className="space-y-2">
                    {versions.map((version, idx) => (
                        <motion.div
                            key={version.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={cn(
                                'p-3 rounded-lg border bg-vite-bg border-gray-800 hover:border-gray-700 transition-colors',
                                version.version === currentVersion && 'border-primary/50 bg-primary/5'
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            'text-xs',
                                            version.version === currentVersion && 'border-primary text-primary'
                                        )}
                                    >
                                        v{version.version}
                                    </Badge>
                                    {getChangeTypeIcon(version.changeType)}
                                    <span className="text-xs text-gray-500">
                                        {formatTimestamp(version.timestamp)}
                                    </span>
                                </div>

                                {version.version !== currentVersion && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    onClick={() => onRestore(version)}
                                                    disabled={isRestoring}
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-7 px-2"
                                                >
                                                    {isRestoring ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        <RotateCcw className="w-3 h-3" />
                                                    )}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Restore this version</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </div>

                            <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                                {version.description}
                            </p>

                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                <span>{version.dataModel.entities.length} entities</span>
                                <span>-</span>
                                <span>
                                    {version.dataModel.entities.reduce(
                                        (acc, e) => acc + e.fields.length,
                                        0
                                    )}{' '}
                                    fields
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}

/**
 * Export Dialog Component
 */
function ExportDialog({
    isOpen,
    onClose,
    dataModel,
    format,
}: {
    isOpen: boolean;
    onClose: () => void;
    dataModel: DataModel;
    format: ExportFormat;
}) {
    const [copied, setCopied] = useState(false);

    const exportContent = useMemo(() => {
        switch (format) {
            case 'json':
                return JSON.stringify(dataModel, null, 2);
            case 'sql':
                return generateSQL(dataModel);
            case 'zerodb':
                return generateZeroDBSchema(dataModel);
            default:
                return '';
        }
    }, [dataModel, format]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(exportContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([exportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `data-model.${format === 'zerodb' ? 'json' : format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const formatLabel = {
        json: 'JSON',
        sql: 'SQL',
        zerodb: 'ZeroDB Schema',
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-[#161B22] border-gray-800">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Download className="w-5 h-5" />
                        Export as {formatLabel[format]}
                    </DialogTitle>
                    <DialogDescription>
                        Preview and download your data model in {formatLabel[format]} format
                    </DialogDescription>
                </DialogHeader>

                <div className="relative">
                    <ScrollArea className="h-[300px] rounded-lg bg-vite-bg border border-gray-800">
                        <pre className="p-4 text-sm font-mono text-gray-300 whitespace-pre-wrap">
                            {exportContent}
                        </pre>
                    </ScrollArea>

                    <Button
                        onClick={handleCopy}
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                    >
                        {copied ? (
                            <CheckCheck className="w-4 h-4 text-green-400" />
                        ) : (
                            <Copy className="w-4 h-4" />
                        )}
                    </Button>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleDownload} className="bg-primary">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/**
 * Main DataModelReview Component
 */
export default function DataModelReview({
    dataModel,
    isGenerating = false,
    projectId,
    onApprove,
    onDataModelUpdate,
    className,
}: DataModelReviewProps) {
    // Feedback state
    const [feedbackState, setFeedbackState] = useState<FeedbackState>('idle');
    const [bottomFeedbackState, setBottomFeedbackState] = useState<FeedbackState>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isApproved, setIsApproved] = useState(false);

    // Chat state
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [currentDataModel, setCurrentDataModel] = useState(dataModel);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Diff preview state
    const [pendingChanges, setPendingChanges] = useState<DataModel | null>(null);
    const [showDiffPreview, setShowDiffPreview] = useState(false);
    const [isApplyingChanges, setIsApplyingChanges] = useState(false);

    // Version history state
    const [versionHistory, setVersionHistory] = useState<DataModelVersion[]>([]);
    const [isRestoringVersion, setIsRestoringVersion] = useState(false);

    // Export state
    const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
    const [showExportDialog, setShowExportDialog] = useState(false);

    // Active tab state
    const [activeRightTab, setActiveRightTab] = useState<'chat' | 'history'>('chat');

    // Initialize version history when data model changes
    useEffect(() => {
        if (dataModel && versionHistory.length === 0) {
            const initialVersion: DataModelVersion = {
                id: crypto.randomUUID(),
                version: dataModel.version || 1,
                dataModel: dataModel as DataModel,
                timestamp: new Date().toISOString(),
                description: 'Initial data model generated from PRD',
                changeType: 'initial',
            };
            setVersionHistory([initialVersion]);
        }
        setCurrentDataModel(dataModel);
    }, [dataModel]);

    // Scroll to bottom of chat when new messages arrive
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    // Generate diff when pending changes exist
    const diffChanges = useMemo(() => {
        if (!pendingChanges || !currentDataModel) return [];
        return generateDiff(currentDataModel as DataModel, pendingChanges);
    }, [pendingChanges, currentDataModel]);

    // Convert data model to string for RLHF prompt/response
    const dataModelContent = currentDataModel
        ? JSON.stringify(currentDataModel, null, 2)
        : '';

    const handleTopFeedback = async (rating: 1 | -1) => {
        if (feedbackState === 'loading' || feedbackState === 'success') {
            return;
        }

        const newState: FeedbackState = rating === 1 ? 'thumbs-up' : 'thumbs-down';
        setFeedbackState(newState);
        setBottomFeedbackState(newState);
        setErrorMessage('');

        setTimeout(() => setFeedbackState('loading'), 300);

        try {
            const result = await rlhfService.submitFeedback(projectId, {
                type: 'workflow_step_feedback',
                stepNumber: 3,
                stepName: 'Data Model Generation',
                prompt: 'data_model_generation',
                response: dataModelContent,
                rating: rating as 1 | -1,
                timestamp: new Date().toISOString(),
                projectId,
            });

            if (result.success) {
                setFeedbackState('success');
                setBottomFeedbackState('success');

                setTimeout(() => {
                    setFeedbackState(newState);
                    setBottomFeedbackState(newState);
                }, 2000);
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            console.error('Failed to submit feedback:', error);
            setFeedbackState('error');
            setBottomFeedbackState('error');
            setErrorMessage(error.message || 'Failed to submit feedback. Please try again.');

            setTimeout(() => {
                setFeedbackState('idle');
                setBottomFeedbackState('idle');
                setErrorMessage('');
            }, 3000);
        }
    };

    const handleBottomFeedback = async (rating: 1 | -1) => {
        await handleTopFeedback(rating);
    };

    const handleApprove = () => {
        setIsApproved(true);
        onApprove?.();
    };

    // Chat handlers
    const handleSendMessage = useCallback(
        async (message?: string) => {
            const messageToSend = message || chatInput.trim();
            if (!messageToSend || isChatLoading || !currentDataModel) return;

            const userMessage: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'user',
                content: messageToSend,
                timestamp: new Date().toISOString(),
            };

            setChatMessages(prev => [...prev, userMessage]);
            setChatInput('');
            setIsChatLoading(true);

            try {
                const response = await dataModelChatService.sendMessage({
                    message: messageToSend,
                    currentDataModel: currentDataModel as DataModel,
                    conversationHistory: chatMessages,
                    projectId,
                });

                setChatMessages(prev => [...prev, response.message]);

                // If there are model changes, show diff preview
                if (response.updatedDataModel) {
                    setPendingChanges(response.updatedDataModel);
                    setShowDiffPreview(true);
                }
            } catch (error) {
                console.error('Chat error:', error);
                setChatMessages(prev => [
                    ...prev,
                    {
                        id: crypto.randomUUID(),
                        role: 'assistant',
                        content: 'Sorry, I encountered an error processing your request. Please try again.',
                        timestamp: new Date().toISOString(),
                    },
                ]);
            } finally {
                setIsChatLoading(false);
                inputRef.current?.focus();
            }
        },
        [chatInput, isChatLoading, currentDataModel, chatMessages, projectId]
    );

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleQuickAction = (prompt: string) => {
        handleSendMessage(prompt);
    };

    // Apply pending changes
    const handleApplyChanges = useCallback(() => {
        if (!pendingChanges) return;

        setIsApplyingChanges(true);

        // Add to version history
        const newVersion: DataModelVersion = {
            id: crypto.randomUUID(),
            version: (currentDataModel?.version || 1) + 1,
            dataModel: {
                ...pendingChanges,
                version: (currentDataModel?.version || 1) + 1,
            },
            timestamp: new Date().toISOString(),
            description: `Changes applied from chat: ${diffChanges.length} modification(s)`,
            changeType: 'chat_edit',
        };

        setVersionHistory(prev => [newVersion, ...prev]);
        setCurrentDataModel(newVersion.dataModel as any);
        onDataModelUpdate?.(newVersion.dataModel);

        // Reset state
        setPendingChanges(null);
        setShowDiffPreview(false);
        setIsApplyingChanges(false);

        // Add confirmation message to chat
        setChatMessages(prev => [
            ...prev,
            {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: `Changes applied successfully! Data model updated to version ${newVersion.version}.`,
                timestamp: new Date().toISOString(),
            },
        ]);
    }, [pendingChanges, currentDataModel, diffChanges, onDataModelUpdate]);

    // Cancel pending changes
    const handleCancelChanges = useCallback(() => {
        setPendingChanges(null);
        setShowDiffPreview(false);

        setChatMessages(prev => [
            ...prev,
            {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: 'Changes cancelled. The data model remains unchanged.',
                timestamp: new Date().toISOString(),
            },
        ]);
    }, []);

    // Restore version from history
    const handleRestoreVersion = useCallback(
        (version: DataModelVersion) => {
            setIsRestoringVersion(true);

            // Create a new version entry for the rollback
            const rollbackVersion: DataModelVersion = {
                id: crypto.randomUUID(),
                version: (versionHistory[0]?.version || 1) + 1,
                dataModel: {
                    ...version.dataModel,
                    version: (versionHistory[0]?.version || 1) + 1,
                },
                timestamp: new Date().toISOString(),
                description: `Rolled back to version ${version.version}`,
                changeType: 'rollback',
            };

            setVersionHistory(prev => [rollbackVersion, ...prev]);
            setCurrentDataModel(rollbackVersion.dataModel as any);
            onDataModelUpdate?.(rollbackVersion.dataModel);

            // Add chat message
            setChatMessages(prev => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: `Data model restored to version ${version.version}. Current version is now ${rollbackVersion.version}.`,
                    timestamp: new Date().toISOString(),
                },
            ]);

            setIsRestoringVersion(false);
        },
        [versionHistory, onDataModelUpdate]
    );

    // Export handlers
    const handleExport = (format: ExportFormat) => {
        setExportFormat(format);
        setShowExportDialog(true);
    };

    const isThumbsUpActive = feedbackState === 'thumbs-up' || feedbackState === 'success';
    const isThumbsDownActive = feedbackState === 'thumbs-down';
    const isLoading = feedbackState === 'loading';
    const isSuccess = feedbackState === 'success';
    const isError = feedbackState === 'error';

    // Loading state
    if (isGenerating) {
        return (
            <Card className={cn('bg-[#161B22] border-gray-800', className)}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-purple-400" />
                        Data Model
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                        <p className="text-lg font-medium text-gray-300 mb-2">
                            AI is generating Data Model...
                        </p>
                        <p className="text-sm text-gray-400">
                            Analyzing your PRD to create database schema
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // No data model yet
    if (!currentDataModel) {
        return (
            <Card className={cn('bg-[#161B22] border-gray-800', className)}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-purple-400" />
                        Data Model
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <p className="text-gray-400">No data model available yet</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn('bg-[#161B22] border-gray-800 relative', className)}>
            {/* Top Action Bar */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                {/* Export Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="border-gray-700">
                            <Download className="w-4 h-4 mr-1" />
                            Export
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#161B22] border-gray-800">
                        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-gray-800" />
                        <DropdownMenuItem onClick={() => handleExport('json')}>
                            <FileJson className="w-4 h-4 mr-2" />
                            JSON
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport('sql')}>
                            <Table className="w-4 h-4 mr-2" />
                            SQL Schema
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport('zerodb')}>
                            <Zap className="w-4 h-4 mr-2" />
                            ZeroDB Schema
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Feedback Buttons */}
                <TooltipProvider delayDuration={200}>
                    <div className="flex items-center gap-1 bg-vite-bg rounded-full p-1 border border-gray-800">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <motion.button
                                    onClick={() => handleTopFeedback(1)}
                                    disabled={isLoading || isSuccess}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={cn(
                                        'relative p-2 rounded-full transition-all duration-200',
                                        isThumbsUpActive
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'text-gray-400 hover:text-green-400 hover:bg-green-500/10',
                                        (isLoading || isSuccess) && 'cursor-not-allowed opacity-70'
                                    )}
                                    aria-label="Thumbs up"
                                >
                                    <AnimatePresence mode="wait">
                                        {isSuccess ? (
                                            <motion.div
                                                key="success"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                            >
                                                <Check className="h-4 w-4" />
                                            </motion.div>
                                        ) : isLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <ThumbsUp className={cn('h-4 w-4', isThumbsUpActive && 'fill-current')} />
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Data model is helpful</p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <motion.button
                                    onClick={() => handleTopFeedback(-1)}
                                    disabled={isLoading || isSuccess}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={cn(
                                        'relative p-2 rounded-full transition-all duration-200',
                                        isThumbsDownActive
                                            ? 'bg-red-500/20 text-red-400'
                                            : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10',
                                        (isLoading || isSuccess) && 'cursor-not-allowed opacity-70'
                                    )}
                                    aria-label="Thumbs down"
                                >
                                    <ThumbsDown className={cn('h-4 w-4', isThumbsDownActive && 'fill-current')} />
                                </motion.button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Needs improvement</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
            </div>

            <CardHeader>
                <CardTitle className="flex items-center gap-2 pr-48">
                    <Database className="w-5 h-5 text-purple-400" />
                    Data Model
                    {currentDataModel.zerodbConfig?.enableVectorSearch && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded-full flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            ZeroDB Ready
                        </span>
                    )}
                    <Badge variant="outline" className="ml-2 text-xs">
                        v{currentDataModel.version || 1}
                    </Badge>
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Success/Error Messages */}
                <AnimatePresence>
                    {isSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-400"
                        >
                            <Check className="h-4 w-4" />
                            <span>Thank you for your feedback!</span>
                        </motion.div>
                    )}

                    {isError && errorMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400"
                        >
                            <AlertCircle className="h-4 w-4" />
                            <span>{errorMessage}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Split View: Data Model + Chat/History */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Left: Data Model Content */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                            <Database className="w-4 h-4" />
                            <span>Entities ({currentDataModel.entities.length})</span>
                        </div>

                        <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-3">
                                {currentDataModel.entities.map((entity, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="p-4 bg-vite-bg rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            <Database className="w-5 h-5 text-purple-400" />
                                            <h4 className="font-semibold text-lg text-gray-100">
                                                {entity.name}
                                            </h4>
                                            {entity.vectorFields && entity.vectorFields.length > 0 && (
                                                <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded-full">
                                                    Vector
                                                </span>
                                            )}
                                        </div>

                                        {entity.description && (
                                            <p className="text-sm text-gray-400 mb-3">
                                                {entity.description}
                                            </p>
                                        )}

                                        <div className="grid grid-cols-1 gap-2">
                                            {entity.fields.map((field, fieldIdx) => {
                                                const isVectorField =
                                                    typeof field === 'string' && field.includes('vector');
                                                return (
                                                    <div
                                                        key={fieldIdx}
                                                        className={cn(
                                                            'text-sm text-gray-300 bg-[#161B22] px-3 py-2 rounded font-mono flex items-center gap-2',
                                                            isVectorField &&
                                                                'border border-purple-500/30 bg-purple-500/5'
                                                        )}
                                                    >
                                                        {isVectorField && (
                                                            <Sparkles className="w-3 h-3 text-purple-400" />
                                                        )}
                                                        {typeof field === 'string'
                                                            ? field
                                                            : `${(field as any).name}: ${(field as any).type}`}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Relationships */}
                            {currentDataModel.relationships &&
                                currentDataModel.relationships.length > 0 && (
                                    <div className="mt-4 p-4 bg-vite-bg rounded-lg border border-gray-800">
                                        <h4 className="font-semibold text-gray-100 mb-2">
                                            Relationships
                                        </h4>
                                        <ul className="space-y-1">
                                            {currentDataModel.relationships.map((rel, idx) => (
                                                <li
                                                    key={idx}
                                                    className="text-sm text-gray-400 flex items-center gap-2"
                                                >
                                                    <ChevronRight className="w-3 h-3" />
                                                    {rel}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                            {/* Notes */}
                            {currentDataModel.notes && (
                                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                    <p className="text-sm text-blue-300">{currentDataModel.notes}</p>
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    {/* Right: Chat + History Tabs */}
                    <div className="flex flex-col bg-vite-bg rounded-lg border border-gray-800 overflow-hidden">
                        <Tabs
                            value={activeRightTab}
                            onValueChange={(v) => setActiveRightTab(v as 'chat' | 'history')}
                            className="flex flex-col h-full"
                        >
                            <TabsList className="grid grid-cols-2 bg-[#161B22] rounded-none border-b border-gray-800">
                                <TabsTrigger
                                    value="chat"
                                    className="data-[state=active]:bg-vite-bg"
                                >
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Edit with AI
                                </TabsTrigger>
                                <TabsTrigger
                                    value="history"
                                    className="data-[state=active]:bg-vite-bg"
                                >
                                    <History className="w-4 h-4 mr-2" />
                                    History
                                </TabsTrigger>
                            </TabsList>

                            {/* Chat Tab */}
                            <TabsContent value="chat" className="flex-1 flex flex-col m-0">
                                {/* Diff Preview (when changes pending) */}
                                {showDiffPreview && pendingChanges && (
                                    <div className="p-3 border-b border-gray-800 bg-[#161B22]">
                                        <DiffPreview
                                            changes={diffChanges}
                                            onApply={handleApplyChanges}
                                            onCancel={handleCancelChanges}
                                            isApplying={isApplyingChanges}
                                        />
                                    </div>
                                )}

                                {/* Chat Messages */}
                                <ScrollArea className="flex-1 h-[280px] p-4">
                                    <div className="space-y-4">
                                        {chatMessages.length === 0 ? (
                                            <div className="text-center py-8">
                                                <Bot className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                                                <p className="text-sm text-gray-400 mb-4">
                                                    Ask me to modify the data model
                                                </p>
                                                <div className="flex flex-wrap gap-2 justify-center">
                                                    {QUICK_ACTIONS.map((action, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => handleQuickAction(action.prompt)}
                                                            className="px-3 py-1.5 text-xs bg-[#161B22] text-gray-300 rounded-full border border-gray-700 hover:border-primary hover:text-primary transition-colors"
                                                        >
                                                            {action.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            chatMessages.map((message) => (
                                                <motion.div
                                                    key={message.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={cn(
                                                        'flex gap-3',
                                                        message.role === 'user'
                                                            ? 'justify-end'
                                                            : 'justify-start'
                                                    )}
                                                >
                                                    {message.role === 'assistant' && (
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-[#FCAE39] flex items-center justify-center flex-shrink-0">
                                                            <Bot className="w-4 h-4 text-white" />
                                                        </div>
                                                    )}
                                                    <div
                                                        className={cn(
                                                            'max-w-[80%] rounded-lg px-4 py-2 text-sm',
                                                            message.role === 'user'
                                                                ? 'bg-primary text-white'
                                                                : 'bg-[#161B22] text-gray-200 border border-gray-800'
                                                        )}
                                                    >
                                                        <p className="whitespace-pre-wrap">{message.content}</p>
                                                        {message.metadata?.suggestions && (
                                                            <div className="mt-2 flex flex-wrap gap-1">
                                                                {message.metadata.suggestions.map(
                                                                    (suggestion, idx) => (
                                                                        <button
                                                                            key={idx}
                                                                            onClick={() =>
                                                                                handleSendMessage(suggestion)
                                                                            }
                                                                            className="text-xs text-primary hover:underline"
                                                                        >
                                                                            {suggestion}
                                                                        </button>
                                                                    )
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {message.role === 'user' && (
                                                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                                                            <User className="w-4 h-4 text-gray-300" />
                                                        </div>
                                                    )}
                                                </motion.div>
                                            ))
                                        )}

                                        {isChatLoading && (
                                            <div className="flex gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-[#FCAE39] flex items-center justify-center">
                                                    <Bot className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="bg-[#161B22] rounded-lg px-4 py-2 border border-gray-800">
                                                    <div className="flex items-center gap-2">
                                                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                                        <span className="text-sm text-gray-400">
                                                            Thinking...
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div ref={chatEndRef} />
                                    </div>
                                </ScrollArea>

                                {/* Chat Input */}
                                <div className="p-3 border-t border-gray-800 bg-[#161B22]">
                                    <div className="flex gap-2">
                                        <Input
                                            ref={inputRef}
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Ask to modify the data model..."
                                            disabled={isChatLoading || showDiffPreview}
                                            className="flex-1 bg-vite-bg border-gray-700 text-gray-200 placeholder:text-gray-500 focus:border-primary"
                                        />
                                        <Button
                                            onClick={() => handleSendMessage()}
                                            disabled={
                                                !chatInput.trim() || isChatLoading || showDiffPreview
                                            }
                                            size="icon"
                                            className="bg-primary hover:bg-primary/90"
                                        >
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* History Tab */}
                            <TabsContent value="history" className="flex-1 p-4 m-0">
                                <VersionHistory
                                    versions={versionHistory}
                                    currentVersion={currentDataModel.version || 1}
                                    onRestore={handleRestoreVersion}
                                    isRestoring={isRestoringVersion}
                                />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                {/* Bottom Feedback Section */}
                <div className="pt-4 border-t border-gray-800 space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400">Was this helpful?</p>

                        <div className="flex items-center gap-2">
                            <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <motion.button
                                            onClick={() => handleBottomFeedback(1)}
                                            disabled={isLoading || isSuccess}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={cn(
                                                'p-2 rounded-lg transition-all duration-200',
                                                isThumbsUpActive
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                    : 'bg-vite-bg text-gray-400 border border-gray-800 hover:border-green-500/30 hover:text-green-400',
                                                (isLoading || isSuccess) && 'cursor-not-allowed opacity-70'
                                            )}
                                            aria-label="Thumbs up"
                                        >
                                            <ThumbsUp
                                                className={cn('h-5 w-5', isThumbsUpActive && 'fill-current')}
                                            />
                                        </motion.button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Yes, this was helpful</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <motion.button
                                            onClick={() => handleBottomFeedback(-1)}
                                            disabled={isLoading || isSuccess}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={cn(
                                                'p-2 rounded-lg transition-all duration-200',
                                                isThumbsDownActive
                                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                    : 'bg-vite-bg text-gray-400 border border-gray-800 hover:border-red-500/30 hover:text-red-400',
                                                (isLoading || isSuccess) && 'cursor-not-allowed opacity-70'
                                            )}
                                            aria-label="Thumbs down"
                                        >
                                            <ThumbsDown
                                                className={cn('h-5 w-5', isThumbsDownActive && 'fill-current')}
                                            />
                                        </motion.button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>No, this needs improvement</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>

                    {/* Approve Button */}
                    <Button
                        onClick={handleApprove}
                        disabled={isApproved || showDiffPreview}
                        className={cn(
                            'w-full transition-all duration-200',
                            isApproved
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-gradient-to-r from-primary to-[#FCAE39] hover:opacity-90'
                        )}
                    >
                        {isApproved ? (
                            <>
                                <CheckCircle2 className="w-5 h-5 mr-2" />
                                Data Model Approved
                            </>
                        ) : (
                            'Approve Data Model'
                        )}
                    </Button>
                </div>
            </CardContent>

            {/* Export Dialog */}
            {currentDataModel && (
                <ExportDialog
                    isOpen={showExportDialog}
                    onClose={() => setShowExportDialog(false)}
                    dataModel={currentDataModel as DataModel}
                    format={exportFormat}
                />
            )}
        </Card>
    );
}
