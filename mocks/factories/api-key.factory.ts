/**
 * API Key Mock Data Factory
 */
export interface APIKey {
  id: string;
  key: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

export class APIKeyFactory {
  static createAPIKey(overrides?: Partial<APIKey>): APIKey {
    return {
      id: 'key_123456',
      key: 'sk_test_abcdef123456',
      name: 'Test API Key',
      created_at: new Date().toISOString(),
      last_used_at: new Date().toISOString(),
      is_active: true,
      ...overrides,
    };
  }

  static createAPIKeyList(count: number = 3): APIKey[] {
    const keys: APIKey[] = [];
    for (let i = 0; i < count; i++) {
      keys.push(
        APIKeyFactory.createAPIKey({
          id: 'key_' + (i + 1),
          name: 'API Key ' + (i + 1),
        })
      );
    }
    return keys;
  }
}
