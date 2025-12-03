import type { PatientCreateDto, PatientUpdateDto } from "@/types/api";

export type ValidationErrors = { [key: string]: string };

export const validatePesel = (pesel: string): boolean => {
  if (!/^\d{11}$/.test(pesel)) return false;
  const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
  const digits = pesel.split("").map(Number);
  const sum = weights.reduce((acc, weight, i) => acc + weight * digits[i], 0);
  const checksum = (10 - (sum % 10)) % 10;
  return checksum === digits[10];
};

export const validatePhone = (phone: string): boolean => {
  return /^\d{9}$/.test(phone);
};

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePostalCode = (code: string): boolean => {
  return /^\d{2}-\d{3}$/.test(code);
};

export type PatientFormData = PatientCreateDto | PatientUpdateDto;

export const validatePatientForm = (formData: PatientFormData): ValidationErrors => {
  const newErrors: ValidationErrors = {};

  if (!formData.firstName?.trim()) {
    newErrors.firstName = "Imię jest wymagane";
  }

  if (!formData.lastName?.trim()) {
    newErrors.lastName = "Nazwisko jest wymagane";
  }

  if (!validateEmail(formData.email || "")) {
    newErrors.email = "Nieprawidłowy adres email";
  }

  if (!validatePesel(formData.pesel || "")) {
    newErrors.pesel = "PESEL musi składać się z 11 cyfr i być poprawny";
  }

  if (!validatePhone(formData.phone || "")) {
    newErrors.phone = "Numer telefonu musi składać się z 9 cyfr";
  }

  if (!formData.birthday) {
    newErrors.birthday = "Data urodzenia jest wymagana";
  }

  if (!formData.gender) {
    newErrors.gender = "Płeć jest wymagana";
  }

  if (!formData.street?.trim()) {
    newErrors.street = "Ulica jest wymagana";
  }

  if (!formData.houseNumber?.trim()) {
    newErrors.houseNumber = "Numer domu jest wymagany";
  }

  if (!formData.city?.trim()) {
    newErrors.city = "Miejscowość jest wymagana";
  }

  if (formData.postalCode && !validatePostalCode(formData.postalCode)) {
    newErrors.postalCode = "Kod pocztowy musi być w formacie XX-XXX";
  }

  if (!formData.postalCode?.trim()) {
    newErrors.postalCode = "Kod pocztowy jest wymagany";
  }

  return newErrors;
};
