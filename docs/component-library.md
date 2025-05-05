# Component Library

## Overview

This document outlines the component library for the Braden Group CRM7 platform, providing guidelines and examples for consistent UI development.

## Core Principles

1. **Consistency**: Components should provide a consistent look and feel across the application
2. **Reusability**: Components should be designed for reuse in multiple contexts
3. **Accessibility**: All components must be accessible and follow WCAG 2.1 AA standards
4. **Performance**: Components should be optimized for performance and minimal re-renders

## Component Architecture

### Component Types

1. **UI Components**: Low-level, stateless components that form the building blocks of the UI
2. **Composite Components**: Combinations of UI components for specific use cases
3. **Feature Components**: Higher-level components with business logic for specific features
4. **Layout Components**: Components that handle layout and positioning

### File Structure

```
/components
  /ui                # UI components from shadcn and custom UI components
    /button.tsx
    /card.tsx
    /input.tsx
    ...
  /common            # Commonly used composite components
    /data-table.tsx
    /filter-bar.tsx
    /search-input.tsx
    /virtualized-list.tsx
    ...
  /layouts           # Layout components
    /dashboard-layout.tsx
    /auth-layout.tsx
    /page-header.tsx
    ...
  /auth              # Authentication-related components
    /login-form.tsx
    /register-form.tsx
    /permission-guard.tsx
    ...
  /apprentices       # Feature-specific components
    /apprentice-card.tsx
    /apprentice-form.tsx
    ...
  /hosts             # Feature-specific components
    /host-card.tsx
    /host-form.tsx
    ...
```

## UI Components

These form the foundation of our component library. We use shadcn/ui as our base component library with customizations to match our design system.

### Button

Variants: primary, secondary, destructive, outline, ghost, link

Usage example:
```tsx
import { Button } from "@/components/ui/button";

// Primary button
<Button>Primary Action</Button>

// Secondary button
<Button variant="secondary">Secondary Action</Button>

// Destructive button
<Button variant="destructive">Delete</Button>

// Outline button
<Button variant="outline">Outline Action</Button>

// Ghost button
<Button variant="ghost">Ghost Action</Button>

// Link button
<Button variant="link">Link Action</Button>

// With icon
<Button>
  <PlusIcon className="mr-2 h-4 w-4" />
  Add New
</Button>

// Loading state
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Please wait
</Button>
```

### Input

Variants: default, with icon, with button, error state

Usage example:
```tsx
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// Default input
<Input placeholder="Enter text" />

// With label (using Form component)
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" placeholder="Enter email" type="email" />
</div>

// With icon
<div className="relative">
  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
  <Input className="pl-8" placeholder="Search..." />
</div>

// With validation error
<div className="space-y-2">
  <Label htmlFor="password">Password</Label>
  <Input 
    id="password" 
    type="password" 
    className="border-red-500"
    aria-invalid="true"
  />
  <p className="text-sm text-red-500">Password must be at least 8 characters</p>
</div>
```

### Select

Variants: default, multiple selection

Usage example:
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Default select
<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="active">Active</SelectItem>
    <SelectItem value="inactive">Inactive</SelectItem>
    <SelectItem value="completed">Completed</SelectItem>
  </SelectContent>
</Select>

// With label (using Form component)
<div className="space-y-2">
  <Label htmlFor="status">Status</Label>
  <Select>
    <SelectTrigger id="status">
      <SelectValue placeholder="Select status" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="active">Active</SelectItem>
      <SelectItem value="inactive">Inactive</SelectItem>
      <SelectItem value="completed">Completed</SelectItem>
    </SelectContent>
  </Select>
</div>
```

### Card

Variants: default, interactive, with header, with footer

Usage example:
```tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Basic card
<Card>
  <CardContent className="pt-6">
    Card content goes here
  </CardContent>
</Card>

// Card with header and footer
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description or subtitle</CardDescription>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
  <CardFooter className="flex justify-between">
    <Button variant="ghost">Cancel</Button>
    <Button>Submit</Button>
  </CardFooter>
</Card>
```

## Composite Components

These components combine multiple UI components to create more complex UI elements.

### DataTable

A powerful data table component for displaying and interacting with tabular data.

Features:
- Column sorting
- Pagination
- Row selection
- Filtering
- Custom cell rendering

Usage example:
```tsx
import { DataTable } from "@/components/common/data-table";
import { Columns } from "@/components/common/data-table/columns";

// Define columns
const columns: Columns<Apprentice>[] = [
  {
    id: "name",
    header: "Name",
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    cell: ({ row }) => (
      <div>
        {row.original.firstName} {row.original.lastName}
      </div>
    ),
  },
  {
    id: "email",
    header: "Email",
    accessorKey: "email",
  },
  {
    id: "trade",
    header: "Trade",
    accessorKey: "trade",
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => (
      <Badge variant={getStatusVariant(row.original.status)}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

// Use the DataTable component
<DataTable
  columns={columns}
  data={apprentices}
  pageCount={pageCount}
  pagination={true}
  onPaginationChange={handlePaginationChange}
  onSortingChange={handleSortingChange}
/>
```

### SearchInput

A debounced search input with optional clear button and loading state.

Usage example:
```tsx
import { SearchInput } from "@/components/common/search-input";

<SearchInput
  placeholder="Search apprentices..."
  value={searchTerm}
  onChange={setSearchTerm}
  debounceMs={300}
  isLoading={isSearching}
  className="w-full md:w-[300px]"
/>
```

### FilterBar

A responsive filter bar that combines multiple filtering options.

Usage example:
```tsx
import { FilterBar, FilterGroup } from "@/components/common/filter-bar";

<FilterBar>
  <FilterGroup label="Status">
    <Select
      value={statusFilter}
      onValueChange={setStatusFilter}
      defaultValue="all"
    >
      <SelectTrigger className="h-8 w-[150px]">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Statuses</SelectItem>
        <SelectItem value="active">Active</SelectItem>
        <SelectItem value="inactive">Inactive</SelectItem>
        <SelectItem value="completed">Completed</SelectItem>
      </SelectContent>
    </Select>
  </FilterGroup>
  
  <FilterGroup label="Trade">
    <Select
      value={tradeFilter}
      onValueChange={setTradeFilter}
      defaultValue="all"
    >
      <SelectTrigger className="h-8 w-[180px]">
        <SelectValue placeholder="Trade" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Trades</SelectItem>
        <SelectItem value="carpentry">Carpentry</SelectItem>
        <SelectItem value="electrical">Electrical</SelectItem>
        <SelectItem value="plumbing">Plumbing</SelectItem>
      </SelectContent>
    </Select>
  </FilterGroup>
  
  <Button 
    variant="outline" 
    size="sm" 
    onClick={resetFilters}
    className="h-8 px-2 lg:px-3"
  >
    Reset
  </Button>
</FilterBar>
```

### VirtualizedList

A high-performance list component for rendering large lists with virtualization.

Usage example:
```tsx
import { VirtualizedList } from "@/components/common/virtualized-list";

<VirtualizedList
  items={apprentices}
  height={600}
  rowHeight={72}
  overscan={5}
  renderItem={(apprentice, index) => (
    <ApprenticeListItem 
      key={apprentice.id}
      apprentice={apprentice}
      isAlternate={index % 2 === 1}
      onSelect={handleSelectApprentice}
    />
  )}
  className="border rounded-md"
  rowClassName="px-4 py-2 hover:bg-muted"
/>
```

## Layout Components

These components handle the overall layout of the application.

### DashboardLayout

The main layout for authenticated dashboard pages with sidebar navigation.

Usage example:
```tsx
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

function ApprenticesPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Apprentices</h1>
        {/* Page content */}
      </div>
    </DashboardLayout>
  );
}
```

### PageHeader

Consistent page header component with title, description, and actions.

Usage example:
```tsx
import { PageHeader } from "@/components/layouts/page-header";

<PageHeader
  title="Apprentices"
  description="Manage your apprentices and trainees"
  actions={
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Add Apprentice
    </Button>
  }
/>
```

## Feature Components

These components are specific to particular features of the application.

### ApprenticeForm

Form component for creating or editing apprentice profiles.

Usage example:
```tsx
import { ApprenticeForm } from "@/components/apprentices/apprentice-form";

// Create new apprentice
<ApprenticeForm
  onSubmit={handleCreateApprentice}
  isSubmitting={isSubmitting}
/>

// Edit existing apprentice
<ApprenticeForm
  apprentice={apprenticeData}
  onSubmit={handleUpdateApprentice}
  isSubmitting={isSubmitting}
/>
```

### HostEmployerCard

Card component for displaying host employer information.

Usage example:
```tsx
import { HostEmployerCard } from "@/components/hosts/host-employer-card";

<HostEmployerCard
  host={hostEmployer}
  onClick={() => viewHostDetails(hostEmployer.id)}
  className="h-full"
/>
```

## Authentication Components

Components for authentication-related functionality.

### PermissionGuard

Component to conditionally render content based on user permissions.

Usage example:
```tsx
import { PermissionGuard } from "@/components/auth/permission-guard";
import { Permission } from "@shared/schema";

<PermissionGuard
  permissions={[Permission.ManageApprentices]}
  fallback={<AccessDeniedMessage />}
>
  <ApprenticeForm onSubmit={handleSubmit} />
</PermissionGuard>

// Multiple permissions (any match)
<PermissionGuard
  permissions={[Permission.ManageApprentices, Permission.ViewApprentices]}
  mode="any"
>
  <ApprenticeList apprentices={apprentices} />
</PermissionGuard>

// Multiple permissions (all required)
<PermissionGuard
  permissions={[Permission.ManageApprentices, Permission.ManageHostEmployers]}
  mode="all"
>
  <PlacementForm onSubmit={handleSubmit} />
</PermissionGuard>
```

## Form Components

Components for building forms with validation.

### Form

The base form component that integrates with React Hook Form and Zod validation.

Usage example:
```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Define form schema
const formSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().optional(),
});

function ContactForm() {
  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({ 
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  });

  // Form submission handler
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Handle form submission
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="First name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Last name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" {...field} />
              </FormControl>
              <FormDescription>
                We'll never share your email with anyone else.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone (optional)</FormLabel>
              <FormControl>
                <Input placeholder="(04) 1234 5678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </Form>
  );
}
```

## Design Guidelines

### Colors

We use a consistent color palette throughout the application:

- Primary: Brand primary color for key actions and elements
- Secondary: Supporting color for secondary elements
- Accent: Highlight color for drawing attention to specific elements
- Destructive: Red color for destructive actions
- Success: Green color for success states
- Warning: Amber color for warning states
- Info: Blue color for informational states
- Muted: Subdued colors for background and less important elements

### Typography

Consistent typography hierarchy:

- Headings: Inter font (h1-h4)
- Body text: Inter font
- Monospace: For code examples or technical data

Font sizes follow a consistent scale.

### Spacing

Consistent spacing using Tailwind's spacing scale:

- 4px (1) - Minimal spacing
- 8px (2) - Tight spacing
- 12px (3) - Compact spacing
- 16px (4) - Default spacing
- 24px (6) - Comfortable spacing
- 32px (8) - Loose spacing
- 48px (12) - Section spacing

### Responsive Design

All components should be responsive, using Tailwind's breakpoint system:

- sm: 640px and up
- md: 768px and up
- lg: 1024px and up
- xl: 1280px and up
- 2xl: 1536px and up

## Accessibility Guidelines

1. **Semantic HTML**: Use the appropriate HTML elements for their intended purpose
2. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
3. **Focus Management**: Visible focus indicators for all interactive elements
4. **ARIA Attributes**: Use ARIA roles and attributes appropriately when needed
5. **Color Contrast**: Maintain sufficient color contrast (WCAG AA minimum)
6. **Screen Readers**: Ensure screen reader compatibility with proper labels and descriptions

## Animation Guidelines

1. **Purposeful**: Animations should serve a purpose, not just be decorative
2. **Subtle**: Prefer subtle animations that enhance user experience
3. **Performance**: Optimize animations for performance, using CSS transitions when possible
4. **Respect User Preferences**: Honor reduced motion preferences

## Theme Customization

Our theme is defined in `client/src/lib/utils/theme.ts` and can be customized to match brand requirements.

```typescript
// Example theme customization
export const theme = createTheme({
  colors: {
    primary: '#0055A4',
    secondary: '#8D9192',
    accent: '#FF9F1C',
    // ...
  },
  fontFamily: {
    sans: ['Inter', 'sans-serif'],
    // ...
  },
  // ...
});
```

## Best Practices

1. **Composition Over Inheritance**: Prefer component composition over inheritance
2. **Single Responsibility**: Each component should have a single responsibility
3. **Consistent Props API**: Maintain consistent props patterns across components
4. **Documentation**: Document component props and usage
5. **Testing**: Write tests for components
6. **Performance**: Optimize components for performance