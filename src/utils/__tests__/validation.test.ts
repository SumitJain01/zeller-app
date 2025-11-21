import {ValidationUtils} from '../validation';
import {FormData} from '../../types';

describe('ValidationUtils', () => {
  describe('validateName', () => {
    it('should return error for empty name', () => {
      const result = ValidationUtils.validateName('');
      expect(result).toEqual({
        field: 'name',
        message: 'Name is required',
      });
    });

    it('should return error for name with only spaces', () => {
      const result = ValidationUtils.validateName('   ');
      expect(result).toEqual({
        field: 'name',
        message: 'Name is required',
      });
    });

    it('should return error for name exceeding 50 characters', () => {
      const longName = 'a'.repeat(51);
      const result = ValidationUtils.validateName(longName);
      expect(result).toEqual({
        field: 'name',
        message: 'Name must not exceed 50 characters',
      });
    });

    it('should return error for name with special characters', () => {
      const result = ValidationUtils.validateName('John@Doe');
      expect(result).toEqual({
        field: 'name',
        message: 'Name can only contain alphabets and spaces',
      });
    });

    it('should return error for name with numbers', () => {
      const result = ValidationUtils.validateName('John123');
      expect(result).toEqual({
        field: 'name',
        message: 'Name can only contain alphabets and spaces',
      });
    });

    it('should return null for valid name with alphabets only', () => {
      const result = ValidationUtils.validateName('John');
      expect(result).toBeNull();
    });

    it('should return null for valid name with alphabets and spaces', () => {
      const result = ValidationUtils.validateName('John Doe');
      expect(result).toBeNull();
    });

    it('should return null for valid name at character limit', () => {
      const validName = 'a'.repeat(50);
      const result = ValidationUtils.validateName(validName);
      expect(result).toBeNull();
    });
  });

  describe('validateEmail', () => {
    it('should return error for empty email', () => {
      const result = ValidationUtils.validateEmail('');
      expect(result).toEqual({
        field: 'email',
        message: 'Email is required',
      });
    });

    it('should return error for email with only spaces', () => {
      const result = ValidationUtils.validateEmail('   ');
      expect(result).toEqual({
        field: 'email',
        message: 'Email is required',
      });
    });

    it('should return error for invalid email format', () => {
      const invalidEmails = [
        'invalid',
        'invalid@',
        '@invalid.com',
        'invalid@.com',
        'invalid@domain',
        'invalid.domain.com',
      ];

      invalidEmails.forEach(email => {
        const result = ValidationUtils.validateEmail(email);
        expect(result).toEqual({
          field: 'email',
          message: 'Please enter a valid email address',
        });
      });
    });

    it('should return null for valid email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test+tag@example.org',
        'user123@test-domain.com',
      ];

      validEmails.forEach(email => {
        const result = ValidationUtils.validateEmail(email);
        expect(result).toBeNull();
      });
    });
  });

  describe('validateRole', () => {
    it('should return error for empty role', () => {
      const result = ValidationUtils.validateRole('');
      expect(result).toEqual({
        field: 'role',
        message: 'Please select a valid role (Admin or Manager)',
      });
    });

    it('should return error for invalid role', () => {
      const result = ValidationUtils.validateRole('InvalidRole');
      expect(result).toEqual({
        field: 'role',
        message: 'Please select a valid role (Admin or Manager)',
      });
    });

    it('should return null for Admin role', () => {
      const result = ValidationUtils.validateRole('Admin');
      expect(result).toBeNull();
    });

    it('should return null for Manager role', () => {
      const result = ValidationUtils.validateRole('Manager');
      expect(result).toBeNull();
    });
  });

  describe('validateForm', () => {
    it('should return multiple errors for invalid form data', () => {
      const formData: FormData = {
        name: '',
        email: 'invalid-email',
        role: 'Admin',
      };

      const result = ValidationUtils.validateForm(formData);
      expect(result).toHaveLength(2);
      expect(result[0].field).toBe('name');
      expect(result[1].field).toBe('email');
    });

    it('should return empty array for valid form data', () => {
      const formData: FormData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'Manager',
      };

      const result = ValidationUtils.validateForm(formData);
      expect(result).toHaveLength(0);
    });
  });

  describe('generateUniqueId', () => {
    it('should generate unique IDs', () => {
      const id1 = ValidationUtils.generateUniqueId();
      const id2 = ValidationUtils.generateUniqueId();
      
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
      expect(id2.length).toBeGreaterThan(0);
    });
  });
});
