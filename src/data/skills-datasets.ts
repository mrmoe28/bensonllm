/**
 * Skills Knowledge Datasets
 * Pre-populated skills for AI assistance
 */

import type { KnowledgeDocument } from '../types/app';

export const SKILLS_DATASETS: Omit<KnowledgeDocument, 'id'>[] = [
  // Python Data Analysis Expertise
  {
    name: 'Python Data Analysis Expertise',
    type: 'text',
    category: 'skills',
    priority: 'high',
    content: `# Python Data Analysis Expertise (2025)

## Core Libraries

### NumPy (Numerical Python)
- Backbone of numerical computing in Python
- Efficient handling of large multidimensional arrays
- Mathematical functions for array operations
- Foundation for scientific computing

### Pandas
- Industry-standard for data manipulation and analysis
- DataFrame and Series objects for tabular data
- Essential for data preprocessing and cleaning
- Handles missing data with methods like isna(), dropna()
- Time series analysis and date handling

### Matplotlib & Seaborn
- Matplotlib: Extensive library for creating fixed, interactive, and animated visualizations
- Seaborn: High-level interface for statistical visualizations
- Both closely integrated with NumPy and pandas

## Best Practices

### Data Cleaning
- Use isna().all() to identify columns with missing values
- Handle NaN values systematically
- Validate data types and ranges
- Remove duplicates with drop_duplicates()

### Performance Optimization
- Use vectorized operations instead of loops
- Leverage NumPy's array operations
- Use appropriate data types (int8 vs int64)
- Chunk large datasets for memory efficiency

### Code Organization
- Think in terms of arrays and dataframes, not loops
- Use method chaining for readability
- Document data transformations clearly
- Separate data loading, cleaning, analysis, and visualization

### Modern Approaches (2025)
- Polars for faster dataframe operations
- DuckDB for SQL-based analysis
- Arrow for efficient data interchange
- Integration with cloud data warehouses

## Common Patterns

\`\`\`python
# Data loading and exploration
df = pd.read_csv('data.csv')
df.info()
df.describe()

# Cleaning
df = df.dropna(subset=['important_column'])
df['date'] = pd.to_datetime(df['date'])

# Analysis
grouped = df.groupby('category').agg({
    'value': ['mean', 'sum', 'count']
})

# Visualization
import matplotlib.pyplot as plt
df['value'].hist(bins=50)
plt.show()
\`\`\`

## Key Takeaways
- NumPy, Pandas, Matplotlib form the essential data analysis stack
- Emphasize data quality and cleaning before analysis
- Use visualization to understand data patterns
- Performance matters - use vectorized operations
- Stay updated with modern alternatives for large-scale work`,
    metadata: {
      size: 2048,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: ['python', 'data-analysis', 'pandas', 'numpy', 'matplotlib', 'data-science'],
    },
  },

  // React Component Design Patterns
  {
    name: 'React Component Design Patterns',
    type: 'text',
    category: 'skills',
    priority: 'high',
    content: `# React Component Design Patterns (2025)

## Modern React Paradigms

### Function Components (Standard)
Function components are the de facto standard in 2025, replacing class components for all use cases.
- Embrace functional programming paradigm
- Emphasize simplicity and composability
- Better performance and smaller bundle sizes

## Essential Patterns

### 1. Custom Hooks Pattern
Most powerful pattern in modern React development.

**When to Use:**
- Reusable stateful logic
- Data fetching
- Form management
- Local storage interaction
- WebSocket connections

**Example:**
\`\`\`typescript
function useDataFetching<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
}
\`\`\`

### 2. Component Composition Pattern
Core React feature promoting modularity.

**Principles:**
- Build complex UIs from simple components
- Use children prop for flexibility
- Prefer composition over inheritance
- Keep components focused and single-purpose

**Example:**
\`\`\`typescript
function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>;
}

function CardHeader({ title }: { title: string }) {
  return <div className="card-header">{title}</div>;
}

function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="card-body">{children}</div>;
}

// Usage
<Card>
  <CardHeader title="User Profile" />
  <CardBody>
    <UserInfo />
  </CardBody>
</Card>
\`\`\`

### 3. Compound Components Pattern
Components that work together as a cohesive unit.

**Example:**
\`\`\`typescript
const Tab = ({ children, isActive }: TabProps) => (
  <div className={isActive ? 'active' : ''}>{children}</div>
);

const Tabs = ({ children }: { children: React.ReactNode }) => {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabContext.Provider>
  );
};

Tabs.Tab = Tab;
\`\`\`

### 4. Render Props Pattern (Legacy, Use Hooks Instead)
While still valid, custom hooks are now preferred for sharing logic.

### 5. Higher-Order Components (HOC)
Less common in 2025, but useful for cross-cutting concerns.

## Best Practices for 2025

### Keep It Simple
- Avoid over-engineering
- Start simple, refactor when needed
- Don't prematurely optimize

### Performance
- Use React.memo() for expensive components
- Optimize re-renders with useMemo and useCallback
- Code splitting with React.lazy()

### TypeScript Integration
- Use TypeScript for type safety
- Define prop interfaces clearly
- Leverage generic types in hooks

### Modern Framework Integration
- Next.js: Full-stack React with SSR/SSG
- Remix: Web fundamentals focus
- Vite: Ultra-fast development

## Key Patterns Summary

1. **Custom Hooks** - Extract reusable logic
2. **Composition** - Build complex from simple
3. **Compound Components** - Related components working together
4. **Context + Hooks** - State management without prop drilling
5. **Server Components (Next.js 15+)** - Server-side rendering optimization

## Anti-Patterns to Avoid

- Deep prop drilling (use Context instead)
- Massive component files (split into smaller pieces)
- Using class components for new code
- Ignoring key props in lists
- Mutating state directly`,
    metadata: {
      size: 3200,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: ['react', 'design-patterns', 'hooks', 'components', 'typescript', 'frontend'],
    },
  },

  // API Design Best Practices
  {
    name: 'API Design Best Practices',
    type: 'text',
    category: 'skills',
    priority: 'high',
    content: `# API Design Best Practices (2025)

## API Landscape 2025

APIs are the backbone of digital ecosystems, enabling seamless communication between apps, platforms, and devices.
RESTful APIs remain the most widely used pattern, while GraphQL and gRPC have gained significant traction.

## REST API Best Practices

### 1. Resource Naming & HTTP Methods

**Use Nouns for Resources:**
\`\`\`
GET    /users          - List users
GET    /users/{id}     - Get single user
POST   /users          - Create user
PUT    /users/{id}     - Update user
DELETE /users/{id}     - Delete user
\`\`\`

**Nested Resources:**
\`\`\`
GET /users/{id}/posts
GET /posts/{id}/comments
\`\`\`

### 2. Versioning
Always version your APIs to maintain backward compatibility.

\`\`\`
/api/v1/users
/api/v2/users
\`\`\`

**Best Practices:**
- Use semantic versioning (v1, v2)
- Notify users before deprecating old versions
- Maintain at least two versions concurrently during transitions

### 3. Pagination & Filtering

**Pagination:**
\`\`\`
GET /users?page=2&limit=20
GET /users?offset=40&limit=20
\`\`\`

**Filtering & Sorting:**
\`\`\`
GET /users?status=active&sort=created_at&order=desc
\`\`\`

### 4. Security Best Practices

**Authentication & Authorization:**
- OAuth 2.0 for delegated access
- JWT tokens for stateless authentication
- API keys for service-to-service
- Always use HTTPS

**Rate Limiting:**
\`\`\`json
{
  "X-RateLimit-Limit": "1000",
  "X-RateLimit-Remaining": "999",
  "X-RateLimit-Reset": "1640995200"
}
\`\`\`

### 5. Error Handling

**Consistent Error Format:**
\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "value": "invalid@"
    }
  }
}
\`\`\`

**HTTP Status Codes:**
- 200 OK - Success
- 201 Created - Resource created
- 400 Bad Request - Invalid input
- 401 Unauthorized - Not authenticated
- 403 Forbidden - Not authorized
- 404 Not Found - Resource doesn't exist
- 429 Too Many Requests - Rate limited
- 500 Internal Server Error - Server error

### 6. OpenAPI Specification (2025)

OpenAPI 3.2 is the standard for REST API documentation:
- Improved webhook support
- Enhanced security schemas
- Better API Gateway integration
- Interactive documentation with Swagger UI

## GraphQL Best Practices

### 1. Schema Design

**Design for UI, not Database:**
\`\`\`graphql
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
  comments: [Comment!]!
}
\`\`\`

**Naming Conventions:**
- PascalCase for types
- camelCase for fields
- Use descriptive names

### 2. Key Advantages

**Precise Data Fetching:**
\`\`\`graphql
query GetUserProfile {
  user(id: "123") {
    name
    email
    posts(limit: 5) {
      title
      createdAt
    }
  }
}
\`\`\`

**No Over-fetching/Under-fetching:**
- Request exactly what you need
- Reduce network payload
- Fewer API calls

### 3. Versioning in GraphQL

**GraphQL Approach:**
- Avoid versioning when possible
- Use field deprecation instead
- Add new fields, deprecate old ones
- Clients specify what they need

\`\`\`graphql
type User {
  name: String! @deprecated(reason: "Use firstName and lastName")
  firstName: String!
  lastName: String!
}
\`\`\`

### 4. Type Safety

Strong typing provides clear contracts:
- Introspection for self-documentation
- Auto-generated TypeScript types
- Compile-time validation

## When to Use What

### Use REST when:
- You need simplicity and convention
- Caching is important
- Public API with wide compatibility
- CRUD operations are primary use case

### Use GraphQL when:
- Frontend needs flexibility
- Multiple clients with different data needs
- Reducing over-fetching is critical
- You want strong typing and introspection

### Use gRPC when:
- High performance is critical
- Service-to-service communication
- Streaming data
- Strong typing with Protocol Buffers

## Modern Tooling (2025)

**REST:**
- OpenAPI 3.2 for specification
- Postman/Insomnia for testing
- API gateways for management

**GraphQL:**
- Apollo Server/Client
- GraphQL Code Generator
- GraphQL Playground
- Relay for advanced use cases

## Security Checklist

- [ ] HTTPS everywhere
- [ ] Authentication implemented
- [ ] Authorization rules defined
- [ ] Rate limiting configured
- [ ] Input validation on all endpoints
- [ ] CORS properly configured
- [ ] Sensitive data encrypted
- [ ] API keys rotated regularly`,
    metadata: {
      size: 4096,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: ['api', 'rest', 'graphql', 'backend', 'design-patterns', 'security', 'web-development'],
    },
  },

  // Debugging Methodology
  {
    name: 'Systematic Debugging Methodology',
    type: 'text',
    category: 'skills',
    priority: 'high',
    content: `# Systematic Debugging Methodology (2025)

## Core Philosophy

Debugging is fundamentally about **understanding first, fixing second**. You need to understand what's happening both to fix it and to verify the fix.

## The Scientific Debugging Process

### 1. Figure Out the Symptoms
- What exactly is broken?
- What should happen vs. what actually happens?
- Is it consistent or intermittent?
- When did it start happening?

### 2. Reproduce the Bug
- Can you make it happen reliably?
- What are the exact steps?
- What conditions are necessary?
- Does it happen in all environments?

**Key Insight:** If you can't reproduce it, you can't verify your fix.

### 3. Understand the System(s)
- What systems are involved?
- How do they interact?
- What's the data flow?
- What are the dependencies?

**Much of debugging happens before touching code.**

### 4. Form a Hypothesis
Use evidence to hypothesize about the cause:
- Error messages
- Log files
- Observed behavior
- Stack traces
- System metrics

### 5. Test the Hypothesis
- Add logging strategically
- Use debugger breakpoints
- Binary search the codebase
- Isolate components

### 6. Fix the Bug
Once you understand the root cause:
- Make the minimal necessary change
- Consider side effects
- Update tests
- Document why the fix works

### 7. Verify the Fix
- Test the original reproduction steps
- Check for regressions
- Verify in all affected environments
- Monitor in production

## Strategic Debugging Techniques

### Binary Search Debugging
Systematically narrow down where the bug is:
1. Comment out half the code
2. Determine which half has the bug
3. Repeat until you find the issue

\`\`\`python
# Instead of checking every line
# Divide and conquer

# First, check if the bug is in data processing
if process_data(input):
    print("Bug is in data processing")
else:
    print("Bug is elsewhere")
\`\`\`

### Strategic Logging
Place logs at key decision points:

\`\`\`typescript
function processOrder(order: Order) {
  console.log('Processing order:', order.id);

  const validation = validateOrder(order);
  console.log('Validation result:', validation);

  if (!validation.isValid) {
    console.error('Validation failed:', validation.errors);
    return;
  }

  const result = submitOrder(order);
  console.log('Submit result:', result);

  return result;
}
\`\`\`

### The Rubber Duck Method
Explain the problem out loud:
- To a colleague
- To a rubber duck
- In written form (bug report)

Often, articulating the problem reveals the solution.

## Modern Debugging Tools (2025)

### Debuggers
- **VS Code Debugger** - Built-in, powerful
- **Chrome DevTools** - For frontend
- **Node.js Inspector** - For backend
- **Python Debugger (pdb)** - For Python

### Logging & Monitoring
- **Structured logging** - JSON logs with context
- **Log aggregation** - Datadog, Splunk, ELK
- **Distributed tracing** - OpenTelemetry, Jaeger
- **Error tracking** - Sentry, Rollbar

### AI-Assisted Debugging
- **ChatGPT/Claude** - Explain errors, suggest fixes
- **GitHub Copilot** - Code suggestions
- **CodeWhisperer** - AWS code assistant

### Network Debugging
- **Postman** - API testing
- **Charles Proxy** - HTTP inspection
- **Wireshark** - Packet analysis

## Best Practices for 2025

### 1. Write Debuggable Code
\`\`\`typescript
// Bad - hard to debug
const result = data.filter(x => x.active).map(x => x.value).reduce((a, b) => a + b, 0);

// Good - easy to debug
const activeItems = data.filter(item => item.active);
const values = activeItems.map(item => item.value);
const sum = values.reduce((total, value) => total + value, 0);
\`\`\`

### 2. Defensive Programming
\`\`\`typescript
function processUser(user: User | null) {
  if (!user) {
    console.error('User is null');
    throw new Error('User cannot be null');
  }

  if (!user.email) {
    console.warn('User missing email:', user.id);
    // Handle gracefully
  }

  // Process user
}
\`\`\`

### 3. Test-Driven Debugging
\`\`\`typescript
// 1. Write a failing test that reproduces the bug
test('should handle empty array', () => {
  expect(processArray([])).toBe(0);
});

// 2. Fix the code
function processArray(arr: number[]) {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b);
}

// 3. Test passes - bug fixed!
\`\`\`

### 4. Use Type Systems
TypeScript catches bugs at compile time:
\`\`\`typescript
interface User {
  id: string;
  email: string;
}

// TypeScript error: missing 'email'
const user: User = { id: '123' };
\`\`\`

## Common Anti-Patterns

### ❌ Random Code Changes
Don't change code randomly hoping it fixes things.

### ❌ Skipping Reproduction
Always reproduce before fixing.

### ❌ Fixing Symptoms, Not Causes
Find the root cause, not just symptoms.

### ❌ No Verification
Always verify your fix works.

### ❌ Debug by Print (Overuse)
Use proper debuggers when appropriate.

## Debugging Checklist

- [ ] Can you reproduce the bug?
- [ ] Do you understand the expected behavior?
- [ ] Have you checked error logs?
- [ ] Have you isolated the component?
- [ ] Do you have a hypothesis?
- [ ] Have you tested your hypothesis?
- [ ] Does your fix address the root cause?
- [ ] Have you verified the fix?
- [ ] Have you added tests to prevent regression?
- [ ] Have you documented the issue?

## Advanced Techniques

### Time-Travel Debugging
Some tools allow stepping backward:
- Redux DevTools for state
- Record/replay debugging
- Git bisect for finding when bug was introduced

### Performance Debugging
\`\`\`javascript
console.time('operation');
performExpensiveOperation();
console.timeEnd('operation');

// Or use Performance API
const start = performance.now();
performExpensiveOperation();
const end = performance.now();
console.log(\`Took \${end - start}ms\`);
\`\`\`

### Memory Debugging
\`\`\`javascript
// Chrome DevTools Memory Profiler
// Heap snapshots
// Memory timeline
\`\`\`

## Remember

> "Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it." - Brian Kernighan

**Write simple, clear code. Future you will thank present you.**`,
    metadata: {
      size: 5120,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: ['debugging', 'troubleshooting', 'best-practices', 'methodology', 'testing', 'development'],
    },
  },
];

/**
 * Initialize skills knowledge in the knowledge base
 * Call this function to populate the knowledge base with all skills
 */
export function initializeSkillsKnowledge() {
  const { addKnowledgeDocument } = require('../lib/storage');

  SKILLS_DATASETS.forEach(skillData => {
    const document: KnowledgeDocument = {
      ...skillData,
      id: `skill-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    addKnowledgeDocument(document);
  });

  console.log(`✅ Added ${SKILLS_DATASETS.length} skills to knowledge base`);
}
