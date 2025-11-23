interface FAQ {
  keywords: string[];
  response: string;
  roles?: string[]; // If undefined, applies to all roles
}

const faqs: FAQ[] = [
  // General FAQs
  {
    keywords: ['hello', 'hi', 'hey'],
    response: "Hello! I'm here to help you with questions about attendance, payments, schedules, and more. How can I assist you today?"
  },
  {
    keywords: ['help', 'what can you do'],
    response: "I can help you with:\n- Checking your attendance\n- Viewing payment status\n- Class schedules\n- Program information\n- Teacher details\n\nJust ask me a question!"
  },
  
  // Programs
  {
    keywords: ['programs', 'courses', 'what programs'],
    response: "The Function Institute offers two main programs:\n\n1. **English Multiverse** (Ages 11-17)\n2. **English Unlimited** (Ages 18+)\n\nBoth programs have levels A1, A2, B1, and B2."
  },
  {
    keywords: ['levels', 'what levels'],
    response: "We offer 4 levels for each program:\n- **A1**: Beginner\n- **A2**: Elementary\n- **B1**: Intermediate\n- **B2**: Upper Intermediate"
  },
  
  // Venues
  {
    keywords: ['location', 'venue', 'where', 'address'],
    response: "We have two locations:\n\n1. **Country Mall** (3 halls)\n2. **Riyadat Mall** (2 halls)\n\nYour specific class location will be shown in your schedule."
  },
  
  // Attendance
  {
    keywords: ['attendance percentage', 'attendance requirement'],
    response: "Students must maintain **75% attendance** to continue in the program. If attendance falls below this, you may receive a warning."
  },
  {
    keywords: ['how to check attendance', 'view attendance'],
    response: "To check your attendance, you can:\n1. Ask me 'What is my attendance?'\n2. View your student dashboard\n3. Check the attendance report in your portal"
  },
  
  // Payments
  {
    keywords: ['payment methods', 'how to pay'],
    response: "We accept the following payment methods:\n- Benefit Pay\n- Bank Transfer\n- Cash\n- Card Machine\n- Online payment (Stripe)\n\nPayments can be made in installments (1-4 installments)."
  },
  {
    keywords: ['installment', 'installments'],
    response: "You can pay your fees in 1 to 4 installments. The total fee is divided equally across the installments you choose."
  },
  
  // Contact
  {
    keywords: ['contact', 'email', 'phone'],
    response: "For general inquiries, please contact:\n- Email: admin@functioninstitute.com\n- Phone: +973 XXXX XXXX\n\nOr speak to an admin at either of our venues."
  },
  
  // Hours/Schedule
  {
    keywords: ['hours', 'when open', 'operating hours'],
    response: "We operate during evening hours to accommodate school/work schedules. Specific class times vary by group. Check your schedule for exact timings."
  }
];

/**
 * Get FAQ response if query matches
 */
export const getFAQResponse = (message: string, userRole: string): string | null => {
  const lowerMessage = message.toLowerCase();
  
  for (const faq of faqs) {
    // Check if any keyword matches
    const matches = faq.keywords.some(keyword => 
      lowerMessage.includes(keyword.toLowerCase())
    );
    
    if (matches) {
      // Check if FAQ is role-specific
      if (faq.roles && !faq.roles.includes(userRole)) {
        continue;
      }
      
      return faq.response;
    }
  }
  
  return null;
};

/**
 * Get all FAQs (for admin management)
 */
export const getAllFAQs = () => {
  return faqs.map((faq, index) => ({
    id: index + 1,
    keywords: faq.keywords,
    response: faq.response,
    roles: faq.roles || ['ALL']
  }));
};