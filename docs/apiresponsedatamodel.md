{
  "database_type": "zerodb",
  "app_template": "ecommerce",
  "schema": {
    "database_name": "generated_project",
    "database_type": "zerodb",
    "description": "AI-powered Generated Project e-commerce platform built on ZeroDB",
    "collections": {
      "products": {
        "name": "products",
        "description": "Product catalog with AI features",
        "vector_fields": [
          "description_embedding",
          "features_embedding",
          "category_embedding"
        ],
        "metadata_schema": {
          "product_id": "string",
          "name": "string",
          "description": "text",
          "category": "string",
          "price": "float",
          "currency": "string",
          "sku": "string",
          "inventory": "integer",
          "status": "string",
          "images": "array",
          "tags": "array",
          "created_at": "timestamp",
          "updated_at": "timestamp"
        },
        "vector_config": {
          "enabled": true,
          "dimension": 1536,
          "metric": "cosine",
          "fields": {
            "description_embedding": {
              "dimension": 1536,
              "metric": "cosine",
              "index_type": "hnsw",
              "index_params": {
                "ef_construct": 128,
                "m": 16
              }
            },
            "features_embedding": {
              "dimension": 1536,
              "metric": "cosine",
              "index_type": "hnsw",
              "index_params": {
                "ef_construct": 128,
                "m": 16
              }
            },
            "category_embedding": {
              "dimension": 1536,
              "metric": "cosine",
              "index_type": "hnsw",
              "index_params": {
                "ef_construct": 128,
                "m": 16
              }
            }
          }
        },
        "indexes": [
          {
            "name": "idx_vector_description_embedding",
            "type": "hnsw",
            "field": "description_embedding",
            "parameters": {
              "ef_construct": 128,
              "m": 16,
              "metric": "cosine"
            }
          },
          {
            "name": "idx_vector_features_embedding",
            "type": "hnsw",
            "field": "features_embedding",
            "parameters": {
              "ef_construct": 128,
              "m": 16,
              "metric": "cosine"
            }
          },
          {
            "name": "idx_vector_category_embedding",
            "type": "hnsw",
            "field": "category_embedding",
            "parameters": {
              "ef_construct": 128,
              "m": 16,
              "metric": "cosine"
            }
          }
        ],
        "validation_rules": {
          "product_id": [
            {
              "type": "string",
              "min_length": 1,
              "max_length": 255
            }
          ],
          "name": [
            {
              "type": "string",
              "min_length": 1,
              "max_length": 255
            }
          ],
          "description": [
            {
              "type": "string",
              "min_length": 1,
              "max_length": 10000
            }
          ],
          "category": [
            {
              "type": "string",
              "min_length": 1,
              "max_length": 255
            }
          ],
          "price": [
            {
              "type": "number",
              "minimum": 0
            }
          ],
          "currency": [
            {
              "type": "string",
              "min_length": 1,
              "max_length": 255
            }
          ],
          "sku": [
            {
              "type": "string",
              "min_length": 1,
              "max_length": 255
            }
          ],
          "inventory": [
            {
              "type": "integer",
              "minimum": 0
            }
          ],
          "status": [
            {
              "type": "string",
              "min_length": 1,
              "max_length": 255
            }
          ],
          "images": [
            {
              "type": "array",
              "max_items": 100
            }
          ],
          "tags": [
            {
              "type": "array",
              "max_items": 100
            }
          ],
          "created_at": [
            {
              "type": "string",
              "format": "date-time"
            }
          ],
          "updated_at": [
            {
              "type": "string",
              "format": "date-time"
            }
          ]
        },
        "access_patterns": []
      },
      "customers": {
        "name": "customers",
        "description": "Customer profiles and preferences",
        "vector_fields": [
          "preferences_embedding",
          "behavior_embedding"
        ],
        "metadata_schema": {
          "customer_id": "string",
          "email": "string",
          "name": "string",
          "phone": "string",
          "addresses": "json",
          "preferences": "json",
          "lifetime_value": "float",
          "created_at": "timestamp",
          "last_purchase": "timestamp"
        },
        "vector_config": {
          "enabled": true,
          "dimension": 1536,
          "metric": "cosine",
          "fields": {
            "preferences_embedding": {
              "dimension": 1536,
              "metric": "cosine",
              "index_type": "hnsw",
              "index_params": {
                "ef_construct": 128,
                "m": 16
              }
            },
            "behavior_embedding": {
              "dimension": 1536,
              "metric": "cosine",
              "index_type": "hnsw",
              "index_params": {
                "ef_construct": 128,
                "m": 16
              }
            }
          }
        },
        "indexes": [
          {
            "name": "idx_vector_preferences_embedding",
            "type": "hnsw",
            "field": "preferences_embedding",
            "parameters": {
              "ef_construct": 128,
              "m": 16,
              "metric": "cosine"
            }
          },
          {
            "name": "idx_vector_behavior_embedding",
            "type": "hnsw",
            "field": "behavior_embedding",
            "parameters": {
              "ef_construct": 128,
              "m": 16,
              "metric": "cosine"
            }
          }
        ],
        "validation_rules": {
          "customer_id": [
            {
              "type": "string",
              "min_length": 1,
              "max_length": 255
            }
          ],
          "email": [
            {
              "type": "string",
              "min_length": 1,
              "max_length": 255
            },
            {
              "format": "email"
            }
          ],
          "name": [
            {
              "type": "string",
              "min_length": 1,
              "max_length": 255
            }
          ],
          "phone": [
            {
              "type": "string",
              "min_length": 1,
              "max_length": 255
            },
            {
              "pattern": "^\\+?[1-9]\\d{1,14}$"
            }
          ],
          "addresses": [
            {
              "type": "object"
            }
          ],
          "preferences": [
            {
              "type": "object"
            }
          ],
          "lifetime_value": [
            {
              "type": "number",
              "minimum": 0
            }
          ],
          "created_at": [
            {
              "type": "string",
              "format": "date-time"
            }
          ],
          "last_purchase": [
            {
              "type": "string",
              "format": "date-time"
            }
          ]
        },
        "access_patterns": []
      },
      "orders": {
        "name": "orders",
        "description": "Order history and tracking",
        "vector_fields": [
          "items_embedding",
          "notes_embedding"
        ],
        "metadata_schema": {
          "order_id": "string",
          "customer_id": "string",
          "status": "string",
          "total_amount": "float",
          "currency": "string",
          "items": "json",
          "shipping_address": "json",
          "payment_method": "string",
          "tracking_number": "string",
          "created_at": "timestamp",
          "shipped_at": "timestamp",
          "delivered_at": "timestamp"
        },
        "vector_config": {
          "enabled": true,
          "dimension": 1536,
          "metric": "cosine",
          "fields": {
            "items_embedding": {
              "dimension": 1536,
              "metric": "cosine",
              "index_type": "hnsw",
              "index_params": {
                "ef_construct": 128,
                "m": 16
              }
            },
            "notes_embedding": {
              "dimension": 1536,
              "metric": "cosine",
              "index_type": "hnsw",
              "index_params": {
                "ef_construct": 128,
                "m": 16
              }
            }
          }
        },
        "indexes": [
          {
            "name": "idx_vector_items_embedding",
            "type": "hnsw",
            "field": "items_embedding",
            "parameters": {
              "ef_construct": 128,
              "m": 16,
              "metric": "cosine"
            }
          },
          {
            "name": "idx_vector_notes_embedding",
            "type": "hnsw",
            "field": "notes_embedding",
            "parameters": {
              "ef_construct": 128,
              "m": 16,
              "metric": "cosine"
            }
          }
        ],
        "validation_rules": {
          "order_id": [
            {
              "type": "string",
              "min_length": 1,
              "max_length": 255
            }
          ],
          "customer_id": [
            {
              "type": "string",
              "min_length": 1,
              "max_length": 255
            }
          ],
          "status": [
            {
              "type": "string",
              "min_length": 1,
              "max_length": 255
            }
          ],
          "total_amount": [
            {
              "type": "number",
              "minimum": 0
            }
          ],
          "currency": [
            {
              "type": "string",
              "min_length": 1,
              "max_length": 255
            }
          ],
          "items": [
            {
              "type": "object"
            }
          ],
          "shipping_address": [
            {
              "type": "object"
            }
          ],
          "payment_method": [
            {
              "type": "string",
              "min_length": 1,
              "max_length": 255
            }
          ],
          "tracking_number": [
            {
              "type": "string",
              "min_length": 1,
              "max_length": 255
            }
          ],
          "created_at": [
            {
              "type": "string",
              "format": "date-time"
            }
          ],
          "shipped_at": [
            {
              "type": "string",
              "format": "date-time"
            }
          ],
          "delivered_at": [
            {
              "type": "string",
              "format": "date-time"
            }
          ]
        },
        "access_patterns": [
          {
            "name": "user_orders",
            "query": {
              "user_id": "?"
            },
            "frequency": "high"
          },
          {
            "name": "recent_orders",
            "sort": {
              "created_at": -1
            },
            "frequency": "medium"
          },
          {
            "name": "pending_orders",
            "query": {
              "status": "pending"
            },
            "frequency": "medium"
          }
        ]
      },
      "reviews": {
        "name": "reviews",
        "description": "Product reviews and ratings",
        "vector_fields": [
          "review_embedding",
          "sentiment_embedding"
        ],
        "metadata_schema": {
          "review_id": "string",
          "product_id": "string",
          "customer_id": "string",
          "rating": "integer",
          "title": "string",
          "content": "text",
          "sentiment": "string",
          "verified_purchase": "boolean",
          "helpful_votes": "integer",
          "created_at": "timestamp"
        },
        "vector_config": {
          "enabled": true,
          "dimension": 1536,
          "metric": "cosine",
          "fields": {
            "review_embedding": {
              "dimension": 1536,
              "metric": "cosine",
              "index_type": "hnsw",
              "index_params": {
                "ef_construct": 128,
                "m": 16
              }
            },
            "sentiment_embedding": {
              "dimension": 1536,
              "metric": "cosine",
              "index_type": "hnsw",
              "index_params": {
                "ef_construct": 128,
                "m": 16
              }
            }
          }
        },
        "indexes": [
          {
            "name": "idx_vector_review_embedding",
            "type": "hnsw",
            "field": "review_embedding",
            "parameters": {
              "ef_construct": 128,
              "m": 16,
              "metric": "cosine"
            }
          },
          {
            "name": "idx_vector_sentiment_embedding",
            "type": "hnsw",
            "field": "sentiment_embedding",
            "parameters": {
              "ef_construct": 128,
              "m": 16,
              "metric": "cosine"
            }
          }
        ],
        "validation_rules": {
          "review_id": [
            {
              "type": "string",
              "min_length": 1,
              "max_length": 255
            }
          ],
          "product_id": [
            {
              "type": "string",
              "min_length": 1,
              "max_length": 255
            }
          ],
          "customer_id": [
            {
              "type": "string",
              "min_length": 1,
              "max_length": 255
            }
          ],
          "rating": [
            {
              "type": "integer",
              "minimum": 0
            }
          ],
          "title": [
            {
              "type": "string",
              "min_length": 1,
              "max_length": 255
            }
          ],
          "content": [
            {
              "type": "string",
              "min_length": 1,
              "max_length": 10000
            }
          ],
          "sentiment": [
            {
              "type": "string",
              "min_length": 1,
              "max_length": 255
            }
          ],
          "verified_purchase": [
            {
              "type": "boolean"
            }
          ],
          "helpful_votes": [
            {
              "type": "integer",
              "minimum": 0
            }
          ],
          "created_at": [
            {
              "type": "string",
              "format": "date-time"
            }
          ]
        },
        "access_patterns": []
      }
    },
    "relationships": {
      "products": {
        "product_id": {
          "type": "belongs_to",
          "target_collection": "products",
          "target_field": "product_id",
          "cascade_delete": false,
          "indexed": true
        },
        "products_ids": {
          "type": "has_many",
          "target_collection": "products",
          "target_field": "product_id",
          "virtual": true
        },
        "reviews_ids": {
          "type": "has_many",
          "target_collection": "reviews",
          "target_field": "product_id",
          "virtual": true
        }
      },
      "customers": {
        "customer_id": {
          "type": "belongs_to",
          "target_collection": "customers",
          "target_field": "customer_id",
          "cascade_delete": false,
          "indexed": true
        },
        "customers_ids": {
          "type": "has_many",
          "target_collection": "customers",
          "target_field": "customer_id",
          "virtual": true
        },
        "orders_ids": {
          "type": "has_many",
          "target_collection": "orders",
          "target_field": "customer_id",
          "virtual": true
        },
        "reviews_ids": {
          "type": "has_many",
          "target_collection": "reviews",
          "target_field": "customer_id",
          "virtual": true
        }
      },
      "orders": {
        "order_id": {
          "type": "belongs_to",
          "target_collection": "orders",
          "target_field": "order_id",
          "cascade_delete": false,
          "indexed": true
        },
        "customer_id": {
          "type": "belongs_to",
          "target_collection": "customers",
          "target_field": "customer_id",
          "cascade_delete": false,
          "indexed": true
        },
        "orders_ids": {
          "type": "has_many",
          "target_collection": "orders",
          "target_field": "order_id",
          "virtual": true
        }
      },
      "reviews": {
        "review_id": {
          "type": "belongs_to",
          "target_collection": "reviews",
          "target_field": "review_id",
          "cascade_delete": false,
          "indexed": true
        },
        "product_id": {
          "type": "belongs_to",
          "target_collection": "products",
          "target_field": "product_id",
          "cascade_delete": false,
          "indexed": true
        },
        "customer_id": {
          "type": "belongs_to",
          "target_collection": "customers",
          "target_field": "customer_id",
          "cascade_delete": false,
          "indexed": true
        },
        "reviews_ids": {
          "type": "has_many",
          "target_collection": "reviews",
          "target_field": "review_id",
          "virtual": true
        }
      }
    },
    "indexes": {
      "products": [
        {
          "name": "idx_products_product_id",
          "fields": [
            "product_id"
          ],
          "type": "btree",
          "unique": true
        },
        {
          "name": "idx_products_category",
          "fields": [
            "category"
          ],
          "type": "btree",
          "unique": false
        },
        {
          "name": "idx_products_status",
          "fields": [
            "status"
          ],
          "type": "btree",
          "unique": false
        },
        {
          "name": "idx_products_created_at",
          "fields": [
            "created_at"
          ],
          "type": "btree",
          "unique": false
        },
        {
          "name": "idx_products_updated_at",
          "fields": [
            "updated_at"
          ],
          "type": "btree",
          "unique": false
        },
        {
          "name": "idx_products_fulltext",
          "fields": [
            "product_id",
            "name",
            "description"
          ],
          "type": "gin",
          "unique": false
        }
      ],
      "customers": [
        {
          "name": "idx_customers_customer_id",
          "fields": [
            "customer_id"
          ],
          "type": "btree",
          "unique": true
        },
        {
          "name": "idx_customers_email",
          "fields": [
            "email"
          ],
          "type": "btree",
          "unique": true
        },
        {
          "name": "idx_customers_created_at",
          "fields": [
            "created_at"
          ],
          "type": "btree",
          "unique": false
        },
        {
          "name": "idx_customers_fulltext",
          "fields": [
            "customer_id",
            "email",
            "name"
          ],
          "type": "gin",
          "unique": false
        }
      ],
      "orders": [
        {
          "name": "idx_orders_order_id",
          "fields": [
            "order_id"
          ],
          "type": "btree",
          "unique": true
        },
        {
          "name": "idx_orders_customer_id",
          "fields": [
            "customer_id"
          ],
          "type": "btree",
          "unique": false
        },
        {
          "name": "idx_orders_status",
          "fields": [
            "status"
          ],
          "type": "btree",
          "unique": false
        },
        {
          "name": "idx_orders_created_at",
          "fields": [
            "created_at"
          ],
          "type": "btree",
          "unique": false
        },
        {
          "name": "idx_orders_composite",
          "fields": [
            "order_id",
            "customer_id"
          ],
          "type": "btree",
          "unique": false
        },
        {
          "name": "idx_orders_fulltext",
          "fields": [
            "order_id",
            "customer_id",
            "status"
          ],
          "type": "gin",
          "unique": false
        }
      ],
      "reviews": [
        {
          "name": "idx_reviews_review_id",
          "fields": [
            "review_id"
          ],
          "type": "btree",
          "unique": true
        },
        {
          "name": "idx_reviews_product_id",
          "fields": [
            "product_id"
          ],
          "type": "btree",
          "unique": false
        },
        {
          "name": "idx_reviews_customer_id",
          "fields": [
            "customer_id"
          ],
          "type": "btree",
          "unique": false
        },
        {
          "name": "idx_reviews_created_at",
          "fields": [
            "created_at"
          ],
          "type": "btree",
          "unique": false
        },
        {
          "name": "idx_reviews_composite",
          "fields": [
            "review_id",
            "product_id"
          ],
          "type": "btree",
          "unique": false
        },
        {
          "name": "idx_reviews_fulltext",
          "fields": [
            "review_id",
            "product_id",
            "customer_id"
          ],
          "type": "gin",
          "unique": false
        }
      ]
    },
    "security_rules": {
      "authentication_required": true,
      "default_access": "deny",
      "role_based_access": true,
      "collection_rules": {
        "products": {
          "read": [
            "authenticated"
          ],
          "write": [
            "authenticated"
          ],
          "delete": [
            "owner",
            "admin"
          ]
        },
        "customers": {
          "read": [
            "authenticated"
          ],
          "write": [
            "authenticated"
          ],
          "delete": [
            "owner",
            "admin"
          ]
        },
        "orders": {
          "read": [
            "authenticated"
          ],
          "write": [
            "authenticated"
          ],
          "delete": [
            "owner",
            "admin"
          ]
        },
        "reviews": {
          "read": [
            "authenticated"
          ],
          "write": [
            "authenticated"
          ],
          "delete": [
            "owner",
            "admin"
          ]
        }
      }
    },
    "api_mappings": {
      "endpoints": {
        "GET /api/v1/products": {
          "collection": "products",
          "method": "GET",
          "path": "/api/v1/products",
          "operation": "list"
        },
        "POST /api/v1/products": {
          "collection": "products",
          "method": "POST",
          "path": "/api/v1/products",
          "operation": "create"
        },
        "GET /api/v1/products/search": {
          "collection": "products",
          "method": "GET",
          "path": "/api/v1/products/search",
          "operation": "search"
        },
        "GET /api/v1/products/{id}/recommendations": {
          "collection": "products",
          "method": "GET",
          "path": "/api/v1/products/{id}/recommendations",
          "operation": "read"
        },
        "POST /api/v1/orders": {
          "collection": "orders",
          "method": "POST",
          "path": "/api/v1/orders",
          "operation": "create"
        },
        "GET /api/v1/orders": {
          "collection": "orders",
          "method": "GET",
          "path": "/api/v1/orders",
          "operation": "list"
        },
        "POST /api/v1/customers": {
          "collection": "customers",
          "method": "POST",
          "path": "/api/v1/customers",
          "operation": "create"
        },
        "GET /api/v1/customers/{id}/recommendations": {
          "collection": "customers",
          "method": "GET",
          "path": "/api/v1/customers/{id}/recommendations",
          "operation": "read"
        },
        "POST /api/v1/reviews": {
          "collection": "reviews",
          "method": "POST",
          "path": "/api/v1/reviews",
          "operation": "create"
        }
      },
      "collection_endpoints": {
        "products": {
          "list": "GET /api/v1/products",
          "create": "POST /api/v1/products",
          "read": "GET /api/v1/products/{id}",
          "update": "PUT /api/v1/products/{id}",
          "delete": "DELETE /api/v1/products/{id}",
          "search": "GET /api/v1/products/search"
        },
        "customers": {
          "list": "GET /api/v1/customers",
          "create": "POST /api/v1/customers",
          "read": "GET /api/v1/customers/{id}",
          "update": "PUT /api/v1/customers/{id}",
          "delete": "DELETE /api/v1/customers/{id}",
          "search": "GET /api/v1/customers/search"
        },
        "orders": {
          "list": "GET /api/v1/orders",
          "create": "POST /api/v1/orders",
          "read": "GET /api/v1/orders/{id}",
          "update": "PUT /api/v1/orders/{id}",
          "delete": "DELETE /api/v1/orders/{id}",
          "search": "GET /api/v1/orders/search"
        },
        "reviews": {
          "list": "GET /api/v1/reviews",
          "create": "POST /api/v1/reviews",
          "read": "GET /api/v1/reviews/{id}",
          "update": "PUT /api/v1/reviews/{id}",
          "delete": "DELETE /api/v1/reviews/{id}",
          "search": "GET /api/v1/reviews/search"
        }
      }
    },
    "created_at": "2026-01-22T19:18:06.505614",
    "version": "1.0.0"
  },
  "tables": {},
  "collections": {
    "products": {
      "name": "products",
      "description": "Product catalog with AI features",
      "vector_fields": [
        "description_embedding",
        "features_embedding",
        "category_embedding"
      ],
      "metadata_schema": {
        "product_id": "string",
        "name": "string",
        "description": "text",
        "category": "string",
        "price": "float",
        "currency": "string",
        "sku": "string",
        "inventory": "integer",
        "status": "string",
        "images": "array",
        "tags": "array",
        "created_at": "timestamp",
        "updated_at": "timestamp"
      },
      "vector_config": {
        "enabled": true,
        "dimension": 1536,
        "metric": "cosine",
        "fields": {
          "description_embedding": {
            "dimension": 1536,
            "metric": "cosine",
            "index_type": "hnsw",
            "index_params": {
              "ef_construct": 128,
              "m": 16
            }
          },
          "features_embedding": {
            "dimension": 1536,
            "metric": "cosine",
            "index_type": "hnsw",
            "index_params": {
              "ef_construct": 128,
              "m": 16
            }
          },
          "category_embedding": {
            "dimension": 1536,
            "metric": "cosine",
            "index_type": "hnsw",
            "index_params": {
              "ef_construct": 128,
              "m": 16
            }
          }
        }
      },
      "indexes": [
        {
          "name": "idx_vector_description_embedding",
          "type": "hnsw",
          "field": "description_embedding",
          "parameters": {
            "ef_construct": 128,
            "m": 16,
            "metric": "cosine"
          }
        },
        {
          "name": "idx_vector_features_embedding",
          "type": "hnsw",
          "field": "features_embedding",
          "parameters": {
            "ef_construct": 128,
            "m": 16,
            "metric": "cosine"
          }
        },
        {
          "name": "idx_vector_category_embedding",
          "type": "hnsw",
          "field": "category_embedding",
          "parameters": {
            "ef_construct": 128,
            "m": 16,
            "metric": "cosine"
          }
        }
      ],
      "validation_rules": {
        "product_id": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "name": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "description": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 10000
          }
        ],
        "category": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "price": [
          {
            "type": "number",
            "minimum": 0
          }
        ],
        "currency": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "sku": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "inventory": [
          {
            "type": "integer",
            "minimum": 0
          }
        ],
        "status": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "images": [
          {
            "type": "array",
            "max_items": 100
          }
        ],
        "tags": [
          {
            "type": "array",
            "max_items": 100
          }
        ],
        "created_at": [
          {
            "type": "string",
            "format": "date-time"
          }
        ],
        "updated_at": [
          {
            "type": "string",
            "format": "date-time"
          }
        ]
      },
      "access_patterns": []
    },
    "customers": {
      "name": "customers",
      "description": "Customer profiles and preferences",
      "vector_fields": [
        "preferences_embedding",
        "behavior_embedding"
      ],
      "metadata_schema": {
        "customer_id": "string",
        "email": "string",
        "name": "string",
        "phone": "string",
        "addresses": "json",
        "preferences": "json",
        "lifetime_value": "float",
        "created_at": "timestamp",
        "last_purchase": "timestamp"
      },
      "vector_config": {
        "enabled": true,
        "dimension": 1536,
        "metric": "cosine",
        "fields": {
          "preferences_embedding": {
            "dimension": 1536,
            "metric": "cosine",
            "index_type": "hnsw",
            "index_params": {
              "ef_construct": 128,
              "m": 16
            }
          },
          "behavior_embedding": {
            "dimension": 1536,
            "metric": "cosine",
            "index_type": "hnsw",
            "index_params": {
              "ef_construct": 128,
              "m": 16
            }
          }
        }
      },
      "indexes": [
        {
          "name": "idx_vector_preferences_embedding",
          "type": "hnsw",
          "field": "preferences_embedding",
          "parameters": {
            "ef_construct": 128,
            "m": 16,
            "metric": "cosine"
          }
        },
        {
          "name": "idx_vector_behavior_embedding",
          "type": "hnsw",
          "field": "behavior_embedding",
          "parameters": {
            "ef_construct": 128,
            "m": 16,
            "metric": "cosine"
          }
        }
      ],
      "validation_rules": {
        "customer_id": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "email": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          },
          {
            "format": "email"
          }
        ],
        "name": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "phone": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          },
          {
            "pattern": "^\\+?[1-9]\\d{1,14}$"
          }
        ],
        "addresses": [
          {
            "type": "object"
          }
        ],
        "preferences": [
          {
            "type": "object"
          }
        ],
        "lifetime_value": [
          {
            "type": "number",
            "minimum": 0
          }
        ],
        "created_at": [
          {
            "type": "string",
            "format": "date-time"
          }
        ],
        "last_purchase": [
          {
            "type": "string",
            "format": "date-time"
          }
        ]
      },
      "access_patterns": []
    },
    "orders": {
      "name": "orders",
      "description": "Order history and tracking",
      "vector_fields": [
        "items_embedding",
        "notes_embedding"
      ],
      "metadata_schema": {
        "order_id": "string",
        "customer_id": "string",
        "status": "string",
        "total_amount": "float",
        "currency": "string",
        "items": "json",
        "shipping_address": "json",
        "payment_method": "string",
        "tracking_number": "string",
        "created_at": "timestamp",
        "shipped_at": "timestamp",
        "delivered_at": "timestamp"
      },
      "vector_config": {
        "enabled": true,
        "dimension": 1536,
        "metric": "cosine",
        "fields": {
          "items_embedding": {
            "dimension": 1536,
            "metric": "cosine",
            "index_type": "hnsw",
            "index_params": {
              "ef_construct": 128,
              "m": 16
            }
          },
          "notes_embedding": {
            "dimension": 1536,
            "metric": "cosine",
            "index_type": "hnsw",
            "index_params": {
              "ef_construct": 128,
              "m": 16
            }
          }
        }
      },
      "indexes": [
        {
          "name": "idx_vector_items_embedding",
          "type": "hnsw",
          "field": "items_embedding",
          "parameters": {
            "ef_construct": 128,
            "m": 16,
            "metric": "cosine"
          }
        },
        {
          "name": "idx_vector_notes_embedding",
          "type": "hnsw",
          "field": "notes_embedding",
          "parameters": {
            "ef_construct": 128,
            "m": 16,
            "metric": "cosine"
          }
        }
      ],
      "validation_rules": {
        "order_id": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "customer_id": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "status": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "total_amount": [
          {
            "type": "number",
            "minimum": 0
          }
        ],
        "currency": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "items": [
          {
            "type": "object"
          }
        ],
        "shipping_address": [
          {
            "type": "object"
          }
        ],
        "payment_method": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "tracking_number": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "created_at": [
          {
            "type": "string",
            "format": "date-time"
          }
        ],
        "shipped_at": [
          {
            "type": "string",
            "format": "date-time"
          }
        ],
        "delivered_at": [
          {
            "type": "string",
            "format": "date-time"
          }
        ]
      },
      "access_patterns": [
        {
          "name": "user_orders",
          "query": {
            "user_id": "?"
          },
          "frequency": "high"
        },
        {
          "name": "recent_orders",
          "sort": {
            "created_at": -1
          },
          "frequency": "medium"
        },
        {
          "name": "pending_orders",
          "query": {
            "status": "pending"
          },
          "frequency": "medium"
        }
      ]
    },
    "reviews": {
      "name": "reviews",
      "description": "Product reviews and ratings",
      "vector_fields": [
        "review_embedding",
        "sentiment_embedding"
      ],
      "metadata_schema": {
        "review_id": "string",
        "product_id": "string",
        "customer_id": "string",
        "rating": "integer",
        "title": "string",
        "content": "text",
        "sentiment": "string",
        "verified_purchase": "boolean",
        "helpful_votes": "integer",
        "created_at": "timestamp"
      },
      "vector_config": {
        "enabled": true,
        "dimension": 1536,
        "metric": "cosine",
        "fields": {
          "review_embedding": {
            "dimension": 1536,
            "metric": "cosine",
            "index_type": "hnsw",
            "index_params": {
              "ef_construct": 128,
              "m": 16
            }
          },
          "sentiment_embedding": {
            "dimension": 1536,
            "metric": "cosine",
            "index_type": "hnsw",
            "index_params": {
              "ef_construct": 128,
              "m": 16
            }
          }
        }
      },
      "indexes": [
        {
          "name": "idx_vector_review_embedding",
          "type": "hnsw",
          "field": "review_embedding",
          "parameters": {
            "ef_construct": 128,
            "m": 16,
            "metric": "cosine"
          }
        },
        {
          "name": "idx_vector_sentiment_embedding",
          "type": "hnsw",
          "field": "sentiment_embedding",
          "parameters": {
            "ef_construct": 128,
            "m": 16,
            "metric": "cosine"
          }
        }
      ],
      "validation_rules": {
        "review_id": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "product_id": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "customer_id": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "rating": [
          {
            "type": "integer",
            "minimum": 0
          }
        ],
        "title": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "content": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 10000
          }
        ],
        "sentiment": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "verified_purchase": [
          {
            "type": "boolean"
          }
        ],
        "helpful_votes": [
          {
            "type": "integer",
            "minimum": 0
          }
        ],
        "created_at": [
          {
            "type": "string",
            "format": "date-time"
          }
        ]
      },
      "access_patterns": []
    }
  },
  "vector_collections": {
    "products": {
      "name": "products",
      "description": "Product catalog with AI features",
      "vector_fields": [
        "description_embedding",
        "features_embedding",
        "category_embedding"
      ],
      "metadata_schema": {
        "product_id": "string",
        "name": "string",
        "description": "text",
        "category": "string",
        "price": "float",
        "currency": "string",
        "sku": "string",
        "inventory": "integer",
        "status": "string",
        "images": "array",
        "tags": "array",
        "created_at": "timestamp",
        "updated_at": "timestamp"
      },
      "vector_config": {
        "enabled": true,
        "dimension": 1536,
        "metric": "cosine",
        "fields": {
          "description_embedding": {
            "dimension": 1536,
            "metric": "cosine",
            "index_type": "hnsw",
            "index_params": {
              "ef_construct": 128,
              "m": 16
            }
          },
          "features_embedding": {
            "dimension": 1536,
            "metric": "cosine",
            "index_type": "hnsw",
            "index_params": {
              "ef_construct": 128,
              "m": 16
            }
          },
          "category_embedding": {
            "dimension": 1536,
            "metric": "cosine",
            "index_type": "hnsw",
            "index_params": {
              "ef_construct": 128,
              "m": 16
            }
          }
        }
      },
      "indexes": [
        {
          "name": "idx_vector_description_embedding",
          "type": "hnsw",
          "field": "description_embedding",
          "parameters": {
            "ef_construct": 128,
            "m": 16,
            "metric": "cosine"
          }
        },
        {
          "name": "idx_vector_features_embedding",
          "type": "hnsw",
          "field": "features_embedding",
          "parameters": {
            "ef_construct": 128,
            "m": 16,
            "metric": "cosine"
          }
        },
        {
          "name": "idx_vector_category_embedding",
          "type": "hnsw",
          "field": "category_embedding",
          "parameters": {
            "ef_construct": 128,
            "m": 16,
            "metric": "cosine"
          }
        }
      ],
      "validation_rules": {
        "product_id": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "name": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "description": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 10000
          }
        ],
        "category": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "price": [
          {
            "type": "number",
            "minimum": 0
          }
        ],
        "currency": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "sku": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "inventory": [
          {
            "type": "integer",
            "minimum": 0
          }
        ],
        "status": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "images": [
          {
            "type": "array",
            "max_items": 100
          }
        ],
        "tags": [
          {
            "type": "array",
            "max_items": 100
          }
        ],
        "created_at": [
          {
            "type": "string",
            "format": "date-time"
          }
        ],
        "updated_at": [
          {
            "type": "string",
            "format": "date-time"
          }
        ]
      },
      "access_patterns": []
    },
    "customers": {
      "name": "customers",
      "description": "Customer profiles and preferences",
      "vector_fields": [
        "preferences_embedding",
        "behavior_embedding"
      ],
      "metadata_schema": {
        "customer_id": "string",
        "email": "string",
        "name": "string",
        "phone": "string",
        "addresses": "json",
        "preferences": "json",
        "lifetime_value": "float",
        "created_at": "timestamp",
        "last_purchase": "timestamp"
      },
      "vector_config": {
        "enabled": true,
        "dimension": 1536,
        "metric": "cosine",
        "fields": {
          "preferences_embedding": {
            "dimension": 1536,
            "metric": "cosine",
            "index_type": "hnsw",
            "index_params": {
              "ef_construct": 128,
              "m": 16
            }
          },
          "behavior_embedding": {
            "dimension": 1536,
            "metric": "cosine",
            "index_type": "hnsw",
            "index_params": {
              "ef_construct": 128,
              "m": 16
            }
          }
        }
      },
      "indexes": [
        {
          "name": "idx_vector_preferences_embedding",
          "type": "hnsw",
          "field": "preferences_embedding",
          "parameters": {
            "ef_construct": 128,
            "m": 16,
            "metric": "cosine"
          }
        },
        {
          "name": "idx_vector_behavior_embedding",
          "type": "hnsw",
          "field": "behavior_embedding",
          "parameters": {
            "ef_construct": 128,
            "m": 16,
            "metric": "cosine"
          }
        }
      ],
      "validation_rules": {
        "customer_id": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "email": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          },
          {
            "format": "email"
          }
        ],
        "name": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "phone": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          },
          {
            "pattern": "^\\+?[1-9]\\d{1,14}$"
          }
        ],
        "addresses": [
          {
            "type": "object"
          }
        ],
        "preferences": [
          {
            "type": "object"
          }
        ],
        "lifetime_value": [
          {
            "type": "number",
            "minimum": 0
          }
        ],
        "created_at": [
          {
            "type": "string",
            "format": "date-time"
          }
        ],
        "last_purchase": [
          {
            "type": "string",
            "format": "date-time"
          }
        ]
      },
      "access_patterns": []
    },
    "orders": {
      "name": "orders",
      "description": "Order history and tracking",
      "vector_fields": [
        "items_embedding",
        "notes_embedding"
      ],
      "metadata_schema": {
        "order_id": "string",
        "customer_id": "string",
        "status": "string",
        "total_amount": "float",
        "currency": "string",
        "items": "json",
        "shipping_address": "json",
        "payment_method": "string",
        "tracking_number": "string",
        "created_at": "timestamp",
        "shipped_at": "timestamp",
        "delivered_at": "timestamp"
      },
      "vector_config": {
        "enabled": true,
        "dimension": 1536,
        "metric": "cosine",
        "fields": {
          "items_embedding": {
            "dimension": 1536,
            "metric": "cosine",
            "index_type": "hnsw",
            "index_params": {
              "ef_construct": 128,
              "m": 16
            }
          },
          "notes_embedding": {
            "dimension": 1536,
            "metric": "cosine",
            "index_type": "hnsw",
            "index_params": {
              "ef_construct": 128,
              "m": 16
            }
          }
        }
      },
      "indexes": [
        {
          "name": "idx_vector_items_embedding",
          "type": "hnsw",
          "field": "items_embedding",
          "parameters": {
            "ef_construct": 128,
            "m": 16,
            "metric": "cosine"
          }
        },
        {
          "name": "idx_vector_notes_embedding",
          "type": "hnsw",
          "field": "notes_embedding",
          "parameters": {
            "ef_construct": 128,
            "m": 16,
            "metric": "cosine"
          }
        }
      ],
      "validation_rules": {
        "order_id": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "customer_id": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "status": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "total_amount": [
          {
            "type": "number",
            "minimum": 0
          }
        ],
        "currency": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "items": [
          {
            "type": "object"
          }
        ],
        "shipping_address": [
          {
            "type": "object"
          }
        ],
        "payment_method": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "tracking_number": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "created_at": [
          {
            "type": "string",
            "format": "date-time"
          }
        ],
        "shipped_at": [
          {
            "type": "string",
            "format": "date-time"
          }
        ],
        "delivered_at": [
          {
            "type": "string",
            "format": "date-time"
          }
        ]
      },
      "access_patterns": [
        {
          "name": "user_orders",
          "query": {
            "user_id": "?"
          },
          "frequency": "high"
        },
        {
          "name": "recent_orders",
          "sort": {
            "created_at": -1
          },
          "frequency": "medium"
        },
        {
          "name": "pending_orders",
          "query": {
            "status": "pending"
          },
          "frequency": "medium"
        }
      ]
    },
    "reviews": {
      "name": "reviews",
      "description": "Product reviews and ratings",
      "vector_fields": [
        "review_embedding",
        "sentiment_embedding"
      ],
      "metadata_schema": {
        "review_id": "string",
        "product_id": "string",
        "customer_id": "string",
        "rating": "integer",
        "title": "string",
        "content": "text",
        "sentiment": "string",
        "verified_purchase": "boolean",
        "helpful_votes": "integer",
        "created_at": "timestamp"
      },
      "vector_config": {
        "enabled": true,
        "dimension": 1536,
        "metric": "cosine",
        "fields": {
          "review_embedding": {
            "dimension": 1536,
            "metric": "cosine",
            "index_type": "hnsw",
            "index_params": {
              "ef_construct": 128,
              "m": 16
            }
          },
          "sentiment_embedding": {
            "dimension": 1536,
            "metric": "cosine",
            "index_type": "hnsw",
            "index_params": {
              "ef_construct": 128,
              "m": 16
            }
          }
        }
      },
      "indexes": [
        {
          "name": "idx_vector_review_embedding",
          "type": "hnsw",
          "field": "review_embedding",
          "parameters": {
            "ef_construct": 128,
            "m": 16,
            "metric": "cosine"
          }
        },
        {
          "name": "idx_vector_sentiment_embedding",
          "type": "hnsw",
          "field": "sentiment_embedding",
          "parameters": {
            "ef_construct": 128,
            "m": 16,
            "metric": "cosine"
          }
        }
      ],
      "validation_rules": {
        "review_id": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "product_id": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "customer_id": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "rating": [
          {
            "type": "integer",
            "minimum": 0
          }
        ],
        "title": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "content": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 10000
          }
        ],
        "sentiment": [
          {
            "type": "string",
            "min_length": 1,
            "max_length": 255
          }
        ],
        "verified_purchase": [
          {
            "type": "boolean"
          }
        ],
        "helpful_votes": [
          {
            "type": "integer",
            "minimum": 0
          }
        ],
        "created_at": [
          {
            "type": "string",
            "format": "date-time"
          }
        ]
      },
      "access_patterns": []
    }
  },
  "relationships": {
    "products": {
      "product_id": {
        "type": "belongs_to",
        "target_collection": "products",
        "target_field": "product_id",
        "cascade_delete": false,
        "indexed": true
      },
      "products_ids": {
        "type": "has_many",
        "target_collection": "products",
        "target_field": "product_id",
        "virtual": true
      },
      "reviews_ids": {
        "type": "has_many",
        "target_collection": "reviews",
        "target_field": "product_id",
        "virtual": true
      }
    },
    "customers": {
      "customer_id": {
        "type": "belongs_to",
        "target_collection": "customers",
        "target_field": "customer_id",
        "cascade_delete": false,
        "indexed": true
      },
      "customers_ids": {
        "type": "has_many",
        "target_collection": "customers",
        "target_field": "customer_id",
        "virtual": true
      },
      "orders_ids": {
        "type": "has_many",
        "target_collection": "orders",
        "target_field": "customer_id",
        "virtual": true
      },
      "reviews_ids": {
        "type": "has_many",
        "target_collection": "reviews",
        "target_field": "customer_id",
        "virtual": true
      }
    },
    "orders": {
      "order_id": {
        "type": "belongs_to",
        "target_collection": "orders",
        "target_field": "order_id",
        "cascade_delete": false,
        "indexed": true
      },
      "customer_id": {
        "type": "belongs_to",
        "target_collection": "customers",
        "target_field": "customer_id",
        "cascade_delete": false,
        "indexed": true
      },
      "orders_ids": {
        "type": "has_many",
        "target_collection": "orders",
        "target_field": "order_id",
        "virtual": true
      }
    },
    "reviews": {
      "review_id": {
        "type": "belongs_to",
        "target_collection": "reviews",
        "target_field": "review_id",
        "cascade_delete": false,
        "indexed": true
      },
      "product_id": {
        "type": "belongs_to",
        "target_collection": "products",
        "target_field": "product_id",
        "cascade_delete": false,
        "indexed": true
      },
      "customer_id": {
        "type": "belongs_to",
        "target_collection": "customers",
        "target_field": "customer_id",
        "cascade_delete": false,
        "indexed": true
      },
      "reviews_ids": {
        "type": "has_many",
        "target_collection": "reviews",
        "target_field": "review_id",
        "virtual": true
      }
    }
  },
  "indexes": {
    "products": [
      {
        "name": "idx_products_product_id",
        "fields": [
          "product_id"
        ],
        "type": "btree",
        "unique": true
      },
      {
        "name": "idx_products_category",
        "fields": [
          "category"
        ],
        "type": "btree",
        "unique": false
      },
      {
        "name": "idx_products_status",
        "fields": [
          "status"
        ],
        "type": "btree",
        "unique": false
      },
      {
        "name": "idx_products_created_at",
        "fields": [
          "created_at"
        ],
        "type": "btree",
        "unique": false
      },
      {
        "name": "idx_products_updated_at",
        "fields": [
          "updated_at"
        ],
        "type": "btree",
        "unique": false
      },
      {
        "name": "idx_products_fulltext",
        "fields": [
          "product_id",
          "name",
          "description"
        ],
        "type": "gin",
        "unique": false
      }
    ],
    "customers": [
      {
        "name": "idx_customers_customer_id",
        "fields": [
          "customer_id"
        ],
        "type": "btree",
        "unique": true
      },
      {
        "name": "idx_customers_email",
        "fields": [
          "email"
        ],
        "type": "btree",
        "unique": true
      },
      {
        "name": "idx_customers_created_at",
        "fields": [
          "created_at"
        ],
        "type": "btree",
        "unique": false
      },
      {
        "name": "idx_customers_fulltext",
        "fields": [
          "customer_id",
          "email",
          "name"
        ],
        "type": "gin",
        "unique": false
      }
    ],
    "orders": [
      {
        "name": "idx_orders_order_id",
        "fields": [
          "order_id"
        ],
        "type": "btree",
        "unique": true
      },
      {
        "name": "idx_orders_customer_id",
        "fields": [
          "customer_id"
        ],
        "type": "btree",
        "unique": false
      },
      {
        "name": "idx_orders_status",
        "fields": [
          "status"
        ],
        "type": "btree",
        "unique": false
      },
      {
        "name": "idx_orders_created_at",
        "fields": [
          "created_at"
        ],
        "type": "btree",
        "unique": false
      },
      {
        "name": "idx_orders_composite",
        "fields": [
          "order_id",
          "customer_id"
        ],
        "type": "btree",
        "unique": false
      },
      {
        "name": "idx_orders_fulltext",
        "fields": [
          "order_id",
          "customer_id",
          "status"
        ],
        "type": "gin",
        "unique": false
      }
    ],
    "reviews": [
      {
        "name": "idx_reviews_review_id",
        "fields": [
          "review_id"
        ],
        "type": "btree",
        "unique": true
      },
      {
        "name": "idx_reviews_product_id",
        "fields": [
          "product_id"
        ],
        "type": "btree",
        "unique": false
      },
      {
        "name": "idx_reviews_customer_id",
        "fields": [
          "customer_id"
        ],
        "type": "btree",
        "unique": false
      },
      {
        "name": "idx_reviews_created_at",
        "fields": [
          "created_at"
        ],
        "type": "btree",
        "unique": false
      },
      {
        "name": "idx_reviews_composite",
        "fields": [
          "review_id",
          "product_id"
        ],
        "type": "btree",
        "unique": false
      },
      {
        "name": "idx_reviews_fulltext",
        "fields": [
          "review_id",
          "product_id",
          "customer_id"
        ],
        "type": "gin",
        "unique": false
      }
    ]
  },
  "security_rules": {
    "authentication_required": true,
    "default_access": "deny",
    "role_based_access": true,
    "collection_rules": {
      "products": {
        "read": [
          "authenticated"
        ],
        "write": [
          "authenticated"
        ],
        "delete": [
          "owner",
          "admin"
        ]
      },
      "customers": {
        "read": [
          "authenticated"
        ],
        "write": [
          "authenticated"
        ],
        "delete": [
          "owner",
          "admin"
        ]
      },
      "orders": {
        "read": [
          "authenticated"
        ],
        "write": [
          "authenticated"
        ],
        "delete": [
          "owner",
          "admin"
        ]
      },
      "reviews": {
        "read": [
          "authenticated"
        ],
        "write": [
          "authenticated"
        ],
        "delete": [
          "owner",
          "admin"
        ]
      }
    }
  },
  "api_mappings": {
    "endpoints": {
      "GET /api/v1/products": {
        "collection": "products",
        "method": "GET",
        "path": "/api/v1/products",
        "operation": "list"
      },
      "POST /api/v1/products": {
        "collection": "products",
        "method": "POST",
        "path": "/api/v1/products",
        "operation": "create"
      },
      "GET /api/v1/products/search": {
        "collection": "products",
        "method": "GET",
        "path": "/api/v1/products/search",
        "operation": "search"
      },
      "GET /api/v1/products/{id}/recommendations": {
        "collection": "products",
        "method": "GET",
        "path": "/api/v1/products/{id}/recommendations",
        "operation": "read"
      },
      "POST /api/v1/orders": {
        "collection": "orders",
        "method": "POST",
        "path": "/api/v1/orders",
        "operation": "create"
      },
      "GET /api/v1/orders": {
        "collection": "orders",
        "method": "GET",
        "path": "/api/v1/orders",
        "operation": "list"
      },
      "POST /api/v1/customers": {
        "collection": "customers",
        "method": "POST",
        "path": "/api/v1/customers",
        "operation": "create"
      },
      "GET /api/v1/customers/{id}/recommendations": {
        "collection": "customers",
        "method": "GET",
        "path": "/api/v1/customers/{id}/recommendations",
        "operation": "read"
      },
      "POST /api/v1/reviews": {
        "collection": "reviews",
        "method": "POST",
        "path": "/api/v1/reviews",
        "operation": "create"
      }
    },
    "collection_endpoints": {
      "products": {
        "list": "GET /api/v1/products",
        "create": "POST /api/v1/products",
        "read": "GET /api/v1/products/{id}",
        "update": "PUT /api/v1/products/{id}",
        "delete": "DELETE /api/v1/products/{id}",
        "search": "GET /api/v1/products/search"
      },
      "customers": {
        "list": "GET /api/v1/customers",
        "create": "POST /api/v1/customers",
        "read": "GET /api/v1/customers/{id}",
        "update": "PUT /api/v1/customers/{id}",
        "delete": "DELETE /api/v1/customers/{id}",
        "search": "GET /api/v1/customers/search"
      },
      "orders": {
        "list": "GET /api/v1/orders",
        "create": "POST /api/v1/orders",
        "read": "GET /api/v1/orders/{id}",
        "update": "PUT /api/v1/orders/{id}",
        "delete": "DELETE /api/v1/orders/{id}",
        "search": "GET /api/v1/orders/search"
      },
      "reviews": {
        "list": "GET /api/v1/reviews",
        "create": "POST /api/v1/reviews",
        "read": "GET /api/v1/reviews/{id}",
        "update": "PUT /api/v1/reviews/{id}",
        "delete": "DELETE /api/v1/reviews/{id}",
        "search": "GET /api/v1/reviews/search"
      }
    }
  }
}