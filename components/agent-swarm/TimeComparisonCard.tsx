'use client';

import { motion } from 'framer-motion';
import { Clock, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TimeComparisonCardProps {
    singleAgentTime: string;
    agentSwarmTime: string;
    timeSavings: string;
    savingsPercentage: number;
    className?: string;
}

export default function TimeComparisonCard({
    singleAgentTime,
    agentSwarmTime,
    timeSavings,
    savingsPercentage,
    className
}: TimeComparisonCardProps) {
    // Calculate progress bar widths (single agent = 100%, swarm = inverse of percentage saved)
    const singleAgentWidth = 100;
    const agentSwarmWidth = 100 - savingsPercentage;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={cn('w-full', className)}
        >
            <Card className="bg-[#161B22] border-gray-800 overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        Performance Comparison
                    </CardTitle>
                    <p className="text-sm text-gray-400 mt-2">
                        Agent Swarm is {savingsPercentage}% faster than single agent
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Single Agent Time */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-300">Single Agent</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-400">{singleAgentTime}</span>
                        </div>
                        <div className="relative w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${singleAgentWidth}%` }}
                                transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                            />
                        </div>
                    </div>

                    {/* Agent Swarm Time */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium text-gray-300">Agent Swarm</span>
                            </div>
                            <span className="text-sm font-semibold text-primary">{agentSwarmTime}</span>
                        </div>
                        <div className="relative w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${agentSwarmWidth}%` }}
                                transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-cyan-500 rounded-full"
                            />
                        </div>
                    </div>

                    {/* Time Savings Display */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 mb-0.5">Time Saved</p>
                                    <p className="text-lg font-bold text-green-400">{timeSavings}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <motion.div
                                    initial={{ scale: 1 }}
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 0.5, delay: 0.8 }}
                                    className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
                                >
                                    {savingsPercentage}%
                                </motion.div>
                                <p className="text-xs text-gray-400">faster</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Visual Comparison Stats */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="p-3 bg-vite-bg rounded-lg border border-gray-800">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock className="w-3.5 h-3.5 text-gray-500" />
                                <p className="text-xs text-gray-500">Traditional</p>
                            </div>
                            <p className="text-lg font-semibold text-gray-400">{singleAgentTime}</p>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-primary/10 to-cyan-500/10 rounded-lg border border-primary/30">
                            <div className="flex items-center gap-2 mb-1">
                                <Zap className="w-3.5 h-3.5 text-primary" />
                                <p className="text-xs text-primary">Swarm Mode</p>
                            </div>
                            <p className="text-lg font-semibold text-primary">{agentSwarmTime}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
