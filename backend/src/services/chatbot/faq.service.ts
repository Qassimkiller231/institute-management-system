import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface FAQMatch {
  id: string;
  response: string;
  keywords: string[];
  roles: string[];
}

// Initial seed data to ensure DB isn't empty on first run
const INITIAL_FAQS = [
  {
    question: "Greeting",
    keywords: ['hello', 'hi', 'hey'],
    answer: "Hello! I'm here to help you with questions about attendance, payments, schedules, and more. How can I assist you today?",
    category: "General",
    roles: ["ALL"]
  },
  {
    question: "Capabilities",
    keywords: ['help', 'what can you do'],
    answer: "I can help you with:\n- Checking your attendance\n- Viewing payment status\n- Class schedules\n- Program information\n- Teacher details\n\nJust ask me a question!",
    category: "General",
    roles: ["ALL"]
  },
  {
    question: "Programs",
    keywords: ['programs', 'courses', 'what programs'],
    answer: "The Function Institute offers two main programs:\n\n1. **English Multiverse** (Ages 11-17)\n2. **English Unlimited** (Ages 18+)\n\nBoth programs have levels A1, A2, B1, and B2.",
    category: "Academic",
    roles: ["ALL"]
  },
  {
    question: "Levels",
    keywords: ['levels', 'what levels'],
    answer: "We offer 4 levels for each program:\n- **A1**: Beginner\n- **A2**: Elementary\n- **B1**: Intermediate\n- **B2**: Upper Intermediate",
    category: "Academic",
    roles: ["ALL"]
  },
  {
    question: "Locations",
    keywords: ['location', 'venue', 'where', 'address'],
    answer: "We have two locations:\n\n1. **Country Mall** (3 halls)\n2. **Riyadat Mall** (2 halls)\n\nYour specific class location will be shown in your schedule.",
    category: "General",
    roles: ["ALL"]
  },
  {
    question: "Attendance Policy",
    keywords: ['attendance percentage', 'attendance requirement'],
    answer: "Students must maintain **75% attendance** to continue in the program. If attendance falls below this, you may receive a warning.",
    category: "Policy",
    roles: ["ALL"]
  },
  {
    question: "Check Attendance",
    keywords: ['how to check attendance', 'view attendance'],
    answer: "To check your attendance, you can:\n1. Ask me 'What is my attendance?'\n2. View your student dashboard\n3. Check the attendance report in your portal",
    category: "Policy",
    roles: ["ALL"]
  },
  {
    question: "Payment Methods",
    keywords: ['payment methods', 'how to pay'],
    answer: "We accept the following payment methods:\n- Benefit Pay\n- Bank Transfer\n- Cash\n- Card Machine\n- Online payment (Stripe)\n\nPayments can be made in installments (1-4 installments).",
    category: "Financial",
    roles: ["ALL"]
  },
  {
    question: "Installments",
    keywords: ['installment', 'installments'],
    answer: "You can pay your fees in 1 to 4 installments. The total fee is divided equally across the installments you choose.",
    category: "Financial",
    roles: ["ALL"]
  },
  {
    question: "Contact Info",
    keywords: ['contact', 'email', 'phone'],
    answer: "For general inquiries, please contact:\n- Email: admin@functioninstitute.com\n- Phone: +973 XXXX XXXX\n\nOr speak to an admin at either of our venues.",
    category: "General",
    roles: ["ALL"]
  },
  {
    question: "Operating Hours",
    keywords: ['hours', 'when open', 'operating hours'],
    answer: "We operate during evening hours to accommodate school/work schedules. Specific class times vary by group. Check your schedule for exact timings.",
    category: "General",
    roles: ["ALL"]
  }
];

/**
 * Ensure initial FAQs exist
 */
export const initializeFAQs = async () => {
  try {
    const count = await prisma.fAQ.count();
    if (count === 0) {
      console.log('🌱 Seeding initial FAQs...');
      for (const faq of INITIAL_FAQS) {
        await prisma.fAQ.create({
          data: {
            question: faq.question,
            keywords: faq.keywords,
            answer: faq.answer,
            category: faq.category,
            isActive: true,
            roles: faq.roles
          }
        });
      }
      console.log('✅ FAQs seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding FAQs:', error);
  }
};

/**
 * Get FAQ response from Database
 */
export const getFAQResponse = async (message: string, userRole: string): Promise<string | null> => {
  try {
    const lowerMessage = message.toLowerCase();

    // Fetch all active FAQs (Optimally we might want full text search, but array filter is fine for <1000 items)
    // We explicitly check Active status
    const faqs = await prisma.fAQ.findMany({
      where: { isActive: true }
    });

    for (const faq of faqs) {
      // Check if role matches (if restricted)
      const hasRoleAccess = faq.roles.includes('ALL') || faq.roles.includes(userRole);
      if (!hasRoleAccess) continue;

      // Check keyword match
      const matches = faq.keywords.some(keyword =>
        lowerMessage.includes(keyword.toLowerCase())
      );

      if (matches) {
        return faq.answer;
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching FAQ from DB:', error);
    return null;
  }
};

/**
 * Get all FAQs (for admin management)
 */
export const getAllFAQs = async () => {
  return await prisma.fAQ.findMany({
    orderBy: { order: 'asc' }
  });
};