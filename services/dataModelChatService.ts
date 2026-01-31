/**
 * Data Model Chat Service
 *
 * Service for interacting with AI to edit and refine data models.
 * Integrates with ZeroDB for semantic search and model versioning.
 */

import apiClient from '@/utils/apiClient';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    metadata?: {
        modelChanges?: DataModelChange[];
        suggestions?: string[];
    };
}

export interface DataModelChange {
    type: 'add_field' | 'remove_field' | 'add_entity' | 'remove_entity' | 'modify_field' | 'add_relationship';
    entityName: string;
    fieldName?: string;
    fieldType?: string;
    description?: string;
    isVectorField?: boolean;
}

export interface DataModelEntity {
    name: string;
    fields: (DataModelField | string)[];
    description?: string;
    vectorFields?: string[];
}

export interface DataModelField {
    name: string;
    type: string;
    isRequired?: boolean;
    isUnique?: boolean;
    isVector?: boolean;
    vectorDimensions?: number;
    description?: string;
}

export interface DataModel {
    entities: DataModelEntity[];
    relationships?: string[];
    notes?: string;
    version?: number;
    zerodbConfig?: {
        enableVectorSearch: boolean;
        defaultVectorDimensions: number;
        indexType: 'hnsw' | 'ivf' | 'flat';
    };
}

export interface ChatRequest {
    message: string;
    currentDataModel: DataModel;
    conversationHistory: ChatMessage[];
    projectId: string;
}

export interface ChatResponse {
    message: ChatMessage;
    updatedDataModel?: DataModel;
    success: boolean;
    error?: string;
}

class DataModelChatService {
    private baseUrl = '/v1/public';

    /**
     * Send a chat message about the data model
     */
    async sendMessage(request: ChatRequest): Promise<ChatResponse> {
        try {
            const response = await apiClient.post(
                `${this.baseUrl}/agent-swarms/data-model/chat`,
                {
                    message: request.message,
                    current_data_model: this.transformToApiFormat(request.currentDataModel),
                    conversation_history: request.conversationHistory.map(msg => ({
                        role: msg.role,
                        content: msg.content,
                    })),
                    project_id: request.projectId,
                }
            );

            const data = response.data as any;

            return {
                message: {
                    id: data.message_id || crypto.randomUUID(),
                    role: 'assistant',
                    content: data.response || data.message,
                    timestamp: new Date().toISOString(),
                    metadata: {
                        modelChanges: data.changes,
                        suggestions: data.suggestions,
                    },
                },
                updatedDataModel: data.updated_data_model
                    ? this.transformFromApiFormat(data.updated_data_model)
                    : undefined,
                success: true,
            };
        } catch (error: any) {
            console.error('Failed to send data model chat message:', error);

            // Return a fallback response for demo/offline mode
            return this.generateFallbackResponse(request);
        }
    }

    /**
     * Generate a fallback response when API is unavailable
     * This allows the UI to work in demo mode
     */
    private generateFallbackResponse(request: ChatRequest): ChatResponse {
        const userMessage = request.message.toLowerCase();
        let responseContent = '';
        let updatedModel: DataModel | undefined;

        // Parse common requests
        if (userMessage.includes('add') && userMessage.includes('field')) {
            const fieldMatch = userMessage.match(/add\s+(?:a\s+)?(\w+)\s+field\s+(?:to\s+)?(\w+)/i);
            if (fieldMatch) {
                const [, fieldName, entityName] = fieldMatch;
                responseContent = `I'll add a "${fieldName}" field to the ${entityName} entity. Here's the updated model with the new field.`;

                updatedModel = this.addFieldToModel(
                    request.currentDataModel,
                    entityName,
                    fieldName,
                    'string'
                );
            } else {
                responseContent = 'I can help you add a field. Please specify the field name and which entity it should be added to. For example: "Add a timestamp field to User"';
            }
        } else if (userMessage.includes('add') && userMessage.includes('vector')) {
            const entityMatch = userMessage.match(/vector\s+(?:field\s+)?(?:to\s+)?(\w+)/i);
            if (entityMatch) {
                const entityName = entityMatch[1];
                responseContent = `I'll add a vector embedding field to ${entityName} for ZeroDB semantic search. This enables AI-powered similarity queries on this entity.`;

                updatedModel = this.addVectorFieldToModel(
                    request.currentDataModel,
                    entityName
                );
            } else {
                responseContent = 'I can add vector embedding fields for ZeroDB integration. Please specify which entity should have vector search enabled.';
            }
        } else if (userMessage.includes('add') && userMessage.includes('entity')) {
            const entityMatch = userMessage.match(/add\s+(?:a\s+)?(?:new\s+)?entity\s+(?:called\s+)?(\w+)/i);
            if (entityMatch) {
                const entityName = entityMatch[1];
                responseContent = `I'll create a new "${entityName}" entity with basic fields. You can then customize it by adding more fields.`;

                updatedModel = this.addEntityToModel(request.currentDataModel, entityName);
            } else {
                responseContent = 'I can add a new entity to your data model. Please specify the entity name. For example: "Add a new entity called Comment"';
            }
        } else if (userMessage.includes('remove') || userMessage.includes('delete')) {
            responseContent = 'I can help you remove fields or entities. Please be specific about what you want to remove. For example: "Remove the age field from User"';
        } else if (userMessage.includes('zerodb') || userMessage.includes('vector search')) {
            responseContent = `Your data model can be enhanced for ZeroDB with these recommendations:

1. **Vector Fields**: Add embedding fields to entities that need semantic search (like content, descriptions, or user-generated text).

2. **Index Configuration**: I recommend using HNSW indexing for fast approximate nearest neighbor search.

3. **Dimension Size**: For most use cases, 384 or 768 dimensions work well with models like BGE or OpenAI embeddings.

Would you like me to add vector fields to specific entities?`;
        } else {
            responseContent = `I can help you modify this data model. Here are some things I can do:

- **Add fields**: "Add a timestamp field to User"
- **Add vector fields**: "Add vector embedding to Product for semantic search"
- **Add entities**: "Add a new entity called Review"
- **Remove elements**: "Remove the age field from User"
- **ZeroDB optimization**: "Make this model ZeroDB-friendly"

What would you like to change?`;
        }

        return {
            message: {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: responseContent,
                timestamp: new Date().toISOString(),
            },
            updatedDataModel: updatedModel,
            success: true,
        };
    }

    /**
     * Add a field to an entity in the data model
     */
    private addFieldToModel(
        model: DataModel,
        entityName: string,
        fieldName: string,
        fieldType: string
    ): DataModel {
        const updatedEntities = model.entities.map(entity => {
            if (entity.name.toLowerCase() === entityName.toLowerCase()) {
                const existingFields = entity.fields.map(f =>
                    typeof f === 'string' ? f : `${f.name}: ${f.type}`
                );
                return {
                    ...entity,
                    fields: [...existingFields, `${fieldName}: ${fieldType}`] as any,
                };
            }
            return entity;
        });

        return {
            ...model,
            entities: updatedEntities,
            version: (model.version || 1) + 1,
        };
    }

    /**
     * Add a vector embedding field to an entity
     */
    private addVectorFieldToModel(model: DataModel, entityName: string): DataModel {
        const updatedEntities = model.entities.map(entity => {
            if (entity.name.toLowerCase() === entityName.toLowerCase()) {
                const existingFields = entity.fields.map(f =>
                    typeof f === 'string' ? f : `${f.name}: ${f.type}`
                );
                return {
                    ...entity,
                    fields: [...existingFields, 'embedding: vector(384)'] as any,
                    vectorFields: [...(entity.vectorFields || []), 'embedding'],
                };
            }
            return entity;
        });

        return {
            ...model,
            entities: updatedEntities,
            version: (model.version || 1) + 1,
            zerodbConfig: {
                enableVectorSearch: true,
                defaultVectorDimensions: 384,
                indexType: 'hnsw',
            },
        };
    }

    /**
     * Add a new entity to the data model
     */
    private addEntityToModel(model: DataModel, entityName: string): DataModel {
        const newEntity: DataModelEntity = {
            name: entityName,
            fields: [
                { name: 'id', type: 'uuid', isRequired: true, isUnique: true },
                { name: 'created_at', type: 'timestamp', isRequired: true },
                { name: 'updated_at', type: 'timestamp', isRequired: true },
            ] as any,
            description: `${entityName} entity`,
        };

        return {
            ...model,
            entities: [...model.entities, newEntity],
            version: (model.version || 1) + 1,
        };
    }

    /**
     * Transform frontend data model to API format
     */
    private transformToApiFormat(model: DataModel): any {
        return {
            entities: model.entities.map(entity => ({
                name: entity.name,
                fields: entity.fields,
                description: entity.description,
                vector_fields: entity.vectorFields,
            })),
            relationships: model.relationships,
            notes: model.notes,
            version: model.version,
            zerodb_config: model.zerodbConfig,
        };
    }

    /**
     * Transform API response to frontend data model format
     */
    private transformFromApiFormat(apiModel: any): DataModel {
        return {
            entities: (apiModel.entities || []).map((entity: any) => ({
                name: entity.name,
                fields: entity.fields,
                description: entity.description,
                vectorFields: entity.vector_fields,
            })),
            relationships: apiModel.relationships,
            notes: apiModel.notes,
            version: apiModel.version,
            zerodbConfig: apiModel.zerodb_config
                ? {
                    enableVectorSearch: apiModel.zerodb_config.enable_vector_search,
                    defaultVectorDimensions: apiModel.zerodb_config.default_vector_dimensions,
                    indexType: apiModel.zerodb_config.index_type,
                }
                : undefined,
        };
    }

    /**
     * Store conversation in ZeroDB for context
     */
    async storeConversation(
        projectId: string,
        messages: ChatMessage[]
    ): Promise<void> {
        try {
            await apiClient.post(
                `${this.baseUrl}/${projectId}/database/memory`,
                {
                    content: JSON.stringify(messages),
                    role: 'system',
                    metadata: {
                        type: 'data_model_chat',
                        message_count: messages.length,
                    },
                }
            );
        } catch (error) {
            console.error('Failed to store conversation:', error);
        }
    }

    /**
     * Generate ZeroDB-optimized schema from data model
     */
    async generateZeroDBSchema(
        projectId: string,
        model: DataModel
    ): Promise<{ sql: string; vectorConfig: any }> {
        try {
            const response = await apiClient.post(
                `${this.baseUrl}/agent-swarms/data-model/zerodb-schema`,
                {
                    data_model: this.transformToApiFormat(model),
                    project_id: projectId,
                }
            );

            return response.data as { sql: string; vectorConfig: any };
        } catch (error) {
            console.error('Failed to generate ZeroDB schema:', error);

            // Return a basic schema as fallback
            return {
                sql: this.generateBasicSQL(model),
                vectorConfig: model.zerodbConfig || {
                    enableVectorSearch: false,
                    defaultVectorDimensions: 384,
                    indexType: 'hnsw',
                },
            };
        }
    }

    /**
     * Generate basic SQL from data model
     */
    private generateBasicSQL(model: DataModel): string {
        return model.entities
            .map(entity => {
                const fields = entity.fields
                    .map(f => {
                        if (typeof f === 'string') {
                            return `  ${f}`;
                        }
                        return `  ${f.name} ${f.type.toUpperCase()}${f.isRequired ? ' NOT NULL' : ''}${f.isUnique ? ' UNIQUE' : ''}`;
                    })
                    .join(',\n');

                return `CREATE TABLE ${entity.name.toLowerCase()} (\n${fields}\n);`;
            })
            .join('\n\n');
    }
}

export const dataModelChatService = new DataModelChatService();
export default dataModelChatService;
