/**
 * SwarmLaunchConfirmation Component
 *
 * Displays a comprehensive confirmation screen before launching an Agent Swarm project.
 * Shows complete summary of project, agents, backlog, and configuration with
 * expand/collapse sections and edit navigation.
 *
 * Issue: #276
 */

'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Rocket,
    Save,
    X,
    Edit2,
    FileText,
    Users,
    ListTodo,
    Settings,
    Download,
    CheckCircle,
    AlertCircle,
    Database,
    Code,
    GitBranch,
    TestTube,
    Shield,
    FileCode,
    Calendar,
    Target,
    Layers,
    Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from '@/components/ui/accordion';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';

// Types
export interface ProjectSummary {
    name: string;
    description: string;
    targetRepo: string;
    techStack: string[];
    timeline: {
        estimatedDays: number;
        startDate: string;
    };
}

export interface AgentInfo {
    id: string;
    name: string;
    role: string;
    assignedTasks: number;
    estimatedHours: number;
    status: 'ready' | 'pending';
}

export interface BacklogSummary {
    totalIssues: number;
    byType: {
        feature: number;
        bug: number;
        chore: number;
        test: number;
    };
    storyPoints: number;
    sprints: {
        sprintNumber: number;
        issues: number;
        points: number;
    }[];
}

export interface RulesConfig {
    usingCustomRules: boolean;
    rulesFileName?: string;
    dataModelEntities: number;
    dataModelRelationships: number;
}

export interface SwarmLaunchConfirmationProps {
    isOpen: boolean;
    onClose: () => void;
    onLaunch: () => Promise<void>;
    onSaveDraft: () => void;
    onEditStep: (stepNumber: number) => void;
    projectSummary: ProjectSummary;
    agents: AgentInfo[];
    backlogSummary: BacklogSummary;
    rulesConfig: RulesConfig;
    isLaunching?: boolean;
}

// Agent icon mapping
const AGENT_ICONS: Record<string, typeof Database> = {
    architect: Database,
    frontend: Code,
    backend: Database,
    devops: GitBranch,
    qa: TestTube,
    security: Shield,
    docs: FileCode
};

// Section component with expand/collapse
interface SectionProps {
    title: string;
    icon: typeof FileText;
    children: React.ReactNode;
    onEdit?: () => void;
    editLabel?: string;
    badge?: string;
    badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

function Section({
    title,
    icon: Icon,
    children,
    onEdit,
    editLabel = 'Edit',
    badge,
    badgeVariant = 'secondary'
}: SectionProps) {
    return (
        <AccordionItem value={title} className="border-gray-800">
            <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-[#4B6FED]/20 to-[#8A63F4]/20">
                            <Icon className="h-5 w-5 text-[#8AB4FF]" />
                        </div>
                        <span className="text-lg font-semibold text-white">{title}</span>
                        {badge && (
                            <Badge variant={badgeVariant} className="ml-2">
                                {badge}
                            </Badge>
                        )}
                    </div>
                    {onEdit && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit();
                            }}
                            className="text-[#8AB4FF] hover:text-white hover:bg-[#4B6FED]/20"
                        >
                            <Edit2 className="h-4 w-4 mr-1" />
                            {editLabel}
                        </Button>
                    )}
                </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
                <div className="pl-12 pr-4">{children}</div>
            </AccordionContent>
        </AccordionItem>
    );
}

// Main component
export function SwarmLaunchConfirmation({
    isOpen,
    onClose,
    onLaunch,
    onSaveDraft,
    onEditStep,
    projectSummary,
    agents,
    backlogSummary,
    rulesConfig,
    isLaunching = false
}: SwarmLaunchConfirmationProps) {
    const [confirmed, setConfirmed] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [expandedSections, setExpandedSections] = useState<string[]>([
        'Project Summary',
        'Agent Summary',
        'Backlog Summary',
        'Rules & Configuration'
    ]);

    // Calculate totals
    const totalAgentTasks = useMemo(
        () => agents.reduce((sum, agent) => sum + agent.assignedTasks, 0),
        [agents]
    );

    const totalEstimatedHours = useMemo(
        () => agents.reduce((sum, agent) => sum + agent.estimatedHours, 0),
        [agents]
    );

    const handleLaunch = async () => {
        if (!confirmed) return;
        await onLaunch();
        // Navigation will be handled by the parent after successful launch
    };

    const handleCancel = () => {
        setShowCancelDialog(true);
    };

    const confirmCancel = () => {
        setShowCancelDialog(false);
        onClose();
    };

    const handleDownloadSummary = () => {
        const summary = generateMarkdownSummary(
            projectSummary,
            agents,
            backlogSummary,
            rulesConfig
        );

        const blob = new Blob([summary], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectSummary.name.toLowerCase().replace(/\s+/g, '-')}-launch-summary.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-vite-bg border-gray-800 text-white">
                    <DialogHeader className="pb-4 border-b border-gray-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-[#4B6FED] to-[#8A63F4]">
                                    <Rocket className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-bold text-white">
                                        Launch Confirmation
                                    </DialogTitle>
                                    <DialogDescription className="text-gray-400">
                                        Review your project configuration before launching the Agent
                                        Swarm
                                    </DialogDescription>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDownloadSummary}
                                className="text-[#8AB4FF] hover:text-white hover:bg-[#4B6FED]/20"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download Summary
                            </Button>
                        </div>
                    </DialogHeader>

                    {/* Scrollable content area */}
                    <div className="overflow-y-auto max-h-[calc(90vh-280px)] pr-2">
                        <Accordion
                            type="multiple"
                            value={expandedSections}
                            onValueChange={setExpandedSections}
                            className="space-y-2"
                        >
                            {/* Project Summary Section */}
                            <Section
                                title="Project Summary"
                                icon={FileText}
                                onEdit={() => onEditStep(0)}
                                editLabel="Edit Project"
                            >
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-gray-400 text-sm">
                                                Project Name
                                            </Label>
                                            <p className="text-white font-medium">
                                                {projectSummary.name}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-gray-400 text-sm">
                                                Target Repository
                                            </Label>
                                            <p className="text-white font-medium flex items-center gap-2">
                                                <GitBranch className="h-4 w-4 text-[#8AB4FF]" />
                                                {projectSummary.targetRepo}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-gray-400 text-sm">Description</Label>
                                        <p className="text-gray-300 text-sm mt-1">
                                            {projectSummary.description}
                                        </p>
                                    </div>

                                    <div>
                                        <Label className="text-gray-400 text-sm">Tech Stack</Label>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {projectSummary.techStack.map((tech) => (
                                                <Badge
                                                    key={tech}
                                                    variant="outline"
                                                    className="border-[#4B6FED]/40 text-[#8AB4FF]"
                                                >
                                                    {tech}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-[#8AB4FF]" />
                                            <div>
                                                <Label className="text-gray-400 text-sm">
                                                    Estimated Duration
                                                </Label>
                                                <p className="text-white font-medium">
                                                    {projectSummary.timeline.estimatedDays} days
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-[#8AB4FF]" />
                                            <div>
                                                <Label className="text-gray-400 text-sm">
                                                    Start Date
                                                </Label>
                                                <p className="text-white font-medium">
                                                    {new Date(
                                                        projectSummary.timeline.startDate
                                                    ).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Section>

                            {/* Agent Summary Section */}
                            <Section
                                title="Agent Summary"
                                icon={Users}
                                badge={`${agents.length} Agents`}
                                onEdit={() => onEditStep(5)}
                                editLabel="Edit Agents"
                            >
                                <div className="space-y-4">
                                    {/* Agent Overview Stats */}
                                    <div className="grid grid-cols-3 gap-4 p-4 bg-[#161B22] rounded-lg border border-gray-800">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-[#8AB4FF]">
                                                {agents.length}
                                            </p>
                                            <p className="text-sm text-gray-400">Active Agents</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-[#8AB4FF]">
                                                {totalAgentTasks}
                                            </p>
                                            <p className="text-sm text-gray-400">Total Tasks</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-[#8AB4FF]">
                                                ~{Math.round(totalEstimatedHours)}h
                                            </p>
                                            <p className="text-sm text-gray-400">Est. Runtime</p>
                                        </div>
                                    </div>

                                    {/* Agent List */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {agents.map((agent) => {
                                            const IconComponent =
                                                AGENT_ICONS[agent.id] || Users;
                                            return (
                                                <div
                                                    key={agent.id}
                                                    className="p-3 bg-[#161B22] rounded-lg border border-gray-800 flex items-center gap-3"
                                                >
                                                    <div className="p-2 rounded-lg bg-gradient-to-br from-[#4B6FED]/20 to-[#8A63F4]/20">
                                                        <IconComponent className="h-5 w-5 text-[#8AB4FF]" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white font-medium truncate">
                                                            {agent.name}
                                                        </p>
                                                        <p className="text-sm text-gray-400 truncate">
                                                            {agent.role}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium text-[#8AB4FF]">
                                                            {agent.assignedTasks} tasks
                                                        </p>
                                                        <Badge
                                                            variant={
                                                                agent.status === 'ready'
                                                                    ? 'default'
                                                                    : 'secondary'
                                                            }
                                                            className={
                                                                agent.status === 'ready'
                                                                    ? 'bg-green-500/20 text-green-400 border-green-500/40'
                                                                    : ''
                                                            }
                                                        >
                                                            {agent.status === 'ready' ? (
                                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                            ) : null}
                                                            {agent.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </Section>

                            {/* Backlog Summary Section */}
                            <Section
                                title="Backlog Summary"
                                icon={ListTodo}
                                badge={`${backlogSummary.storyPoints} points`}
                                onEdit={() => onEditStep(4)}
                                editLabel="Edit Backlog"
                            >
                                <div className="space-y-4">
                                    {/* Issue Type Breakdown */}
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="p-3 bg-[#161B22] rounded-lg border border-gray-800 text-center">
                                            <p className="text-xl font-bold text-green-400">
                                                {backlogSummary.byType.feature}
                                            </p>
                                            <p className="text-sm text-gray-400">Features</p>
                                        </div>
                                        <div className="p-3 bg-[#161B22] rounded-lg border border-gray-800 text-center">
                                            <p className="text-xl font-bold text-red-400">
                                                {backlogSummary.byType.bug}
                                            </p>
                                            <p className="text-sm text-gray-400">Bugs</p>
                                        </div>
                                        <div className="p-3 bg-[#161B22] rounded-lg border border-gray-800 text-center">
                                            <p className="text-xl font-bold text-yellow-400">
                                                {backlogSummary.byType.chore}
                                            </p>
                                            <p className="text-sm text-gray-400">Chores</p>
                                        </div>
                                        <div className="p-3 bg-[#161B22] rounded-lg border border-gray-800 text-center">
                                            <p className="text-xl font-bold text-blue-400">
                                                {backlogSummary.byType.test}
                                            </p>
                                            <p className="text-sm text-gray-400">Tests</p>
                                        </div>
                                    </div>

                                    {/* Total Stats */}
                                    <div className="flex items-center justify-between p-4 bg-[#161B22] rounded-lg border border-gray-800">
                                        <div className="flex items-center gap-2">
                                            <Target className="h-5 w-5 text-[#8AB4FF]" />
                                            <span className="text-gray-400">Total Issues:</span>
                                            <span className="text-white font-bold">
                                                {backlogSummary.totalIssues}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Layers className="h-5 w-5 text-[#8AB4FF]" />
                                            <span className="text-gray-400">Story Points:</span>
                                            <span className="text-white font-bold">
                                                {backlogSummary.storyPoints}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Sprint Breakdown */}
                                    <div>
                                        <Label className="text-gray-400 text-sm mb-2 block">
                                            Sprint Breakdown
                                        </Label>
                                        <div className="space-y-2">
                                            {backlogSummary.sprints.map((sprint) => (
                                                <div
                                                    key={sprint.sprintNumber}
                                                    className="flex items-center justify-between p-3 bg-[#161B22] rounded-lg border border-gray-800"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-[#8AB4FF]" />
                                                        <span className="text-white font-medium">
                                                            Sprint {sprint.sprintNumber}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-sm text-gray-400">
                                                            {sprint.issues} issues
                                                        </span>
                                                        <Badge
                                                            variant="outline"
                                                            className="border-[#4B6FED]/40 text-[#8AB4FF]"
                                                        >
                                                            {sprint.points} pts
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Section>

                            {/* Rules & Configuration Section */}
                            <Section
                                title="Rules & Configuration"
                                icon={Settings}
                                badge={
                                    rulesConfig.usingCustomRules
                                        ? 'Custom Rules'
                                        : 'AINative Defaults'
                                }
                                badgeVariant={
                                    rulesConfig.usingCustomRules ? 'default' : 'secondary'
                                }
                                onEdit={() => onEditStep(1)}
                                editLabel="Edit Rules"
                            >
                                <div className="space-y-4">
                                    {/* Rules Status */}
                                    <div className="flex items-center gap-3 p-4 bg-[#161B22] rounded-lg border border-gray-800">
                                        {rulesConfig.usingCustomRules ? (
                                            <>
                                                <CheckCircle className="h-5 w-5 text-green-400" />
                                                <div>
                                                    <p className="text-white font-medium">
                                                        Custom Rules Applied
                                                    </p>
                                                    <p className="text-sm text-gray-400">
                                                        File: {rulesConfig.rulesFileName}
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="h-5 w-5 text-yellow-400" />
                                                <div>
                                                    <p className="text-white font-medium">
                                                        Using AINative Default Rules
                                                    </p>
                                                    <p className="text-sm text-gray-400">
                                                        Standard coding conventions and best practices
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Data Model Summary */}
                                    <div>
                                        <Label className="text-gray-400 text-sm mb-2 block">
                                            Data Model Summary
                                        </Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-[#161B22] rounded-lg border border-gray-800 flex items-center gap-3">
                                                <Database className="h-5 w-5 text-[#8AB4FF]" />
                                                <div>
                                                    <p className="text-white font-medium">
                                                        {rulesConfig.dataModelEntities} Entities
                                                    </p>
                                                    <p className="text-sm text-gray-400">
                                                        Database tables
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="p-3 bg-[#161B22] rounded-lg border border-gray-800 flex items-center gap-3">
                                                <GitBranch className="h-5 w-5 text-[#8AB4FF]" />
                                                <div>
                                                    <p className="text-white font-medium">
                                                        {rulesConfig.dataModelRelationships}{' '}
                                                        Relationships
                                                    </p>
                                                    <p className="text-sm text-gray-400">
                                                        Foreign keys
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Section>
                        </Accordion>
                    </div>

                    {/* Footer with actions */}
                    <DialogFooter className="pt-4 border-t border-gray-800 flex-col gap-4">
                        {/* Confirmation Checkbox */}
                        <div className="flex items-center gap-3 w-full p-4 bg-[#161B22] rounded-lg border border-gray-800">
                            <Checkbox
                                id="confirm-launch"
                                checked={confirmed}
                                onCheckedChange={(checked) => setConfirmed(checked as boolean)}
                                className="border-[#4B6FED] data-[state=checked]:bg-[#4B6FED]"
                                data-testid="confirm-launch-checkbox"
                            />
                            <Label
                                htmlFor="confirm-launch"
                                className="text-sm text-gray-300 cursor-pointer flex-1"
                            >
                                I have reviewed and approve this plan. I understand that launching
                                the swarm will begin automated development work.
                            </Label>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={handleCancel}
                                    className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
                                    data-testid="cancel-button"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={onSaveDraft}
                                    className="border-[#4B6FED]/40 text-[#8AB4FF] hover:text-white hover:bg-[#4B6FED]/20"
                                    data-testid="save-draft-button"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Draft
                                </Button>
                            </div>

                            <Button
                                onClick={handleLaunch}
                                disabled={!confirmed || isLaunching}
                                className="bg-gradient-to-r from-[#4B6FED] to-[#8A63F4] hover:from-[#3A56D3] hover:to-[#7A4FEB] text-white px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                                data-testid="launch-swarm-button"
                            >
                                {isLaunching ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{
                                                duration: 1,
                                                repeat: Infinity,
                                                ease: 'linear'
                                            }}
                                            className="mr-2"
                                        >
                                            <Rocket className="h-5 w-5" />
                                        </motion.div>
                                        Launching...
                                    </>
                                ) : (
                                    <>
                                        <Rocket className="h-5 w-5 mr-2" />
                                        Launch Swarm
                                    </>
                                )}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Confirmation Dialog */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent className="max-w-md bg-vite-bg border-gray-800 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-white">Cancel Launch?</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Are you sure you want to cancel? Your progress will not be saved unless
                            you click &ldquo;Save Draft&rdquo; first.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowCancelDialog(false)}
                            className="border-gray-700 text-gray-300"
                        >
                            Go Back
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmCancel}
                            className="bg-red-600 hover:bg-red-700"
                            data-testid="confirm-cancel-button"
                        >
                            Yes, Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

// Helper function to generate markdown summary
function generateMarkdownSummary(
    project: ProjectSummary,
    agents: AgentInfo[],
    backlog: BacklogSummary,
    rules: RulesConfig
): string {
    const totalTasks = agents.reduce((sum, a) => sum + a.assignedTasks, 0);

    return `# Agent Swarm Launch Summary

## Project Overview
- **Name:** ${project.name}
- **Description:** ${project.description}
- **Target Repository:** ${project.targetRepo}
- **Tech Stack:** ${project.techStack.join(', ')}
- **Estimated Duration:** ${project.timeline.estimatedDays} days
- **Start Date:** ${new Date(project.timeline.startDate).toLocaleDateString()}

## Agent Team (${agents.length} Agents)
| Agent | Role | Tasks | Status |
|-------|------|-------|--------|
${agents.map((a) => `| ${a.name} | ${a.role} | ${a.assignedTasks} | ${a.status} |`).join('\n')}

**Total Tasks:** ${totalTasks}

## Backlog Summary
- **Total Issues:** ${backlog.totalIssues}
- **Story Points:** ${backlog.storyPoints}

### By Type
- Features: ${backlog.byType.feature}
- Bugs: ${backlog.byType.bug}
- Chores: ${backlog.byType.chore}
- Tests: ${backlog.byType.test}

### Sprint Breakdown
${backlog.sprints.map((s) => `- Sprint ${s.sprintNumber}: ${s.issues} issues (${s.points} points)`).join('\n')}

## Configuration
- **Rules:** ${rules.usingCustomRules ? `Custom (${rules.rulesFileName})` : 'AINative Defaults'}
- **Data Model Entities:** ${rules.dataModelEntities}
- **Data Model Relationships:** ${rules.dataModelRelationships}

---
*Generated by AINative Studio*
`;
}

export default SwarmLaunchConfirmation;
