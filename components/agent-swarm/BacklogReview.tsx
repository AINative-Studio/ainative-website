'use client';

/**
 * Enhanced Backlog Review Component with RLHF Feedback
 *
 * Features:
 * - List/Kanban view toggle
 * - Detailed issue cards with title, type badge, description, acceptance criteria, story points
 * - Expandable/collapsible issue cards
 * - Inline editing for title, description, and acceptance criteria
 * - Drag-and-drop reordering (HTML5 DnD + Framer Motion)
 * - Group issues by epic/feature area
 * - Filter by type, priority, story points
 * - Sort options (priority, points, dependencies)
 * - Bulk actions (select multiple, delete, re-estimate)
 * - Add new issues manually
 * - Delete unwanted issues
 * - Merge similar issues
 * - PRD coverage analysis
 * - Floating thumbs up/down buttons (top-right)
 * - Bottom feedback section with "Was this helpful?"
 * - Approve Backlog button
 * - Loading state during generation
 * - RLHF integration for feedback collection
 *
 * GitHub Issue: #273
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ThumbsUp,
    ThumbsDown,
    Check,
    Loader2,
    FileCode,
    AlertCircle,
    CheckCircle2,
    ListTodo,
    ChevronDown,
    ChevronUp,
    Pencil,
    X,
    Save,
    ArrowUp,
    ArrowDown,
    Filter,
    Bug,
    Sparkles,
    Wrench,
    FileText,
    Server,
    Shield,
    Zap,
    GripVertical,
    List,
    LayoutGrid,
    Plus,
    Trash2,
    ArrowUpDown,
    CheckSquare,
    Merge,
    AlertTriangle,
    Link,
    Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { rlhfService } from '@/services/RLHFService';

// Issue types following GitHub issue tracking conventions
type IssueType = 'BUG' | 'FEATURE' | 'TEST' | 'REFACTOR' | 'DOCS' | 'DEVOPS' | 'SECURITY' | 'PERFORMANCE';
type Priority = 'critical' | 'high' | 'medium' | 'low';
type StoryPoints = 0 | 1 | 2 | 3 | 5 | 8;
type ViewMode = 'list' | 'kanban';
type SortOption = 'priority' | 'points' | 'type' | 'title';
type SortDirection = 'asc' | 'desc';

export interface BacklogIssue {
    id: string;
    title: string;
    description: string;
    type: IssueType;
    priority: Priority;
    storyPoints: StoryPoints;
    acceptanceCriteria: string[];
    epicId: string;
    dependencies?: string[];
    suggestedAssignee?: string;
    prdSection?: string;
}

export interface Epic {
    id: string;
    title: string;
    description?: string;
    tasks: number;
    priority?: string;
    issues?: BacklogIssue[];
}

export interface PRDRequirement {
    id: string;
    section: string;
    requirement: string;
    linkedIssueIds: string[];
}

interface BacklogReviewProps {
    backlog: {
        epics: Epic[];
        totalTasks: number;
        notes?: string;
        issues?: BacklogIssue[];
    } | null;
    isGenerating?: boolean;
    projectId: string;
    onApprove?: () => void;
    onBacklogUpdate?: (updatedBacklog: BacklogReviewProps['backlog']) => void;
    prdRequirements?: PRDRequirement[];
    className?: string;
}

type FeedbackState = 'idle' | 'thumbs-up' | 'thumbs-down' | 'loading' | 'success' | 'error';

// Type badge configuration
const TYPE_CONFIG: Record<IssueType, { icon: React.ElementType; color: string; bgColor: string }> = {
    BUG: { icon: Bug, color: 'text-red-400', bgColor: 'bg-red-500/20 border-red-500/30' },
    FEATURE: { icon: Sparkles, color: 'text-purple-400', bgColor: 'bg-purple-500/20 border-purple-500/30' },
    TEST: { icon: CheckCircle2, color: 'text-blue-400', bgColor: 'bg-blue-500/20 border-blue-500/30' },
    REFACTOR: { icon: Wrench, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20 border-yellow-500/30' },
    DOCS: { icon: FileText, color: 'text-green-400', bgColor: 'bg-green-500/20 border-green-500/30' },
    DEVOPS: { icon: Server, color: 'text-cyan-400', bgColor: 'bg-cyan-500/20 border-cyan-500/30' },
    SECURITY: { icon: Shield, color: 'text-orange-400', bgColor: 'bg-orange-500/20 border-orange-500/30' },
    PERFORMANCE: { icon: Zap, color: 'text-pink-400', bgColor: 'bg-pink-500/20 border-pink-500/30' },
};

// Priority badge configuration
const PRIORITY_CONFIG: Record<Priority, { color: string; bgColor: string; order: number }> = {
    critical: { color: 'text-red-300', bgColor: 'bg-red-600/30 border-red-500/40', order: 0 },
    high: { color: 'text-orange-300', bgColor: 'bg-orange-500/20 border-orange-500/30', order: 1 },
    medium: { color: 'text-yellow-300', bgColor: 'bg-yellow-500/20 border-yellow-500/30', order: 2 },
    low: { color: 'text-green-300', bgColor: 'bg-green-500/20 border-green-500/30', order: 3 },
};

// Story points badge configuration
const STORY_POINTS_CONFIG: Record<StoryPoints, { color: string; label: string }> = {
    0: { color: 'text-gray-400', label: 'Trivial' },
    1: { color: 'text-green-400', label: 'XS' },
    2: { color: 'text-blue-400', label: 'S' },
    3: { color: 'text-yellow-400', label: 'M' },
    5: { color: 'text-orange-400', label: 'L' },
    8: { color: 'text-red-400', label: 'XL' },
};

// Individual Issue Card Component
interface IssueCardProps {
    issue: BacklogIssue;
    index: number;
    totalIssues: number;
    isSelected: boolean;
    onUpdate: (issueId: string, updates: Partial<BacklogIssue>) => void;
    onMoveUp: (issueId: string) => void;
    onMoveDown: (issueId: string) => void;
    onDelete: (issueId: string) => void;
    onSelect: (issueId: string, selected: boolean) => void;
    isDragging?: boolean;
    viewMode: ViewMode;
}

function IssueCard({
    issue,
    index,
    totalIssues,
    isSelected,
    onUpdate,
    onMoveUp,
    onMoveDown,
    onDelete,
    onSelect,
    isDragging = false,
    viewMode,
}: IssueCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(issue.title);
    const [editedDescription, setEditedDescription] = useState(issue.description);
    const [editedCriteria, setEditedCriteria] = useState(issue.acceptanceCriteria.join('\n'));

    const typeConfig = TYPE_CONFIG[issue.type];
    const priorityConfig = PRIORITY_CONFIG[issue.priority];
    const pointsConfig = STORY_POINTS_CONFIG[issue.storyPoints];
    const TypeIcon = typeConfig.icon;

    const handleSave = () => {
        onUpdate(issue.id, {
            title: editedTitle,
            description: editedDescription,
            acceptanceCriteria: editedCriteria.split('\n').filter((c) => c.trim()),
        });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedTitle(issue.title);
        setEditedDescription(issue.description);
        setEditedCriteria(issue.acceptanceCriteria.join('\n'));
        setIsEditing(false);
    };

    // Kanban card view (compact)
    if (viewMode === 'kanban') {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                    opacity: isDragging ? 0.5 : 1,
                    scale: isDragging ? 1.02 : 1,
                    boxShadow: isDragging ? '0 10px 30px rgba(0,0,0,0.3)' : 'none',
                }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className={cn(
                    'p-3 bg-vite-bg rounded-lg border cursor-grab active:cursor-grabbing',
                    isSelected ? 'border-primary/60 bg-primary/5' : 'border-gray-800 hover:border-gray-700'
                )}
                data-testid={`issue-card-${issue.id}`}
            >
                {/* Header with checkbox and badges */}
                <div className="flex items-start gap-2 mb-2">
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => onSelect(issue.id, checked as boolean)}
                        className="mt-1"
                        data-testid={`issue-checkbox-${issue.id}`}
                    />
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-1 mb-1">
                            <Badge
                                className={cn(
                                    'border text-[10px] font-medium flex items-center gap-0.5 px-1 py-0',
                                    typeConfig.bgColor,
                                    typeConfig.color
                                )}
                            >
                                <TypeIcon className="w-2.5 h-2.5" />
                                {issue.type}
                            </Badge>
                            <Badge
                                className={cn(
                                    'text-[10px] px-1 py-0',
                                    pointsConfig.color,
                                    'bg-gray-800/50 border-gray-700'
                                )}
                            >
                                {issue.storyPoints}pt
                            </Badge>
                        </div>
                        <h4 className="text-sm font-medium text-gray-100 line-clamp-2">{issue.title}</h4>
                    </div>
                </div>
                {/* Actions */}
                <div className="flex items-center justify-between">
                    <Badge className={cn('text-[10px] px-1 py-0', priorityConfig.bgColor, priorityConfig.color)}>
                        {issue.priority}
                    </Badge>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(issue.id)}
                        className="h-6 w-6 p-0 text-gray-500 hover:text-red-400"
                    >
                        <Trash2 className="w-3 h-3" />
                    </Button>
                </div>
            </motion.div>
        );
    }

    // List view (full details)
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{
                opacity: isDragging ? 0.5 : 1,
                y: 0,
                scale: isDragging ? 1.02 : 1,
                boxShadow: isDragging ? '0 10px 30px rgba(0,0,0,0.3)' : 'none',
            }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="group"
            data-testid={`issue-card-${issue.id}`}
        >
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                <div
                    className={cn(
                        'p-4 bg-vite-bg rounded-lg border transition-all duration-200',
                        isSelected ? 'border-primary/60 bg-primary/5' : 'border-gray-800 hover:border-gray-700',
                        isExpanded && 'border-primary/40'
                    )}
                >
                    {/* Header Row */}
                    <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => onSelect(issue.id, checked as boolean)}
                            className="mt-1"
                            data-testid={`issue-checkbox-${issue.id}`}
                        />

                        {/* Drag Handle */}
                        <div className="mt-1 opacity-0 group-hover:opacity-50 transition-opacity cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-4 h-4 text-gray-500" />
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 min-w-0">
                            {/* Title Row with Badges */}
                            <div className="flex items-start gap-2 mb-2 flex-wrap">
                                {/* Type Badge */}
                                <Badge
                                    className={cn(
                                        'border text-xs font-medium flex items-center gap-1',
                                        typeConfig.bgColor,
                                        typeConfig.color
                                    )}
                                >
                                    <TypeIcon className="w-3 h-3" />
                                    {issue.type}
                                </Badge>

                                {/* Priority Badge */}
                                <Badge
                                    className={cn('border text-xs font-medium', priorityConfig.bgColor, priorityConfig.color)}
                                >
                                    {issue.priority}
                                </Badge>

                                {/* Story Points Badge */}
                                <Badge className={cn('bg-gray-800/50 border-gray-700 text-xs font-medium', pointsConfig.color)}>
                                    {issue.storyPoints} pts ({pointsConfig.label})
                                </Badge>

                                {/* PRD Section Link */}
                                {issue.prdSection && (
                                    <Badge className="bg-blue-500/10 border-blue-500/20 text-blue-400 text-xs">
                                        <Link className="w-3 h-3 mr-1" />
                                        {issue.prdSection}
                                    </Badge>
                                )}
                            </div>

                            {/* Title */}
                            {isEditing ? (
                                <Input
                                    value={editedTitle}
                                    onChange={(e) => setEditedTitle(e.target.value)}
                                    className="mb-2 bg-[#161B22] border-gray-700"
                                    autoFocus
                                    data-testid="issue-title-input"
                                />
                            ) : (
                                <h4 className="font-semibold text-gray-100 mb-1 break-words">{issue.title}</h4>
                            )}

                            {/* Description Preview (truncated) */}
                            {!isExpanded && !isEditing && (
                                <p className="text-sm text-gray-400 line-clamp-2">{issue.description}</p>
                            )}

                            {/* Dependencies */}
                            {issue.dependencies && issue.dependencies.length > 0 && !isExpanded && (
                                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                    <Link className="w-3 h-3" />
                                    <span>Depends on: {issue.dependencies.length} issue(s)</span>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                            <TooltipProvider delayDuration={200}>
                                {/* Move Up/Down */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onMoveUp(issue.id)}
                                            disabled={index === 0}
                                            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-200 disabled:opacity-30"
                                        >
                                            <ArrowUp className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Move up</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onMoveDown(issue.id)}
                                            disabled={index === totalIssues - 1}
                                            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-200 disabled:opacity-30"
                                        >
                                            <ArrowDown className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Move down</TooltipContent>
                                </Tooltip>

                                {/* Edit Button */}
                                {!isEditing ? (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setIsEditing(true)}
                                                className="h-8 w-8 p-0 text-gray-400 hover:text-primary"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Edit issue</TooltipContent>
                                    </Tooltip>
                                ) : (
                                    <>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleSave}
                                                    className="h-8 w-8 p-0 text-green-400 hover:text-green-300"
                                                    data-testid="save-issue-btn"
                                                >
                                                    <Save className="w-4 h-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Save changes</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleCancel}
                                                    className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Cancel</TooltipContent>
                                        </Tooltip>
                                    </>
                                )}

                                {/* Delete Button */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDelete(issue.id)}
                                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete issue</TooltipContent>
                                </Tooltip>

                                {/* Expand/Collapse */}
                                <CollapsibleTrigger asChild>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-200">
                                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>{isExpanded ? 'Collapse' : 'Expand'}</TooltipContent>
                                    </Tooltip>
                                </CollapsibleTrigger>
                            </TooltipProvider>
                        </div>
                    </div>

                    {/* Expanded Content */}
                    <CollapsibleContent>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="mt-4 pt-4 border-t border-gray-800 space-y-4"
                        >
                            {/* Full Description */}
                            <div>
                                <h5 className="text-sm font-medium text-gray-300 mb-2">Description</h5>
                                {isEditing ? (
                                    <Textarea
                                        value={editedDescription}
                                        onChange={(e) => setEditedDescription(e.target.value)}
                                        className="bg-[#161B22] border-gray-700 min-h-[100px]"
                                        data-testid="issue-description-input"
                                    />
                                ) : (
                                    <p className="text-sm text-gray-400 whitespace-pre-wrap">{issue.description}</p>
                                )}
                            </div>

                            {/* Acceptance Criteria */}
                            <div>
                                <h5 className="text-sm font-medium text-gray-300 mb-2">Acceptance Criteria</h5>
                                {isEditing ? (
                                    <Textarea
                                        value={editedCriteria}
                                        onChange={(e) => setEditedCriteria(e.target.value)}
                                        placeholder="Enter each criterion on a new line"
                                        className="bg-[#161B22] border-gray-700 min-h-[100px]"
                                        data-testid="issue-criteria-input"
                                    />
                                ) : issue.acceptanceCriteria && issue.acceptanceCriteria.length > 0 ? (
                                    <ul className="space-y-2">
                                        {issue.acceptanceCriteria.map((criterion, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-400">
                                                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                                <span>{criterion}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">No acceptance criteria defined</p>
                                )}
                            </div>

                            {/* Dependencies */}
                            {issue.dependencies && issue.dependencies.length > 0 && (
                                <div>
                                    <h5 className="text-sm font-medium text-gray-300 mb-2">Dependencies</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {issue.dependencies.map((dep) => (
                                            <Badge key={dep} className="bg-gray-800 border-gray-700 text-gray-300 text-xs">
                                                <Link className="w-3 h-3 mr-1" />
                                                {dep}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Suggested Assignee */}
                            {issue.suggestedAssignee && (
                                <div>
                                    <h5 className="text-sm font-medium text-gray-300 mb-2">Suggested Assignee</h5>
                                    <Badge className="bg-primary/20 border-primary/30 text-primary">
                                        {issue.suggestedAssignee}
                                    </Badge>
                                </div>
                            )}
                        </motion.div>
                    </CollapsibleContent>
                </div>
            </Collapsible>
        </motion.div>
    );
}

// Filter and Sort Controls Component
interface FilterSortControlsProps {
    typeFilter: IssueType | 'all';
    priorityFilter: Priority | 'all';
    pointsFilter: StoryPoints | 'all';
    sortBy: SortOption;
    sortDirection: SortDirection;
    viewMode: ViewMode;
    onTypeChange: (value: IssueType | 'all') => void;
    onPriorityChange: (value: Priority | 'all') => void;
    onPointsChange: (value: StoryPoints | 'all') => void;
    onSortChange: (value: SortOption) => void;
    onSortDirectionChange: () => void;
    onViewModeChange: (mode: ViewMode) => void;
}

function FilterSortControls({
    typeFilter,
    priorityFilter,
    pointsFilter,
    sortBy,
    sortDirection,
    viewMode,
    onTypeChange,
    onPriorityChange,
    onPointsChange,
    onSortChange,
    onSortDirectionChange,
    onViewModeChange,
}: FilterSortControlsProps) {
    return (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-vite-bg rounded-lg border border-gray-800 mb-4">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 bg-[#161B22] rounded-md border border-gray-800">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewModeChange('list')}
                    className={cn(
                        'h-7 px-2',
                        viewMode === 'list' ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-gray-200'
                    )}
                    data-testid="view-mode-list"
                >
                    <List className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewModeChange('kanban')}
                    className={cn(
                        'h-7 px-2',
                        viewMode === 'kanban' ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-gray-200'
                    )}
                    data-testid="view-mode-kanban"
                >
                    <LayoutGrid className="w-4 h-4" />
                </Button>
            </div>

            <div className="h-6 w-px bg-gray-700" />

            <div className="flex items-center gap-2 text-sm text-gray-400">
                <Filter className="w-4 h-4" />
                <span>Filters:</span>
            </div>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={(value) => onTypeChange(value as IssueType | 'all')}>
                <SelectTrigger className="w-[130px] h-8 bg-[#161B22] border-gray-700">
                    <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-[#161B22] border-gray-700">
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.keys(TYPE_CONFIG).map((type) => (
                        <SelectItem key={type} value={type}>
                            {type}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select value={priorityFilter} onValueChange={(value) => onPriorityChange(value as Priority | 'all')}>
                <SelectTrigger className="w-[130px] h-8 bg-[#161B22] border-gray-700">
                    <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="bg-[#161B22] border-gray-700">
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                </SelectContent>
            </Select>

            {/* Story Points Filter */}
            <Select
                value={pointsFilter.toString()}
                onValueChange={(value) => onPointsChange(value === 'all' ? 'all' : (parseInt(value) as StoryPoints))}
            >
                <SelectTrigger className="w-[130px] h-8 bg-[#161B22] border-gray-700">
                    <SelectValue placeholder="Points" />
                </SelectTrigger>
                <SelectContent className="bg-[#161B22] border-gray-700">
                    <SelectItem value="all">All Points</SelectItem>
                    <SelectItem value="0">0 (Trivial)</SelectItem>
                    <SelectItem value="1">1 (XS)</SelectItem>
                    <SelectItem value="2">2 (S)</SelectItem>
                    <SelectItem value="3">3 (M)</SelectItem>
                    <SelectItem value="5">5 (L)</SelectItem>
                    <SelectItem value="8">8 (XL)</SelectItem>
                </SelectContent>
            </Select>

            <div className="h-6 w-px bg-gray-700" />

            {/* Sort */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
                <ArrowUpDown className="w-4 h-4" />
                <span>Sort:</span>
            </div>

            <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
                <SelectTrigger className="w-[120px] h-8 bg-[#161B22] border-gray-700">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-[#161B22] border-gray-700">
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="points">Story Points</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                </SelectContent>
            </Select>

            <Button
                variant="ghost"
                size="sm"
                onClick={onSortDirectionChange}
                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-200"
            >
                <ArrowUpDown className={cn('w-4 h-4', sortDirection === 'desc' && 'rotate-180')} />
            </Button>
        </div>
    );
}

// Bulk Actions Bar Component
interface BulkActionsBarProps {
    selectedCount: number;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onDeleteSelected: () => void;
    onMergeSelected: () => void;
    onReestimate: () => void;
    totalCount: number;
}

function BulkActionsBar({
    selectedCount,
    onSelectAll,
    onDeselectAll,
    onDeleteSelected,
    onMergeSelected,
    onReestimate,
    totalCount,
}: BulkActionsBarProps) {
    if (selectedCount === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/30 rounded-lg mb-4"
            data-testid="bulk-actions-bar"
        >
            <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                    {selectedCount} of {totalCount} selected
                </span>
            </div>

            <div className="flex-1" />

            <Button variant="ghost" size="sm" onClick={onSelectAll} className="text-primary hover:text-primary/80">
                Select All
            </Button>
            <Button variant="ghost" size="sm" onClick={onDeselectAll} className="text-gray-400 hover:text-gray-200">
                Deselect All
            </Button>

            <div className="h-6 w-px bg-gray-700" />

            <TooltipProvider delayDuration={200}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onMergeSelected}
                            disabled={selectedCount < 2}
                            className="text-yellow-400 hover:text-yellow-300 disabled:opacity-30"
                            data-testid="merge-selected-btn"
                        >
                            <Merge className="w-4 h-4 mr-1" />
                            Merge
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Merge selected issues into one</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onReestimate}
                            className="text-blue-400 hover:text-blue-300"
                            data-testid="reestimate-btn"
                        >
                            <Target className="w-4 h-4 mr-1" />
                            Re-estimate
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Re-estimate story points</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onDeleteSelected}
                            className="text-red-400 hover:text-red-300"
                            data-testid="delete-selected-btn"
                        >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete selected issues</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </motion.div>
    );
}

// PRD Coverage Analysis Component
interface PRDCoverageProps {
    prdRequirements: PRDRequirement[];
    issues: BacklogIssue[];
    onAddMissingIssue: (requirement: PRDRequirement) => void;
}

function PRDCoverageAnalysis({ prdRequirements, issues, onAddMissingIssue }: PRDCoverageProps) {
    const coverageData = useMemo(() => {
        const covered = prdRequirements.filter((req) => req.linkedIssueIds.length > 0);
        const uncovered = prdRequirements.filter((req) => req.linkedIssueIds.length === 0);
        const percentage = prdRequirements.length > 0 ? Math.round((covered.length / prdRequirements.length) * 100) : 100;

        return { covered, uncovered, percentage };
    }, [prdRequirements]);

    if (prdRequirements.length === 0) return null;

    return (
        <div className="p-4 bg-vite-bg rounded-lg border border-gray-800 mb-4" data-testid="prd-coverage">
            <div className="flex items-center justify-between mb-3">
                <h4 className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Target className="w-4 h-4 text-blue-400" />
                    PRD Coverage Analysis
                </h4>
                <Badge
                    className={cn(
                        'text-xs',
                        coverageData.percentage >= 80
                            ? 'bg-green-500/20 text-green-400'
                            : coverageData.percentage >= 50
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                    )}
                >
                    {coverageData.percentage}% Coverage
                </Badge>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
                <div
                    className={cn(
                        'h-2 rounded-full transition-all',
                        coverageData.percentage >= 80
                            ? 'bg-green-500'
                            : coverageData.percentage >= 50
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                    )}
                    style={{ width: `${coverageData.percentage}%` }}
                />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                <div>
                    <p className="text-xl font-bold text-gray-100">{prdRequirements.length}</p>
                    <p className="text-xs text-gray-400">Total Requirements</p>
                </div>
                <div>
                    <p className="text-xl font-bold text-green-400">{coverageData.covered.length}</p>
                    <p className="text-xs text-gray-400">Covered</p>
                </div>
                <div>
                    <p className="text-xl font-bold text-red-400">{coverageData.uncovered.length}</p>
                    <p className="text-xs text-gray-400">Gaps</p>
                </div>
            </div>

            {/* Coverage Gaps */}
            {coverageData.uncovered.length > 0 && (
                <div>
                    <h5 className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-yellow-400" />
                        Coverage Gaps
                    </h5>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {coverageData.uncovered.map((req) => (
                            <div
                                key={req.id}
                                className="flex items-center justify-between p-2 bg-[#161B22] rounded border border-gray-800"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-400">{req.section}</p>
                                    <p className="text-sm text-gray-200 truncate">{req.requirement}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onAddMissingIssue(req)}
                                    className="ml-2 text-primary hover:text-primary/80"
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Add Issue Dialog Component
interface AddIssueDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (issue: Omit<BacklogIssue, 'id'>) => void;
    epics: Epic[];
    defaultPrdSection?: string;
}

function AddIssueDialog({ isOpen, onClose, onAdd, epics, defaultPrdSection }: AddIssueDialogProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<IssueType>('FEATURE');
    const [priority, setPriority] = useState<Priority>('medium');
    const [storyPoints, setStoryPoints] = useState<StoryPoints>(2);
    const [epicId, setEpicId] = useState(epics[0]?.id || '');
    const [criteria, setCriteria] = useState('');

    const handleSubmit = () => {
        if (!title.trim()) return;

        onAdd({
            title: `[${type}] ${title}`,
            description,
            type,
            priority,
            storyPoints,
            epicId,
            acceptanceCriteria: criteria.split('\n').filter((c) => c.trim()),
            prdSection: defaultPrdSection,
        });

        // Reset form
        setTitle('');
        setDescription('');
        setType('FEATURE');
        setPriority('medium');
        setStoryPoints(2);
        setCriteria('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#161B22] border-gray-800 max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="w-5 h-5 text-primary" />
                        Add New Issue
                    </DialogTitle>
                    <DialogDescription>Create a new backlog issue manually</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div>
                        <label className="text-sm font-medium text-gray-300 mb-1 block">Title</label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter issue title..."
                            className="bg-vite-bg border-gray-700"
                            data-testid="new-issue-title"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-1 block">Type</label>
                            <Select value={type} onValueChange={(v) => setType(v as IssueType)}>
                                <SelectTrigger className="bg-vite-bg border-gray-700">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#161B22] border-gray-700">
                                    {Object.keys(TYPE_CONFIG).map((t) => (
                                        <SelectItem key={t} value={t}>
                                            {t}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-1 block">Priority</label>
                            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                                <SelectTrigger className="bg-vite-bg border-gray-700">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#161B22] border-gray-700">
                                    <SelectItem value="critical">Critical</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-1 block">Story Points</label>
                            <Select
                                value={storyPoints.toString()}
                                onValueChange={(v) => setStoryPoints(parseInt(v) as StoryPoints)}
                            >
                                <SelectTrigger className="bg-vite-bg border-gray-700">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#161B22] border-gray-700">
                                    <SelectItem value="0">0 - Trivial</SelectItem>
                                    <SelectItem value="1">1 - XS</SelectItem>
                                    <SelectItem value="2">2 - S</SelectItem>
                                    <SelectItem value="3">3 - M</SelectItem>
                                    <SelectItem value="5">5 - L</SelectItem>
                                    <SelectItem value="8">8 - XL</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-1 block">Epic</label>
                            <Select value={epicId} onValueChange={setEpicId}>
                                <SelectTrigger className="bg-vite-bg border-gray-700">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#161B22] border-gray-700">
                                    {epics.map((epic) => (
                                        <SelectItem key={epic.id} value={epic.id}>
                                            {epic.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-300 mb-1 block">Description</label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the issue..."
                            className="bg-vite-bg border-gray-700 min-h-[80px]"
                            data-testid="new-issue-description"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-300 mb-1 block">Acceptance Criteria</label>
                        <Textarea
                            value={criteria}
                            onChange={(e) => setCriteria(e.target.value)}
                            placeholder="Enter each criterion on a new line..."
                            className="bg-vite-bg border-gray-700 min-h-[80px]"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!title.trim()}
                        className="bg-primary hover:bg-primary/90"
                        data-testid="submit-new-issue"
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Issue
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Merge Issues Dialog Component
interface MergeDialogProps {
    isOpen: boolean;
    onClose: () => void;
    selectedIssues: BacklogIssue[];
    onMerge: (mergedIssue: Omit<BacklogIssue, 'id'>) => void;
}

function MergeIssuesDialog({ isOpen, onClose, selectedIssues, onMerge }: MergeDialogProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (isOpen && selectedIssues.length > 0) {
            setTitle(selectedIssues[0].title);
            setDescription(selectedIssues.map((i) => `- ${i.title}: ${i.description}`).join('\n\n'));
        }
    }, [isOpen, selectedIssues]);

    const handleMerge = () => {
        if (!title.trim()) return;

        const mergedCriteria = selectedIssues.flatMap((i) => i.acceptanceCriteria);
        const maxPoints = Math.max(...selectedIssues.map((i) => i.storyPoints)) as StoryPoints;
        const highestPriority = selectedIssues.reduce((highest, issue) => {
            return PRIORITY_CONFIG[issue.priority].order < PRIORITY_CONFIG[highest].order ? issue.priority : highest;
        }, selectedIssues[0].priority);

        onMerge({
            title,
            description,
            type: selectedIssues[0].type,
            priority: highestPriority,
            storyPoints: maxPoints,
            epicId: selectedIssues[0].epicId,
            acceptanceCriteria: [...new Set(mergedCriteria)],
        });

        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#161B22] border-gray-800 max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Merge className="w-5 h-5 text-yellow-400" />
                        Merge {selectedIssues.length} Issues
                    </DialogTitle>
                    <DialogDescription>Combine selected issues into a single issue</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div>
                        <label className="text-sm font-medium text-gray-300 mb-1 block">Merged Title</label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-vite-bg border-gray-700"
                            data-testid="merge-title-input"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-300 mb-1 block">Combined Description</label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-vite-bg border-gray-700 min-h-[150px]"
                        />
                    </div>

                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <p className="text-sm text-yellow-300">
                            <AlertTriangle className="w-4 h-4 inline mr-1" />
                            This will delete the {selectedIssues.length} selected issues and create one merged issue.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleMerge}
                        disabled={!title.trim()}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black"
                        data-testid="confirm-merge-btn"
                    >
                        <Merge className="w-4 h-4 mr-1" />
                        Merge Issues
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Re-estimate Dialog Component
interface ReestimateDialogProps {
    isOpen: boolean;
    onClose: () => void;
    selectedIssues: BacklogIssue[];
    onReestimate: (issueId: string, newPoints: StoryPoints) => void;
}

function ReestimateDialog({ isOpen, onClose, selectedIssues, onReestimate }: ReestimateDialogProps) {
    const [estimates, setEstimates] = useState<Record<string, StoryPoints>>({});

    useEffect(() => {
        if (isOpen) {
            const initial: Record<string, StoryPoints> = {};
            selectedIssues.forEach((issue) => {
                initial[issue.id] = issue.storyPoints;
            });
            setEstimates(initial);
        }
    }, [isOpen, selectedIssues]);

    const handleSave = () => {
        Object.entries(estimates).forEach(([issueId, points]) => {
            onReestimate(issueId, points);
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#161B22] border-gray-800 max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-400" />
                        Re-estimate Story Points
                    </DialogTitle>
                    <DialogDescription>Update story point estimates for selected issues</DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-4 max-h-[400px] overflow-y-auto">
                    {selectedIssues.map((issue) => (
                        <div key={issue.id} className="flex items-center justify-between p-3 bg-vite-bg rounded-lg border border-gray-800">
                            <div className="flex-1 min-w-0 mr-4">
                                <p className="text-sm font-medium text-gray-200 truncate">{issue.title}</p>
                                <p className="text-xs text-gray-500">Current: {issue.storyPoints} pts</p>
                            </div>
                            <Select
                                value={(estimates[issue.id] ?? issue.storyPoints).toString()}
                                onValueChange={(v) =>
                                    setEstimates((prev) => ({ ...prev, [issue.id]: parseInt(v) as StoryPoints }))
                                }
                            >
                                <SelectTrigger className="w-[100px] bg-[#161B22] border-gray-700">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#161B22] border-gray-700">
                                    <SelectItem value="0">0 pts</SelectItem>
                                    <SelectItem value="1">1 pt</SelectItem>
                                    <SelectItem value="2">2 pts</SelectItem>
                                    <SelectItem value="3">3 pts</SelectItem>
                                    <SelectItem value="5">5 pts</SelectItem>
                                    <SelectItem value="8">8 pts</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    ))}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600" data-testid="save-estimates-btn">
                        <Save className="w-4 h-4 mr-1" />
                        Save Estimates
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Kanban Board Component
interface KanbanBoardProps {
    issues: BacklogIssue[];
    selectedIds: Set<string>;
    onUpdate: (issueId: string, updates: Partial<BacklogIssue>) => void;
    onDelete: (issueId: string) => void;
    onSelect: (issueId: string, selected: boolean) => void;
    onReorder: (issues: BacklogIssue[]) => void;
}

function KanbanBoard({ issues, selectedIds, onUpdate, onDelete, onSelect, onReorder }: KanbanBoardProps) {
    const columns: { id: Priority; title: string; color: string }[] = [
        { id: 'critical', title: 'Critical', color: 'border-red-500/50' },
        { id: 'high', title: 'High', color: 'border-orange-500/50' },
        { id: 'medium', title: 'Medium', color: 'border-yellow-500/50' },
        { id: 'low', title: 'Low', color: 'border-green-500/50' },
    ];

    const issuesByPriority = useMemo(() => {
        const grouped: Record<Priority, BacklogIssue[]> = {
            critical: [],
            high: [],
            medium: [],
            low: [],
        };

        issues.forEach((issue) => {
            grouped[issue.priority].push(issue);
        });

        return grouped;
    }, [issues]);

    const handleDrop = (e: React.DragEvent, targetPriority: Priority) => {
        e.preventDefault();
        const issueId = e.dataTransfer.getData('text/plain');
        if (issueId) {
            onUpdate(issueId, { priority: targetPriority });
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDragStart = (e: React.DragEvent, issueId: string) => {
        e.dataTransfer.setData('text/plain', issueId);
    };

    return (
        <div className="grid grid-cols-4 gap-4" data-testid="kanban-board">
            {columns.map((column) => (
                <div
                    key={column.id}
                    className={cn('p-3 bg-vite-bg rounded-lg border-t-2', column.color)}
                    onDrop={(e) => handleDrop(e, column.id)}
                    onDragOver={handleDragOver}
                    data-testid={`kanban-column-${column.id}`}
                >
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-300">{column.title}</h4>
                        <Badge className="bg-gray-800 text-gray-400 text-xs">
                            {issuesByPriority[column.id].length}
                        </Badge>
                    </div>
                    <div className="space-y-2 min-h-[200px]">
                        {issuesByPriority[column.id].map((issue, index) => (
                            <div
                                key={issue.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, issue.id)}
                            >
                                <IssueCard
                                    issue={issue}
                                    index={index}
                                    totalIssues={issuesByPriority[column.id].length}
                                    isSelected={selectedIds.has(issue.id)}
                                    onUpdate={onUpdate}
                                    onMoveUp={() => {}}
                                    onMoveDown={() => {}}
                                    onDelete={onDelete}
                                    onSelect={onSelect}
                                    viewMode="kanban"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

// Main Component
export default function BacklogReview({
    backlog,
    isGenerating = false,
    projectId,
    onApprove,
    onBacklogUpdate,
    prdRequirements = [],
    className,
}: BacklogReviewProps) {
    const [feedbackState, setFeedbackState] = useState<FeedbackState>('idle');
    const [bottomFeedbackState, setBottomFeedbackState] = useState<FeedbackState>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isApproved, setIsApproved] = useState(false);

    // View and filter state
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [typeFilter, setTypeFilter] = useState<IssueType | 'all'>('all');
    const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
    const [pointsFilter, setPointsFilter] = useState<StoryPoints | 'all'>('all');
    const [sortBy, setSortBy] = useState<SortOption>('priority');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    // Selection state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Dialog state
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isMergeDialogOpen, setIsMergeDialogOpen] = useState(false);
    const [isReestimateDialogOpen, setIsReestimateDialogOpen] = useState(false);
    const [addIssueDefaultPrdSection, setAddIssueDefaultPrdSection] = useState<string | undefined>();

    // Local issues state for editing and reordering
    const [localIssues, setLocalIssues] = useState<BacklogIssue[]>(() => {
        if (!backlog) return [];
        if (backlog.issues) return backlog.issues;

        // Generate sample issues from epics for demonstration
        const generatedIssues: BacklogIssue[] = [];
        backlog.epics.forEach((epic, epicIndex) => {
            const issueTypes: IssueType[] = ['FEATURE', 'BUG', 'TEST', 'REFACTOR', 'DOCS', 'DEVOPS', 'SECURITY', 'PERFORMANCE'];
            const priorities: Priority[] = ['critical', 'high', 'medium', 'low'];
            const points: StoryPoints[] = [0, 1, 2, 3, 5, 8];

            for (let i = 0; i < epic.tasks; i++) {
                generatedIssues.push({
                    id: `${epic.id}-issue-${i}`,
                    title: `[${issueTypes[i % issueTypes.length]}] ${epic.title} - Task ${i + 1}`,
                    description: `Implementation task for ${epic.title}. This task involves completing specific functionality related to the epic objectives.`,
                    type: issueTypes[i % issueTypes.length],
                    priority: priorities[(epicIndex + i) % priorities.length],
                    storyPoints: points[(epicIndex + i) % points.length],
                    acceptanceCriteria: [
                        'Unit tests written and passing with 80%+ coverage',
                        'Code review completed and approved',
                        'Documentation updated',
                        'Integration tests passing',
                    ],
                    epicId: epic.id,
                });
            }
        });
        return generatedIssues;
    });

    // Filtered and sorted issues
    const filteredAndSortedIssues = useMemo(() => {
        let filtered = localIssues.filter((issue) => {
            if (typeFilter !== 'all' && issue.type !== typeFilter) return false;
            if (priorityFilter !== 'all' && issue.priority !== priorityFilter) return false;
            if (pointsFilter !== 'all' && issue.storyPoints !== pointsFilter) return false;
            return true;
        });

        // Sort
        filtered.sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'priority':
                    comparison = PRIORITY_CONFIG[a.priority].order - PRIORITY_CONFIG[b.priority].order;
                    break;
                case 'points':
                    comparison = a.storyPoints - b.storyPoints;
                    break;
                case 'type':
                    comparison = a.type.localeCompare(b.type);
                    break;
                case 'title':
                    comparison = a.title.localeCompare(b.title);
                    break;
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [localIssues, typeFilter, priorityFilter, pointsFilter, sortBy, sortDirection]);

    // Group issues by epic for list view
    const groupedIssues = useMemo(() => {
        const groups: Record<string, { epic: Epic; issues: BacklogIssue[] }> = {};

        if (backlog) {
            backlog.epics.forEach((epic) => {
                groups[epic.id] = { epic, issues: [] };
            });

            filteredAndSortedIssues.forEach((issue) => {
                if (groups[issue.epicId]) {
                    groups[issue.epicId].issues.push(issue);
                }
            });
        }

        return Object.values(groups).filter((group) => group.issues.length > 0);
    }, [backlog, filteredAndSortedIssues]);

    // Selected issues for bulk operations
    const selectedIssues = useMemo(() => {
        return localIssues.filter((issue) => selectedIds.has(issue.id));
    }, [localIssues, selectedIds]);

    // Convert backlog to string for RLHF prompt/response
    const backlogContent = backlog ? JSON.stringify(backlog, null, 2) : '';

    // Handlers
    const handleUpdateIssue = useCallback((issueId: string, updates: Partial<BacklogIssue>) => {
        setLocalIssues((prev) => prev.map((issue) => (issue.id === issueId ? { ...issue, ...updates } : issue)));
    }, []);

    const handleMoveUp = useCallback((issueId: string) => {
        setLocalIssues((prev) => {
            const index = prev.findIndex((issue) => issue.id === issueId);
            if (index <= 0) return prev;

            const newIssues = [...prev];
            [newIssues[index - 1], newIssues[index]] = [newIssues[index], newIssues[index - 1]];
            return newIssues;
        });
    }, []);

    const handleMoveDown = useCallback((issueId: string) => {
        setLocalIssues((prev) => {
            const index = prev.findIndex((issue) => issue.id === issueId);
            if (index === -1 || index >= prev.length - 1) return prev;

            const newIssues = [...prev];
            [newIssues[index], newIssues[index + 1]] = [newIssues[index + 1], newIssues[index]];
            return newIssues;
        });
    }, []);

    const handleDeleteIssue = useCallback((issueId: string) => {
        setLocalIssues((prev) => prev.filter((issue) => issue.id !== issueId));
        setSelectedIds((prev) => {
            const next = new Set(prev);
            next.delete(issueId);
            return next;
        });
    }, []);

    const handleSelectIssue = useCallback((issueId: string, selected: boolean) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (selected) {
                next.add(issueId);
            } else {
                next.delete(issueId);
            }
            return next;
        });
    }, []);

    const handleSelectAll = useCallback(() => {
        setSelectedIds(new Set(filteredAndSortedIssues.map((i) => i.id)));
    }, [filteredAndSortedIssues]);

    const handleDeselectAll = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    const handleDeleteSelected = useCallback(() => {
        setLocalIssues((prev) => prev.filter((issue) => !selectedIds.has(issue.id)));
        setSelectedIds(new Set());
    }, [selectedIds]);

    const handleAddIssue = useCallback((issue: Omit<BacklogIssue, 'id'>) => {
        const newIssue: BacklogIssue = {
            ...issue,
            id: `new-issue-${Date.now()}`,
        };
        setLocalIssues((prev) => [...prev, newIssue]);
    }, []);

    const handleMergeIssues = useCallback(
        (mergedIssue: Omit<BacklogIssue, 'id'>) => {
            const newIssue: BacklogIssue = {
                ...mergedIssue,
                id: `merged-issue-${Date.now()}`,
            };
            setLocalIssues((prev) => [...prev.filter((issue) => !selectedIds.has(issue.id)), newIssue]);
            setSelectedIds(new Set());
        },
        [selectedIds]
    );

    const handleReestimate = useCallback((issueId: string, newPoints: StoryPoints) => {
        setLocalIssues((prev) =>
            prev.map((issue) => (issue.id === issueId ? { ...issue, storyPoints: newPoints } : issue))
        );
    }, []);

    const handleAddMissingIssue = useCallback((requirement: PRDRequirement) => {
        setAddIssueDefaultPrdSection(requirement.section);
        setIsAddDialogOpen(true);
    }, []);

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
                stepNumber: 4,
                stepName: 'Backlog Generation',
                prompt: 'backlog_generation',
                response: backlogContent,
                rating: rating,
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
        if (onBacklogUpdate && backlog) {
            onBacklogUpdate({
                ...backlog,
                issues: localIssues,
            });
        }
        onApprove?.();
    };

    const isThumbsUpActive = feedbackState === 'thumbs-up' || feedbackState === 'success';
    const isThumbsDownActive = feedbackState === 'thumbs-down';
    const isLoading = feedbackState === 'loading';
    const isSuccess = feedbackState === 'success';
    const isError = feedbackState === 'error';

    // Calculate totals
    const totalPoints = useMemo(() => {
        return filteredAndSortedIssues.reduce((sum, issue) => sum + issue.storyPoints, 0);
    }, [filteredAndSortedIssues]);

    // Loading state
    if (isGenerating) {
        return (
            <Card className={cn('bg-[#161B22] border-gray-800', className)}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ListTodo className="w-5 h-5 text-green-400" />
                        Backlog
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                        <p className="text-lg font-medium text-gray-300 mb-2">AI is generating Backlog...</p>
                        <p className="text-sm text-gray-400">Creating epics and tasks from your data model</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // No backlog yet
    if (!backlog) {
        return (
            <Card className={cn('bg-[#161B22] border-gray-800', className)}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ListTodo className="w-5 h-5 text-green-400" />
                        Backlog
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <p className="text-gray-400">No backlog available yet</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn('bg-[#161B22] border-gray-800 relative', className)} data-testid="backlog-review">
            {/* Floating Thumbs Up/Down (Top-Right) */}
            <div className="absolute top-4 right-4 z-10">
                <TooltipProvider delayDuration={200}>
                    <div className="flex items-center gap-2 bg-vite-bg rounded-full p-1 border border-gray-800 shadow-lg">
                        {/* Thumbs Up */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <motion.button
                                    onClick={() => handleTopFeedback(1)}
                                    disabled={isLoading || isSuccess}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={cn(
                                        'relative p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0D1117]',
                                        isThumbsUpActive
                                            ? 'bg-green-500/20 text-green-400 focus:ring-green-500'
                                            : 'text-gray-400 hover:text-green-400 hover:bg-green-500/10 focus:ring-gray-500',
                                        (isLoading || isSuccess) && 'cursor-not-allowed opacity-70'
                                    )}
                                    aria-label="Thumbs up - Backlog is helpful"
                                    aria-pressed={isThumbsUpActive}
                                    data-testid="thumbs-up-btn"
                                >
                                    <AnimatePresence mode="wait">
                                        {isSuccess && feedbackState === 'success' ? (
                                            <motion.div
                                                key="success"
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                exit={{ scale: 0, rotate: 180 }}
                                                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                            >
                                                <Check className="h-4 w-4" />
                                            </motion.div>
                                        ) : isLoading ? (
                                            <motion.div
                                                key="loading"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            </motion.div>
                                        ) : (
                                            <motion.div key="thumbs-up" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                <ThumbsUp className={cn('h-4 w-4', isThumbsUpActive && 'fill-current')} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {isSuccess && (
                                        <motion.span
                                            className="absolute inset-0 rounded-full bg-green-400"
                                            initial={{ opacity: 0.6, scale: 1 }}
                                            animate={{ opacity: 0, scale: 2 }}
                                            transition={{ duration: 0.6 }}
                                        />
                                    )}
                                </motion.button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>This backlog is helpful</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* Thumbs Down */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <motion.button
                                    onClick={() => handleTopFeedback(-1)}
                                    disabled={isLoading || isSuccess}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={cn(
                                        'relative p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0D1117]',
                                        isThumbsDownActive
                                            ? 'bg-red-500/20 text-red-400 focus:ring-red-500'
                                            : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10 focus:ring-gray-500',
                                        (isLoading || isSuccess) && 'cursor-not-allowed opacity-70'
                                    )}
                                    aria-label="Thumbs down - Backlog needs improvement"
                                    aria-pressed={isThumbsDownActive}
                                    data-testid="thumbs-down-btn"
                                >
                                    <AnimatePresence mode="wait">
                                        {isLoading ? (
                                            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            </motion.div>
                                        ) : (
                                            <motion.div key="thumbs-down" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                <ThumbsDown className={cn('h-4 w-4', isThumbsDownActive && 'fill-current')} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>This backlog needs improvement</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
            </div>

            <CardHeader>
                <div className="flex items-center justify-between pr-24">
                    <CardTitle className="flex items-center gap-2">
                        <ListTodo className="w-5 h-5 text-green-400" />
                        Backlog Review
                    </CardTitle>
                    <Button
                        onClick={() => {
                            setAddIssueDefaultPrdSection(undefined);
                            setIsAddDialogOpen(true);
                        }}
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                        data-testid="add-issue-btn"
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Issue
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Success/Error Messages */}
                <AnimatePresence>
                    {isSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
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
                            transition={{ duration: 0.3 }}
                            className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400"
                        >
                            <AlertCircle className="h-4 w-4" />
                            <span>{errorMessage}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* PRD Coverage Analysis */}
                <PRDCoverageAnalysis
                    prdRequirements={prdRequirements}
                    issues={localIssues}
                    onAddMissingIssue={handleAddMissingIssue}
                />

                {/* Backlog Summary */}
                <div className="mb-4 p-4 bg-vite-bg rounded-lg border border-gray-800">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-primary">{backlog.totalTasks}</p>
                            <p className="text-xs text-gray-400">Total Tasks</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-400">{backlog.epics.length}</p>
                            <p className="text-xs text-gray-400">Epics</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-400">{filteredAndSortedIssues.length}</p>
                            <p className="text-xs text-gray-400">Filtered Issues</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-yellow-400">{totalPoints}</p>
                            <p className="text-xs text-gray-400">Story Points</p>
                        </div>
                    </div>
                </div>

                {/* Filter and Sort Controls */}
                <FilterSortControls
                    typeFilter={typeFilter}
                    priorityFilter={priorityFilter}
                    pointsFilter={pointsFilter}
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    viewMode={viewMode}
                    onTypeChange={setTypeFilter}
                    onPriorityChange={setPriorityFilter}
                    onPointsChange={setPointsFilter}
                    onSortChange={setSortBy}
                    onSortDirectionChange={() => setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))}
                    onViewModeChange={setViewMode}
                />

                {/* Bulk Actions Bar */}
                <AnimatePresence>
                    <BulkActionsBar
                        selectedCount={selectedIds.size}
                        onSelectAll={handleSelectAll}
                        onDeselectAll={handleDeselectAll}
                        onDeleteSelected={handleDeleteSelected}
                        onMergeSelected={() => setIsMergeDialogOpen(true)}
                        onReestimate={() => setIsReestimateDialogOpen(true)}
                        totalCount={filteredAndSortedIssues.length}
                    />
                </AnimatePresence>

                {/* Kanban or List View */}
                {viewMode === 'kanban' ? (
                    <KanbanBoard
                        issues={filteredAndSortedIssues}
                        selectedIds={selectedIds}
                        onUpdate={handleUpdateIssue}
                        onDelete={handleDeleteIssue}
                        onSelect={handleSelectIssue}
                        onReorder={setLocalIssues}
                    />
                ) : (
                    /* Issues Grouped by Epic (List View) */
                    <div className="space-y-6">
                        {groupedIssues.map(({ epic, issues }) => (
                            <div key={epic.id} className="space-y-3">
                                {/* Epic Header */}
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
                                    <FileCode className="w-5 h-5 text-green-400" />
                                    <h3 className="font-semibold text-lg text-gray-100">{epic.title}</h3>
                                    {epic.priority && (
                                        <Badge
                                            className={cn(
                                                'text-xs',
                                                epic.priority === 'high' && 'bg-red-500/20 text-red-400',
                                                epic.priority === 'medium' && 'bg-yellow-500/20 text-yellow-400',
                                                epic.priority === 'low' && 'bg-green-500/20 text-green-400'
                                            )}
                                        >
                                            {epic.priority}
                                        </Badge>
                                    )}
                                    <span className="text-sm text-gray-400 ml-auto">
                                        {issues.length} issue{issues.length !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                {/* Epic Description */}
                                {epic.description && <p className="text-sm text-gray-400 pl-7">{epic.description}</p>}

                                {/* Issues List */}
                                <div className="space-y-2 pl-2">
                                    <AnimatePresence>
                                        {issues.map((issue, index) => (
                                            <IssueCard
                                                key={issue.id}
                                                issue={issue}
                                                index={index}
                                                totalIssues={issues.length}
                                                isSelected={selectedIds.has(issue.id)}
                                                onUpdate={handleUpdateIssue}
                                                onMoveUp={handleMoveUp}
                                                onMoveDown={handleMoveDown}
                                                onDelete={handleDeleteIssue}
                                                onSelect={handleSelectIssue}
                                                viewMode="list"
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {filteredAndSortedIssues.length === 0 && (
                    <div className="text-center py-8">
                        <Filter className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">No issues match the current filters</p>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setTypeFilter('all');
                                setPriorityFilter('all');
                                setPointsFilter('all');
                            }}
                            className="mt-2 text-primary"
                        >
                            Clear Filters
                        </Button>
                    </div>
                )}

                {/* Notes (if any) */}
                {backlog.notes && (
                    <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-sm text-blue-300">{backlog.notes}</p>
                    </div>
                )}

                {/* Bottom Feedback Section */}
                <div className="pt-4 border-t border-gray-800 space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400">Was this helpful?</p>

                        <div className="flex items-center gap-2">
                            <TooltipProvider delayDuration={200}>
                                {/* Thumbs Up */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <motion.button
                                            onClick={() => handleBottomFeedback(1)}
                                            disabled={isLoading || isSuccess}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={cn(
                                                'p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#161B22]',
                                                isThumbsUpActive
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30 focus:ring-green-500'
                                                    : 'bg-vite-bg text-gray-400 border border-gray-800 hover:border-green-500/30 hover:text-green-400 focus:ring-gray-500',
                                                (isLoading || isSuccess) && 'cursor-not-allowed opacity-70'
                                            )}
                                            aria-label="Thumbs up"
                                        >
                                            <ThumbsUp className={cn('h-5 w-5', isThumbsUpActive && 'fill-current')} />
                                        </motion.button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Yes, this was helpful</p>
                                    </TooltipContent>
                                </Tooltip>

                                {/* Thumbs Down */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <motion.button
                                            onClick={() => handleBottomFeedback(-1)}
                                            disabled={isLoading || isSuccess}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={cn(
                                                'p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#161B22]',
                                                isThumbsDownActive
                                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30 focus:ring-red-500'
                                                    : 'bg-vite-bg text-gray-400 border border-gray-800 hover:border-red-500/30 hover:text-red-400 focus:ring-gray-500',
                                                (isLoading || isSuccess) && 'cursor-not-allowed opacity-70'
                                            )}
                                            aria-label="Thumbs down"
                                        >
                                            <ThumbsDown className={cn('h-5 w-5', isThumbsDownActive && 'fill-current')} />
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
                        disabled={isApproved}
                        className={cn(
                            'w-full transition-all duration-200',
                            isApproved
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-gradient-to-r from-primary to-[#FCAE39] hover:opacity-90'
                        )}
                        data-testid="approve-backlog-btn"
                    >
                        {isApproved ? (
                            <>
                                <CheckCircle2 className="w-5 h-5 mr-2" />
                                Backlog Approved
                            </>
                        ) : (
                            'Approve Backlog'
                        )}
                    </Button>
                </div>
            </CardContent>

            {/* Dialogs */}
            <AddIssueDialog
                isOpen={isAddDialogOpen}
                onClose={() => setIsAddDialogOpen(false)}
                onAdd={handleAddIssue}
                epics={backlog.epics}
                defaultPrdSection={addIssueDefaultPrdSection}
            />

            <MergeIssuesDialog
                isOpen={isMergeDialogOpen}
                onClose={() => setIsMergeDialogOpen(false)}
                selectedIssues={selectedIssues}
                onMerge={handleMergeIssues}
            />

            <ReestimateDialog
                isOpen={isReestimateDialogOpen}
                onClose={() => setIsReestimateDialogOpen(false)}
                selectedIssues={selectedIssues}
                onReestimate={handleReestimate}
            />
        </Card>
    );
}
