import {ValidationError, FormData} from '../types';

export class ValidationUtils {
  public static validateName(name: string): ValidationError | null {
    if (!name || name.trim().length === 0) {
      return {
        field: 'name',
        message: 'Name is required',
      };
    }

    if (name.length > 50) {
      return {
        field: 'name',
        message: 'Name must not exceed 50 characters',
      };
    }

    // Check for special characters (only alphabets and spaces allowed)
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(name)) {
      return {
        field: 'name',
        message: 'Name can only contain alphabets and spaces',
      };
    }

    return null;
  }

  public static validateEmail(email: string): ValidationError | null {
    if (!email || email.trim().length === 0) {
      return {
        field: 'email',
        message: 'Email is required',
      };
    }

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        field: 'email',
        message: 'Please enter a valid email address',
      };
    }

    return null;
  }

  public static validateRole(role: string): ValidationError | null {
    if (!role || (role !== 'Admin' && role !== 'Manager')) {
      return {
        field: 'role',
        message: 'Please select a valid role (Admin or Manager)',
      };
    }

    return null;
  }

  public static validateForm(formData: FormData): ValidationError[] {
    const errors: ValidationError[] = [];

    const nameError = this.validateName(formData.name);
    if (nameError) {
      errors.push(nameError);
    }

    const emailError = this.validateEmail(formData.email);
    if (emailError) {
      errors.push(emailError);
    }

    const roleError = this.validateRole(formData.role);
    if (roleError) {
      errors.push(roleError);
    }

    return errors;
  }

  public static generateUniqueId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}
