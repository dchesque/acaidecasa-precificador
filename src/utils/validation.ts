import { z } from "zod";

const DIGITS_ONLY = /\D+/g;

const phoneRegex = /^(?:\+55\s?)?(?:\(?\d{2}\)?\s?)?(?:9\d{4}|\d{4})-?\d{4}$/;

const cpfRegex = /^(\d{3}\.?){3}-?\d{2}$/;
const cnpjRegex = /^(\d{2}\.?){2}\d{3}\/?\d{4}-?\d{2}$/;

const stripNonDigits = (value: string) => value.replace(DIGITS_ONLY, "");

export const isValidPhone = (value: string) => {
  const digits = stripNonDigits(value);
  return digits.length === 10 || digits.length === 11;
};

const calculateCpfCnpjCheckDigits = (base: number[], factors: number[]): number => {
  const sum = base.reduce((acc, digit, index) => acc + digit * factors[index], 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
};

const isRepeatedSequence = (digits: string) => digits.split("").every((d) => d === digits[0]);

export const isValidCPF = (value: string) => {
  const digits = stripNonDigits(value);
  if (digits.length !== 11 || isRepeatedSequence(digits)) {
    return false;
  }

  const base = digits.slice(0, 9).split("").map(Number);
  const checkDigits = digits.slice(9).split("").map(Number);

  const firstCheck = calculateCpfCnpjCheckDigits(base, [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  if (firstCheck !== checkDigits[0]) {
    return false;
  }

  const secondCheck = calculateCpfCnpjCheckDigits([...base, firstCheck], [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
  return secondCheck === checkDigits[1];
};

export const isValidCNPJ = (value: string) => {
  const digits = stripNonDigits(value);
  if (digits.length !== 14 || isRepeatedSequence(digits)) {
    return false;
  }

  const base = digits.slice(0, 12).split("").map(Number);
  const checkDigits = digits.slice(12).split("").map(Number);

  const firstCheck = calculateCpfCnpjCheckDigits(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  if (firstCheck !== checkDigits[0]) {
    return false;
  }

  const secondCheck = calculateCpfCnpjCheckDigits([...base, firstCheck], [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return secondCheck === checkDigits[1];
};

export const parseBrazilianCurrency = (value: string) => {
  const normalized = value
    .replace(/\s|R\$|\u00A0/g, "")
    .replace(/\./g, "")
    .replace(/,/g, ".");

  const parsed = Number(normalized);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return Math.round(parsed * 100) / 100;
};

const optionalString = () =>
  z.preprocess((val) => {
    if (typeof val !== "string") {
      return undefined;
    }
    const trimmed = val.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  }, z.string().optional());

export const optionalStringField = () => optionalString();

export const optionalEmailField = () =>
  optionalString().refine((val) => !val || z.string().email().safeParse(val).success, {
    message: "Email invalido",
  });

export const optionalPhoneField = () =>
  optionalString().refine((val) => !val || (phoneRegex.test(val) && isValidPhone(val)), {
    message: "Telefone invalido",
  });

export const optionalCpfField = () =>
  optionalString().refine((val) => !val || (cpfRegex.test(val) && isValidCPF(val)), {
    message: "CPF invalido",
  });

export const optionalCnpjField = () =>
  optionalString().refine((val) => !val || (cnpjRegex.test(val) && isValidCNPJ(val)), {
    message: "CNPJ invalido",
  });

export const optionalIntegerField = (message = "Valor invalido") =>
  z.preprocess((val) => {
    if (typeof val === "number") {
      return Number.isFinite(val) ? Math.trunc(val) : undefined;
    }
    if (typeof val === "string") {
      const trimmed = val.trim();
      if (!trimmed) {
        return undefined;
      }
      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? Math.trunc(parsed) : undefined;
    }
    return undefined;
  }, z.number().int().min(0, { message }).optional());

export const optionalCurrencyField = (message = "Valor monetario invalido") =>
  z.preprocess((val) => {
    if (typeof val === "number") {
      return Number.isFinite(val) ? Math.round(val * 100) / 100 : undefined;
    }
    if (typeof val === "string") {
      const trimmed = val.trim();
      if (!trimmed) {
        return undefined;
      }
      const parsed = parseBrazilianCurrency(trimmed);
      return parsed ?? undefined;
    }
    return undefined;
  }, z.number().min(0, { message }).optional());
