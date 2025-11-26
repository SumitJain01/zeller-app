import SQLite from 'react-native-sqlite-storage';
import {ZellerCustomer} from '../types';

// Disable verbose SQLite debug logging in production
SQLite.DEBUG(false);
SQLite.enablePromise(true);

export class DatabaseService {
  private static instance: DatabaseService;
  private database: SQLite.SQLiteDatabase | null = null;

  // Normalize role values to match database constraints
  private normalizeRole(role: string): 'Admin' | 'Manager' {
    const normalizedRole = role.trim();
    
    // Handle common variations
    if (normalizedRole.toLowerCase() === 'admin' || normalizedRole === 'ADMIN') {
      return 'Admin';
    }
    if (normalizedRole.toLowerCase() === 'manager' || normalizedRole === 'MANAGER') {
      return 'Manager';
    }
    
    // Handle other possible role names from GraphQL
    if (normalizedRole.toLowerCase().includes('admin')) {
      return 'Admin';
    }
    if (normalizedRole.toLowerCase().includes('manager')) {
      return 'Manager';
    }
    
    // Handle specific role values that might come from the API
    switch (normalizedRole.toLowerCase()) {
      case 'administrator':
      case 'admin_user':
      case 'system_admin':
        return 'Admin';
      case 'team_manager':
      case 'project_manager':
      case 'manager_user':
        return 'Manager';
      default:
        // Default fallback when role is unrecognised
        return 'Manager';
    }
  }

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async initDatabase(): Promise<void> {
    try {
      this.database = await SQLite.openDatabase({
        name: 'ZellerCustomers.db',
        location: 'default',
      });

      await this.createTables();
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('Admin', 'Manager'))
      );
    `;

    await this.database.executeSql(createTableQuery);
  }

  public async insertCustomer(customer: ZellerCustomer): Promise<void> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const insertQuery = `
      INSERT OR REPLACE INTO customers (id, name, email, role)
      VALUES (?, ?, ?, ?);
    `;

    // Normalize the role before inserting
    const normalizedRole = this.normalizeRole(customer.role);
    
    try {
      await this.database.executeSql(insertQuery, [
        customer.id,
        customer.name,
        customer.email,
        normalizedRole,
      ]);
    } catch (error) {
      console.error(`Error inserting customer ${customer.name} with role ${normalizedRole}:`, error);
      throw error;
    }
  }

  public async insertCustomers(customers: ZellerCustomer[]): Promise<void> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    if (customers.length === 0) {
      return;
    }

    // Alternative approach: Insert one by one to avoid transaction issues
    try {
      for (let i = 0; i < customers.length; i++) {
        const customer = customers[i];
        await this.insertCustomer(customer);
      }
    } catch (error) {
      console.error('Error in insertCustomers:', error);
      throw error;
    }
  }

  public async getAllCustomers(): Promise<ZellerCustomer[]> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const selectQuery = 'SELECT * FROM customers ORDER BY name ASC;';
    const result = await this.database.executeSql(selectQuery);
    const customers: ZellerCustomer[] = [];
    const rows = result[0].rows;

    for (let i = 0; i < rows.length; i++) {
      const row = rows.item(i);
      // Normalize role when reading to ensure consistency
      const normalizedCustomer: ZellerCustomer = {
        ...row,
        role: this.normalizeRole(row.role),
      };
      customers.push(normalizedCustomer);
    }
    
    return customers;
  }

  public async getCustomersByRole(role: 'Admin' | 'Manager'): Promise<ZellerCustomer[]> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    // Normalize the role before querying
    const normalizedRole = this.normalizeRole(role);
    const selectQuery = 'SELECT * FROM customers WHERE role = ? ORDER BY name ASC;';
    const result = await this.database.executeSql(selectQuery, [normalizedRole]);
    
    const customers: ZellerCustomer[] = [];
    const rows = result[0].rows;
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows.item(i);
      // Normalize role when reading to ensure consistency
      const normalizedCustomer: ZellerCustomer = {
        ...row,
        role: this.normalizeRole(row.role),
      };
      customers.push(normalizedCustomer);
    }
    
    return customers;
  }

  public async searchCustomers(searchTerm: string): Promise<ZellerCustomer[]> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const selectQuery = `
      SELECT * FROM customers 
      WHERE name LIKE ? 
      ORDER BY name ASC;
    `;
    const result = await this.database.executeSql(selectQuery, [`%${searchTerm}%`]);
    
    const customers: ZellerCustomer[] = [];
    const rows = result[0].rows;
    
    for (let i = 0; i < rows.length; i++) {
      customers.push(rows.item(i));
    }
    
    return customers;
  }

  public async searchCustomersByRole(
    searchTerm: string,
    role: 'Admin' | 'Manager'
  ): Promise<ZellerCustomer[]> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const selectQuery = `
      SELECT * FROM customers 
      WHERE name LIKE ? AND role = ?
      ORDER BY name ASC;
    `;
    const result = await this.database.executeSql(selectQuery, [`%${searchTerm}%`, role]);
    
    const customers: ZellerCustomer[] = [];
    const rows = result[0].rows;
    
    for (let i = 0; i < rows.length; i++) {
      customers.push(rows.item(i));
    }
    
    return customers;
  }

  public async updateCustomer(customer: ZellerCustomer): Promise<void> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const updateQuery = `
      UPDATE customers 
      SET name = ?, email = ?, role = ?
      WHERE id = ?;
    `;

    // Normalize the role before updating
    const normalizedRole = this.normalizeRole(customer.role);
    
    await this.database.executeSql(updateQuery, [
      customer.name,
      customer.email,
      normalizedRole,
      customer.id,
    ]);
  }

  public async deleteCustomer(id: string): Promise<void> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const deleteQuery = 'DELETE FROM customers WHERE id = ?;';
    await this.database.executeSql(deleteQuery, [id]);
  }

  public async clearAllCustomers(): Promise<void> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const deleteQuery = 'DELETE FROM customers;';
    await this.database.executeSql(deleteQuery);
  }

  public async getCustomerCount(): Promise<number> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const countQuery = 'SELECT COUNT(*) as count FROM customers;';
    const result = await this.database.executeSql(countQuery);
    const count = result[0].rows.item(0).count;
    return count;
  }

  public async testDatabaseConnection(): Promise<boolean> {
    try {
      if (!this.database) {
        return false;
      }

      // Test basic query
      const testQuery = 'SELECT name FROM sqlite_master WHERE type="table" AND name="customers";';
      const result = await this.database.executeSql(testQuery);
      
      if (result[0].rows.length === 0) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  public async testInsertSingleCustomer(): Promise<void> {
    const testCustomer: ZellerCustomer = {
      id: 'test-' + Date.now(),
      name: 'Test Customer',
      email: 'test@example.com',
      role: 'Admin',
    };

    await this.insertCustomer(testCustomer);
    await this.deleteCustomer(testCustomer.id);
  }

  public async recreateTableWithoutConstraint(): Promise<void> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    // Drop existing table
    await this.database.executeSql('DROP TABLE IF EXISTS customers;');

    // Create table without CHECK constraint
    const createTableQuery = `
      CREATE TABLE customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT NOT NULL
      );
    `;

    await this.database.executeSql(createTableQuery);
  }

  public async closeDatabase(): Promise<void> {
    if (this.database) {
      await this.database.close();
      this.database = null;
    }
  }
}
