# Database Types Guide

## Helper Types for Tables and Joins

This guide explains how to use TypeScript helper types with our Supabase database integration.

### Basic Usage

```typescript
import { Database, Tables, Enums } from "@/lib/types/database";

// Before (verbose way)
let movie: Database['public']['Tables']['movies']['Row'] = // ...

// After (using helper types)
let movie: Tables<'movies'>
```

### Response Types for Complex Queries

When working with nested queries and joins, you can use the helper types to get proper typing:

```typescript
import { QueryResult, QueryData, QueryError } from '@supabase/supabase-js';

const countriesWithCitiesQuery = supabase.from('countries').select(`
    id,
    name,
    cities (
      id,
      name
    )
  `);

type CountriesWithCities = QueryData<typeof countriesWithCitiesQuery>;

const { data, error } = await countriesWithCitiesQuery;
if (error) throw error;
const countriesWithCities: CountriesWithCities = data;
```

### Type Overrides

Sometimes you may need to override the generated types. You can use `type-fest`'s `MergeDeep` utility:

```typescript
import { MergeDeep } from 'type-fest';
import { Database as DatabaseGenerated } from './database-generated.types';

// Override the type for a specific column in a view:
export type Database = MergeDeep<
  DatabaseGenerated,
  {
    public: {
      Views: {
        movies_view: {
          Row: {
            // id is a primary key in public.movies, so it must be `not null`
            id: number;
          };
        };
      };
    };
  }
>;
```

### Generating Types

To generate TypeScript types from your database schema:

```bash
supabase gen types typescript --project-id <your-project-id> > lib/types/database.ts
```

This will create type definitions based on your current database schema, including:

- Table definitions
- View definitions
- Enum types
- Foreign key relationships
