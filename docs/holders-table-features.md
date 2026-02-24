# Top Holders Table Features

## Overview

The Top Holders table on the token dashboard provides an efficient way to browse and search through token holders, even when dealing with hundreds or thousands of addresses.

## Features

Problem
The Top Holders table can become too large, making it difficult to browse or locate specific addresses as the user base grows.

Proposed Solution
Add pagination to the Top Holders dashboard table (e.g., 10 rows per page)
Add a search bar to instantly filter or find a specific wallet address in the table
Alternatives Considered
Keeping a long, static table (hurts UX and performance)

Additional Context
Should work smoothly for hundreds or thousands of holders, with minimal UI latency.

### 1. Search Functionality

- **Real-time filtering**: Instantly filter holders by wallet address as you type
- **Case-insensitive**: Search works regardless of letter casing
- **Partial matching**: Find addresses by entering any part of the address
- **Result counter**: Shows how many holders match your search query

**Usage:**

```
Type any part of a wallet address in the search bar above the table
Example: "GABC" will find all addresses containing "GABC"
```

### 2. Pagination

- **10 rows per page**: Keeps the table manageable and fast to render
- **Smart pagination controls**:
  - Previous/Next buttons for easy navigation
  - Direct page number buttons for quick jumps
  - Ellipsis (...) for large page ranges
  - Current page highlighted
- **Page information**: Shows current range (e.g., "Showing 1-10 of 45 holders")

**Navigation:**

- Click page numbers to jump directly to that page
- Use Previous/Next buttons to move one page at a time
- Pagination automatically resets when searching or sorting

### 3. Sorting

All three columns remain sortable:

- **Address**: Alphabetical sorting
- **Balance**: Numerical sorting by token amount
- **% Share**: Sorting by ownership percentage

Click any column header to sort. Click again to reverse the sort direction.

### 4. Performance Optimizations

- **Memoized filtering**: Search results are cached until the query changes
- **Memoized sorting**: Sort operations are optimized with React.useMemo
- **Efficient pagination**: Only renders visible rows (10 at a time)
- **Minimal re-renders**: State updates are optimized to prevent unnecessary renders

## User Experience

### Empty States

1. **No holders**: Shows a message explaining that Soroban-native tokens require an indexer
2. **No search results**: Displays the search query and suggests trying a different search

### Accessibility

- **ARIA labels**: All interactive elements have proper labels
- **Keyboard navigation**: Full keyboard support for pagination and sorting
- **Screen reader support**: Table structure and pagination state are announced
- **Focus management**: Clear focus indicators on all interactive elements

### Responsive Design

- **Mobile-friendly**: Address truncation on small screens
- **Touch-optimized**: Buttons and controls sized for touch interaction
- **Flexible layout**: Adapts to different screen sizes

## Technical Details

### State Management

```typescript
const [searchQuery, setSearchQuery] = useState("");
const [currentPage, setCurrentPage] = useState(1);
const [sortField, setSortField] = useState<SortField>("balance");Problem
The Top Holders table can become too large, making it difficult to browse or locate specific addresses as the user base grows.

Proposed Solution
Add pagination to the Top Holders dashboard table (e.g., 10 rows per page)
Add a search bar to instantly filter or find a specific wallet address in the table
Alternatives Considered
Keeping a long, static table (hurts UX and performance)

Additional Context
Should work smoothly for hundreds or thousands of holders, with minimal UI latency.
const [sortDir, setSortDir] = useState<SortDir>("desc");
```

### Filtering Logic

```typescript
const filtered = useMemo(() => {
  if (!searchQuery.trim()) return holders;
  const query = searchQuery.toLowerCase();
  return holders.filter((holder) =>
    holder.address.toLowerCase().includes(query),
  );
}, [holders, searchQuery]);
```

### Pagination Calculation

```typescript
const itemsPerPage = 10;
const totalPages = Math.ceil(sorted.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const paginatedHolders = sorted.slice(startIndex, endIndex);
```

## Future Enhancements

Potential improvements for future versions:

1. **Configurable page size**: Allow users to choose 10, 25, 50, or 100 rows per page
2. **Advanced filters**: Filter by balance range or ownership percentage
3. **Export filtered results**: CSV export of search results only
4. **Keyboard shortcuts**: Quick navigation with keyboard shortcuts
5. **URL state**: Preserve search and pagination state in URL for sharing
6. **Virtual scrolling**: For extremely large datasets (10,000+ holders)

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support with responsive design

## Performance Benchmarks

Expected performance with different dataset sizes:

- **< 100 holders**: Instant search and pagination
- **100-1,000 holders**: < 50ms search latency
- **1,000-10,000 holders**: < 200ms search latency
- **> 10,000 holders**: Consider implementing virtual scrolling

## Related Components

- `TokenDashboard.tsx`: Main dashboard component
- `CopyButton.tsx`: Copy-to-clipboard functionality
- `ExplorerLink.tsx`: Links to Stellar Expert (if implemented)
