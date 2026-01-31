'use client';

/**
 * Sprint Plan Review Component with Pacing and Human Intervention
 *
 * GitHub Issue #310 - Enhanced sprint planning with:
 * - Sprint breakdown display with issues assigned to each
 * - Estimated velocity and capacity per sprint
 * - "Review at my pace" mode - user controls review advancement
 * - Clear "I've reviewed this" confirmation before proceeding
 * - Option to go back and re-review previous sections
 * - Drag-and-drop for issue reassignment between sprints
 * - Inline story point adjustments
 * - Sprint-by-sprint approval option
 * - "Approve all" for confident users
 * - Comments/notes field for each sprint
 * - Save draft and return later
 * - RLHF feedback integration
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ThumbsUp,
    ThumbsDown,
    Check,
    Loader2,
    Activity,
    AlertCircle,
    CheckCircle2,
    Calendar,
    Clock,
    User,
    Bot,
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Edit,
    Target,
    Zap,
    AlertTriangle,
    GripVertical,
    MessageSquare,
    Save,
    RotateCcw,
    CheckCheck,
    ArrowLeft,
    ArrowRight,
    Bookmark,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { rlhfService } from '@/services/rlhfService';

// Issue/Story interface for sprint items
export interface SprintIssue {
    id: string;
    title: string;
    type: 'feature' | 'bug' | 'chore' | 'refactor';
    storyPoints: number;
    priority: 'critical' | 'high' | 'medium' | 'low';
    assignee?: string;
    labels?: string[];
}

export interface Sprint {
    number: number;
    title?: string;
    duration: string;
    focus: string;
    tasks: number;
    agentTimePercentage?: number;
    humanTimePercentage?: number;
    issues?: SprintIssue[];
    velocity?: number;
    capacity?: number;
    isReviewed?: boolean;
    isApproved?: boolean;
    notes?: string;
}

export interface SprintPlanDraft {
    projectId: string;
    sprints: Sprint[];
    savedAt: string;
    currentSprintIndex: number;
    hasReviewedAll: boolean;
}

export interface SprintPlanReviewProps {
    sprintPlan: {
        sprints: Sprint[];
        totalDuration: string;
        agentTime?: string;
        humanTime?: string;
        notes?: string;
        totalVelocity?: number;
        totalCapacity?: number;
    } | null;
    isGenerating?: boolean;
    projectId: string;
    onApprove?: () => void;
    onSprintApprove?: (sprintNumber: number) => void;
    onIssueMove?: (issueId: string, fromSprint: number, toSprint: number) => void;
    onStoryPointsChange?: (issueId: string, sprintNumber: number, newPoints: number) => void;
    onSaveDraft?: (draft: SprintPlanDraft) => void;
    onSprintPlanUpdate?: (sprints: Sprint[]) => void;
    className?: string;
}

type FeedbackState = 'idle' | 'thumbs-up' | 'thumbs-down' | 'loading' | 'success' | 'error';
type ReviewMode = 'paced' | 'all';

// Priority color mapping
const priorityColors: Record<SprintIssue['priority'], string> = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

// Type color mapping
const typeColors: Record<SprintIssue['type'], string> = {
    feature: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    bug: 'bg-red-500/20 text-red-400 border-red-500/30',
    chore: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    refactor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

// Local storage key for drafts
const DRAFT_STORAGE_KEY = 'sprint-plan-draft';

// Draggable Issue Card Component
function DraggableIssueCard({
    issue,
    sprintNumber,
    totalSprints,
    onMove,
    onStoryPointsChange,
    isEditing,
    onEditToggle,
    isDragging,
    onDragStart,
    onDragEnd,
}: {
    issue: SprintIssue;
    sprintNumber: number;
    totalSprints: number;
    onMove: (direction: 'prev' | 'next') => void;
    onStoryPointsChange: (newPoints: number) => void;
    isEditing: boolean;
    onEditToggle: () => void;
    isDragging: boolean;
    onDragStart: () => void;
    onDragEnd: () => void;
}) {
    const [editedPoints, setEditedPoints] = useState(issue.storyPoints);
    const dragRef = useRef<HTMLDivElement>(null);

    const handlePointsSave = () => {
        if (editedPoints !== issue.storyPoints && editedPoints >= 0 && editedPoints <= 13) {
            onStoryPointsChange(editedPoints);
        }
        onEditToggle();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handlePointsSave();
        } else if (e.key === 'Escape') {
            setEditedPoints(issue.storyPoints);
            onEditToggle();
        }
    };

    const handleNativeDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ issueId: issue.id, fromSprint: sprintNumber }));
        e.dataTransfer.effectAllowed = 'move';
        onDragStart();
    };

    const handleNativeDragEnd = () => {
        onDragEnd();
    };

    return (
        <motion.div
            ref={dragRef}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isDragging ? 0.5 : 1, y: 0, scale: isDragging ? 1.02 : 1 }}
            exit={{ opacity: 0, y: -10 }}
            draggable
            onDragStartCapture={handleNativeDragStart}
            onDragEndCapture={handleNativeDragEnd}
            className={cn(
                'group p-3 bg-[#161B22] rounded-lg border transition-all cursor-grab active:cursor-grabbing',
                isDragging ? 'border-primary shadow-lg shadow-primary/20' : 'border-gray-800 hover:border-gray-700'
            )}
            data-testid={`issue-card-${issue.id}`}
        >
            <div className="flex items-start gap-3">
                {/* Drag Handle */}
                <div className="mt-1 text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Badge
                            className={cn(
                                'text-[10px] px-1.5 py-0 h-5 capitalize',
                                typeColors[issue.type]
                            )}
                        >
                            {issue.type}
                        </Badge>
                        <Badge
                            className={cn(
                                'text-[10px] px-1.5 py-0 h-5 capitalize',
                                priorityColors[issue.priority]
                            )}
                        >
                            {issue.priority}
                        </Badge>
                    </div>
                    <p className="text-sm text-gray-200 truncate" title={issue.title}>
                        {issue.title}
                    </p>
                    {issue.assignee && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {issue.assignee}
                        </p>
                    )}
                </div>

                {/* Story Points Badge - Editable */}
                <div className="flex items-center gap-1">
                    {isEditing ? (
                        <div className="flex items-center gap-1">
                            <Input
                                type="number"
                                min={0}
                                max={13}
                                value={editedPoints}
                                onChange={(e) => setEditedPoints(parseInt(e.target.value) || 0)}
                                onKeyDown={handleKeyDown}
                                onBlur={handlePointsSave}
                                className="w-12 h-7 text-center text-xs bg-vite-bg border-primary/50"
                                autoFocus
                                data-testid={`points-input-${issue.id}`}
                            />
                        </div>
                    ) : (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={onEditToggle}
                                        className="flex items-center gap-1 px-2 py-1 rounded bg-primary/20 text-primary text-xs font-semibold hover:bg-primary/30 transition-colors"
                                        data-testid={`points-badge-${issue.id}`}
                                    >
                                        <Target className="w-3 h-3" />
                                        {issue.storyPoints}
                                        <Edit className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Click to edit story points</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </div>

            {/* Move Controls - Visible on hover */}
            <div className="flex items-center justify-end gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onMove('prev')}
                                disabled={sprintNumber === 1}
                                className="h-6 px-2 text-xs text-gray-400 hover:text-white hover:bg-gray-800"
                                data-testid={`move-prev-${issue.id}`}
                            >
                                <ChevronLeft className="w-3 h-3 mr-1" />
                                Sprint {sprintNumber - 1}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Move to previous sprint</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onMove('next')}
                                disabled={sprintNumber === totalSprints}
                                className="h-6 px-2 text-xs text-gray-400 hover:text-white hover:bg-gray-800"
                                data-testid={`move-next-${issue.id}`}
                            >
                                Sprint {sprintNumber + 1}
                                <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Move to next sprint</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </motion.div>
    );
}

// Sprint Card Component with expand/collapse and drag-drop zone
function SprintCard({
    sprint,
    totalSprints,
    isExpanded,
    isCurrentReview,
    reviewMode,
    onToggleExpand,
    onReviewToggle,
    onApprove,
    onIssueMove,
    onStoryPointsChange,
    onNotesChange,
    onIssueDrop,
}: {
    sprint: Sprint;
    totalSprints: number;
    isExpanded: boolean;
    isCurrentReview: boolean;
    reviewMode: ReviewMode;
    onToggleExpand: () => void;
    onReviewToggle: () => void;
    onApprove: () => void;
    onIssueMove: (issueId: string, direction: 'prev' | 'next') => void;
    onStoryPointsChange: (issueId: string, newPoints: number) => void;
    onNotesChange: (notes: string) => void;
    onIssueDrop: (issueId: string, fromSprint: number) => void;
}) {
    const [editingIssueId, setEditingIssueId] = useState<string | null>(null);
    const [draggingIssueId, setDraggingIssueId] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [showNotesInput, setShowNotesInput] = useState(false);
    const [localNotes, setLocalNotes] = useState(sprint.notes || '');

    const totalPoints = sprint.issues?.reduce((sum, issue) => sum + issue.storyPoints, 0) || 0;
    const velocity = sprint.velocity || totalPoints;
    const capacity = sprint.capacity || 40;
    const capacityUsage = Math.min((velocity / capacity) * 100, 100);
    const isOverCapacity = velocity > capacity;

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            if (data.issueId && data.fromSprint !== sprint.number) {
                onIssueDrop(data.issueId, data.fromSprint);
            }
        } catch (err) {
            console.error('Invalid drop data:', err);
        }
    };

    const handleNotesSave = () => {
        onNotesChange(localNotes);
        setShowNotesInput(false);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
                'rounded-lg border transition-all',
                sprint.isApproved
                    ? 'bg-green-500/5 border-green-500/30'
                    : isDragOver
                        ? 'bg-primary/10 border-primary border-dashed'
                        : isCurrentReview && reviewMode === 'paced'
                            ? 'bg-vite-bg border-primary/50 ring-2 ring-primary/20'
                            : 'bg-vite-bg border-gray-800 hover:border-gray-700'
            )}
            data-testid={`sprint-card-${sprint.number}`}
        >
            {/* Sprint Header */}
            <div
                className="p-4 cursor-pointer"
                onClick={onToggleExpand}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            'flex items-center justify-center w-10 h-10 rounded-lg border',
                            isCurrentReview && reviewMode === 'paced'
                                ? 'bg-gradient-to-br from-primary/30 to-orange-500/30 border-primary/50'
                                : 'bg-gradient-to-br from-primary/20 to-orange-500/20 border-primary/30'
                        )}>
                            <span className="text-lg font-bold text-primary">{sprint.number}</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-100">
                                    {sprint.title || `Sprint ${sprint.number}`}
                                </h4>
                                {sprint.isApproved && (
                                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        Approved
                                    </Badge>
                                )}
                                {isCurrentReview && reviewMode === 'paced' && !sprint.isApproved && (
                                    <Badge className="bg-primary/20 text-primary border-primary/30">
                                        <Activity className="w-3 h-3 mr-1" />
                                        Reviewing
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-gray-400">{sprint.focus}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Duration */}
                        <div className="text-right">
                            <div className="flex items-center gap-1 text-sm text-gray-400">
                                <Clock className="w-4 h-4" />
                                {sprint.duration}
                            </div>
                        </div>

                        {/* Velocity/Capacity */}
                        <div className="text-right min-w-[100px]">
                            <div className={cn(
                                'flex items-center gap-1 text-sm font-medium',
                                isOverCapacity ? 'text-red-400' : 'text-gray-300'
                            )}>
                                <Zap className="w-4 h-4" />
                                {velocity} / {capacity} pts
                                {isOverCapacity && (
                                    <AlertTriangle className="w-4 h-4 text-red-400" />
                                )}
                            </div>
                            <Progress
                                value={capacityUsage}
                                className={cn(
                                    'h-1.5 mt-1',
                                    isOverCapacity ? '[&>div]:bg-red-500' : ''
                                )}
                            />
                        </div>

                        {/* Expand/Collapse Icon */}
                        <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        </motion.div>
                    </div>
                </div>

                {/* Agent/Human Time Split */}
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                        <Bot className="w-3 h-3 text-blue-400" />
                        Agent: {sprint.agentTimePercentage || 95}%
                    </span>
                    <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-green-400" />
                        Human: {sprint.humanTimePercentage || 5}%
                    </span>
                    <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3 text-gray-400" />
                        {sprint.issues?.length || sprint.tasks} issues
                    </span>
                </div>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-3">
                            {/* Drop Zone Indicator */}
                            {isDragOver && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-4 border-2 border-dashed border-primary rounded-lg bg-primary/5 text-center"
                                >
                                    <p className="text-sm text-primary">Drop issue here to add to Sprint {sprint.number}</p>
                                </motion.div>
                            )}

                            {/* Issues List */}
                            {sprint.issues && sprint.issues.length > 0 ? (
                                <div className="space-y-2">
                                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center justify-between">
                                        <span>Issues in this Sprint</span>
                                        <span className="text-gray-500">Drag to reorder or move between sprints</span>
                                    </div>
                                    <AnimatePresence mode="popLayout">
                                        {sprint.issues.map((issue) => (
                                            <DraggableIssueCard
                                                key={issue.id}
                                                issue={issue}
                                                sprintNumber={sprint.number}
                                                totalSprints={totalSprints}
                                                onMove={(direction) => onIssueMove(issue.id, direction)}
                                                onStoryPointsChange={(newPoints) =>
                                                    onStoryPointsChange(issue.id, newPoints)
                                                }
                                                isEditing={editingIssueId === issue.id}
                                                onEditToggle={() =>
                                                    setEditingIssueId(
                                                        editingIssueId === issue.id ? null : issue.id
                                                    )
                                                }
                                                isDragging={draggingIssueId === issue.id}
                                                onDragStart={() => setDraggingIssueId(issue.id)}
                                                onDragEnd={() => setDraggingIssueId(null)}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-500 text-sm border border-dashed border-gray-800 rounded-lg">
                                    No issues assigned - drag issues here from other sprints
                                </div>
                            )}

                            {/* Notes Section */}
                            <div className="pt-3 border-t border-gray-800">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1">
                                        <MessageSquare className="w-3 h-3" />
                                        Sprint Notes
                                    </label>
                                    {!showNotesInput && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowNotesInput(true)}
                                            className="h-6 text-xs text-gray-500 hover:text-gray-300"
                                            data-testid={`add-notes-${sprint.number}`}
                                        >
                                            <Edit className="w-3 h-3 mr-1" />
                                            {sprint.notes ? 'Edit' : 'Add'} Notes
                                        </Button>
                                    )}
                                </div>
                                {showNotesInput ? (
                                    <div className="space-y-2">
                                        <Textarea
                                            value={localNotes}
                                            onChange={(e) => setLocalNotes(e.target.value)}
                                            placeholder="Add any notes or concerns about this sprint..."
                                            className="bg-[#161B22] border-gray-700 min-h-[80px] text-sm"
                                            data-testid={`notes-input-${sprint.number}`}
                                        />
                                        <div className="flex items-center gap-2 justify-end">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setLocalNotes(sprint.notes || '');
                                                    setShowNotesInput(false);
                                                }}
                                                className="text-gray-400"
                                            >
                                                <X className="w-3 h-3 mr-1" />
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleNotesSave}
                                                className="bg-primary"
                                                data-testid={`save-notes-${sprint.number}`}
                                            >
                                                <Save className="w-3 h-3 mr-1" />
                                                Save Notes
                                            </Button>
                                        </div>
                                    </div>
                                ) : sprint.notes ? (
                                    <div className="p-3 bg-[#161B22] rounded-lg border border-gray-800 text-sm text-gray-300">
                                        {sprint.notes}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500 italic">No notes added yet</p>
                                )}
                            </div>

                            {/* Sprint Review & Approval Section */}
                            <div className="pt-3 border-t border-gray-800 space-y-3">
                                {/* Review Checkbox */}
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <Checkbox
                                        checked={sprint.isReviewed || false}
                                        onCheckedChange={onReviewToggle}
                                        className={cn(
                                            'border-gray-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary',
                                            'transition-all'
                                        )}
                                        data-testid={`review-checkbox-${sprint.number}`}
                                    />
                                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                                        I've reviewed this sprint and the issue assignments
                                    </span>
                                </label>

                                {/* Sprint Approve Button */}
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onApprove();
                                    }}
                                    disabled={!sprint.isReviewed || sprint.isApproved}
                                    className={cn(
                                        'w-full transition-all duration-200',
                                        sprint.isApproved
                                            ? 'bg-green-500 hover:bg-green-600'
                                            : !sprint.isReviewed
                                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-primary to-[#FCAE39] hover:opacity-90'
                                    )}
                                    data-testid={`approve-sprint-${sprint.number}`}
                                >
                                    {sprint.isApproved ? (
                                        <>
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            Sprint {sprint.number} Approved
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4 mr-2" />
                                            Approve Sprint {sprint.number}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// Pacing Controls Component
function PacingControls({
    currentIndex,
    totalSprints,
    onPrevious,
    onNext,
    onGoToSprint,
    sprintStatuses,
}: {
    currentIndex: number;
    totalSprints: number;
    onPrevious: () => void;
    onNext: () => void;
    onGoToSprint: (index: number) => void;
    sprintStatuses: { isReviewed: boolean; isApproved: boolean }[];
}) {
    return (
        <div className="flex items-center justify-between p-4 bg-vite-bg rounded-lg border border-gray-800">
            <Button
                variant="outline"
                onClick={onPrevious}
                disabled={currentIndex === 0}
                className="border-gray-700"
                data-testid="pacing-prev"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous Sprint
            </Button>

            {/* Sprint Progress Dots */}
            <div className="flex items-center gap-2">
                {sprintStatuses.map((status, index) => (
                    <TooltipProvider key={index}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => onGoToSprint(index)}
                                    className={cn(
                                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                                        status.isApproved
                                            ? 'bg-green-500 text-white'
                                            : status.isReviewed
                                                ? 'bg-yellow-500/50 text-yellow-300 border border-yellow-500/50'
                                                : index === currentIndex
                                                    ? 'bg-primary text-white ring-2 ring-primary/50'
                                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    )}
                                    data-testid={`pacing-dot-${index + 1}`}
                                >
                                    {status.isApproved ? (
                                        <Check className="w-4 h-4" />
                                    ) : (
                                        index + 1
                                    )}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>
                                    Sprint {index + 1}
                                    {status.isApproved
                                        ? ' - Approved'
                                        : status.isReviewed
                                            ? ' - Reviewed'
                                            : index === currentIndex
                                                ? ' - Current'
                                                : ' - Pending'}
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}
            </div>

            <Button
                variant="outline"
                onClick={onNext}
                disabled={currentIndex >= totalSprints - 1}
                className="border-gray-700"
                data-testid="pacing-next"
            >
                Next Sprint
                <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
        </div>
    );
}

export default function SprintPlanReview({
    sprintPlan,
    isGenerating = false,
    projectId,
    onApprove,
    onSprintApprove,
    onIssueMove,
    onStoryPointsChange,
    onSaveDraft,
    onSprintPlanUpdate,
    className,
}: SprintPlanReviewProps) {
    const [feedbackState, setFeedbackState] = useState<FeedbackState>('idle');
    const [bottomFeedbackState, setBottomFeedbackState] = useState<FeedbackState>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isApproved, setIsApproved] = useState(false);
    const [expandedSprints, setExpandedSprints] = useState<Set<number>>(new Set());
    const [localSprints, setLocalSprints] = useState<Sprint[]>([]);
    const [currentSprintIndex, setCurrentSprintIndex] = useState(0);
    const [hasReviewedAll, setHasReviewedAll] = useState(false);
    const [reviewMode, setReviewMode] = useState<ReviewMode>('paced');
    const [showSaveDraftDialog, setShowSaveDraftDialog] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

    // Load saved draft on mount
    useEffect(() => {
        const savedDraft = localStorage.getItem(`${DRAFT_STORAGE_KEY}-${projectId}`);
        if (savedDraft) {
            try {
                const draft: SprintPlanDraft = JSON.parse(savedDraft);
                if (draft.sprints && draft.projectId === projectId) {
                    setLocalSprints(draft.sprints);
                    setCurrentSprintIndex(draft.currentSprintIndex);
                    setHasReviewedAll(draft.hasReviewedAll);
                    setLastSavedAt(draft.savedAt);
                    // Expand the current sprint
                    setExpandedSprints(new Set([draft.sprints[draft.currentSprintIndex]?.number]));
                }
            } catch (err) {
                console.error('Error loading draft:', err);
            }
        }
    }, [projectId]);

    // Initialize local sprints when sprint plan changes (only if no draft loaded)
    useEffect(() => {
        if (sprintPlan?.sprints && localSprints.length === 0) {
            const initialized = sprintPlan.sprints.map((s) => ({
                ...s,
                isReviewed: false,
                isApproved: false,
                notes: s.notes || '',
                issues: s.issues || generateMockIssues(s.number, s.tasks),
            }));
            setLocalSprints(initialized);
            // Auto-expand first sprint in paced mode
            if (initialized.length > 0) {
                setExpandedSprints(new Set([initialized[0].number]));
            }
        }
    }, [sprintPlan, localSprints.length]);

    // Generate mock issues for demo purposes
    function generateMockIssues(sprintNumber: number, count: number): SprintIssue[] {
        const types: SprintIssue['type'][] = ['feature', 'bug', 'chore', 'refactor'];
        const priorities: SprintIssue['priority'][] = ['critical', 'high', 'medium', 'low'];
        const tasks = [
            'Implement user authentication flow',
            'Fix navigation menu bug',
            'Add unit tests for API endpoints',
            'Refactor database queries',
            'Create dashboard component',
            'Update documentation',
            'Optimize image loading',
            'Add error handling',
        ];

        return Array.from({ length: count }, (_, i) => ({
            id: `sprint-${sprintNumber}-issue-${i + 1}`,
            title: tasks[i % tasks.length],
            type: types[i % types.length],
            storyPoints: [1, 2, 3, 5, 8][Math.floor(Math.random() * 5)],
            priority: priorities[i % priorities.length],
            assignee: i % 2 === 0 ? 'AI Agent' : undefined,
        }));
    }

    // Save draft to localStorage
    const saveDraft = useCallback(() => {
        setIsSaving(true);
        const draft: SprintPlanDraft = {
            projectId,
            sprints: localSprints,
            savedAt: new Date().toISOString(),
            currentSprintIndex,
            hasReviewedAll,
        };

        localStorage.setItem(`${DRAFT_STORAGE_KEY}-${projectId}`, JSON.stringify(draft));
        setLastSavedAt(draft.savedAt);
        onSaveDraft?.(draft);

        setTimeout(() => {
            setIsSaving(false);
            setShowSaveDraftDialog(false);
        }, 500);
    }, [projectId, localSprints, currentSprintIndex, hasReviewedAll, onSaveDraft]);

    // Clear saved draft
    const clearDraft = useCallback(() => {
        localStorage.removeItem(`${DRAFT_STORAGE_KEY}-${projectId}`);
        setLastSavedAt(null);
    }, [projectId]);

    // Toggle sprint expansion
    const toggleSprintExpansion = useCallback((sprintNumber: number) => {
        setExpandedSprints((prev) => {
            const next = new Set(prev);
            if (next.has(sprintNumber)) {
                next.delete(sprintNumber);
            } else {
                next.add(sprintNumber);
            }
            return next;
        });
    }, []);

    // Handle sprint review toggle
    const handleSprintReviewToggle = useCallback((sprintNumber: number) => {
        setLocalSprints((prev) =>
            prev.map((s) =>
                s.number === sprintNumber ? { ...s, isReviewed: !s.isReviewed } : s
            )
        );
    }, []);

    // Handle sprint notes change
    const handleSprintNotesChange = useCallback((sprintNumber: number, notes: string) => {
        setLocalSprints((prev) =>
            prev.map((s) =>
                s.number === sprintNumber ? { ...s, notes } : s
            )
        );
    }, []);

    // Handle sprint approval
    const handleSprintApprove = useCallback(
        (sprintNumber: number) => {
            setLocalSprints((prev) =>
                prev.map((s) =>
                    s.number === sprintNumber ? { ...s, isApproved: true } : s
                )
            );
            onSprintApprove?.(sprintNumber);

            // In paced mode, auto-advance to next sprint
            if (reviewMode === 'paced') {
                const currentIndex = localSprints.findIndex((s) => s.number === sprintNumber);
                if (currentIndex < localSprints.length - 1) {
                    const nextSprint = localSprints[currentIndex + 1];
                    setCurrentSprintIndex(currentIndex + 1);
                    setExpandedSprints(new Set([nextSprint.number]));
                }
            }
        },
        [localSprints, onSprintApprove, reviewMode]
    );

    // Handle issue drop from drag-and-drop
    const handleIssueDrop = useCallback(
        (targetSprintNumber: number, issueId: string, fromSprintNumber: number) => {
            setLocalSprints((prev) => {
                const issueToMove = prev
                    .find((s) => s.number === fromSprintNumber)
                    ?.issues?.find((i) => i.id === issueId);

                if (!issueToMove) return prev;

                return prev.map((sprint) => {
                    if (sprint.number === fromSprintNumber) {
                        return {
                            ...sprint,
                            issues: sprint.issues?.filter((i) => i.id !== issueId),
                            tasks: Math.max(0, (sprint.issues?.length || 1) - 1),
                        };
                    }
                    if (sprint.number === targetSprintNumber) {
                        return {
                            ...sprint,
                            issues: [...(sprint.issues || []), issueToMove],
                            tasks: (sprint.issues?.length || 0) + 1,
                        };
                    }
                    return sprint;
                });
            });

            onIssueMove?.(issueId, fromSprintNumber, targetSprintNumber);
        },
        [onIssueMove]
    );

    // Handle issue move via buttons
    const handleIssueMove = useCallback(
        (issueId: string, sprintNumber: number, direction: 'prev' | 'next') => {
            const targetSprintNumber = direction === 'prev' ? sprintNumber - 1 : sprintNumber + 1;
            handleIssueDrop(targetSprintNumber, issueId, sprintNumber);
        },
        [handleIssueDrop]
    );

    // Handle story points change
    const handleStoryPointsChange = useCallback(
        (issueId: string, sprintNumber: number, newPoints: number) => {
            setLocalSprints((prev) =>
                prev.map((sprint) => {
                    if (sprint.number !== sprintNumber) return sprint;
                    return {
                        ...sprint,
                        issues: sprint.issues?.map((issue) =>
                            issue.id === issueId
                                ? { ...issue, storyPoints: newPoints }
                                : issue
                        ),
                    };
                })
            );

            onStoryPointsChange?.(issueId, sprintNumber, newPoints);
        },
        [onStoryPointsChange]
    );

    // Pacing navigation
    const goToPreviousSprint = useCallback(() => {
        if (currentSprintIndex > 0) {
            const newIndex = currentSprintIndex - 1;
            setCurrentSprintIndex(newIndex);
            const sprint = localSprints[newIndex];
            if (sprint) {
                setExpandedSprints(new Set([sprint.number]));
            }
        }
    }, [currentSprintIndex, localSprints]);

    const goToNextSprint = useCallback(() => {
        if (currentSprintIndex < localSprints.length - 1) {
            const newIndex = currentSprintIndex + 1;
            setCurrentSprintIndex(newIndex);
            const sprint = localSprints[newIndex];
            if (sprint) {
                setExpandedSprints(new Set([sprint.number]));
            }
        }
    }, [currentSprintIndex, localSprints]);

    const goToSprint = useCallback((index: number) => {
        if (index >= 0 && index < localSprints.length) {
            setCurrentSprintIndex(index);
            const sprint = localSprints[index];
            if (sprint) {
                setExpandedSprints(new Set([sprint.number]));
            }
        }
    }, [localSprints]);

    // Approve all sprints at once
    const approveAllSprints = useCallback(() => {
        setLocalSprints((prev) =>
            prev.map((s) => ({ ...s, isReviewed: true, isApproved: true }))
        );
        localSprints.forEach((s) => onSprintApprove?.(s.number));
    }, [localSprints, onSprintApprove]);

    // Convert sprint plan to string for RLHF prompt/response
    const sprintPlanContent = sprintPlan
        ? JSON.stringify(sprintPlan, null, 2)
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
                stepNumber: 5,
                stepName: 'Sprint Plan Generation',
                prompt: 'sprint_plan_generation',
                response: sprintPlanContent,
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
        clearDraft();
        onSprintPlanUpdate?.(localSprints);
        onApprove?.();
    };

    const isThumbsUpActive = feedbackState === 'thumbs-up' || feedbackState === 'success';
    const isThumbsDownActive = feedbackState === 'thumbs-down';
    const isLoading = feedbackState === 'loading';
    const isSuccess = feedbackState === 'success';
    const isError = feedbackState === 'error';

    // Check if all sprints are reviewed/approved
    const allSprintsReviewed = localSprints.every((s) => s.isReviewed);
    const allSprintsApproved = localSprints.every((s) => s.isApproved);
    const approvedCount = localSprints.filter((s) => s.isApproved).length;
    const totalSprints = localSprints.length;

    // Sprint statuses for pacing controls
    const sprintStatuses = useMemo(() =>
        localSprints.map((s) => ({
            isReviewed: s.isReviewed || false,
            isApproved: s.isApproved || false,
        })),
        [localSprints]
    );

    // Calculate totals
    const totalPoints = localSprints.reduce(
        (sum, sprint) =>
            sum + (sprint.issues?.reduce((s, i) => s + i.storyPoints, 0) || 0),
        0
    );
    const totalCapacity = localSprints.reduce((sum, sprint) => sum + (sprint.capacity || 40), 0);

    // Loading state
    if (isGenerating) {
        return (
            <Card className={cn('bg-[#161B22] border-gray-800', className)} data-testid="sprint-plan-loading">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-orange-400" />
                        Sprint Plan
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                        <p className="text-lg font-medium text-gray-300 mb-2">
                            AI is generating Sprint Plan...
                        </p>
                        <p className="text-sm text-gray-400">
                            Creating sprint schedule and task distribution
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // No sprint plan yet
    if (!sprintPlan) {
        return (
            <Card className={cn('bg-[#161B22] border-gray-800', className)} data-testid="sprint-plan-empty">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-orange-400" />
                        Sprint Plan
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <p className="text-gray-400">No sprint plan available yet</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Use local sprints if available, otherwise fall back to prop
    const displaySprints = localSprints.length > 0 ? localSprints : sprintPlan.sprints;

    return (
        <Card className={cn('bg-[#161B22] border-gray-800 relative', className)} data-testid="sprint-plan-review">
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
                                    aria-label="Thumbs up - Sprint plan is helpful"
                                    aria-pressed={isThumbsUpActive}
                                    data-testid="feedback-thumbs-up"
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
                                            <motion.div
                                                key="thumbs-up"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                <ThumbsUp
                                                    className={cn('h-4 w-4', isThumbsUpActive && 'fill-current')}
                                                />
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
                                <p>This sprint plan is helpful</p>
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
                                    aria-label="Thumbs down - Sprint plan needs improvement"
                                    aria-pressed={isThumbsDownActive}
                                    data-testid="feedback-thumbs-down"
                                >
                                    <AnimatePresence mode="wait">
                                        {isLoading ? (
                                            <motion.div
                                                key="loading"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="thumbs-down"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                <ThumbsDown
                                                    className={cn('h-4 w-4', isThumbsDownActive && 'fill-current')}
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>This sprint plan needs improvement</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
            </div>

            <CardHeader>
                <CardTitle className="flex items-center gap-2 pr-24">
                    <Calendar className="w-5 h-5 text-orange-400" />
                    Sprint Plan Review
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

                {/* Review Mode Toggle */}
                <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                        <Activity className="w-5 h-5 text-blue-400 mt-0.5" />
                        <div>
                            <h4 className="font-medium text-blue-300 mb-1">Review Mode</h4>
                            <p className="text-sm text-blue-300/80">
                                {reviewMode === 'paced'
                                    ? 'Review one sprint at a time with guided navigation'
                                    : 'Review all sprints at once'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant={reviewMode === 'paced' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setReviewMode('paced')}
                            className={reviewMode === 'paced' ? 'bg-primary' : 'border-gray-700'}
                            data-testid="mode-paced"
                        >
                            <User className="w-3 h-3 mr-1" />
                            At My Pace
                        </Button>
                        <Button
                            variant={reviewMode === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                                setReviewMode('all');
                                setExpandedSprints(new Set(displaySprints.map((s) => s.number)));
                            }}
                            className={reviewMode === 'all' ? 'bg-primary' : 'border-gray-700'}
                            data-testid="mode-all"
                        >
                            <CheckCheck className="w-3 h-3 mr-1" />
                            View All
                        </Button>
                    </div>
                </div>

                {/* Pacing Controls (only in paced mode) */}
                {reviewMode === 'paced' && totalSprints > 0 && (
                    <PacingControls
                        currentIndex={currentSprintIndex}
                        totalSprints={totalSprints}
                        onPrevious={goToPreviousSprint}
                        onNext={goToNextSprint}
                        onGoToSprint={goToSprint}
                        sprintStatuses={sprintStatuses}
                    />
                )}

                {/* Sprint Plan Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-vite-bg rounded-lg border border-gray-800">
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                            <Clock className="w-4 h-4" />
                            Total Duration
                        </div>
                        <div className="text-lg font-semibold text-primary">{sprintPlan.totalDuration}</div>
                    </div>

                    <div className="p-3 bg-vite-bg rounded-lg border border-gray-800">
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                            <Target className="w-4 h-4" />
                            Total Points
                        </div>
                        <div className="text-lg font-semibold text-orange-400">
                            {totalPoints} pts
                        </div>
                    </div>

                    <div className="p-3 bg-vite-bg rounded-lg border border-gray-800">
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                            <Bot className="w-4 h-4" />
                            Agent Time
                        </div>
                        <div className="text-lg font-semibold text-blue-400">
                            {sprintPlan.agentTime || '95%'}
                        </div>
                    </div>

                    <div className="p-3 bg-vite-bg rounded-lg border border-gray-800">
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                            <CheckCircle2 className="w-4 h-4" />
                            Approved
                        </div>
                        <div className="text-lg font-semibold text-green-400">
                            {approvedCount} / {totalSprints} sprints
                        </div>
                    </div>
                </div>

                {/* Overall Progress */}
                <div className="p-4 bg-vite-bg rounded-lg border border-gray-800">
                    <div className="flex items-center justify-between mb-2 text-sm">
                        <span className="text-gray-400">Sprint Review Progress</span>
                        <span className="text-gray-300">{approvedCount} of {totalSprints} approved</span>
                    </div>
                    <Progress
                        value={(approvedCount / totalSprints) * 100}
                        className="h-2"
                    />
                </div>

                {/* Agent vs Human Time Visualization */}
                <div className="p-4 bg-vite-bg rounded-lg border border-gray-800">
                    <div className="flex items-center justify-between mb-2 text-sm text-gray-400">
                        <span>Agent / Human Time Split</span>
                        <span>95% / 5%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden flex">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-full" style={{ width: '95%' }}>
                            <div className="h-full flex items-center justify-center text-xs text-white font-medium">
                                AI Agents
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-green-500 to-green-600 h-full" style={{ width: '5%' }}>
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>Automated Development</span>
                        <span>Human Review & Approval</span>
                    </div>
                </div>

                {/* Sprints List - Expandable */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                            Sprints
                        </h3>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedSprints(new Set())}
                                className="text-xs text-gray-500 hover:text-gray-300"
                            >
                                <ChevronUp className="w-3 h-3 mr-1" />
                                Collapse All
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedSprints(new Set(displaySprints.map((s) => s.number)))}
                                className="text-xs text-gray-500 hover:text-gray-300"
                            >
                                <ChevronDown className="w-3 h-3 mr-1" />
                                Expand All
                            </Button>
                        </div>
                    </div>

                    {displaySprints.map((sprint, index) => (
                        <SprintCard
                            key={sprint.number}
                            sprint={sprint}
                            totalSprints={displaySprints.length}
                            isExpanded={expandedSprints.has(sprint.number)}
                            isCurrentReview={index === currentSprintIndex}
                            reviewMode={reviewMode}
                            onToggleExpand={() => toggleSprintExpansion(sprint.number)}
                            onReviewToggle={() => handleSprintReviewToggle(sprint.number)}
                            onApprove={() => handleSprintApprove(sprint.number)}
                            onIssueMove={(issueId, direction) =>
                                handleIssueMove(issueId, sprint.number, direction)
                            }
                            onStoryPointsChange={(issueId, newPoints) =>
                                handleStoryPointsChange(issueId, sprint.number, newPoints)
                            }
                            onNotesChange={(notes) => handleSprintNotesChange(sprint.number, notes)}
                            onIssueDrop={(issueId, fromSprint) =>
                                handleIssueDrop(sprint.number, issueId, fromSprint)
                            }
                        />
                    ))}
                </div>

                {/* Notes (if any) */}
                {sprintPlan.notes && (
                    <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-sm text-blue-300">{sprintPlan.notes}</p>
                    </div>
                )}

                {/* Save Draft Section */}
                <div className="p-4 bg-vite-bg rounded-lg border border-gray-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bookmark className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-400">
                                {lastSavedAt
                                    ? `Last saved: ${new Date(lastSavedAt).toLocaleString()}`
                                    : 'No draft saved'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {lastSavedAt && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearDraft}
                                    className="text-gray-500 hover:text-red-400"
                                >
                                    <RotateCcw className="w-3 h-3 mr-1" />
                                    Clear Draft
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={saveDraft}
                                disabled={isSaving}
                                className="border-gray-700"
                                data-testid="save-draft"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                ) : (
                                    <Save className="w-3 h-3 mr-1" />
                                )}
                                Save Draft
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Bottom Feedback & Final Approval Section */}
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

                    {/* Final Review Checkbox */}
                    <label className="flex items-center gap-3 cursor-pointer group p-3 bg-vite-bg rounded-lg border border-gray-800 hover:border-gray-700 transition-colors">
                        <Checkbox
                            checked={hasReviewedAll}
                            onCheckedChange={(checked) => setHasReviewedAll(!!checked)}
                            className="border-gray-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            data-testid="final-review-checkbox"
                        />
                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                            I've reviewed the entire sprint plan and confirm the issue assignments and story points
                        </span>
                    </label>

                    {/* Warning if not all sprints approved */}
                    {!allSprintsApproved && (
                        <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-400">
                            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                            <span>
                                {approvedCount === 0
                                    ? 'Review and approve each sprint before finalizing the plan.'
                                    : `${totalSprints - approvedCount} sprint(s) still need approval.`}
                            </span>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        {/* Approve All Button */}
                        {!allSprintsApproved && (
                            <Button
                                variant="outline"
                                onClick={approveAllSprints}
                                className="flex-1 border-gray-700 hover:border-primary hover:text-primary"
                                data-testid="approve-all-sprints"
                            >
                                <CheckCheck className="w-4 h-4 mr-2" />
                                Approve All Sprints
                            </Button>
                        )}

                        {/* Final Approve Button */}
                        <Button
                            onClick={handleApprove}
                            disabled={isApproved || !hasReviewedAll || !allSprintsApproved}
                            className={cn(
                                'flex-1 transition-all duration-200',
                                isApproved
                                    ? 'bg-green-500 hover:bg-green-600'
                                    : !hasReviewedAll || !allSprintsApproved
                                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-primary to-[#FCAE39] hover:opacity-90'
                            )}
                            data-testid="finalize-sprint-plan"
                        >
                            {isApproved ? (
                                <>
                                    <CheckCircle2 className="w-5 h-5 mr-2" />
                                    Sprint Plan Approved
                                </>
                            ) : (
                                <>
                                    <Check className="w-5 h-5 mr-2" />
                                    Finalize Sprint Plan ({approvedCount}/{totalSprints} sprints approved)
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
