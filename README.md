# Zeller Customer Management App

A React Native application for managing Zeller customers with offline support, built with TypeScript, Zustand state management, and SQLite local storage.

## Features

- 📱 **Cross-platform**: Runs on both iOS and Android
- 🔄 **Offline Support**: Local SQLite database with GraphQL sync
- 🎯 **User Management**: Add, edit, delete customers with validation
- 🔍 **Search & Filter**: Search by name and filter by role (Admin/Manager)
- 📄 **Tab Navigation**: Swipeable tabs with smooth animations
- ↻ **Pull-to-Refresh**: Sync data from GraphQL API
- ✅ **Form Validation**: Comprehensive input validation
- 🧪 **Well Tested**: Unit and integration tests
- 🎨 **Modern UI**: Clean, responsive design

## Architecture

### Tech Stack
- **React Native 0.82.1** with TypeScript
- **Zustand** for state management
- **SQLite** for local data storage
- **Apollo Client** for GraphQL integration
- **React Native PagerView** for tab animations
- **Jest & React Native Testing Library** for testing

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── CustomerList.tsx
│   ├── SearchBar.tsx
│   └── TabSelector.tsx
├── screens/            # Screen components
│   ├── CustomerScreen.tsx
│   └── AddEditCustomerScreen.tsx
├── store/              # Zustand state management
│   └── customerStore.ts
├── database/           # SQLite database service
│   └── DatabaseService.ts
├── services/           # External API services
│   └── GraphQLService.ts
├── types/              # TypeScript type definitions
│   └── index.ts
└── utils/              # Utility functions
    └── validation.ts
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- React Native development environment
- iOS Simulator (for iOS development)
- Android Studio & Android SDK (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd zeller-rn-codechallenge-master/ZellerApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **iOS Setup** (macOS only)
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Run the application**
   
   For iOS:
   ```bash
   npm run ios
   ```
   
   For Android:
   ```bash
   npm run android
   ```

### Environment & Configuration

- **AppSync config**: Copy `env.example` to `.env` (or update `aws-exports.js` directly) with your `APPSYNC_GRAPHQL_ENDPOINT` and `APPSYNC_API_KEY`, then regenerate `aws-exports.js` if needed.
- **Android keystore**: `android/app/debug.keystore` is already checked in for local debugging.
- **iOS pods**: Run `cd ios && pod install` whenever dependencies change.
- **Database**: The local SQLite schema is created automatically on first launch—no manual seeding required.

## Usage

### Customer Management
- **View Customers**: Browse customers in All/Admin/Manager tabs
- **Search**: Use the search bar to find customers by name
- **Add Customer**: Tap the "+" button to add a new customer
- **Edit Customer**: Tap "Edit" on any customer card
- **Delete Customer**: Tap "Delete" and confirm the action

### Data Sync
- **Pull-to-Refresh**: Pull down on the customer list to sync with server
- **Offline Mode**: App works offline using local SQLite database
- **Auto-Sync**: Automatically syncs with GraphQL API when available

### Form Validation
- **Name**: Required, alphabets and spaces only, max 50 characters
- **Email**: Required, valid email format
- **Role**: Required, must be Admin or Manager

## Testing

| Command | Description |
| --- | --- |
| `npm test` | Run the Jest suite once (components, store, utils) |
| `npm run test -- --watch` | Watch mode for rapid iteration |
| `npm run test -- --coverage` | Generate text + lcov coverage reports |

Test coverage highlights:
- `src/store/__tests__/customerStore.test.ts` – Zustand store + GraphQL/db integrations.
- `src/components/__tests__` – UI behavior (lists, inputs, etc.).
- `src/utils/__tests__` – validation helpers.

## API Integration

### GraphQL Queries
The app integrates with AWS AppSync GraphQL API:

```graphql
query ListZellerCustomers($filter: TableZellerCustomerFilterInput, $limit: Int, $nextToken: String) {
  listZellerCustomers(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      name
      email
      role
    }
    nextToken
  }
}
```

### Data Flow
1. **Initial Load**: Fetch from local database first, then sync with GraphQL
2. **Create/Update/Delete**: Operations performed on local database immediately
3. **Sync**: Pull-to-refresh fetches latest data from GraphQL API
4. **Offline**: App continues to work with local data when network is unavailable

## Database Schema

### Customers Table
```sql
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Manager'))
);
```

## State Management

### Zustand Store
The app uses a single Zustand store for customer management:

```typescript
interface CustomerStore {
  // State
  customers: ZellerCustomer[];
  filteredCustomers: ZellerCustomer[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  selectedRole: UserRole;
  refreshing: boolean;

  // Actions
  loadCustomers: () => Promise<void>;
  refreshCustomers: () => Promise<void>;
  addCustomer: (customer: Omit<ZellerCustomer, 'id'>) => Promise<void>;
  updateCustomer: (customer: ZellerCustomer) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  setSearchTerm: (term: string) => void;
  setSelectedRole: (role: UserRole) => void;
  filterCustomers: () => void;
}
```

## Performance Optimizations

- **Local-First**: Data loads from SQLite first for instant UI
- **Efficient Filtering**: Client-side filtering with debounced search
- **Optimized Rendering**: FlatList for efficient list rendering
- **Minimal Re-renders**: Zustand's selective subscriptions

## Error Handling

- **Network Errors**: Graceful fallback to local data
- **Validation Errors**: Real-time form validation with user feedback
- **Database Errors**: Error boundaries and user notifications
- **Loading States**: Loading indicators for better UX

## Accessibility

- **Screen Reader Support**: Proper accessibility labels
- **Keyboard Navigation**: Full keyboard support
- **Color Contrast**: WCAG compliant color schemes
- **Touch Targets**: Minimum 44pt touch targets

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Troubleshooting

### Common Issues

**Metro bundler issues**
```bash
npx react-native start --reset-cache
```

**iOS build issues**
```bash
cd ios && pod install && cd ..
```

**Android build issues**
```bash
cd android && ./gradlew clean && cd ..
```

**Database initialization errors**
- Check SQLite permissions
- Verify database path accessibility
- Clear app data and reinstall

### Debug Mode

Enable debug mode for detailed logging:
```typescript
// In DatabaseService.ts
SQLite.DEBUG(true);
```

## Support

For support and questions, please open an issue in the repository or contact the development team.