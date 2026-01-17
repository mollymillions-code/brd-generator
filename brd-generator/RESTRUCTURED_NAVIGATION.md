# Restructured Navigation - Project-Centric Design

## Overview

The application has been completely restructured to be **project-centric**. All features (knowledge base, chat, BRD generation) now exist **within** the context of a specific project, not as global features.

## New URL Structure

### Before (Flat Structure):
```
/                        → Dashboard (all documents)
/knowledge-base          → Upload documents (global)
/chat                    → Chat with all documents
/generate-brd            → Generate BRD from all documents
/projects                → View projects list
```

### After (Project-Nested Structure):
```
/                                   → Projects list (home)
/projects/new                       → Create new project
/projects/{id}                      → Project dashboard
/projects/{id}/knowledge-base       → Project's documents
/projects/{id}/chat                 → Chat with project's documents
/projects/{id}/generate-brd         → Generate BRD for this project
```

## Navigation Flow

### 1. Starting Point - Projects List (`/`)
**What you see:**
- Grid of all your projects
- Each project card shows name, description, created date
- "+ New Project" button
- "Open Project" button on each card

**Sidebar shows:**
- "All Projects" link (you're here)

**Actions:**
- Click "+ New Project" → Create a new project
- Click "Open Project" → Enter that project

---

### 2. Create New Project (`/projects/new`)
**What you see:**
- Form with:
  - Project Name (required)
  - Project Description (optional)
  - Create/Cancel buttons

**After creating:**
- Redirects to the new project's dashboard
- Project is now active

---

### 3. Inside a Project (`/projects/{id}`)

#### Sidebar Changes (Context-Aware)
**When inside a project, sidebar shows:**
```
BRD Generator  (click to go back to projects list)
├─ Projects / {Project Name}  ← Breadcrumb showing current project
│
├─ Dashboard        ← Project dashboard
├─ Knowledge Base   ← Upload & manage documents for THIS project
├─ Chat            ← Chat with THIS project's documents
├─ Generate BRD    ← Generate BRD for THIS project
│
└─ ← All Projects  ← Back to projects list
```

**Key Features:**
- Breadcrumb shows: `Projects / {Current Project Name}`
- Clicking "BRD Generator" title → Back to projects list
- Navigation links are project-specific URLs
- "← All Projects" link at bottom to exit project

#### Project Dashboard (`/projects/{id}`)
**What you see:**
- Project name and description
- 4 stat cards:
  - Total Documents (for this project)
  - Processed Documents
  - Conversations
  - BRDs Generated
- Quick Actions:
  - Manage Knowledge Base
  - Chat with Documents
  - Generate BRD
- Getting Started guide
- Recent Activity (coming soon)

---

### 4. Knowledge Base (`/projects/{id}/knowledge-base`)
**What it does:**
- Upload documents FOR THIS PROJECT ONLY
- View documents uploaded to this project
- Each document tagged with project ID
- Processing happens per-project

**Data isolation:**
- Documents from other projects are NOT visible here
- Uploads are automatically tagged with current project ID

---

### 5. Chat (`/projects/{id}/chat`)
**What it does:**
- Chat interface
- Only searches THIS PROJECT's documents
- Conversations saved per project
- Source citations show documents from this project only

**Data isolation:**
- Cannot access documents from other projects
- Chat history is project-specific
- Vector search filtered by project ID

---

### 6. Generate BRD (`/projects/{id}/generate-brd`)
**What it does:**
- Analyzes THIS PROJECT's documents only
- Generates BRD based on this project's content
- Saves BRD to this project's history
- Can access past BRDs for this project

**Data isolation:**
- Only uses documents from this project
- BRD saved with project ID
- Can view all BRDs generated for this project

---

## Key Benefits

### 1. Complete Data Isolation
- Each project has its own:
  - Document collection
  - Chat conversations
  - Generated BRDs
  - Activity history

### 2. Clear Mental Model
- "I'm working on Project X"
- All actions happen in context of Project X
- No confusion about which project a document belongs to

### 3. Better Organization
- Multiple clients? Create a project per client
- Multiple products? Project per product
- Multiple phases? Project per phase

### 4. Scalable Architecture
- Easy to add:
  - Project-level permissions (when auth is added)
  - Project sharing/collaboration
  - Project archives
  - Project exports
  - Project templates

### 5. Sidebar Adapts to Context
- **Outside projects:** Simple "All Projects" link
- **Inside project:** Full project navigation
- Breadcrumb always shows where you are
- Easy to switch between projects

---

## File Structure

```
app/
  └── (dashboard)/
      ├── page.tsx                    → Projects list (home)
      ├── layout.tsx                  → Dashboard layout
      └── projects/
          ├── page.tsx                → Projects list (duplicate for SEO)
          ├── new/
          │   └── page.tsx            → Create new project form
          └── [id]/
              ├── page.tsx            → Project dashboard
              ├── knowledge-base/
              │   └── page.tsx        → Document management
              ├── chat/
              │   └── page.tsx        → Chat interface
              └── generate-brd/
                  └── page.tsx        → BRD generation
```

---

## Component Changes

### Sidebar (`components/layout/Sidebar.tsx`)
**Now context-aware:**
- Detects if you're in a project by parsing URL
- Shows different navigation based on context
- Fetches and displays current project name
- Breadcrumb navigation
- "Back to Projects" link when in a project

**Key code:**
```typescript
// Extract project ID from URL
const projectId = pathname.includes('/projects/')
  ? pathname.split('/projects/')[1]?.split('/')[0]
  : null

// Show project-specific or top-level navigation
const links = projectId ? projectLinks : topLinks
```

### ProjectSwitcher Component
**Removed!**
- No longer needed
- Projects accessed via proper routing
- Cleaner, more intuitive UX

---

## Migration Notes

### Old URLs Don't Work
These URLs no longer exist:
- ❌ `/knowledge-base`
- ❌ `/chat`
- ❌ `/generate-brd`
- ❌ `/?project=xxx`

### New URLs
Use these instead:
- ✅ `/projects/{id}/knowledge-base`
- ✅ `/projects/{id}/chat`
- ✅ `/projects/{id}/generate-brd`

### Bookmarks
If you had bookmarked old URLs, update them to:
- `/` → Projects list
- Save project-specific URLs like `/projects/{id}`

---

## Testing Checklist

- [ ] Visit `/` → See projects list
- [ ] Click "+ New Project" → Create project form
- [ ] Create a project → Redirects to project dashboard
- [ ] Verify sidebar shows project name in breadcrumb
- [ ] Click "Knowledge Base" → URL is `/projects/{id}/knowledge-base`
- [ ] Click "Chat" → URL is `/projects/{id}/chat`
- [ ] Click "Generate BRD" → URL is `/projects/{id}/generate-brd`
- [ ] Click "← All Projects" → Back to projects list
- [ ] Click "BRD Generator" title → Back to projects list
- [ ] Create another project → Switch between projects works

---

## Next Steps (API Integration)

To make features functional, update these files to use `projectId`:

1. **Document Upload** - Pass project ID in request
2. **Documents API** - Filter by project ID
3. **Chat API** - Filter documents by project ID
4. **RAG/Vector Search** - Use project ID in search
5. **BRD Generation** - Filter documents by project ID, save BRD to project

See `PROJECT_MANAGEMENT_FEATURE.md` for detailed integration steps.

---

## User Experience Flow

### New User Journey:
1. Opens app → Sees empty projects list
2. Clicks "Create First Project"
3. Enters project name ("Mobile App Redesign")
4. Lands on project dashboard
5. Clicks "Manage Knowledge Base"
6. Uploads documents
7. Clicks "Chat" in sidebar
8. Asks questions about documents
9. Clicks "Generate BRD"
10. Downloads BRD
11. Clicks "← All Projects" to start another project

### Returning User Journey:
1. Opens app → Sees all projects
2. Clicks on a project card
3. Lands on project dashboard
4. Continues working in that project context
5. All navigation scoped to that project
6. Can switch projects via "← All Projects"

---

## Design Principles Applied

1. **Context is King**: Always clear which project you're in
2. **No Orphaned Features**: Features don't exist without a project
3. **Explicit > Implicit**: Project selection via URL, not hidden state
4. **Consistent Navigation**: Sidebar adapts but remains predictable
5. **Escape Hatches**: Easy to go back to projects list
6. **Progressive Disclosure**: See projects list first, then drill down

This structure scales from 1 project to 100+ projects while maintaining clarity and usability.
