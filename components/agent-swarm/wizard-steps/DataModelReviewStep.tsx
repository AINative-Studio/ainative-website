'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  Table,
  Link,
  Key,
  ChevronDown,
  ChevronRight,
  Loader2,
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  Box,
  GitBranch,
  Hash,
  List,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  agentSwarmAIService,
  DataModel,
} from '@/lib/agent-swarm-wizard-service';

// Extended types to match actual API response structure
interface CollectionMetadataSchema {
  [fieldName: string]: string;
}

interface VectorFieldConfig {
  dimension: number;
  metric: string;
  index_type?: string;
  index_params?: Record<string, number>;
}

interface CollectionVectorConfig {
  enabled: boolean;
  dimension: number;
  metric: string;
  fields?: Record<string, VectorFieldConfig>;
}

interface CollectionDefinitionExtended {
  name: string;
  description?: string;
  metadata_schema?: CollectionMetadataSchema;
  vector_fields?: string[];
  vector_config?: CollectionVectorConfig;
  indexes?: Array<{
    name: string;
    type: string;
    field?: string;
    parameters?: Record<string, unknown>;
  }>;
}

interface RelationshipFieldDefinition {
  type: string;
  target_collection: string;
  target_field: string;
  cascade_delete?: boolean;
  indexed?: boolean;
  virtual?: boolean;
}

interface IndexDefinitionExtended {
  name: string;
  fields: string[];
  type: string;
  unique: boolean;
}

interface DataModelReviewStepProps {
  projectId: string;
  prdContent: string;
  onComplete: (dataModel: DataModel) => void;
  onBack: () => void;
}

// App template display names and colors
const APP_TEMPLATE_INFO: Record<string, { label: string; color: string }> = {
  ecommerce: { label: 'E-Commerce', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  social_network: { label: 'Social Network', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  task_management: { label: 'Task Management', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  content_management: { label: 'Content Management', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  custom: { label: 'Custom', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
};

export default function DataModelReviewStep({
  projectId,
  prdContent,
  onComplete,
  onBack,
}: DataModelReviewStepProps) {
  const [dataModel, setDataModel] = useState<DataModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['collections']));
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());

  const generateDataModel = async (isRegenerate = false) => {
    if (isRegenerate) {
      setIsRegenerating(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await agentSwarmAIService.generateDataModel(projectId, prdContent);
      setDataModel(response.data_model);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate data model';
      setError(errorMessage);
      console.error('Data model generation error:', err);
    } finally {
      setIsLoading(false);
      setIsRegenerating(false);
    }
  };

  useEffect(() => {
    generateDataModel();
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const toggleTable = (tableName: string) => {
    setExpandedTables((prev) => {
      const next = new Set(prev);
      if (next.has(tableName)) {
        next.delete(tableName);
      } else {
        next.add(tableName);
      }
      return next;
    });
  };

  const handleContinue = () => {
    if (dataModel) {
      onComplete(dataModel);
    }
  };

  // Helper functions to count nested structures
  const countRelationships = () => {
    const relationships = dataModel?.relationships as Record<string, Record<string, RelationshipFieldDefinition>> | undefined;
    if (!relationships) return 0;
    let count = 0;
    Object.values(relationships).forEach((fields) => {
      count += Object.keys(fields).length;
    });
    return count;
  };

  const countIndexes = () => {
    const indexes = dataModel?.indexes as Record<string, IndexDefinitionExtended[]> | undefined;
    if (!indexes) return 0;
    let count = 0;
    Object.values(indexes).forEach((indexArray) => {
      if (Array.isArray(indexArray)) {
        count += indexArray.length;
      }
    });
    return count;
  };

  const renderLoadingState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-5xl mx-auto"
    >
      <Card className="bg-[#161B22] border-[#2D333B]">
        <CardContent className="py-16 flex flex-col items-center justify-center">
          <Loader2 className="h-16 w-16 text-[#8AB4FF] animate-spin mb-6" />
          <h3 className="text-xl font-semibold text-white mb-2">Generating Data Model...</h3>
          <p className="text-gray-400 text-center max-w-md mb-4">
            Our AI is analyzing your PRD and creating a comprehensive database schema.
          </p>
          <Alert className="bg-[#4B6FED]/10 border-[#4B6FED]/30 max-w-md">
            <AlertDescription className="text-gray-300 text-sm">
              This may take 10-30 seconds. We're designing tables, relationships, indexes, and vector collections.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderErrorState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-5xl mx-auto"
    >
      <Card className="bg-[#161B22] border-[#2D333B]">
        <CardContent className="py-16 space-y-6">
          <Alert className="bg-red-500/10 border-red-500/30">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <AlertTitle className="text-red-400">Generation Failed</AlertTitle>
            <AlertDescription className="text-gray-300">{error}</AlertDescription>
          </Alert>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => generateDataModel()}
              className="bg-[#4B6FED] hover:bg-[#3A56D3]"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Retry
            </Button>
            <Button onClick={onBack} variant="outline" className="border-[#2D333B] text-gray-300">
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderFieldTypeBadge = (fieldType: string) => {
    const typeColors: Record<string, string> = {
      string: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      text: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      integer: 'bg-green-500/20 text-green-400 border-green-500/30',
      float: 'bg-green-500/20 text-green-400 border-green-500/30',
      boolean: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      timestamp: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      json: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      array: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    };
    return (
      <Badge className={`font-mono text-xs ${typeColors[fieldType] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
        {fieldType}
      </Badge>
    );
  };

  const renderCollections = () => {
    // Use collections from the API response (not tables, since ZeroDB is NoSQL)
    const collections = dataModel?.collections as Record<string, CollectionDefinitionExtended> | undefined;

    if (!collections || Object.keys(collections).length === 0) {
      return (
        <p className="text-gray-400 text-sm">No collections defined in the data model.</p>
      );
    }

    return (
      <div className="space-y-3">
        {Object.entries(collections).map(([collectionName, collectionData]) => {
          const metadataSchema = collectionData?.metadata_schema || {};
          const fields = Object.entries(metadataSchema);
          const vectorFields = collectionData?.vector_fields || [];

          return (
            <motion.div
              key={collectionName}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-[#0D1117] border-[#2D333B]">
                <Collapsible
                  open={expandedTables.has(collectionName)}
                  onOpenChange={() => toggleTable(collectionName)}
                >
                  <CollapsibleTrigger className="w-full">
                    <div className="p-4 flex items-center justify-between hover:bg-[#161B22] transition-colors">
                      <div className="flex items-center gap-3">
                        {expandedTables.has(collectionName) ? (
                          <ChevronDown className="h-5 w-5 text-[#8AB4FF]" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-[#8AB4FF]" />
                        )}
                        <Database className="h-5 w-5 text-[#8AB4FF]" />
                        <span className="text-white font-semibold font-mono">{collectionName}</span>
                        <Badge className="bg-[#4B6FED]/20 text-[#8AB4FF] border-[#4B6FED]/30">
                          {fields.length} fields
                        </Badge>
                        {vectorFields.length > 0 && (
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                            {vectorFields.length} vector fields
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-2">
                      {collectionData?.description && (
                        <p className="text-gray-400 text-sm mb-3">{collectionData.description}</p>
                      )}
                      {fields.map(([fieldName, fieldType]) => (
                        <div
                          key={fieldName}
                          className="flex items-center justify-between p-3 bg-[#161B22] border border-[#2D333B] rounded-md"
                        >
                          <div className="flex items-center gap-3">
                            <Hash className="h-4 w-4 text-gray-500" />
                            <span className="text-white font-mono">{fieldName}</span>
                            {fieldName.endsWith('_id') && (
                              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                                <Key className="mr-1 h-3 w-3" />
                                ID
                              </Badge>
                            )}
                          </div>
                          {renderFieldTypeBadge(fieldType)}
                        </div>
                      ))}
                      {vectorFields.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[#2D333B]">
                          <p className="text-gray-400 text-xs mb-2">Vector Fields:</p>
                          <div className="flex flex-wrap gap-2">
                            {vectorFields.map((vf) => (
                              <Badge key={vf} className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                <Box className="mr-1 h-3 w-3" />
                                {vf}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderVectorCollections = () => {
    const vectorCollections = dataModel?.vector_collections as Record<string, CollectionDefinitionExtended> | undefined;

    if (!vectorCollections || Object.keys(vectorCollections).length === 0) {
      return (
        <p className="text-gray-400 text-sm">No vector collections defined.</p>
      );
    }

    return (
      <div className="space-y-3">
        {Object.entries(vectorCollections).map(([collectionName, collectionData]) => {
          const vectorConfig = collectionData?.vector_config;
          const vectorFields = collectionData?.vector_fields || [];
          const dimension = vectorConfig?.dimension;
          const metric = vectorConfig?.metric;

          return (
            <Card key={collectionName} className="bg-[#0D1117] border-[#2D333B]">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Box className="h-5 w-5 text-[#8AB4FF]" />
                  <span className="text-white font-semibold font-mono">{collectionName}</span>
                  {vectorConfig?.enabled && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                      Enabled
                    </Badge>
                  )}
                </div>
                {collectionData?.description && (
                  <p className="text-gray-400 text-sm mb-3">{collectionData.description}</p>
                )}
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  {dimension && (
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      {dimension}D
                    </Badge>
                  )}
                  {metric && (
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {metric.toUpperCase()}
                    </Badge>
                  )}
                </div>
                {vectorFields.length > 0 && (
                  <div className="border-t border-[#2D333B] pt-3">
                    <p className="text-gray-400 text-xs mb-2">Embedding Fields:</p>
                    <div className="flex flex-wrap gap-2">
                      {vectorFields.map((field) => (
                        <Badge key={field} className="bg-[#4B6FED]/20 text-[#8AB4FF] border-[#4B6FED]/30 font-mono text-xs">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderRelationships = () => {
    const relationships = dataModel?.relationships as Record<string, Record<string, RelationshipFieldDefinition>> | undefined;

    if (!relationships || Object.keys(relationships).length === 0) {
      return (
        <p className="text-gray-400 text-sm">No relationships defined.</p>
      );
    }

    // Flatten the nested structure for display
    const flattenedRelationships: Array<{
      sourceCollection: string;
      fieldName: string;
      type: string;
      targetCollection: string;
      targetField: string;
      indexed?: boolean;
      virtual?: boolean;
    }> = [];

    Object.entries(relationships).forEach(([sourceCollection, fields]) => {
      Object.entries(fields).forEach(([fieldName, relDef]) => {
        flattenedRelationships.push({
          sourceCollection,
          fieldName,
          type: relDef.type,
          targetCollection: relDef.target_collection,
          targetField: relDef.target_field,
          indexed: relDef.indexed,
          virtual: relDef.virtual,
        });
      });
    });

    const relationshipTypeColors: Record<string, string> = {
      belongs_to: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      has_many: 'bg-green-500/20 text-green-400 border-green-500/30',
      has_one: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    };

    return (
      <div className="space-y-3">
        {flattenedRelationships.map((rel, index) => (
          <Card key={`${rel.sourceCollection}-${rel.fieldName}-${index}`} className="bg-[#0D1117] border-[#2D333B]">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <GitBranch className="h-5 w-5 text-[#8AB4FF]" />
                <span className="text-white font-mono">{rel.sourceCollection}</span>
                <span className="text-gray-500">.</span>
                <span className="text-[#8AB4FF] font-mono">{rel.fieldName}</span>
              </div>
              <div className="flex items-center gap-3 text-sm flex-wrap">
                <Badge className={relationshipTypeColors[rel.type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}>
                  {rel.type.replace(/_/g, ' ')}
                </Badge>
                <span className="text-gray-400">→</span>
                <span className="text-gray-300 font-mono">{rel.targetCollection}.{rel.targetField}</span>
                {rel.indexed && (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                    Indexed
                  </Badge>
                )}
                {rel.virtual && (
                  <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs">
                    Virtual
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderIndexes = () => {
    const indexes = dataModel?.indexes as Record<string, IndexDefinitionExtended[]> | undefined;

    if (!indexes || Object.keys(indexes).length === 0) {
      return (
        <p className="text-gray-400 text-sm">No indexes defined.</p>
      );
    }

    // Flatten indexes with collection name for display
    const flattenedIndexes: Array<{
      collection: string;
      name: string;
      fields: string[];
      type: string;
      unique: boolean;
    }> = [];

    Object.entries(indexes).forEach(([collection, indexArray]) => {
      if (Array.isArray(indexArray)) {
        indexArray.forEach((idx) => {
          flattenedIndexes.push({
            collection,
            name: idx.name,
            fields: idx.fields || [],
            type: idx.type,
            unique: idx.unique,
          });
        });
      }
    });

    const indexTypeColors: Record<string, string> = {
      btree: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      gin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      hnsw: 'bg-green-500/20 text-green-400 border-green-500/30',
    };

    return (
      <div className="space-y-3">
        {flattenedIndexes.map((idx, index) => (
          <Card key={`${idx.collection}-${idx.name}-${index}`} className="bg-[#0D1117] border-[#2D333B]">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <List className="h-5 w-5 text-[#8AB4FF]" />
                <span className="text-white font-medium font-mono">{idx.name}</span>
                <Badge className={indexTypeColors[idx.type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}>
                  {idx.type.toUpperCase()}
                </Badge>
                {idx.unique && (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                    UNIQUE
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <span className="text-gray-400">Collection:</span>
                <span className="text-gray-300 font-mono">{idx.collection}</span>
                <span className="text-gray-400 ml-2">Fields:</span>
                <div className="flex gap-2 flex-wrap">
                  {idx.fields.map((field, fieldIdx) => (
                    <Badge key={fieldIdx} className="bg-[#4B6FED]/20 text-[#8AB4FF] border-[#4B6FED]/30 font-mono text-xs">
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderSection = (
    id: string,
    title: string,
    icon: React.ReactNode,
    content: React.ReactNode,
    count?: number
  ) => (
    <Card className="bg-[#0D1117] border-[#2D333B]">
      <Collapsible
        open={expandedSections.has(id)}
        onOpenChange={() => toggleSection(id)}
      >
        <CollapsibleTrigger className="w-full">
          <div className="p-4 flex items-center justify-between hover:bg-[#161B22] transition-colors">
            <div className="flex items-center gap-3">
              {expandedSections.has(id) ? (
                <ChevronDown className="h-5 w-5 text-[#8AB4FF]" />
              ) : (
                <ChevronRight className="h-5 w-5 text-[#8AB4FF]" />
              )}
              {icon}
              <span className="text-white font-semibold text-lg">{title}</span>
              {count !== undefined && (
                <Badge className="bg-[#4B6FED]/20 text-[#8AB4FF] border-[#4B6FED]/30">
                  {count}
                </Badge>
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4">{content}</div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );

  if (isLoading) {
    return renderLoadingState();
  }

  if (error || !dataModel) {
    return renderErrorState();
  }

  const templateInfo = APP_TEMPLATE_INFO[dataModel.app_template] || APP_TEMPLATE_INFO.custom;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-5xl mx-auto"
    >
      <Card className="bg-[#161B22] border-[#2D333B]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#4B6FED]/10">
                <Database className="h-6 w-6 text-[#8AB4FF]" />
              </div>
              <div>
                <CardTitle className="text-2xl text-white">Review Data Model</CardTitle>
                <CardDescription className="text-gray-400 mt-1">
                  AI-generated database schema based on your PRD
                </CardDescription>
              </div>
            </div>
            <Badge className={templateInfo.color}>
              {templateInfo.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Data Model Sections */}
          <div className="space-y-4">
            {renderSection(
              'collections',
              'Collections',
              <Database className="h-5 w-5 text-[#8AB4FF]" />,
              renderCollections(),
              Object.keys(dataModel.collections || {}).length
            )}

            {renderSection(
              'vectors',
              'Vector Collections',
              <Box className="h-5 w-5 text-[#8AB4FF]" />,
              renderVectorCollections(),
              Object.keys(dataModel.vector_collections || {}).length
            )}

            {renderSection(
              'relationships',
              'Relationships',
              <GitBranch className="h-5 w-5 text-[#8AB4FF]" />,
              renderRelationships(),
              countRelationships()
            )}

            {renderSection(
              'indexes',
              'Indexes',
              <List className="h-5 w-5 text-[#8AB4FF]" />,
              renderIndexes(),
              countIndexes()
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[#2D333B]">
            <div className="flex gap-3">
              <Button
                onClick={onBack}
                variant="outline"
                className="border-[#2D333B] text-gray-300 hover:bg-[#0D1117]"
              >
                Back
              </Button>
              <Button
                onClick={() => generateDataModel(true)}
                disabled={isRegenerating}
                variant="outline"
                className="border-[#2D333B] text-[#8AB4FF] hover:bg-[#0D1117]"
              >
                {isRegenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Regenerate
                  </>
                )}
              </Button>
            </div>
            <Button
              onClick={handleContinue}
              className="bg-gradient-to-r from-[#4B6FED] to-[#8A63F4] hover:from-[#3A56D3] hover:to-[#7A4FEB]"
              size="lg"
            >
              Approve & Continue
              <CheckCircle2 className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
