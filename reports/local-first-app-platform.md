# WEMS v2: From HR App to Local-First App Platform

**Project:** WEMS v2 (Workforce/Employee Management System)
**Date:** 2026-04-20
**Type:** Vision / Strategic Direction
**Status:** Exploratory

---

## Executive Summary

WEMS started as a Workforce/Employee Management System — a focused HR tool for small teams. The document-based architecture (`.wems` = SQLite file, local-first, optional network sharing) removes the deployment friction that plagued earlier versions. But this architecture unlocks something bigger: **WEMS as a general-purpose local-first app platform**, where non-technical users create data-driven applications without writing code — just like Excel, but for structured apps instead of spreadsheets.

This report explores the vision, architecture, and feasibility of evolving WEMS beyond HR into a platform where users define their own data models, create forms, build views, and share applications — all stored in a `.wems` file that works offline and syncs via network shares.

---

## 1. The Vision: Excel for Apps

### 1.1 The Problem with SaaS

Traditional app development requires:
- A backend server (cost, maintenance, uptime)
- A database schema (technical, rigid)
- An API layer (complexity)
- User authentication (security headaches)
- Cloud hosting (dependency, costs)

For small teams (5-10 people), this is massive overkill. They need:
- A tool to track their specific data
- Works offline
- Easy to share (just copy a file)
- No subscriptions, no accounts, no servers

### 1.2 The Excel Mental Model

Excel solved this for numerical data 40 years ago. People create spreadsheets for everything — budgets, inventories, project tracking — without being "developers."

**What Excel gives you:**
- Define your own columns (schema)
- Fill in rows (data)
- Formulas for calculations
- Share by sending a file
- Works offline

**What Excel doesn't give you:**
- Structured relationships (employee → department)
- Role-based views (HR sees salary, manager sees availability)
- Workflows and approvals
- Custom forms (masking the grid)
- Multiple views over same data (list, calendar, kanban)

### 1.3 The Gap WEMS Fills

WEMS becomes "Excel for structured apps":

```
Excel                          WEMS Platform
─────                          ─────────────
Spreadsheet                    Database
Columns = schema               Tables = schema
Rows = data                    Records = data
Formulas                       Calculated fields
Single view (grid)             Multiple views (list, kanban, calendar, chart)
File sharing (copy)            File sharing (network share + lock)
Offline by default             Offline by default
```

The HR module becomes a **pre-built template**, not the product itself. The product is the platform that can run any structured data app.

---

## 2. Architecture Foundation

### 2.1 Why `.wems` is the Perfect Substrate

The document-based architecture we defined for HR is already the foundation for a generic app platform:

```
payroll.wems                    ← SQLite database (user-defined schema)
    ├── _schema                 ← System table: table definitions
    ├── _fields                ← System table: field definitions
    ├── _relations             ← System table: relationships
    ├── employees              ← User-defined table
    ├── custom_table_001       ← User-defined table
    └── ...
```

**Why SQLite works:**
- Dynamic schema (CREATE TABLE at runtime)
- Zero-configuration (single file)
- Battle-tested (billions of deployments)
- SQL for querying (familiar, powerful)
- WAL mode for local performance

**The lock file enables multi-user:**
- Same `.wems.lock` pattern works for any data, not just HR
- Shadow lockfile = Word/Excel pattern (proven at scale)
- Reader/writer separation = same UX as HR version

### 2.2 Current WEMS → Platform WEMS

| Current WEMS | Platform WEMS |
|--------------|---------------|
| Fixed schema (employees, schedules) | Dynamic schema (any tables) |
| Hard-coded CRUD forms | Auto-generated CRUD from schema |
| Single view (list) | Multiple view types |
| File → Open → Work | File → Open → **Design Mode** |
| HR-specific UI | Generic UI + HR template pre-installed |

The **document service**, **lock manager**, and **temp extraction** layers are identical. Only the schema layer becomes dynamic.

---

## 3. Core Platform Components

### 3.1 Schema Builder

A UI where users define their data model:

```
┌─────────────────────────────────────────────────────────────┐
│  Schema Builder                                              │
│                                                              │
│  Tables                                                      │
│  ├── employees          [Edit] [Delete]                    │
│  ├── departments        [Edit] [Delete]                    │
│  └── projects           [Edit] [Delete]                    │
│                                                              │
│  [+ Add Table]                                               │
└─────────────────────────────────────────────────────────────┘
```

**Table definition:**
- Table name (singular, plural)
- Fields: name, type, required, default, validation
- Relationships: foreign keys, lookup fields

**Field types:**
| Type | Description |
|------|-------------|
| `text` | Single line string |
| `textarea` | Multi-line text |
| `number` | Integer or decimal |
| `boolean` | Yes/No toggle |
| `date` | Date picker |
| `datetime` | Date + time picker |
| `select` | Dropdown (user-defined options) |
| `multiselect` | Multi-select checkboxes |
| `foreign` | Lookup to another table |
| `file` | Attachment (stored in sidecar folder) |
| `formula` | Calculated from other fields |

**Example: Creating an "equipment" table:**

```
Table: equipment
├── name        (text, required)
├── type        (select: Laptop | Monitor | Phone | Other)
├── assigned_to (foreign → employees)
├── purchase_date (date)
└── status      (select: Available | In Use | Broken | Retired)
```

### 3.2 Auto-CRUD Engine

Given a schema, WEMS generates Create/Read/Update/Delete interfaces automatically:

```
┌─────────────────────────────────────────────────────────────┐
│  equipment                                           [+]    │
│                                                              │
│  [Search...]                    [Filter ▼]  [Sort ▼]        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ Name          │ Type     │ Assigned To │ Status     │    │
│  ├───────────────┼──────────┼──────────────┼────────────┤    │
│  │ MacBook Pro   │ Laptop   │ Alice        │ In Use      │    │
│  │ Dell Monitor  │ Monitor  │ Bob          │ Available   │    │
│  │ iPhone 15     │ Phone    │ Carol        │ In Use      │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  Showing 3 of 47 items                        [<] 1 of 4 [>]  │
└─────────────────────────────────────────────────────────────┘
```

**How it works:**
1. On app open, read `_schema` table
2. For each user-defined table, generate:
   - List view (sortable, filterable, searchable)
   - Detail view (all fields, read-only)
   - Edit form (all fields, validation)
   - Delete confirmation
3. TanStack Query caches data locally
4. Mutations write to local temp DB, sync to file on save

### 3.3 Multiple Views

Different perspectives on the same data:

**List View** (default)
- Sortable columns
- Inline search/filter
- Pagination

**Kanban View**
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Available   │  │ In Use      │  │ Broken      │  │ Retired     │
│─────────────│  │─────────────│  │─────────────│  │─────────────│
│ Dell Mon    │  │ MacBook     │  │ iPhone 12   │  │ ThinkPad X  │
│             │  │             │  │             │  │             │
│             │  │ iPhone 15    │  │             │  │             │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

**Calendar View**
- For tables with date fields
- Month/week/day views
- Color-coded by status/type

**Chart View**
- Bar, pie, line charts
- Group by any field
- Useful for dashboards

**Implementation:** Single data source, view layer is pure UI. Add a new view type = add a React component. No schema changes needed.

### 3.4 Form Builder (Advanced)

For more control over data entry:

```
┌─────────────────────────────────────────────────────────────┐
│  Form Layout Editor                                          │
│                                                              │
│  Field          Layout          Validation                   │
│  ─────────────────────────────────────────────────────────  │
│  name        →  [    full width    ]                       │
│  type        →  [  50%  ][ status  ]                       │
│  assigned_to →  [  50%  ][ notes   ]                       │
│                                                              │
│  [+ Add Field]    [Preview]    [Save Layout]                 │
└─────────────────────────────────────────────────────────────┘
```

Users design the form layout, not just the schema. Useful for:
- Complex forms (stepped input)
- Conditional visibility (show field B only if field A = X)
- Rich text notes fields

### 3.5 Permissions & Roles (Multi-User)

Network share + lock file gives us "first writer wins." But for true collaboration:

**Simple model (v1):**
```
Owner (lock holder)     → Full write access
Readers (no lock)       → Read-only, see updates via polling
```

**Role-based model (v2):**
```
.wems file contains:
├── _roles table (name, can_read, can_write, can_admin)
└── _user_roles table (user, role, table_filter)

Example:
- HR Admin: can read/write employees, salary fields visible
- Manager: can read employees, salary hidden, can write schedules
- Viewer: read-only access to non-sensitive data
```

**Implementation:** Filter TanStack Query results and disable form fields based on role. Lock file still controls write access at file level — roles are an additional layer within the app.

### 3.6 Calculated Fields (Formulas)

Like Excel formulas, but for structured data:

```javascript
// Field definition example
{
  name: "total_cost",
  type: "formula",
  formula: "unit_price * quantity * (1 - discount)",
  depends_on: ["unit_price", "quantity", "discount"]
}

// Runtime evaluation
record.unit_price = 100
record.quantity = 5
record.discount = 0.1
// total_cost = 450
```

**Supported formula operations:**
- Arithmetic: `+`, `-`, `*`, `/`, `^`
- Comparisons: `>`, `<`, `=`, `!=`, `<=`, `>=`
- Conditionals: `IF(condition, then, else)`
- Aggregations: `SUM(records.where(type = "expense"))`
- Lookups: `LOOKUP(employee_id, salary)` → foreign key traversal

**Technical note:** Formulas computed on read (not stored), so they're always current. Use a simple expression parser like `jsep` or `mathjs`.

---

## 4. App Templates & Use Cases

### 4.1 Pre-Built Templates

The platform ships with a "HR/Workforce" template pre-installed:

```
wems-hr-template.wems
├── employees         (name, email, department, position, hire_date, salary)
├── departments       (name, manager, budget)
├── schedules        (employee, date, start_time, end_time, type)
├── time_off         (employee, type, start_date, end_date, status)
└── reports          (title, generated_by, date, content)
```

Users can:
- Use as-is for HR
- Modify the template (add fields, new tables)
- Start from scratch (blank schema)

### 4.2 Other Template Ideas

| Industry | Tables |
|----------|--------|
| **Equipment/Library** | items, categories, loans, members |
| **Project Tracker** | projects, tasks, milestones, time_entries |
| **Inventory** | products, categories, stock_movements, suppliers |
| **Client CRM** | contacts, companies, deals, activities |
| **Event Planning** | events, venues, vendors, guest_list, budget |
| **School/Class** | students, teachers, classes, grades, attendance |

Each template is a `.wems` file users can duplicate and customize.

### 4.3 Customization Path

```
Start with template
    ↓
Modify existing tables (add fields, new types)
    ↓
Add new tables (customers, projects, etc.)
    ↓
Custom views (kanban for tasks, calendar for events)
    ↓
Form layouts (stepped intake form)
    ↓
Role-based permissions (viewer vs editor)
    ↓
You're building a custom app — no code required
```

---

## 5. Technical Implementation

### 5.1 System Tables (Metadata Schema)

The `.wems` SQLite file contains system tables that define the user schema:

```sql
-- Core metadata (installed by default)
CREATE TABLE _meta (
  key TEXT PRIMARY KEY,
  value TEXT
);
INSERT INTO _meta VALUES ('version', '1.0');

-- User-defined tables metadata
CREATE TABLE _tables (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  label_plural TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Field definitions
CREATE TABLE _fields (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_id INTEGER NOT NULL REFERENCES _tables(id),
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  type TEXT NOT NULL,  -- text, number, date, select, foreign, formula, etc.
  required INTEGER DEFAULT 0,
  default_value TEXT,
  options TEXT,         -- JSON array for select/multiselect types
  foreign_table_id INTEGER REFERENCES _tables(id),  -- for foreign type
  formula TEXT,         -- for formula type
  validation TEXT,       -- JSON object for custom validation rules
  sort_order INTEGER DEFAULT 0,
  UNIQUE(table_id, name)
);

-- Indexes for fast lookups
CREATE INDEX idx_fields_table ON _fields(table_id);
CREATE INDEX idx_fields_name ON _fields(name);
```

### 5.2 Runtime Schema Discovery

```typescript
async function loadSchema(dbPath: string) {
  const db = new Database(dbPath, { readonly: true });

  // Load table metadata
  const tables = db.prepare('SELECT * FROM _tables ORDER BY sort_order').all();

  // Load field metadata per table
  for (const table of tables) {
    table.fields = db.prepare(
      'SELECT * FROM _fields WHERE table_id = ? ORDER BY sort_order'
    ).all(table.id);
  }

  return { tables };
}
```

### 5.3 Auto-Generated CRUD

```typescript
function generateCRUDConfig(schema: Schema, tableName: string) {
  const table = schema.tables.find(t => t.name === tableName);

  return {
    table: tableName,
    label: table.label,
    icon: table.icon,
    fields: table.fields.map(f => ({
      name: f.name,
      label: f.label,
      type: f.type,
      required: f.required,
      options: f.options ? JSON.parse(f.options) : null,
      foreignTable: f.foreign_table_id
        ? schema.tables.find(t => t.id === f.foreign_table_id)
        : null,
    })),
  };
}

// Generate TanStack Query hooks
const useEmployeesList = () =>
  useQuery({
    queryKey: ['table', 'employees'],
    queryFn: () => db.prepare('SELECT * FROM employees').all(),
  });

const useCreateEmployee = () =>
  useMutation({
    mutationFn: (data) =>
      db.prepare('INSERT INTO employees (...) VALUES (...)').run(data),
    onSuccess: () => invalidateQueries(['table', 'employees']),
  });
```

### 5.4 Dynamic Form Rendering

```tsx
function DynamicForm({ tableName, recordId, onSubmit }: Props) {
  const { data: config } = useQuery(['schema', tableName], () =>
    generateCRUDConfig(schema, tableName)
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {config.fields.map(field => (
        <FieldRenderer
          key={field.name}
          field={field}
          value={watch(field.name)}
          onChange={setValue}
          error={errors[field.name]}
        />
      ))}
      <button type="submit">Save</button>
    </form>
  );
}

// Field renderer maps type → component
function FieldRenderer({ field, ...props }: FieldProps) {
  switch (field.type) {
    case 'text':     return <TextField {...props} />;
    case 'number':   return <NumberField {...props} />;
    case 'select':   return <SelectField {...props} options={field.options} />;
    case 'foreign':  return <LookupField {...props} table={field.foreignTable} />;
    case 'date':     return <DateField {...props} />;
    default:         return <TextField {...props} />;
  }
}
```

### 5.5 File Structure (With Attachments)

For large files (BLOBs externalized):

```
C:\HR\
├── payroll.wems              SQLite (schema + small data, ~20-50MB)
├── payroll_attachments\      External BLOBs
│   ├── employees\
│   │   ├── emp_001_photo.webp
│   │   ├── emp_001_contract.pdf
│   │   └── emp_002_photo.webp
│   └── custom_001\
│       └── doc_123_invoice.pdf
└── payroll.lock             Shadow lockfile

// Attachment stored as file path in DB, actual file in sidecar folder
// On copy to temp, also copy attachments folder
// On save, copy attachments folder back (incremental if possible)
```

---

## 6. Multi-User Sharing (Same as HR)

### 6.1 Lock File Works for Any Schema

The `.wems.lock` mechanism is schema-agnostic:

```
payroll.wems        (any user-defined schema)
payroll.wems.lock   (same lock format)

equipment.wems      (different schema)
equipment.wems.lock (same lock format)
```

The lock file tracks who has write access, regardless of what data the `.wems` contains.

### 6.2 Reader Experience

Same as HR version:
- Copy to temp
- Open read-only
- Poll mtime every 15s
- Toast: "Document updated by [user]. Click to reload."

### 6.3 Writer Experience

Same as HR version:
- Acquire lock via `proper-lockfile`
- Extract to temp
- Auto-save every 2 minutes
- Save: copy → .tmp → rename → update heartbeat

**No additional complexity for multi-user beyond HR.**

---

## 7. Development Roadmap

### Phase 1: Core Platform (Current work)
- [ ] Document service (`.wems` open/save/lock)
- [ ] Lock manager (`proper-lockfile`)
- [ ] File operations (Open, New, Save As, Recent)
- [ ] Basic UI shell (title bar, status, file menu)

### Phase 2: Dynamic Schema (v2)
- [ ] Schema builder UI (create/edit tables and fields)
- [ ] System tables (`_tables`, `_fields`) creation
- [ ] Schema discovery on document open
- [ ] Basic CRUD generation from schema

### Phase 3: Views (v3)
- [ ] List view (sortable, filterable, paginated)
- [ ] Detail/Edit view
- [ ] Kanban view (for status-like fields)
- [ ] Calendar view (for date fields)

### Phase 4: Advanced Features (v4+)
- [ ] Form builder (custom layouts)
- [ ] Calculated fields (formulas)
- [ ] Role-based permissions
- [ ] Multiple attachments per record

### Phase 5: Templates & Distribution (v5)
- [ ] Pre-built templates (HR, Equipment, Projects, etc.)
- [ ] Template marketplace (sharing `.wems` files)
- [ ] Documentation / onboarding UX

---

## 8. Why This Works for 5-10 Users

### 8.1 The Network Share Model

For 5-10 users:
- No server infrastructure required
- Everyone already has a shared folder
- Lock file handles coordination (same as Word/Excel)
- No monthly fees, no accounts, no cloud dependency

### 8.2 The Offline Model

- Works without internet (just local network for shared folder)
- No dependency on SaaS uptime
- Data never "disappears" because a startup shut down
- Users own their data completely

### 8.3 The Familiarity Model

- "Open a file" = open a `.wems`
- "Save" = Ctrl+S or auto-save
- "Share" = copy to shared folder
- No learning curve for file operations

### 8.4 The Flexibility Model

- Users aren't locked into a specific workflow
- Can build any data model they need
- Can start simple, add complexity later
- No "enterprise features" required for small teams

---

## 9. Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Schema changes break existing data | Medium | Migration system (detect version, run transforms) |
| Large files slow over network | Medium | BLOB externalization + background sync |
| Complex formulas cause bugs | Low | Start simple (arithmetic only), add features later |
| Users create bad schema designs | Low | Pre-built templates guide best practices |
| No real-time collaboration (lock is exclusive) | Low | This is by design — first writer wins, like Word |

---

## 10. Competitive Landscape

| Tool | What it is | vs WEMS Platform |
|------|-----------|------------------|
| **Excel/Google Sheets** | Spreadsheet, not structured DB | WEMS has typed fields, relations, views |
| **Airtable** | Cloud-based, no-code DB | WEMS is local-first, no subscription |
| **Notion** | Document-centric, not structured data | WEMS is relational tables |
| **MS Access** | Local desktop DB | WEMS works over network shares |
| **LibreOffice Base** | Complex, ugly UI | WEMS has modern React UI |

**WEMS Platform's unique position:**
- Local-first (offline works)
- Network-shareable (collaboration without server)
- No subscription (one-time purchase or free)
- Modern UI (React, not legacy desktop)
- Schema-builder (no-code, like Airtable)

---

## 11. Summary

The document-based architecture for WEMS HR application naturally extends to a **general-purpose local-first app platform**. Users who need a simple HR tool get the HR template. Users who need to track equipment, projects, inventory, or any structured data get the same platform with a different template.

**Key value proposition:**
- "It's like Excel, but for building apps without code"
- "Your data lives in a file you own, not in someone's cloud"
- "Share with your team by putting the file on a shared drive"
- "No monthly fees, no account needed"

**The foundation (`.wems` = SQLite + lock file + temp extraction) is already built for the HR version. Extending to generic app platform mostly means:**
1. Making schema dynamic (user-defined tables)
2. Generating CRUD UI from schema
3. Adding view types (kanban, calendar, chart)
4. Pre-building templates for common use cases

---

*Vision document for WEMS v2 platform evolution*
*Generated: 2026-04-20*
*Status: Exploratory — for discussion and planning*