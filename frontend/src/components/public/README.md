# Public Components

This directory contains all components used in the public-facing pages of the Exampapel platform. These components are designed for guest users (non-authenticated) and focus on browsing, searching, and discovering exam papers and questions.

## Directory Structure

```
public/
├── types.ts              # Shared TypeScript types and interfaces
├── index.ts              # Central export point
├── base-card.tsx         # Base card component template
├── base-filter.tsx       # Base filter component template
├── base-search.tsx       # Base search component template
└── README.md            # This file
```

## Base Components

### BaseCard

A reusable card component that provides consistent styling across all card types (papers, questions, institutions).

**Features:**
- Hover effects
- Multiple variants (default, outline, ghost)
- Optional header, footer, and click handlers
- Responsive design

**Usage:**
```tsx
import { BaseCard } from '@/components/public';

<BaseCard
  title="Card Title"
  description="Card description"
  footer={<Button>View More</Button>}
  hoverable
>
  <p>Card content goes here</p>
</BaseCard>
```

### BaseFilter

A reusable filter component with checkbox selections, counts, and expand/collapse functionality.

**Features:**
- Multi-select checkboxes
- Option counts display
- Show more/less functionality
- Clear individual or all filters
- Active filters display with badges

**Usage:**
```tsx
import { BaseFilter, ActiveFiltersDisplay } from '@/components/public';

<BaseFilter
  title="Institutions"
  options={institutionOptions}
  selectedValues={selectedInstitutions}
  onSelectionChange={setSelectedInstitutions}
  showCount
  maxVisible={5}
/>

<ActiveFiltersDisplay
  filters={activeFilters}
  onRemove={handleRemoveFilter}
  onClearAll={handleClearAll}
/>
```

### BaseSearch

A search component with autocomplete suggestions and debouncing support.

**Features:**
- Search input with icon
- Clear button
- Suggestions dropdown
- Loading states
- Click-outside to close
- Keyboard navigation ready

**Usage:**
```tsx
import { BaseSearch, QuickSearch } from '@/components/public';

<BaseSearch
  value={searchQuery}
  placeholder="Search exam papers..."
  onSearch={handleSearch}
  onSuggestionClick={handleSuggestionClick}
  showSuggestions
/>

// Or use QuickSearch for simpler use cases
<QuickSearch
  onSearch={handleSearch}
  placeholder="Quick search..."
/>
```

## Shared Types

All shared types are defined in `types.ts` and include:

- **API Types**: Re-exported from generated API types
- **Filter Types**: `FilterOption`, `ActiveFilters`
- **Pagination Types**: `PaginationState`
- **Card Props**: `QuestionCardProps`, `PaperCardProps`, `InstitutionCardProps`
- **Search Types**: `SearchBarProps`, `SearchSuggestion`
- **Stats Types**: `PlatformStats`
- **Sign-up Prompt Types**: `SignUpPromptType`, `SignUpPromptState`

## Design Principles

1. **Consistency**: All components follow the same design patterns and use shadcn/ui as the base
2. **Accessibility**: Components include proper ARIA labels and keyboard navigation
3. **Responsiveness**: Mobile-first design approach
4. **Performance**: Optimized for fast loading and smooth interactions
5. **Reusability**: Base components can be composed to create specific features

## Component Development Guidelines

When creating new public components:

1. **Use TypeScript**: Always define proper prop types
2. **Follow naming conventions**: Use PascalCase for components, camelCase for functions
3. **Add 'use client' directive**: For components with interactivity
4. **Include className prop**: Allow style customization
5. **Document props**: Add JSDoc comments for complex props
6. **Handle loading states**: Show appropriate feedback during async operations
7. **Implement error boundaries**: Gracefully handle errors
8. **Test responsiveness**: Ensure components work on all screen sizes

## Next Steps

The following components will be built on top of these base components:

- **Landing Page Components**: HeroSection, RecentQuestionsSection, FeaturedInstitutionsSection
- **Browse Components**: FilterSidebar, PaperCard, PapersGrid
- **Paper Detail Components**: PaperHeader, QuestionItem, RelatedPapersSection
- **Institution Components**: InstitutionCard, InstitutionProfile
- **Search Components**: SearchResults, SearchFilters
- **Engagement Components**: SignUpPrompt, QuestionModal

## Related Documentation

- [Design Document](/.kiro/specs/public-landing-and-browse/design.md)
- [Requirements Document](/.kiro/specs/public-landing-and-browse/requirements.md)
- [Implementation Tasks](/.kiro/specs/public-landing-and-browse/tasks.md)
