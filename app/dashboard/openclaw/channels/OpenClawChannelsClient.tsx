'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAgentList } from '@/hooks/useOpenClawAgents';
import { MOCK_CHANNELS } from '@/lib/openclaw-mock-data';
import AgentPicker from '@/components/openclaw/AgentPicker';
import ChannelRow from '@/components/openclaw/ChannelRow';

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' },
  }),
};

export default function OpenClawChannelsClient() {
  const { data } = useAgentList();
  const agents = data?.agents ?? [];
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>(
    agents[0]?.id
  );

  // Update selection when agents load
  if (agents.length > 0 && !selectedAgentId) {
    setSelectedAgentId(agents[0].id);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-2xl font-bold text-gray-900">Channels</h1>
        <p className="text-sm text-gray-500 mt-1">
          Connect messaging platforms to your agents
        </p>
      </motion.div>

      {/* Agent picker */}
      <motion.div
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <AgentPicker
          agents={agents}
          selectedId={selectedAgentId}
          onSelect={setSelectedAgentId}
        />
      </motion.div>

      {/* Channels card */}
      <motion.div
        custom={2}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="rounded-lg border border-gray-200 bg-white"
      >
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Channels</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Connect messaging platforms
          </p>
        </div>

        <div className="px-5">
          {MOCK_CHANNELS.map((channel) => (
            <ChannelRow
              key={channel.id}
              channel={channel}
              onConnect={() => {
                // Connection logic would go here
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
