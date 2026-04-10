import { LocalizedText } from "../../common/application/localized-text.interface";

interface MessageEntry {
  title: LocalizedText;
  description: LocalizedText;
}

export const MESSAGES: Record<number, MessageEntry> = {
  // Success
  200: {
    title: { en: "Success", ar: "نجاح" },
    description: {
      en: "The request was successfully processed.",
      ar: "تم معالجة الطلب بنجاح",
    },
  },
  201: {
    title: { en: "Created", ar: "تم الإنشاء" },
    description: {
      en: "The resource was successfully created.",
      ar: "تم إنشاء المورد بنجاح",
    },
  },

  // HTTP standard errors
  400: {
    title: { en: "Bad request", ar: "طلب غير صالح" },
    description: {
      en: "The request could not be understood.",
      ar: "لا يمكن فهم الطلب.",
    },
  },
  401: {
    title: { en: "Unauthorized", ar: "غير مصرح" },
    description: {
      en: "Authentication is required.",
      ar: "مطلوب تسجيل الدخول.",
    },
  },
  403: {
    title: { en: "Forbidden", ar: "محظور" },
    description: {
      en: "You do not have permission to perform this action.",
      ar: "ليس لديك صلاحية لتنفيذ هذا الإجراء.",
    },
  },
  404: {
    title: { en: "Not found", ar: "غير موجود" },
    description: {
      en: "The requested resource does not exist.",
      ar: "المورد المطلوب غير موجود.",
    },
  },
  422: {
    title: { en: "Validation failed", ar: "فشل التحقق" },
    description: {
      en: "Please check the highlighted fields and try again.",
      ar: "يرجى التحقق من الحقول المحددة والمحاولة مرة أخرى.",
    },
  },
  429: {
    title: { en: "Too many requests", ar: "طلبات كثيرة" },
    description: {
      en: "You have exceeded the rate limit. Please try again later.",
      ar: "لقد تجاوزت الحد المسموح. يرجى المحاولة لاحقاً.",
    },
  },
  500: {
    title: { en: "Internal server error", ar: "خطأ في الخادم" },
    description: {
      en: "An unexpected error occurred. Please contact support.",
      ar: "حدث خطأ غير متوقع. يرجى التواصل مع الدعم.",
    },
  },

  // 1xxx — Authentication
  1001: {
    title: { en: "Token expired", ar: "انتهت صلاحية الرمز" },
    description: {
      en: "Your session has expired. Please log in again.",
      ar: "انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.",
    },
  },
  1002: {
    title: { en: "Invalid credentials", ar: "بيانات اعتماد غير صالحة" },
    description: {
      en: "The provided credentials are incorrect.",
      ar: "بيانات الاعتماد المقدمة غير صحيحة.",
    },
  },

  // 2xxx — Authorization
  2001: {
    title: { en: "Insufficient permissions", ar: "صلاحيات غير كافية" },
    description: {
      en: "You do not have the required permissions for this action.",
      ar: "ليس لديك الصلاحيات المطلوبة لهذا الإجراء.",
    },
  },
  2002: {
    title: { en: "Tenant access denied", ar: "رفض الوصول" },
    description: {
      en: "You do not have access to this program or branch.",
      ar: "ليس لديك حق الوصول لهذا البرنامج أو الفرع.",
    },
  },

  // 3xxx — Validation
  3001: {
    title: { en: "Validation failed", ar: "فشل التحقق" },
    description: {
      en: "Please check the highlighted fields and try again.",
      ar: "يرجى التحقق من الحقول المحددة والمحاولة مرة أخرى.",
    },
  },

  // 4xxx — Not Found / Business
  4001: {
    title: { en: "Book not found", ar: "الكتاب غير موجود" },
    description: {
      en: "The requested book does not exist in the catalog.",
      ar: "الكتاب المطلوب غير موجود في الفهرس.",
    },
  },
  4002: {
    title: { en: "Patron not found", ar: "المستعير غير موجود" },
    description: {
      en: "The requested patron does not exist.",
      ar: "المستعير المطلوب غير موجود.",
    },
  },

  // 5xxx — Circulation
  5001: {
    title: { en: "Book not available", ar: "الكتاب غير متاح" },
    description: {
      en: "This book is currently checked out by another patron.",
      ar: "هذا الكتاب مُعار حالياً لمستعير آخر.",
    },
  },
  5002: {
    title: { en: "Already checked out", ar: "مُعار مسبقاً" },
    description: {
      en: "This patron already has this book checked out.",
      ar: "هذا المستعير لديه هذا الكتاب مُعاراً بالفعل.",
    },
  },
  5003: {
    title: { en: "Overdue block", ar: "حظر بسبب تأخير" },
    description: {
      en: "This patron has overdue items and cannot borrow new books.",
      ar: "لدى هذا المستعير كتب متأخرة ولا يمكنه استعارة كتب جديدة.",
    },
  },
  5004: {
    title: { en: "Loan limit exceeded", ar: "تم تجاوز حد الإعارة" },
    description: {
      en: "This patron has reached the maximum number of loans.",
      ar: "وصل هذا المستعير إلى الحد الأقصى لعدد الإعارات.",
    },
  },

  // 6xxx — Catalog
  6001: {
    title: { en: "Duplicate ISBN", ar: "رقم ISBN مكرر" },
    description: {
      en: "A book with this ISBN already exists in the catalog.",
      ar: "يوجد كتاب بنفس رقم ISBN في الفهرس بالفعل.",
    },
  },

  // 9xxx — System
  9001: {
    title: { en: "Database unavailable", ar: "قاعدة البيانات غير متاحة" },
    description: {
      en: "The database is temporarily unavailable. Please try again later.",
      ar: "قاعدة البيانات غير متاحة مؤقتاً. يرجى المحاولة لاحقاً.",
    },
  },
  9002: {
    title: { en: "Search service unavailable", ar: "خدمة البحث غير متاحة" },
    description: {
      en: "The search service is temporarily unavailable.",
      ar: "خدمة البحث غير متاحة مؤقتاً.",
    },
  },
};
