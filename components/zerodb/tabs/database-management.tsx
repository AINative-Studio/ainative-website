import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import { AlertCircle, Database, Plus, Trash2, Edit, Eye, BarChart } from 'lucide-react';
import { Alert, AlertDescription } from '../../ui/alert';
import { toast } from 'sonner';

import { 
  DatabaseService, 
  type Collection, 
  type Table, 
  type PostgresProvisionResponse,
  type CollectionCreateRequest,
  type TableCreateRequest 
} from '../../../services/zerodb';

interface DatabaseManagementProps {
  className?: string;
}

export const DatabaseManagement: React.FC<DatabaseManagementProps> = ({ className }) => {
  const [selectedTab, setSelectedTab] = useState('postgres');
  const [isProvisionDialogOpen, setIsProvisionDialogOpen] = useState(false);
  const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false);
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const queryClient = useQueryClient();

  // Queries
  const { data: databases = [], isLoading: isLoadingDatabases } = useQuery({
    queryKey: ['databases'],
    queryFn: () => DatabaseService.getPostgresDatabases(),
  });

  const { data: collections = [], isLoading: isLoadingCollections } = useQuery({
    queryKey: ['collections'],
    queryFn: () => DatabaseService.getCollections(),
  });

  const { data: tables = [], isLoading: isLoadingTables } = useQuery({
    queryKey: ['tables'],
    queryFn: () => DatabaseService.getTables(),
  });

  const { data: stats } = useQuery({
    queryKey: ['database-stats'],
    queryFn: () => DatabaseService.getDatabaseStats(),
  });

  // Mutations
  const provisionMutation = useMutation({
    mutationFn: DatabaseService.provisionPostgres,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['databases'] });
      setIsProvisionDialogOpen(false);
      toast.success('PostgreSQL database provisioned successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to provision database: ${error.message}`);
    },
  });

  const deleteDatabaseMutation = useMutation({
    mutationFn: DatabaseService.deletePostgresDatabase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['databases'] });
      toast.success('Database deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete database: ${error.message}`);
    },
  });

  const createCollectionMutation = useMutation({
    mutationFn: DatabaseService.createCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      setIsCollectionDialogOpen(false);
      toast.success('Collection created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create collection: ${error.message}`);
    },
  });

  const deleteCollectionMutation = useMutation({
    mutationFn: DatabaseService.deleteCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success('Collection deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete collection: ${error.message}`);
    },
  });

  const createTableMutation = useMutation({
    mutationFn: DatabaseService.createTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      setIsTableDialogOpen(false);
      toast.success('Table created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create table: ${error.message}`);
    },
  });

  const deleteTableMutation = useMutation({
    mutationFn: DatabaseService.deleteTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Table deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete table: ${error.message}`);
    },
  });

  // Form handlers
  const handleProvisionDatabase = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    provisionMutation.mutate({
      database_name: formData.get('database_name') as string,
      user: formData.get('user') as string || undefined,
      password: formData.get('password') as string || undefined,
      host: formData.get('host') as string || undefined,
      port: formData.get('port') ? parseInt(formData.get('port') as string) : undefined,
    });
  };

  const handleCreateCollection = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const schemaText = formData.get('schema') as string;
    let schema = {};
    try {
      if (schemaText.trim()) {
        schema = JSON.parse(schemaText);
      }
    } catch (error) {
      toast.error('Invalid JSON schema');
      return;
    }

    createCollectionMutation.mutate({
      name: formData.get('name') as string,
      database_id: formData.get('database_id') as string || undefined,
      schema,
      metadata: {},
    });
  };

  const handleCreateTable = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const schemaText = formData.get('schema') as string;
    let schema = {};
    try {
      if (schemaText.trim()) {
        schema = JSON.parse(schemaText);
      }
    } catch (error) {
      toast.error('Invalid JSON schema');
      return;
    }

    createTableMutation.mutate({
      name: formData.get('name') as string,
      collection_id: formData.get('collection_id') as string,
      schema,
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center p-6">
              <Database className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Databases</p>
                <p className="text-2xl font-bold">{stats.total_databases}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <BarChart className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Collections</p>
                <p className="text-2xl font-bold">{stats.total_collections}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <BarChart className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tables</p>
                <p className="text-2xl font-bold">{stats.total_tables}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <BarChart className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Storage (MB)</p>
                <p className="text-2xl font-bold">{stats.storage_used_mb}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="postgres">PostgreSQL</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
        </TabsList>

        {/* PostgreSQL Databases */}
        <TabsContent value="postgres" className="space-y-4">
          <>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">PostgreSQL Databases</h3>
              {databases.length === 0 ? (
                <Button onClick={() => setIsProvisionDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Provision Database
                </Button>
              ) : (
                <div className="text-sm text-muted-foreground flex items-center">
                  <span>One PostgreSQL instance per project</span>
                  <Button variant="outline" size="sm" className="ml-3" disabled>
                    <Plus className="w-4 h-4 mr-1" />
                    Scale Up (Coming Soon)
                  </Button>
                </div>
              )}
            </div>

            {/* Provision Dialog - Only show when no databases exist */}
            {databases.length === 0 && (
              <Dialog open={isProvisionDialogOpen} onOpenChange={setIsProvisionDialogOpen}>
                <DialogTrigger asChild>
                  <Button style={{display: 'none'}}>Hidden Trigger</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Provision PostgreSQL Database</DialogTitle>
                    <DialogDescription>
                      Create a new PostgreSQL database instance
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleProvisionDatabase} className="space-y-4">
                    <div>
                      <Label htmlFor="database_name">Database Name *</Label>
                      <Input id="database_name" name="database_name" required />
                    </div>
                    <div>
                      <Label htmlFor="user">User (optional)</Label>
                      <Input id="user" name="user" />
                    </div>
                    <div>
                      <Label htmlFor="password">Password (optional)</Label>
                      <Input id="password" name="password" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="host">Host (optional)</Label>
                      <Input id="host" name="host" placeholder="localhost" />
                    </div>
                    <div>
                      <Label htmlFor="port">Port (optional)</Label>
                      <Input id="port" name="port" type="number" placeholder="5432" />
                    </div>
                    <Button type="submit" disabled={provisionMutation.isPending}>
                      {provisionMutation.isPending ? 'Provisioning...' : 'Provision Database'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </>

          <div className="grid gap-4">
            {isLoadingDatabases ? (
              <div>Loading databases...</div>
            ) : databases.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No PostgreSQL databases found. Create your first database to get started.
                </AlertDescription>
              </Alert>
            ) : (
              databases.map((db: PostgresProvisionResponse, index: number) => (
                <Card key={db.id || `db-${index}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">PostgreSQL Database ({db.instance_size || 'hobby'})</CardTitle>
                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span>PostgreSQL {db.postgres_version || '15'}</span>
                            <span>•</span>
                            <span>Status:</span>
                            <Badge variant={db.status === 'active' ? 'default' : 'secondary'}>{db.status || 'Unknown'}</Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteDatabaseMutation.mutate(db.id)}
                        disabled={deleteDatabaseMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">CPU Usage</p>
                          <p className="text-lg">{(db.cpu_usage_percent || 0).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Memory Usage</p>
                          <p className="text-lg">{(db.memory_usage_percent || 0).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Storage</p>
                          <p className="text-lg">{(db.storage_usage_gb || 0).toFixed(2)} GB</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Monthly Cost</p>
                          <p className="text-lg">${(db.monthly_cost_usd || 0).toFixed(2)}</p>
                        </div>
                      </div>
                      <p><strong>Created:</strong> {db.created_at ? new Date(db.created_at).toLocaleString() : 'Unknown'}</p>
                      {db.error_message && (
                        <div>
                          {db.error_message.toLowerCase().includes('completed successfully') || 
                           db.error_message.toLowerCase().includes('restart initiated') ||
                           db.error_message.toLowerCase().includes('provisioning') ||
                           db.status === 'active' ? (
                            <p className="text-green-600"><strong>Status:</strong> {db.error_message}</p>
                          ) : (
                            <p className="text-red-600"><strong>Error:</strong> {db.error_message}</p>
                          )}
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            DatabaseService.getPostgresConnectionDetails()
                              .then((details) => {
                                navigator.clipboard.writeText(details.connection_string);
                                toast.success('Connection string copied to clipboard');
                              })
                              .catch((error) => {
                                toast.error(error.message);
                              });
                          }}
                        >
                          Copy Connection String
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => {
                            DatabaseService.restartPostgresDatabase()
                              .then((result) => {
                                toast.success(result.message || 'PostgreSQL restart initiated');
                                // Refresh the databases list to show new status
                                queryClient.invalidateQueries({ queryKey: ['databases'] });
                              })
                              .catch((error) => {
                                toast.error(error.message);
                              });
                          }}
                        >
                          Restart Instance
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Collections */}
        <TabsContent value="collections" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Collections</h3>
            <Dialog open={isCollectionDialogOpen} onOpenChange={setIsCollectionDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Collection
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Collection</DialogTitle>
                  <DialogDescription>
                    Create a new data collection
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateCollection} className="space-y-4">
                  <div>
                    <Label htmlFor="collection_name">Name *</Label>
                    <Input id="collection_name" name="name" required />
                  </div>
                  <div>
                    <Label htmlFor="database_id">Database (optional)</Label>
                    <Select name="database_id">
                      <SelectTrigger>
                        <SelectValue placeholder="Select database" />
                      </SelectTrigger>
                      <SelectContent>
                        {databases.map((db: PostgresProvisionResponse, index: number) => (
                          <SelectItem key={db.database_id || `db-select-${index}`} value={db.database_id}>
                            {db.database_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="schema">Schema (JSON, optional)</Label>
                    <Textarea 
                      id="schema" 
                      name="schema" 
                      placeholder='{"type": "object", "properties": {...}}'
                      rows={4}
                    />
                  </div>
                  <Button type="submit" disabled={createCollectionMutation.isPending}>
                    {createCollectionMutation.isPending ? 'Creating...' : 'Create Collection'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {isLoadingCollections ? (
              <div>Loading collections...</div>
            ) : collections.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No collections found. Create your first collection to organize your data.
                </AlertDescription>
              </Alert>
            ) : (
              collections.map((collection: Collection, index: number) => (
                <Card key={collection.id || `collection-${index}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{collection.name}</CardTitle>
                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span>Schema v{collection.schema_version}</span>
                            <span>•</span>
                            <span>Status:</span>
                            <Badge variant={collection.status === 'active' ? 'default' : 'secondary'}>{collection.status}</Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteCollectionMutation.mutate(collection.id)}
                        disabled={deleteCollectionMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p><strong>ID:</strong> <code className="text-sm">{collection.id}</code></p>
                      <p><strong>Database ID:</strong> <code className="text-sm">{collection.database_id}</code></p>
                      <p><strong>Created:</strong> {new Date(collection.created_at).toLocaleString()}</p>
                      <p><strong>Updated:</strong> {new Date(collection.updated_at).toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Tables */}
        <TabsContent value="tables" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Tables</h3>
            <Dialog open={isTableDialogOpen} onOpenChange={setIsTableDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Table
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Table</DialogTitle>
                  <DialogDescription>
                    Create a new table in a collection
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateTable} className="space-y-4">
                  <div>
                    <Label htmlFor="table_name">Name *</Label>
                    <Input id="table_name" name="name" required />
                  </div>
                  <div>
                    <Label htmlFor="collection_id">Collection *</Label>
                    <Select name="collection_id" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select collection" />
                      </SelectTrigger>
                      <SelectContent>
                        {collections.map((collection: Collection, index: number) => (
                          <SelectItem key={collection.id || `collection-select-${index}`} value={collection.id}>
                            {collection.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="table_schema">Schema (JSON) *</Label>
                    <Textarea 
                      id="table_schema" 
                      name="schema" 
                      placeholder='{"columns": [{"name": "id", "type": "integer", "primary": true}, {"name": "name", "type": "varchar", "length": 255}]}'
                      rows={6}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={createTableMutation.isPending}>
                    {createTableMutation.isPending ? 'Creating...' : 'Create Table'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {isLoadingTables ? (
              <div>Loading tables...</div>
            ) : tables.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No tables found. Create your first table to store structured data.
                </AlertDescription>
              </Alert>
            ) : (
              tables.map((table: Table, index: number) => (
                <Card key={table.id || `table-${index}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{table.name}</CardTitle>
                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span>{table.row_count} rows</span>
                            <span>•</span>
                            <span>Status:</span>
                            <Badge variant={table.status === 'active' ? 'default' : 'secondary'}>{table.status}</Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteTableMutation.mutate(table.id)}
                        disabled={deleteTableMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p><strong>ID:</strong> <code className="text-sm">{table.id}</code></p>
                      <p><strong>Collection ID:</strong> <code className="text-sm">{table.collection_id}</code></p>
                      <p><strong>Created:</strong> {new Date(table.created_at).toLocaleString()}</p>
                      <p><strong>Updated:</strong> {new Date(table.updated_at).toLocaleString()}</p>
                      <details className="mt-2">
                        <summary className="cursor-pointer font-medium">Schema</summary>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
                          {JSON.stringify(table.schema, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};