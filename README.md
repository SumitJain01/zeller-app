# Zeller Customer Management App

A React Native application for managing Zeller customers with offline support, built with TypeScript, Zustand state management, and SQLite local storage.

## Features

- 📱 **Cross-platform**: Runs on both iOS and Android.
- 🔄 **Local-first storage**: Uses a local SQLite database, with an optional one-time seed from an AWS AppSync GraphQL API.
- 🎯 **User Management**: Add, edit, and delete customers with validation.
- 🔍 **Search & Filter**: Search by name and filter by role (All/Admin/Manager).
- 📄 **Tab Navigation**: Swipeable tabs with smooth animations between roles.
- ↻ **Pull-to-Refresh**: Reload the latest data from the local database.
- ✅ **Form Validation**: Comprehensive input validation for name, email, and role.
- 🧪 **Well Tested**: Unit and integration tests for store, components, and utilities.
- 🎨 **Modern UI**: Clean, responsive design matching the Zeller product aesthetic.

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

- **AppSync config**: Copy `env.example` to `.env` (or update `aws-exports.js` directly) with your `APPSYNC_GRAPHQL_ENDPOINT` and `APPSYNC_API_KEY`, then regenerate `aws-exports.js` if needed. When configured, the app will attempt a **one-time seed** of customers from GraphQL when the local database is empty.
- **Android keystore**: `android/app/debug.keystore` is already checked in for local debugging.
- **iOS pods**: Run `cd ios && pod install` whenever dependencies change.
- **Database**: The local SQLite schema is created automatically on first launch—no manual seeding required.
- **Remote mutations toggle**: In `src/store/customerStore.ts`, the `ENABLE_REMOTE_MUTATIONS` flag is `false` by default. With this default, all create/update/delete operations are local-only; switch it to `true` if you want writes to also be sent to the GraphQL API.

## Usage

### App Flow

- **Launch & initialization**: On startup the app shows a loading screen ("Initializing Zeller App...") while the SQLite database is opened/created.
- **First run seeding**: If the local database is empty and AppSync is configured, the app fetches customers from GraphQL **once** and persists them locally. Subsequent launches read directly from SQLite.
- **Main screen**: After initialization you land on the **Manage roles and team access** screen, which shows:
  - A role tab selector (`All`, `Admin`, `Manager`) with an animated thumb.
  - A floating **+** action button in the bottom-right to create a new user.
  - An optional search bar that can be toggled via the search icon in the header.

### Customer Management

- **View customers**:
  - Use the `All` / `Admin` / `Manager` tabs to filter by role.
  - Customers are grouped alphabetically by name and displayed in a sectioned list.
- **Search**:
  - Tap the search icon in the header to show/hide the search bar.
  - Type to filter by customer name; clear the field or close search to reset.
- **Add customer**:
  - Tap the floating **+** button to open the **New User** modal.
  - Fill in first name, last name, email, and select `Admin` or `Manager`, then tap **Create User**.
- **Edit customer**:
  - Tap an existing customer row to open the **Edit User** modal.
  - Update fields and tap **Save Changes**.
- **Delete customer**:
  - Long-press a customer in the list and confirm **Delete** in the confirmation dialog, or tap **Delete User** from within the edit modal.

### Data Sync

- **Initial data**: On first launch with an empty database, the store attempts to fetch customers from AppSync using `GraphQLService` and inserts them into SQLite. If the network or API is unavailable, the app simply starts with an empty customer list.
- **Ongoing usage**: By default, all reads and writes go against the local SQLite database via `DatabaseService`. Data you create, edit, or delete remains local to the device.
- **Pull-to-Refresh**: Pull down on the customer list to **reload the latest state from SQLite**. This does not re-fetch from GraphQL unless you customize the store.
- **Remote mutations (optional)**: If you enable `ENABLE_REMOTE_MUTATIONS` in `customerStore`, create/update/delete operations will attempt to call the corresponding GraphQL mutations as well, while still persisting everything locally.

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
1. **Initial Load**:
   - Open/create the local SQLite database.
   - If there are no local customers and AppSync is configured, fetch from GraphQL once and seed the database.
2. **Create/Update/Delete**:
   - Operations are always performed on the local database immediately.
   - If `ENABLE_REMOTE_MUTATIONS` is `true`, the app will also attempt the matching GraphQL mutation, falling back to local-only behaviour on failure.
3. **Refresh**:
   - Pull-to-refresh reloads customers from SQLite to ensure the UI reflects the latest local state.
4. **Offline**:
   - The app continues to work entirely from local data when the network is unavailable; remote GraphQL calls are best-effort only for seeding and (optionally) mutations.

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

- **Local-first reads**: Data loads from SQLite first for instant UI and offline-friendly behaviour.
- **Efficient filtering**: Client-side filtering on role and name, triggered automatically when filters change.
- **Optimized rendering**: Sectioned list rendering for large customer lists.
- **Minimal re-renders**: Zustand store with focused state slices to keep renders snappy.

## Error Handling

- **Network Errors**: Remote GraphQL calls are wrapped in try/catch with console logging; the app falls back to local data when remote calls fail.
- **Validation Errors**: Real-time form validation with inline error messages for name, email, and role.
- **Database Errors**: Database initialization failures surface an alert prompting the user to restart the app; other DB issues are logged and reflected via store error state.
- **Loading States**: A dedicated loading screen and pull-to-refresh indicators provide clear feedback during long-running operations.

## Accessibility Considerations

- **Accessible labels**: Key interactive elements such as search, add customer, close form, and fetch-from-server buttons expose `accessibilityLabel`s for screen readers.
- **Clear affordances**: High-contrast text and prominent primary actions help guide the user through key flows.
- **Touch targets**: Primary buttons and tappable list rows are sized with mobile touch ergonomics in mind.

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