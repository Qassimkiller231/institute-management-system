--
-- PostgreSQL database dump
--

\restrict Eou5z6RX0wAqgi5iGGWZG8hLBw99dCfiISA7RPzWF4sqlrSdIiTFrcOunZ5Mcdt

-- Dumped from database version 18.1 (Postgres.app)
-- Dumped by pg_dump version 18.1 (Postgres.app)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Announcement; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."Announcement" (
    id text NOT NULL,
    "groupId" text,
    "termId" text,
    title text NOT NULL,
    content text NOT NULL,
    "targetAudience" text NOT NULL,
    "publishedBy" text,
    "publishedAt" timestamp(3) without time zone,
    "scheduledFor" timestamp(3) without time zone,
    "isPublished" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Announcement" OWNER TO macbookairm3;

--
-- Name: Attendance; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."Attendance" (
    id text NOT NULL,
    "classSessionId" text NOT NULL,
    "studentId" text NOT NULL,
    "enrollmentId" text NOT NULL,
    status text NOT NULL,
    "markedAt" timestamp(3) without time zone NOT NULL,
    "markedBy" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Attendance" OWNER TO macbookairm3;

--
-- Name: AttendanceWarning; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."AttendanceWarning" (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "attendancePercentage" double precision NOT NULL,
    "sentAt" timestamp(3) without time zone NOT NULL,
    "sentVia" text NOT NULL
);


ALTER TABLE public."AttendanceWarning" OWNER TO macbookairm3;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "userId" text,
    action text NOT NULL,
    "tableName" text,
    "recordId" text,
    "oldValues" jsonb,
    "newValues" jsonb,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AuditLog" OWNER TO macbookairm3;

--
-- Name: ChatMessage; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."ChatMessage" (
    id text NOT NULL,
    "userId" text,
    "userRole" text NOT NULL,
    message text NOT NULL,
    response text NOT NULL,
    context jsonb,
    "queryType" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ChatMessage" OWNER TO macbookairm3;

--
-- Name: ClassSession; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."ClassSession" (
    id text NOT NULL,
    "groupId" text NOT NULL,
    "hallId" text,
    "sessionDate" date NOT NULL,
    "sessionNumber" integer NOT NULL,
    "startTime" time without time zone NOT NULL,
    "endTime" time without time zone NOT NULL,
    topic text,
    status text DEFAULT 'SCHEDULED'::text NOT NULL,
    "cancellationReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ClassSession" OWNER TO macbookairm3;

--
-- Name: Enrollment; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."Enrollment" (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "groupId" text NOT NULL,
    "enrollmentDate" date NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "withdrawalDate" date,
    "withdrawalReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "areasForImprovement" jsonb,
    "overallPerformance" text,
    strengths jsonb,
    "teacherComments" text
);


ALTER TABLE public."Enrollment" OWNER TO macbookairm3;

--
-- Name: Group; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."Group" (
    id text NOT NULL,
    "termId" text NOT NULL,
    "levelId" text NOT NULL,
    "teacherId" text,
    "venueId" text,
    "groupCode" text NOT NULL,
    name text,
    schedule jsonb,
    capacity integer DEFAULT 15 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Group" OWNER TO macbookairm3;

--
-- Name: Hall; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."Hall" (
    id text NOT NULL,
    "venueId" text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    capacity integer,
    floor text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Hall" OWNER TO macbookairm3;

--
-- Name: Installment; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."Installment" (
    id text NOT NULL,
    "paymentPlanId" text NOT NULL,
    "installmentNumber" integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    "paymentDate" date,
    "paymentMethod" text NOT NULL,
    "receiptNumber" text,
    "receiptUrl" text,
    "receiptMakerId" text,
    "benefitReferenceNumber" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dueDate" date
);


ALTER TABLE public."Installment" OWNER TO macbookairm3;

--
-- Name: Level; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."Level" (
    id text NOT NULL,
    name text NOT NULL,
    "displayName" text,
    "orderNumber" integer,
    description text,
    "isMixed" boolean DEFAULT false NOT NULL,
    "mixedLevels" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Level" OWNER TO macbookairm3;

--
-- Name: Material; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."Material" (
    id text NOT NULL,
    "groupId" text NOT NULL,
    title text NOT NULL,
    description text,
    "materialType" text NOT NULL,
    "fileUrl" text,
    "fileSizeKb" integer,
    "uploadedBy" text,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."Material" OWNER TO macbookairm3;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    "linkUrl" text,
    "isRead" boolean DEFAULT false NOT NULL,
    "readAt" timestamp(3) without time zone,
    "sentVia" text,
    "sentAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Notification" OWNER TO macbookairm3;

--
-- Name: OtpCode; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."OtpCode" (
    id text NOT NULL,
    "userId" text NOT NULL,
    code text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "isUsed" boolean DEFAULT false NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."OtpCode" OWNER TO macbookairm3;

--
-- Name: Parent; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."Parent" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Parent" OWNER TO macbookairm3;

--
-- Name: ParentStudentLink; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."ParentStudentLink" (
    id text NOT NULL,
    "parentId" text NOT NULL,
    "studentId" text NOT NULL,
    relationship text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ParentStudentLink" OWNER TO macbookairm3;

--
-- Name: PaymentReminder; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."PaymentReminder" (
    id text NOT NULL,
    "installmentId" text NOT NULL,
    "reminderType" text NOT NULL,
    "sentAt" timestamp(3) without time zone NOT NULL,
    "sentVia" text NOT NULL
);


ALTER TABLE public."PaymentReminder" OWNER TO macbookairm3;

--
-- Name: Phone; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."Phone" (
    id text NOT NULL,
    "phoneNumber" text NOT NULL,
    "countryCode" text DEFAULT '+973'::text NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    "isPrimary" boolean DEFAULT false NOT NULL,
    "studentId" text,
    "parentId" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Phone" OWNER TO macbookairm3;

--
-- Name: Program; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."Program" (
    id text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    "minAge" integer,
    "maxAge" integer,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Program" OWNER TO macbookairm3;

--
-- Name: ProgressCriteria; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."ProgressCriteria" (
    id text NOT NULL,
    "levelId" text,
    "groupId" text,
    name text NOT NULL,
    description text,
    "orderNumber" integer,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProgressCriteria" OWNER TO macbookairm3;

--
-- Name: Refund; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."Refund" (
    id text NOT NULL,
    "installmentId" text,
    "enrollmentId" text NOT NULL,
    "refundAmount" numeric(10,2) NOT NULL,
    "refundReason" text NOT NULL,
    "refundMethod" text,
    "requestedBy" text NOT NULL,
    "requestedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "approvedBy" text,
    "approvedAt" timestamp(3) without time zone,
    "processedBy" text,
    "processedAt" timestamp(3) without time zone,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "receiptUrl" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Refund" OWNER TO macbookairm3;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "userId" text NOT NULL,
    token text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Session" OWNER TO macbookairm3;

--
-- Name: SpeakingSlot; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."SpeakingSlot" (
    id text NOT NULL,
    "teacherId" text NOT NULL,
    "studentId" text,
    "testSessionId" text,
    "slotDate" date NOT NULL,
    "slotTime" time without time zone NOT NULL,
    "durationMinutes" integer DEFAULT 15 NOT NULL,
    status text DEFAULT 'AVAILABLE'::text NOT NULL,
    score numeric(5,2),
    feedback text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SpeakingSlot" OWNER TO macbookairm3;

--
-- Name: Student; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."Student" (
    id text NOT NULL,
    "userId" text NOT NULL,
    cpr text NOT NULL,
    "firstName" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    area text,
    block text,
    "dateOfBirth" date NOT NULL,
    email text,
    gender text NOT NULL,
    "healthIssues" text,
    "houseNo" text,
    "howHeardAbout" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "needsTransport" boolean DEFAULT false NOT NULL,
    notes text,
    "preferredCenter" text,
    "preferredTiming" text,
    "referralPerson" text,
    road text,
    "schoolType" text,
    "schoolYear" text,
    "secondName" text,
    "thirdName" text,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "canSeePayment" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."Student" OWNER TO macbookairm3;

--
-- Name: StudentCriteriaCompletion; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."StudentCriteriaCompletion" (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "criteriaId" text NOT NULL,
    "enrollmentId" text,
    completed boolean DEFAULT false NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."StudentCriteriaCompletion" OWNER TO macbookairm3;

--
-- Name: StudentPaymentPlan; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."StudentPaymentPlan" (
    id text NOT NULL,
    "enrollmentId" text NOT NULL,
    "totalAmount" numeric(10,2) NOT NULL,
    "discountAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    "discountReason" text,
    "finalAmount" numeric(10,2) NOT NULL,
    "totalInstallments" integer NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."StudentPaymentPlan" OWNER TO macbookairm3;

--
-- Name: Teacher; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."Teacher" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    specialization text,
    "isActive" boolean DEFAULT true NOT NULL,
    "availableForSpeakingTests" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Teacher" OWNER TO macbookairm3;

--
-- Name: TeacherScheduleOverride; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."TeacherScheduleOverride" (
    id text NOT NULL,
    "teacherId" text NOT NULL,
    "overrideDate" date NOT NULL,
    "isAvailable" boolean NOT NULL,
    "startTime" time without time zone,
    "endTime" time without time zone,
    reason text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."TeacherScheduleOverride" OWNER TO macbookairm3;

--
-- Name: TeacherScheduleTemplate; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."TeacherScheduleTemplate" (
    id text NOT NULL,
    "teacherId" text NOT NULL,
    "dayOfWeek" integer NOT NULL,
    "startTime" time without time zone NOT NULL,
    "endTime" time without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."TeacherScheduleTemplate" OWNER TO macbookairm3;

--
-- Name: Term; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."Term" (
    id text NOT NULL,
    "programId" text NOT NULL,
    name text NOT NULL,
    "startDate" date NOT NULL,
    "endDate" date NOT NULL,
    "isCurrent" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Term" OWNER TO macbookairm3;

--
-- Name: Test; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."Test" (
    id text NOT NULL,
    name text NOT NULL,
    "testType" text NOT NULL,
    "levelId" text,
    "totalQuestions" integer NOT NULL,
    "durationMinutes" integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Test" OWNER TO macbookairm3;

--
-- Name: TestQuestion; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."TestQuestion" (
    id text NOT NULL,
    "testId" text NOT NULL,
    "questionText" text NOT NULL,
    "questionType" text NOT NULL,
    options jsonb,
    "correctAnswer" text NOT NULL,
    points integer DEFAULT 1 NOT NULL,
    "orderNumber" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."TestQuestion" OWNER TO macbookairm3;

--
-- Name: TestSession; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."TestSession" (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "testId" text NOT NULL,
    "startedAt" timestamp(3) without time zone NOT NULL,
    "completedAt" timestamp(3) without time zone,
    score numeric(5,2),
    answers jsonb,
    status text DEFAULT 'IN_PROGRESS'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."TestSession" OWNER TO macbookairm3;

--
-- Name: User; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    phone text,
    role text DEFAULT 'STUDENT'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "lastLogin" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO macbookairm3;

--
-- Name: Venue; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."Venue" (
    id text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    address text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Venue" OWNER TO macbookairm3;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO macbookairm3;

--
-- Data for Name: Announcement; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Announcement" (id, "groupId", "termId", title, content, "targetAudience", "publishedBy", "publishedAt", "scheduledFor", "isPublished", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Attendance; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Attendance" (id, "classSessionId", "studentId", "enrollmentId", status, "markedAt", "markedBy", notes, "createdAt", "updatedAt") FROM stdin;
5a3677d0-67da-4451-a4fa-2419e3ddd67f	bea3897d-0a1f-47e0-9cea-87b028b766ad	cee2506e-8f68-40df-8fe8-4c5444cecda9	aab1ba9f-f530-4f2b-8562-840b18b6c116	ABSENT	2025-11-17 20:21:52.986	31b6851c-a0d1-4ccc-adcc-1073d6c9946a	No notification received	2025-11-17 20:21:52.987	2025-11-17 20:21:52.987
ff14bda8-b1ed-4551-9a83-ad330a29266b	bea3897d-0a1f-47e0-9cea-87b028b766ad	b9314efd-8a0b-4a78-8a16-099cd6b4a6e9	6b689442-806e-4081-912e-44dcd7d5e0e1	LATE	2025-11-17 20:21:56.552	31b6851c-a0d1-4ccc-adcc-1073d6c9946a	Arrived 15 minutes late	2025-11-17 20:21:56.553	2025-11-17 20:21:56.553
c2b1202d-b702-4b00-9858-9e10a4530a21	bea3897d-0a1f-47e0-9cea-87b028b766ad	9a617c37-a2ab-47db-9213-d1feac8add95	376fccbf-02d4-4317-b914-c24de5ee37b6	PRESENT	2025-11-17 20:24:24.494	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	2025-11-17 20:24:24.495	2025-11-17 20:24:24.495
\.


--
-- Data for Name: AttendanceWarning; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."AttendanceWarning" (id, "studentId", "attendancePercentage", "sentAt", "sentVia") FROM stdin;
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."AuditLog" (id, "userId", action, "tableName", "recordId", "oldValues", "newValues", "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: ChatMessage; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."ChatMessage" (id, "userId", "userRole", message, response, context, "queryType", "createdAt") FROM stdin;
d8feedf7-a88a-4c76-890f-80c37b41018c	462ccd39-1359-4616-81c2-3c31a81d8ce3	ADMIN	What is the overall attendance?	📊 **Overall Attendance:**\n- Average Attendance: 66.7%\n- Total Records: 3\n- At-Risk Students (< 75%): 1\n- Active Students: 6	{"usedAI": false}	ATTENDANCE	2025-11-22 07:01:44.737
\.


--
-- Data for Name: ClassSession; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."ClassSession" (id, "groupId", "hallId", "sessionDate", "sessionNumber", "startTime", "endTime", topic, status, "cancellationReason", "createdAt", "updatedAt") FROM stdin;
c9a8c89e-4ff9-4ad0-807b-483b231eb772	ce7ad635-c179-46b4-beb0-8cf5fa0404f7	\N	2025-12-03	2	12:00:00	14:00:00	Present Simple Tense	SCHEDULED	\N	2025-11-17 19:26:51.19	2025-11-17 19:26:51.19
9cf0a8c1-6e09-4ffa-833f-ae28188f0a81	ce7ad635-c179-46b4-beb0-8cf5fa0404f7	5719dc5f-1d3b-400e-86eb-f29a5dd6678e	2025-12-05	3	12:00:00	14:00:00	Past Simple Tense	SCHEDULED	\N	2025-11-17 19:26:53.527	2025-11-17 19:26:53.527
1466d399-665d-4142-9f2e-5dfe3076189f	ce7ad635-c179-46b4-beb0-8cf5fa0404f7	5719dc5f-1d3b-400e-86eb-f29a5dd6678e	2025-12-08	4	12:00:00	14:00:00	Future Tense	SCHEDULED	\N	2025-11-17 19:26:53.527	2025-11-17 19:26:53.527
4bb9ff33-8d11-4b45-8d97-211baf266bba	ce7ad635-c179-46b4-beb0-8cf5fa0404f7	5719dc5f-1d3b-400e-86eb-f29a5dd6678e	2025-12-10	5	12:00:00	14:00:00	Present Continuous	SCHEDULED	\N	2025-11-17 19:26:53.527	2025-11-17 19:26:53.527
bea3897d-0a1f-47e0-9cea-87b028b766ad	ce7ad635-c179-46b4-beb0-8cf5fa0404f7	5719dc5f-1d3b-400e-86eb-f29a5dd6678e	2025-12-02	1	13:00:00	15:00:00	Introduction to English Grammar - Updated	COMPLETED	\N	2025-11-17 19:26:42.991	2025-11-17 19:27:16.3
\.


--
-- Data for Name: Enrollment; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Enrollment" (id, "studentId", "groupId", "enrollmentDate", status, "withdrawalDate", "withdrawalReason", "createdAt", "updatedAt", "areasForImprovement", "overallPerformance", strengths, "teacherComments") FROM stdin;
3ab2ef47-fb0e-41ea-895d-1c40b63b1971	44df7d55-02fe-4bf1-8944-478d4f9275ec	c04c38d4-8135-44b9-9612-18d0cec874cc	2025-06-01	ACTIVE	\N	\N	2025-11-15 00:55:26.987	2025-11-15 00:55:26.987	\N	\N	\N	\N
d3d32035-2cc9-4ab6-a025-8dfdca60af32	5f198ff9-cdb2-435d-b3b0-888461180c84	9213c589-0f8f-4b38-b9dc-cadcd3c43442	2025-06-01	ACTIVE	\N	\N	2025-11-15 00:55:26.988	2025-11-15 00:55:26.988	\N	\N	\N	\N
75659e2c-393b-443f-a7a5-32bcd9442f28	b9314efd-8a0b-4a78-8a16-099cd6b4a6e9	ce7ad635-c179-46b4-beb0-8cf5fa0404f7	2025-11-17	WITHDRAWN	\N	\N	2025-11-17 19:50:24.347	2025-11-17 19:55:39.108	\N	\N	\N	\N
376fccbf-02d4-4317-b914-c24de5ee37b6	9a617c37-a2ab-47db-9213-d1feac8add95	ce7ad635-c179-46b4-beb0-8cf5fa0404f7	2025-11-17	ACTIVE	\N	\N	2025-11-17 20:20:45.682	2025-11-17 20:20:45.682	\N	\N	\N	\N
aab1ba9f-f530-4f2b-8562-840b18b6c116	cee2506e-8f68-40df-8fe8-4c5444cecda9	ce7ad635-c179-46b4-beb0-8cf5fa0404f7	2025-11-17	ACTIVE	\N	\N	2025-11-17 20:20:56.498	2025-11-17 20:20:56.498	\N	\N	\N	\N
6b689442-806e-4081-912e-44dcd7d5e0e1	b9314efd-8a0b-4a78-8a16-099cd6b4a6e9	ce7ad635-c179-46b4-beb0-8cf5fa0404f7	2025-11-17	ACTIVE	\N	\N	2025-11-17 20:21:08.151	2025-11-17 20:21:08.151	\N	\N	\N	\N
\.


--
-- Data for Name: Group; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Group" (id, "termId", "levelId", "teacherId", "venueId", "groupCode", name, schedule, capacity, "isActive", "createdAt", "updatedAt") FROM stdin;
c04c38d4-8135-44b9-9612-18d0cec874cc	a62c586c-f3f1-43cd-ac1c-1fb38f120269	7c3d722a-cc6d-4c2f-ae3d-9cecfc257e9b	31b6851c-a0d1-4ccc-adcc-1073d6c9946a	f41e8e8e-ba98-479f-92bf-65138882e64b	22-23/S1/B1/01	B1 Intermediate - Group 1	{"days": ["Sunday", "Tuesday"], "endTime": "18:00", "startTime": "16:00"}	15	t	2025-11-15 00:55:26.983	2025-11-15 00:55:26.983
9213c589-0f8f-4b38-b9dc-cadcd3c43442	a62c586c-f3f1-43cd-ac1c-1fb38f120269	89af8efc-9eab-4c87-b33c-19348ea6822b	964e3e82-84cd-4570-aa96-cf7510b20ded	6186727a-8b3c-4455-9e69-495c843778de	22-23/S1/A2/01	A2 Elementary - Group 1	{"days": ["Monday", "Wednesday"], "endTime": "12:00", "startTime": "10:00"}	15	t	2025-11-15 00:55:26.986	2025-11-15 00:55:26.986
9c5e0abb-1a35-43b4-a6ed-6dae31a69a91	49a33970-5bdf-44f7-8d50-8f4099a58f32	16fb655c-ef9e-4038-895f-e350a5df4604	fd435948-d4a9-44ac-8f4e-e8c9887f696d	f41e8e8e-ba98-479f-92bf-65138882e64b	A1-ME	A1 - Monday Evening (Updated)	{"days": ["Monday", "Wednesday"], "time": "18:00-20:00"}	20	f	2025-11-17 15:01:41.356	2025-11-17 15:09:54.12
6cd3b944-0152-4c8a-af1e-5fde958aadb2	49a33970-5bdf-44f7-8d50-8f4099a58f32	16fb655c-ef9e-4038-895f-e350a5df4604	\N	\N	EM-A2-01	English Multiverse A2 - Group 1	{"days": ["Monday", "Wednesday"], "time": "18:00-20:00"}	15	t	2025-11-17 19:17:51.659	2025-11-17 19:17:51.659
ce7ad635-c179-46b4-beb0-8cf5fa0404f7	49a33970-5bdf-44f7-8d50-8f4099a58f32	16fb655c-ef9e-4038-895f-e350a5df4604	fd435948-d4a9-44ac-8f4e-e8c9887f696d	f41e8e8e-ba98-479f-92bf-65138882e64b	EM-A1-01	English Multiverse A1 - Group 1 Updated	{"days": ["Sunday", "Tuesday", "Thursday"], "time": "17:00-19:00"}	22	t	2025-11-17 19:17:38.198	2025-11-17 19:50:11.895
\.


--
-- Data for Name: Hall; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Hall" (id, "venueId", name, code, capacity, floor, "isActive", "createdAt") FROM stdin;
03052fbc-18a2-44f9-b54c-4cbb6f423fbf	f41e8e8e-ba98-479f-92bf-65138882e64b	Room A	A	15	Ground Floor	t	2025-11-15 00:55:26.981
495d9aa8-ab6f-47bf-b49e-6526a39cbd15	6186727a-8b3c-4455-9e69-495c843778de	Room 1	1	18	Second Floor	t	2025-11-15 00:55:26.982
3238fa82-afe8-4d03-ac27-8068bae176d2	f41e8e8e-ba98-479f-92bf-65138882e64b	Hall 1	H1	20	Ground	t	2025-11-17 02:24:04.787
5719dc5f-1d3b-400e-86eb-f29a5dd6678e	f41e8e8e-ba98-479f-92bf-65138882e64b	Room A - Updated	B	22	First Floor	f	2025-11-15 00:55:26.982
\.


--
-- Data for Name: Installment; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Installment" (id, "paymentPlanId", "installmentNumber", amount, "paymentDate", "paymentMethod", "receiptNumber", "receiptUrl", "receiptMakerId", "benefitReferenceNumber", notes, "createdAt", "dueDate") FROM stdin;
761ed4ac-d0cf-4a25-b236-d7b3d333fb20	e40ab2b9-4fa2-4e4e-a57d-2e07e6f8bb13	2	137.50	2025-11-15	PENDING	\N	\N	\N	\N	\N	2025-11-21 05:28:09.037	\N
31a2e867-90d1-4fbb-a4d2-0013006419c7	e40ab2b9-4fa2-4e4e-a57d-2e07e6f8bb13	3	137.50	2025-12-15	PENDING	\N	\N	\N	\N	\N	2025-11-21 05:28:09.038	\N
eaf63933-599d-4979-a662-7cfabaf3c57f	e40ab2b9-4fa2-4e4e-a57d-2e07e6f8bb13	4	137.50	2026-01-15	PENDING	\N	\N	\N	\N	\N	2025-11-21 05:28:09.038	\N
25e92b55-025f-4ee6-b04b-eb901bd95ae5	e40ab2b9-4fa2-4e4e-a57d-2e07e6f8bb13	1	137.50	2025-10-15	CARD_MACHINE	REC-2025-004	https://example.com/receipts/rec-002.pdf	462ccd39-1359-4616-81c2-3c31a81d8ce3	BEN-12345678	Card payment via POS machine	2025-11-21 05:28:09.035	\N
\.


--
-- Data for Name: Level; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Level" (id, name, "displayName", "orderNumber", description, "isMixed", "mixedLevels", "createdAt") FROM stdin;
89af8efc-9eab-4c87-b33c-19348ea6822b	A2	Elementary	2	Basic user - Elementary level	f	\N	2025-11-15 00:55:26.979
7c3d722a-cc6d-4c2f-ae3d-9cecfc257e9b	B1	Intermediate	3	Independent user - Intermediate level	f	\N	2025-11-15 00:55:26.979
61413c01-d682-40af-98b1-9746e3ca6475	B2	Upper Intermediate	4	Independent user - Upper Intermediate level	f	\N	2025-11-15 00:55:26.979
16fb655c-ef9e-4038-895f-e350a5df4604	A1	Beginner Level A1	1	Updated description	f	\N	2025-11-15 00:55:26.978
\.


--
-- Data for Name: Material; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Material" (id, "groupId", title, description, "materialType", "fileUrl", "fileSizeKb", "uploadedBy", "uploadedAt", "isActive") FROM stdin;
fc868e83-7d8a-413a-bb6d-9b5cd65d23cf	ce7ad635-c179-46b4-beb0-8cf5fa0404f7	Listening Exercise - Conversation at Restaurant	Practice dialogue for beginner level	VIDEO	https://youtube.com/watch?v=example	15360	31b6851c-a0d1-4ccc-adcc-1073d6c9946a	2025-11-17 20:31:22.123	t
029fdce4-dc4e-4258-85d4-19149257c671	ce7ad635-c179-46b4-beb0-8cf5fa0404f7	Online Quiz - Vocabulary	Interactive quiz on Quizlet	LINK	https://quizlet.com/example	\N	31b6851c-a0d1-4ccc-adcc-1073d6c9946a	2025-11-17 20:31:25.917	t
4f8b3908-6d15-42a3-8bcf-7d61777759a1	ce7ad635-c179-46b4-beb0-8cf5fa0404f7	Flashcards - Common Verbs	\N	IMAGE	https://example.com/flashcards.png	512	31b6851c-a0d1-4ccc-adcc-1073d6c9946a	2025-11-17 20:31:29.795	t
1ac79d25-6a2c-4d15-a697-a533ab406579	ce7ad635-c179-46b4-beb0-8cf5fa0404f7	Course Syllabus	Complete syllabus for A1 level	PDF	https://example.com/syllabus.pdf	1024	fd435948-d4a9-44ac-8f4e-e8c9887f696d	2025-11-17 20:31:31.581	t
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Notification" (id, "userId", type, title, message, "linkUrl", "isRead", "readAt", "sentVia", "sentAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: OtpCode; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."OtpCode" (id, "userId", code, "expiresAt", "isUsed", attempts, "createdAt") FROM stdin;
2c8aef5d-7da8-4a7e-96cb-365f7e19778a	4c6148b7-952a-45eb-b055-31d925e44d65	732501	2025-11-23 07:11:09.59	f	0	2025-11-23 07:06:09.591
e2efeb6e-100d-4fab-b9e7-9a83fa848866	e20510e6-73e0-4b76-9fe9-fbca6965013e	985383	2025-11-15 01:01:12.883	t	1	2025-11-15 00:56:12.884
5e0984be-00a7-4904-9886-ebb84999b30c	462ccd39-1359-4616-81c2-3c31a81d8ce3	493212	2025-11-17 02:16:16.594	t	1	2025-11-17 02:11:16.595
514db392-43a5-49cc-9b87-2d7c33f9ba49	e20510e6-73e0-4b76-9fe9-fbca6965013e	102123	2025-11-15 01:07:11.895	t	1	2025-11-15 01:02:11.895
c3b02421-c6c1-422d-9b66-3f4460c1e537	462ccd39-1359-4616-81c2-3c31a81d8ce3	663973	2025-11-15 01:08:35.998	f	0	2025-11-15 01:03:35.999
bae4441f-64d2-44b9-9dfe-1def044dd298	462ccd39-1359-4616-81c2-3c31a81d8ce3	861462	2025-11-17 02:40:21.656	f	0	2025-11-17 02:35:21.657
51ca540f-bf54-4f47-a96d-9a2ffa01fb7c	e20510e6-73e0-4b76-9fe9-fbca6965013e	238119	2025-11-16 01:50:16.263	t	1	2025-11-16 01:45:16.264
864824da-3c22-4691-8b9f-46587bb3c947	e20510e6-73e0-4b76-9fe9-fbca6965013e	787845	2025-11-17 03:38:34.9	f	0	2025-11-17 03:33:34.9
f6368310-a387-44c8-b21c-6a6430d792b3	e20510e6-73e0-4b76-9fe9-fbca6965013e	776674	2025-11-16 01:56:26.433	t	1	2025-11-16 01:51:26.434
4346aa08-30f4-4ca6-85fa-3300f097c08e	e20510e6-73e0-4b76-9fe9-fbca6965013e	192209	2025-11-17 12:38:12.394	f	0	2025-11-17 12:33:12.395
71335ccf-257e-4d61-bfa4-5564d8c84147	e20510e6-73e0-4b76-9fe9-fbca6965013e	190406	2025-11-16 02:00:40.765	t	1	2025-11-16 01:55:40.766
94323a98-5fed-47e4-8048-19ea09512b5e	e20510e6-73e0-4b76-9fe9-fbca6965013e	115385	2025-11-16 02:05:35.802	t	1	2025-11-16 02:00:35.802
b5020f95-3092-41f1-a3cb-4d885d2bc06d	e20510e6-73e0-4b76-9fe9-fbca6965013e	993264	2025-11-16 02:11:46.875	t	1	2025-11-16 02:06:46.875
b19ca26c-35cf-4844-a24d-ed5e739cf3d8	4c6148b7-952a-45eb-b055-31d925e44d65	457502	2025-11-17 14:51:11.259	t	1	2025-11-17 14:46:11.262
c83c6a63-21be-4c8d-8e2d-31c8eda3f171	e20510e6-73e0-4b76-9fe9-fbca6965013e	546121	2025-11-16 02:16:44.815	t	1	2025-11-16 02:11:44.815
934cc3cf-eb7e-480b-9d85-b89a959c7495	e20510e6-73e0-4b76-9fe9-fbca6965013e	987425	2025-11-18 05:18:52.241	f	0	2025-11-18 05:13:52.242
09800cca-019d-43fe-905c-3daa75f659fc	e20510e6-73e0-4b76-9fe9-fbca6965013e	142377	2025-11-16 02:33:08.164	t	1	2025-11-16 02:28:08.165
9876e226-0ceb-4475-bc67-ce0790bb0f0f	e20510e6-73e0-4b76-9fe9-fbca6965013e	224276	2025-11-18 06:17:01.098	f	0	2025-11-18 06:12:01.099
cfcd09da-c969-42e6-9af4-d7dca244d47e	e20510e6-73e0-4b76-9fe9-fbca6965013e	110457	2025-11-16 02:35:36.894	t	1	2025-11-16 02:30:36.895
c257ac09-20e8-45b2-aaad-e78b7ae52b55	e20510e6-73e0-4b76-9fe9-fbca6965013e	300527	2025-11-16 02:36:31.805	t	1	2025-11-16 02:31:31.806
8cb351c4-b976-40e3-af0c-bed5c185065d	731b7785-2fae-4405-b385-536205c887c5	305722	2025-11-23 11:43:49.147	t	1	2025-11-23 11:38:49.148
4a2780d2-a2ff-43b2-908b-3b3769e7aaa8	e20510e6-73e0-4b76-9fe9-fbca6965013e	544406	2025-11-16 02:42:32.271	t	1	2025-11-16 02:37:32.272
61410a4a-768d-465f-ac5e-af292957b9ec	e20510e6-73e0-4b76-9fe9-fbca6965013e	724394	2025-11-18 14:13:52.692	t	1	2025-11-18 14:08:52.693
bb888f6e-2a78-4662-914c-57561b599d84	4c6148b7-952a-45eb-b055-31d925e44d65	765192	2025-11-16 02:43:19.552	t	1	2025-11-16 02:38:19.553
f3221f7c-554f-488c-8fa1-eff2a02cc145	462ccd39-1359-4616-81c2-3c31a81d8ce3	875085	2025-11-16 02:43:39.182	t	1	2025-11-16 02:38:39.183
a4de0c9c-0a6e-48b7-ac06-2e2deec9b1b7	462ccd39-1359-4616-81c2-3c31a81d8ce3	246107	2025-11-23 07:36:24.436	t	1	2025-11-23 07:31:24.437
25e663d1-4fd4-49e0-bea7-b746834a133f	4c6148b7-952a-45eb-b055-31d925e44d65	275750	2025-11-16 02:50:16.349	t	1	2025-11-16 02:45:16.351
df7301b4-fd74-4f66-8d10-033a9ca52228	462ccd39-1359-4616-81c2-3c31a81d8ce3	440218	2025-11-18 14:17:26.978	t	1	2025-11-18 14:12:26.979
752edcb8-51bf-4ce8-9632-5292cb607fa4	462ccd39-1359-4616-81c2-3c31a81d8ce3	787942	2025-11-16 02:52:09.017	t	1	2025-11-16 02:47:09.018
e43af535-33f5-463a-a253-1beae8486f2e	462ccd39-1359-4616-81c2-3c31a81d8ce3	133943	2025-11-19 05:01:29.836	f	0	2025-11-19 04:56:29.837
812737a2-adbc-4b2e-ac01-9bf0c793d0f6	e20510e6-73e0-4b76-9fe9-fbca6965013e	634431	2025-11-16 14:45:43.703	t	1	2025-11-16 14:40:43.708
d0f0be8e-20b2-469f-b2d6-171f97b477bc	462ccd39-1359-4616-81c2-3c31a81d8ce3	439860	2025-11-19 06:01:33.113	t	1	2025-11-19 05:56:33.114
db276c76-536d-45f8-b10d-f8428ff965d0	e20510e6-73e0-4b76-9fe9-fbca6965013e	630544	2025-11-20 02:33:30.162	f	0	2025-11-20 02:28:30.163
4b55e069-9be5-434e-98c4-3f5972cce0ae	e20510e6-73e0-4b76-9fe9-fbca6965013e	959947	2025-11-20 05:11:45.855	t	1	2025-11-20 05:06:45.856
6b5766d1-b9fc-4da7-9381-22dc902d400e	ab92aca3-350a-4c80-98bd-36a43fc81334	901605	2025-11-23 08:54:27.707	t	1	2025-11-23 08:49:27.708
e8fa58d6-a874-4e0d-a21f-de21af4b9a23	462ccd39-1359-4616-81c2-3c31a81d8ce3	878140	2025-11-23 07:09:08.308	t	1	2025-11-23 07:04:08.309
91342943-51da-49f9-8e8e-5f7dc86a1fc2	e20510e6-73e0-4b76-9fe9-fbca6965013e	510512	2025-11-23 07:10:05.591	t	1	2025-11-23 07:05:05.592
6868c467-2a86-498a-b775-0adc5854a339	731b7785-2fae-4405-b385-536205c887c5	162784	2025-11-25 04:54:13.582	t	1	2025-11-25 04:49:13.583
9fe26945-9baf-4397-a532-b5b1792b7864	4c6148b7-952a-45eb-b055-31d925e44d65	597251	2025-11-23 07:10:32.574	t	1	2025-11-23 07:05:32.575
a81b26db-84f1-430e-9bd1-10e26005990c	462ccd39-1359-4616-81c2-3c31a81d8ce3	795572	2025-11-23 08:58:24.912	t	1	2025-11-23 08:53:24.913
df4928b1-e13c-46d6-9f48-15072505dc0e	731b7785-2fae-4405-b385-536205c887c5	274625	2025-11-23 18:58:02.536	t	1	2025-11-23 18:53:02.537
e21e67bf-dec9-4276-b3c3-bfdf8857dbfe	ab92aca3-350a-4c80-98bd-36a43fc81334	330339	2025-11-23 09:04:27.855	t	1	2025-11-23 08:59:27.856
df42d828-9bdd-4254-b16b-3bc9f6c821e5	a0993de2-971e-4cec-9aa1-cf4a1692349f	717464	2025-11-23 10:24:33.986	t	1	2025-11-23 10:19:33.987
fab7d3d3-31ce-4dcc-9f82-e6e4ba6e1f20	535a04d3-fc9a-4fbb-8097-fe5781c9760f	948989	2025-11-23 20:23:28.786	t	1	2025-11-23 20:18:28.787
9381c37f-3695-4efd-9f16-e022b1de3e14	731b7785-2fae-4405-b385-536205c887c5	963100	2025-11-23 19:34:48.253	t	1	2025-11-23 19:29:48.254
2bbb9d75-37b9-4418-bca5-9662c4a423e2	535a04d3-fc9a-4fbb-8097-fe5781c9760f	896913	2025-11-23 20:01:02.831	t	1	2025-11-23 19:56:02.832
ad1ab0b9-7a36-4bcb-9e8d-9187098d02ae	535a04d3-fc9a-4fbb-8097-fe5781c9760f	693214	2025-11-23 20:28:46.634	t	1	2025-11-23 20:23:46.635
166c31c1-6363-4174-8b2e-743feb572fc5	731b7785-2fae-4405-b385-536205c887c5	347047	2025-11-25 05:11:26.061	t	1	2025-11-25 05:06:26.062
3fe668cd-c515-4baa-bf26-73a3b722dccd	4e7225fd-ad80-4822-a0d4-765eef65cac5	703396	2025-11-25 05:10:12.048	t	1	2025-11-25 05:05:12.049
\.


--
-- Data for Name: Parent; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Parent" (id, "userId", "firstName", "lastName", "createdAt") FROM stdin;
5083ad92-9309-4be1-a81a-f680eab59587	fd7d2c71-6405-42d3-bff6-4223d22c4b24	Ali	Hassan	2025-11-15 00:55:26.972
8b22be73-37ab-4248-9668-7c3c0402c826	253c6444-40ee-4a06-87ca-d49034068066	Ahmed Updated	Al-Khalifa	2025-11-17 15:45:18.216
\.


--
-- Data for Name: ParentStudentLink; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."ParentStudentLink" (id, "parentId", "studentId", relationship, "createdAt") FROM stdin;
8625bd55-b7cf-4eed-93cf-e07055b0c152	5083ad92-9309-4be1-a81a-f680eab59587	44df7d55-02fe-4bf1-8944-478d4f9275ec	Father	2025-11-15 00:55:26.973
70002b7b-58c3-4a17-b7b4-460894986936	8b22be73-37ab-4248-9668-7c3c0402c826	b9314efd-8a0b-4a78-8a16-099cd6b4a6e9	Father	2025-11-17 15:46:25.596
16c111c7-dab2-4fce-9af4-1b6595767b80	8b22be73-37ab-4248-9668-7c3c0402c826	9a617c37-a2ab-47db-9213-d1feac8add95	Mother	2025-11-17 15:47:20.505
\.


--
-- Data for Name: PaymentReminder; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."PaymentReminder" (id, "installmentId", "reminderType", "sentAt", "sentVia") FROM stdin;
\.


--
-- Data for Name: Phone; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Phone" (id, "phoneNumber", "countryCode", "isVerified", "isPrimary", "studentId", "parentId", "isActive", "createdAt") FROM stdin;
f574f061-2dde-4b26-b175-99d424e8bfa2	33445566	+973	t	t	44df7d55-02fe-4bf1-8944-478d4f9275ec	\N	t	2025-11-15 00:55:26.975
4e13ecab-ae26-42d9-99f9-fdc9a136d521	33998877	+973	t	t	\N	5083ad92-9309-4be1-a81a-f680eab59587	t	2025-11-15 00:55:26.976
bb90fab5-4c31-4f1e-a231-b73c80b7afc9	+97333444555	+973	f	t	b9314efd-8a0b-4a78-8a16-099cd6b4a6e9	\N	t	2025-11-17 14:57:15.711
387c6d8e-153d-4e9d-ab84-88c622bfe5f8	+97333666777	+973	f	f	b9314efd-8a0b-4a78-8a16-099cd6b4a6e9	\N	t	2025-11-17 14:57:27.914
9bcddbc1-9e52-4ea5-aec2-60f7eea50de3	+97333999888	+973	t	f	\N	8b22be73-37ab-4248-9668-7c3c0402c826	f	2025-11-17 18:47:21.372
76e5b544-2dc3-44f2-ab32-5247b4100742	+97333111222	+973	f	t	\N	8b22be73-37ab-4248-9668-7c3c0402c826	t	2025-11-19 04:27:53.778
\.


--
-- Data for Name: Program; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Program" (id, name, code, description, "minAge", "maxAge", "isActive", "createdAt", "updatedAt") FROM stdin;
61c38de4-c0a0-4f07-9512-39aa607e4075	English Multiverse	ENG-MV	Comprehensive English program for young learners	6	12	t	2025-11-15 00:55:26.976	2025-11-15 00:55:26.976
686b7f25-b713-4e2d-b73b-968673c5e962	English Unlimited	ENG-UL	Advanced English program for teenagers and adults	13	99	t	2025-11-15 00:55:26.977	2025-11-15 00:55:26.977
742f6b2d-eb68-4b8c-afdd-c2af2c18b9d6	English Multiverse Updated	EM	Updated description	11	17	f	2025-11-17 02:16:52.01	2025-11-17 13:53:06.003
4a693ed0-8b57-427e-816d-6273b1f4ed37	English for big people	EFBP	English program for ages 11-17	\N	\N	t	2025-11-18 14:28:26.237	2025-11-18 14:28:26.237
\.


--
-- Data for Name: ProgressCriteria; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."ProgressCriteria" (id, "levelId", "groupId", name, description, "orderNumber", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Refund; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Refund" (id, "installmentId", "enrollmentId", "refundAmount", "refundReason", "refundMethod", "requestedBy", "requestedAt", "approvedBy", "approvedAt", "processedBy", "processedAt", status, "receiptUrl", notes, "createdAt") FROM stdin;
86f5200c-cc5d-49a7-8a15-591f1c0af2fd	25e92b55-025f-4ee6-b04b-eb901bd95ae5	75659e2c-393b-443f-a7a5-32bcd9442f28	137.50	Student withdrew from program	BANK_TRANSFER	462ccd39-1359-4616-81c2-3c31a81d8ce3	2025-11-21 05:30:11.759	462ccd39-1359-4616-81c2-3c31a81d8ce3	2025-11-21 05:30:33.185	462ccd39-1359-4616-81c2-3c31a81d8ce3	2025-11-21 05:30:34.881	COMPLETED	https://example.com/refund-receipts/refund-001.pdf	Request full refund for last installment	2025-11-21 05:30:11.759
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Session" (id, "userId", token, "expiresAt", "ipAddress", "userAgent", "createdAt") FROM stdin;
13d69215-837a-4bf0-b2e7-dd979f977e7f	e20510e6-73e0-4b76-9fe9-fbca6965013e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMjA1MTBlNi03M2UwLTRiNzYtOWZlOS1mYmNhNjk2NTAxM2UiLCJlbWFpbCI6ImFobWVkLnN0dWRlbnRAZXhhbXBsZS5jb20iLCJyb2xlIjoiU1RVREVOVCIsImlhdCI6MTc2MzE2ODI3OSwiZXhwIjoxNzYzNzczMDc5fQ.Ht6FADS8E5mMrTMBfoj38_bC9A2ImPmbNeZJojg2wXg	2025-11-22 00:57:59.202	\N	\N	2025-11-15 00:57:59.203
e57d485e-fb7b-4071-bfdd-4ba62b33be47	e20510e6-73e0-4b76-9fe9-fbca6965013e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMjA1MTBlNi03M2UwLTRiNzYtOWZlOS1mYmNhNjk2NTAxM2UiLCJlbWFpbCI6ImFobWVkLnN0dWRlbnRAZXhhbXBsZS5jb20iLCJyb2xlIjoiU1RVREVOVCIsImlhdCI6MTc2MzI1NzYwOSwiZXhwIjoxNzYzODYyNDA5fQ.AdLY62OAKqCDPhevtt_slQE8CrVMWmsG-0Eg2vogUBk	2025-11-23 01:46:49.717	\N	\N	2025-11-16 01:46:49.719
53373b8b-20a2-4367-aae1-eb7566ab3455	e20510e6-73e0-4b76-9fe9-fbca6965013e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMjA1MTBlNi03M2UwLTRiNzYtOWZlOS1mYmNhNjk2NTAxM2UiLCJlbWFpbCI6ImFobWVkLnN0dWRlbnRAZXhhbXBsZS5jb20iLCJyb2xlIjoiU1RVREVOVCIsImlhdCI6MTc2MzI1NzkwNSwiZXhwIjoxNzYzODYyNzA1fQ.97BrQIJyjquId4CotR6RuddVO_n_8wOHa6D1ESsjCR0	2025-11-23 01:51:45.906	\N	\N	2025-11-16 01:51:45.907
1bce5fca-56f7-42e8-a125-b2c75a038036	e20510e6-73e0-4b76-9fe9-fbca6965013e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMjA1MTBlNi03M2UwLTRiNzYtOWZlOS1mYmNhNjk2NTAxM2UiLCJlbWFpbCI6ImFobWVkLnN0dWRlbnRAZXhhbXBsZS5jb20iLCJyb2xlIjoiU1RVREVOVCIsImlhdCI6MTc2MzI1ODE1NywiZXhwIjoxNzYzODYyOTU3fQ.2oc2kQabJTfNgSBgZCHmBdhggg60zCbWf6YD05seoO4	2025-11-23 01:55:57.441	\N	\N	2025-11-16 01:55:57.443
8f5ebd8d-7258-4337-8d10-2a7ba131b0f5	e20510e6-73e0-4b76-9fe9-fbca6965013e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMjA1MTBlNi03M2UwLTRiNzYtOWZlOS1mYmNhNjk2NTAxM2UiLCJlbWFpbCI6ImFobWVkLnN0dWRlbnRAZXhhbXBsZS5jb20iLCJyb2xlIjoiU1RVREVOVCIsImlhdCI6MTc2MzI1ODQ1MiwiZXhwIjoxNzYzODYzMjUyfQ.w2bH8z9R0ozTUiKgTIySotyV4aBO-ChhWqOQ7qvqHKw	2025-11-23 02:00:52.735	\N	\N	2025-11-16 02:00:52.736
72fff9eb-b734-40cb-aed5-e6c87c03813f	e20510e6-73e0-4b76-9fe9-fbca6965013e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMjA1MTBlNi03M2UwLTRiNzYtOWZlOS1mYmNhNjk2NTAxM2UiLCJlbWFpbCI6ImFobWVkLnN0dWRlbnRAZXhhbXBsZS5jb20iLCJyb2xlIjoiU1RVREVOVCIsImlhdCI6MTc2MzI1ODgyMCwiZXhwIjoxNzYzODYzNjIwfQ.FVOoNXUa3-nuMUxzavDkNLt0EbdZU9WC6NuxMVj6M6Y	2025-11-23 02:07:00.793	\N	\N	2025-11-16 02:07:00.794
5f41157e-eccd-4b1f-b0aa-64a1cc8d9d74	e20510e6-73e0-4b76-9fe9-fbca6965013e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMjA1MTBlNi03M2UwLTRiNzYtOWZlOS1mYmNhNjk2NTAxM2UiLCJlbWFpbCI6ImFobWVkLnN0dWRlbnRAZXhhbXBsZS5jb20iLCJyb2xlIjoiU1RVREVOVCIsImlhdCI6MTc2MzI1OTExNSwiZXhwIjoxNzYzODYzOTE1fQ.jzKvXH2UXp-h58VdO1Wfs7EqgYvOrPQ4-7tI_2VOkeQ	2025-11-23 02:11:55.213	\N	\N	2025-11-16 02:11:55.214
2b4b4ef8-3514-4fa5-bee1-b5d45d0b0f4d	e20510e6-73e0-4b76-9fe9-fbca6965013e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMjA1MTBlNi03M2UwLTRiNzYtOWZlOS1mYmNhNjk2NTAxM2UiLCJlbWFpbCI6ImFobWVkLnN0dWRlbnRAZXhhbXBsZS5jb20iLCJyb2xlIjoiU1RVREVOVCIsImlhdCI6MTc2MzI2MDA5OCwiZXhwIjoxNzYzODY0ODk4fQ.c5F8Goa41d-8cEDjDThC_Iw6hVFUddm3LFeEbVTLUkI	2025-11-23 02:28:18.785	\N	\N	2025-11-16 02:28:18.786
ec8374cd-3522-44ba-8cb4-9dd2a7af1943	e20510e6-73e0-4b76-9fe9-fbca6965013e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMjA1MTBlNi03M2UwLTRiNzYtOWZlOS1mYmNhNjk2NTAxM2UiLCJlbWFpbCI6ImFobWVkLnN0dWRlbnRAZXhhbXBsZS5jb20iLCJyb2xlIjoiU1RVREVOVCIsImlhdCI6MTc2MzI2MDY2NiwiZXhwIjoxNzYzODY1NDY2fQ.EqJEueLGjHAx08Ltx_WcR4CYZSx8EJ9-B3BmVxbGReM	2025-11-23 02:37:46.089	\N	\N	2025-11-16 02:37:46.09
9b0e431f-084b-4661-9f9b-69207e749a85	4c6148b7-952a-45eb-b055-31d925e44d65	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0YzYxNDhiNy05NTJhLTQ1ZWItYjA1NS0zMWQ5MjVlNDRkNjUiLCJlbWFpbCI6InNhcmFoLnRlYWNoZXJAaW5zdGl0dXRlLmNvbSIsInJvbGUiOiJURUFDSEVSIiwiaWF0IjoxNzYzMjYwNzExLCJleHAiOjE3NjM4NjU1MTF9.8KdjI1HAD2fG31VrsuoUzMz3KrCm9eXyoJ1TLX0WV6E	2025-11-23 02:38:31.834	\N	\N	2025-11-16 02:38:31.835
b9e99e2a-e2f3-4c05-a9ed-62d6d2cb2702	462ccd39-1359-4616-81c2-3c31a81d8ce3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0NjJjY2QzOS0xMzU5LTQ2MTYtODFjMi0zYzMxYTgxZDhjZTMiLCJlbWFpbCI6ImFkbWluQGluc3RpdHV0ZS5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NjMyNjA3MjYsImV4cCI6MTc2Mzg2NTUyNn0.4mg8Hp8ndMl4lR4G8VcIFpgae6c2NqpMehOlJm3amM4	2025-11-23 02:38:46.927	\N	\N	2025-11-16 02:38:46.928
ea8890b1-3d63-4a2e-b579-d0d481d3c70b	4c6148b7-952a-45eb-b055-31d925e44d65	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0YzYxNDhiNy05NTJhLTQ1ZWItYjA1NS0zMWQ5MjVlNDRkNjUiLCJlbWFpbCI6InNhcmFoLnRlYWNoZXJAaW5zdGl0dXRlLmNvbSIsInJvbGUiOiJURUFDSEVSIiwiaWF0IjoxNzYzMjYxMTcwLCJleHAiOjE3NjM4NjU5NzB9.TqIOe9GIljtYUtgMvZKXxaKHthbuWye_4SBXfhARGvE	2025-11-23 02:46:10.402	\N	\N	2025-11-16 02:46:10.403
6d0dcd32-c204-45a4-b1c5-b9bda956c1f3	462ccd39-1359-4616-81c2-3c31a81d8ce3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0NjJjY2QzOS0xMzU5LTQ2MTYtODFjMi0zYzMxYTgxZDhjZTMiLCJlbWFpbCI6ImFkbWluQGluc3RpdHV0ZS5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NjMyNjEyNDAsImV4cCI6MTc2Mzg2NjA0MH0.Y9tnmzPuR5qnj_QqDfpQqe9NhCcE1fIAeLSJragqoEg	2025-11-23 02:47:20.752	\N	\N	2025-11-16 02:47:20.753
f76fa98f-ed44-48e5-95f5-81f21880ea0c	e20510e6-73e0-4b76-9fe9-fbca6965013e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMjA1MTBlNi03M2UwLTRiNzYtOWZlOS1mYmNhNjk2NTAxM2UiLCJlbWFpbCI6ImFobWVkLnN0dWRlbnRAZXhhbXBsZS5jb20iLCJyb2xlIjoiU1RVREVOVCIsImlhdCI6MTc2MzMwNDA4MywiZXhwIjoxNzYzOTA4ODgzfQ.KhlQxnkA5McQasxzj9mZ0pZNrBTDf_g0Mprpa8bFvpQ	2025-11-23 14:41:23.591	\N	\N	2025-11-16 14:41:23.592
fcf2d2bb-f3d6-47c7-9c58-097f6d5ab214	462ccd39-1359-4616-81c2-3c31a81d8ce3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0NjJjY2QzOS0xMzU5LTQ2MTYtODFjMi0zYzMxYTgxZDhjZTMiLCJlbWFpbCI6ImFkbWluQGluc3RpdHV0ZS5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NjMzNDU0ODcsImV4cCI6MTc2Mzk1MDI4N30._imZsnAjh6mOtksjPVFtlqCNJU3Gmec-suBv_6kc1Xk	2025-11-24 02:11:27.053	\N	\N	2025-11-17 02:11:27.053
4fe50813-350f-4c17-9108-9fb010580679	4c6148b7-952a-45eb-b055-31d925e44d65	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0YzYxNDhiNy05NTJhLTQ1ZWItYjA1NS0zMWQ5MjVlNDRkNjUiLCJlbWFpbCI6InNhcmFoLnRlYWNoZXJAaW5zdGl0dXRlLmNvbSIsInJvbGUiOiJURUFDSEVSIiwiaWF0IjoxNzYzMzkwODEzLCJleHAiOjE3NjM5OTU2MTN9.54muh3VK-Bf-3TUYbe7LIyOwqBQ4b-RUQCTLJ-GuPrc	2025-11-24 14:46:53.576	\N	\N	2025-11-17 14:46:53.581
bb01f32d-0024-4925-aa91-d881da2aca58	462ccd39-1359-4616-81c2-3c31a81d8ce3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0NjJjY2QzOS0xMzU5LTQ2MTYtODFjMi0zYzMxYTgxZDhjZTMiLCJlbWFpbCI6ImFkbWluQGluc3RpdHV0ZS5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NjM0NzUxNTYsImV4cCI6MTc2NDA3OTk1Nn0.KPVCuUKRLFvHFfQYOodrfIxbvcEDPDzntypcockzTl4	2025-11-25 14:12:36.048	\N	\N	2025-11-18 14:12:36.049
881a7bb0-11f0-4364-af78-fef0b6cb2c80	462ccd39-1359-4616-81c2-3c31a81d8ce3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0NjJjY2QzOS0xMzU5LTQ2MTYtODFjMi0zYzMxYTgxZDhjZTMiLCJlbWFpbCI6ImFkbWluQGluc3RpdHV0ZS5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NjM1MzE4MDYsImV4cCI6MTc2NDEzNjYwNn0.abe4ytos-g2YfE6_Xgcb4jL3OpI2TIok8oldjSKBOIE	2025-11-26 05:56:46.193	\N	\N	2025-11-19 05:56:46.193
9ea64049-da6b-480d-aa00-684815eff7fd	e20510e6-73e0-4b76-9fe9-fbca6965013e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMjA1MTBlNi03M2UwLTRiNzYtOWZlOS1mYmNhNjk2NTAxM2UiLCJlbWFpbCI6ImFobWVkLnN0dWRlbnRAZXhhbXBsZS5jb20iLCJyb2xlIjoiU1RVREVOVCIsImlhdCI6MTc2MzYxNTIxOSwiZXhwIjoxNzY0MjIwMDE5fQ.63GTlVXEqelnkn9uu2HnZQPCfVMtrCNr_umL7x4DRM0	2025-11-27 05:06:59.7	\N	\N	2025-11-20 05:06:59.701
0426478f-c6a4-4865-b219-5e4862493114	462ccd39-1359-4616-81c2-3c31a81d8ce3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0NjJjY2QzOS0xMzU5LTQ2MTYtODFjMi0zYzMxYTgxZDhjZTMiLCJlbWFpbCI6ImFkbWluQGluc3RpdHV0ZS5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NjM4ODE0NTgsImV4cCI6MTc2NDQ4NjI1OH0.WSGlK5uxsoWXHnB0NU6pV_pxN9zYHuOKTRdc_99vP2E	2025-11-30 07:04:18.94	\N	\N	2025-11-23 07:04:18.941
6a686078-d2fe-4d30-9ae9-cbfa5fce46ce	e20510e6-73e0-4b76-9fe9-fbca6965013e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMjA1MTBlNi03M2UwLTRiNzYtOWZlOS1mYmNhNjk2NTAxM2UiLCJlbWFpbCI6ImFobWVkLnN0dWRlbnRAZXhhbXBsZS5jb20iLCJyb2xlIjoiU1RVREVOVCIsImlhdCI6MTc2Mzg4MTUxNSwiZXhwIjoxNzY0NDg2MzE1fQ.DGV1ezui31gL-uREUw0dLam52L1b9HwasY7MxuPX4U0	2025-11-30 07:05:15.394	\N	\N	2025-11-23 07:05:15.395
c04d1e3a-f8ce-4e43-ad45-6a5b638c1bc8	4c6148b7-952a-45eb-b055-31d925e44d65	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0YzYxNDhiNy05NTJhLTQ1ZWItYjA1NS0zMWQ5MjVlNDRkNjUiLCJlbWFpbCI6InNhcmFoLnRlYWNoZXJAaW5zdGl0dXRlLmNvbSIsInJvbGUiOiJURUFDSEVSIiwiaWF0IjoxNzYzODgxNTM5LCJleHAiOjE3NjQ0ODYzMzl9.sRRdTU60akSsKrY2WWiKV8fUQ5S3F0nBwI_oNbI2-Mw	2025-11-30 07:05:39.14	\N	\N	2025-11-23 07:05:39.141
b0df29d8-2d59-4933-b830-2413a2b1e3a7	462ccd39-1359-4616-81c2-3c31a81d8ce3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0NjJjY2QzOS0xMzU5LTQ2MTYtODFjMi0zYzMxYTgxZDhjZTMiLCJlbWFpbCI6ImFkbWluQGluc3RpdHV0ZS5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NjM4ODMxMDIsImV4cCI6MTc2NDQ4NzkwMn0.cJq9pk93HFpK7a-MolBvp41BptKhlw4EHaPUQwiNClY	2025-11-30 07:31:42.975	\N	\N	2025-11-23 07:31:42.976
45658a72-1f1b-4ac4-9e6d-d2cd00ebf0e0	ab92aca3-350a-4c80-98bd-36a43fc81334	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhYjkyYWNhMy0zNTBhLTRjODAtOThiZC0zNmE0M2ZjODEzMzQiLCJlbWFpbCI6IlFhc3NpbWFobWVkMjMxQGdtYWlsLmNvbSIsInJvbGUiOiJTVFVERU5UIiwiaWF0IjoxNzYzODg3Nzc4LCJleHAiOjE3NjQ0OTI1Nzh9.KyiLw297sAlAJ7_m25xi5chqiYL8vBantmme7WoLreQ	2025-11-30 08:49:38.778	\N	\N	2025-11-23 08:49:38.78
dd7c9623-72a0-4835-9214-5f4e7c91054d	462ccd39-1359-4616-81c2-3c31a81d8ce3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0NjJjY2QzOS0xMzU5LTQ2MTYtODFjMi0zYzMxYTgxZDhjZTMiLCJlbWFpbCI6ImFkbWluQGluc3RpdHV0ZS5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NjM4ODgwMzUsImV4cCI6MTc2NDQ5MjgzNX0.AGpa8fFCCgFmc6THL7R8fKN7XDqotKut_lR1bgwAO4E	2025-11-30 08:53:55.673	\N	\N	2025-11-23 08:53:55.673
fa1e7e27-4328-4869-96e1-04d584c7a281	ab92aca3-350a-4c80-98bd-36a43fc81334	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhYjkyYWNhMy0zNTBhLTRjODAtOThiZC0zNmE0M2ZjODEzMzQiLCJlbWFpbCI6IlFhc3NpbWFobWVkMjMxQGdtYWlsLmNvbSIsInJvbGUiOiJTVFVERU5UIiwiaWF0IjoxNzYzODg4Mzc0LCJleHAiOjE3NjQ0OTMxNzR9.-tgp6wsXmIkYIUb0SldEhhs4pDWx3JfQftF46SKQKAw	2025-11-30 08:59:34.362	\N	\N	2025-11-23 08:59:34.363
3bcc87a3-7afa-41fd-9a65-8aa851a7cf04	a0993de2-971e-4cec-9aa1-cf4a1692349f	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhMDk5M2RlMi05NzFlLTRjZWMtOWFhMS1jZjRhMTY5MjM0OWYiLCJlbWFpbCI6InMuYWhtZWQuYmhAZ21haWwuY29tIiwicm9sZSI6IlNUVURFTlQiLCJpYXQiOjE3NjM4OTMyMDAsImV4cCI6MTc2NDQ5ODAwMH0.7aJb1R1OUgD0Rr8sskRu15XMBtLQx0_eWbF8j2kaOBU	2025-11-30 10:20:00.302	\N	\N	2025-11-23 10:20:00.308
52a4511a-abd2-445b-ba95-8e3e9c90ffed	731b7785-2fae-4405-b385-536205c887c5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3MzFiNzc4NS0yZmFlLTQ0MDUtYjM4NS01MzYyMDVjODg3YzUiLCJlbWFpbCI6ImZhdGltYTgzMTNAZ21haWwuY29tIiwicm9sZSI6IlNUVURFTlQiLCJpYXQiOjE3NjM4OTc5MzYsImV4cCI6MTc2NDUwMjczNn0.oUZKjSLiHG43FC8jb8DgInIyJx2XTcoE93hnolkN2-o	2025-11-30 11:38:56.571	\N	\N	2025-11-23 11:38:56.572
475a85fa-7557-4b53-886b-d3bf6e1fed3a	731b7785-2fae-4405-b385-536205c887c5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3MzFiNzc4NS0yZmFlLTQ0MDUtYjM4NS01MzYyMDVjODg3YzUiLCJlbWFpbCI6ImZhdGltYTgzMTNAZ21haWwuY29tIiwicm9sZSI6IlNUVURFTlQiLCJpYXQiOjE3NjM5MjM5OTIsImV4cCI6MTc2NDUyODc5Mn0.QSGZsh9VOz0vxoacSy9zurjbXCOmXGcY4nkyALnvIu0	2025-11-30 18:53:12.452	\N	\N	2025-11-23 18:53:12.453
a5408e29-2c94-4ef1-a0ad-9a42eb06e90b	731b7785-2fae-4405-b385-536205c887c5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3MzFiNzc4NS0yZmFlLTQ0MDUtYjM4NS01MzYyMDVjODg3YzUiLCJlbWFpbCI6ImZhdGltYTgzMTNAZ21haWwuY29tIiwicm9sZSI6IlNUVURFTlQiLCJpYXQiOjE3NjM5MjYyMDMsImV4cCI6MTc2NDUzMTAwM30.5YbZBJJoiYzp9wXaDDIFkYu_xv35AGHn3k9--RbznCE	2025-11-30 19:30:03.947	\N	\N	2025-11-23 19:30:03.949
f312d261-af3b-46a8-aa45-328068f429c8	535a04d3-fc9a-4fbb-8097-fe5781c9760f	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MzVhMDRkMy1mYzlhLTRmYmItODA5Ny1mZTU3ODFjOTc2MGYiLCJlbWFpbCI6ImFobWVkLmFsaXNhQGVtYWlsLmNvbSIsInJvbGUiOiJTVFVERU5UIiwiaWF0IjoxNzYzOTI3OTAwLCJleHAiOjE3NjQ1MzI3MDB9.C9LSR-3mtclLKmJ4VaS6Q6CdjYG6VAvr7EwF9gLxE2s	2025-11-30 19:58:20.936	\N	\N	2025-11-23 19:58:20.937
335ed067-030b-437c-b8ab-6b9984981075	535a04d3-fc9a-4fbb-8097-fe5781c9760f	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MzVhMDRkMy1mYzlhLTRmYmItODA5Ny1mZTU3ODFjOTc2MGYiLCJlbWFpbCI6ImFobWVkLmFsaXNhQGVtYWlsLmNvbSIsInJvbGUiOiJTVFVERU5UIiwic3R1ZGVudElkIjoiNDkxOTM3MWYtMzEzYi00N2RiLWIwNWMtYzNjOGI0MDY5N2Y1IiwidGVhY2hlcklkIjpudWxsLCJwYXJlbnRJZCI6bnVsbCwiaWF0IjoxNzYzOTI5MTE1LCJleHAiOjE3NjQ1MzM5MTV9._AZpNYickaSfLifbRDWSkv3N23bJ81WH8zh_qJB1SPU	2025-11-30 20:18:35.882	\N	\N	2025-11-23 20:18:35.884
e04e9ef5-c03c-4c0c-bd92-665b8eb179ae	535a04d3-fc9a-4fbb-8097-fe5781c9760f	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MzVhMDRkMy1mYzlhLTRmYmItODA5Ny1mZTU3ODFjOTc2MGYiLCJlbWFpbCI6ImFobWVkLmFsaXNhQGVtYWlsLmNvbSIsInJvbGUiOiJTVFVERU5UIiwic3R1ZGVudElkIjoiNDkxOTM3MWYtMzEzYi00N2RiLWIwNWMtYzNjOGI0MDY5N2Y1IiwidGVhY2hlcklkIjpudWxsLCJwYXJlbnRJZCI6bnVsbCwiaWF0IjoxNzYzOTI5NDMyLCJleHAiOjE3NjQ1MzQyMzJ9.OS43BHwCJ5E_7zIV0vlGhf860M0cEiXKOz-hiylRNY0	2025-11-30 20:23:52.912	\N	\N	2025-11-23 20:23:52.913
12dba2df-3abe-451d-9abe-b841378d2cd7	731b7785-2fae-4405-b385-536205c887c5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3MzFiNzc4NS0yZmFlLTQ0MDUtYjM4NS01MzYyMDVjODg3YzUiLCJlbWFpbCI6ImZhdGltYTgzMTNAZ21haWwuY29tIiwicm9sZSI6IlNUVURFTlQiLCJzdHVkZW50SWQiOiI2MTJhZGQxNC02Zjg5LTRkY2QtYWEyNy1jZGYwYjY5MjA2YjciLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjQwNDYxNjksImV4cCI6MTc2NDY1MDk2OX0.5y_L7YeVqY22-rmu86ASn8PVsbs51qztSP5mES94Ryg	2025-12-02 04:49:29.598	\N	\N	2025-11-25 04:49:29.599
890f1f1a-244c-4a7e-96ab-941fe0bb491b	4e7225fd-ad80-4822-a0d4-765eef65cac5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0ZTcyMjVmZC1hZDgwLTQ4MjItYTBkNC03NjVlZWY2NWNhYzUiLCJlbWFpbCI6IlFhc3NpbWNsYW4yMzFAZ21haWwuY29tIiwicm9sZSI6IlNUVURFTlQiLCJzdHVkZW50SWQiOiI0MDRmNmYyYS05MzUzLTQ5MzAtOTViZS03OTY3ZTAyMjg4ZTMiLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjQwNDcxMjQsImV4cCI6MTc2NDY1MTkyNH0.UU7Etx8k-EMum3rhp5VmFhV3GMjJDC2NtNC2R4AXKEU	2025-12-02 05:05:24.651	\N	\N	2025-11-25 05:05:24.652
df199cc8-2faf-4da0-9366-8f4286307276	731b7785-2fae-4405-b385-536205c887c5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3MzFiNzc4NS0yZmFlLTQ0MDUtYjM4NS01MzYyMDVjODg3YzUiLCJlbWFpbCI6ImZhdGltYTgzMTNAZ21haWwuY29tIiwicm9sZSI6IlNUVURFTlQiLCJzdHVkZW50SWQiOiI2MTJhZGQxNC02Zjg5LTRkY2QtYWEyNy1jZGYwYjY5MjA2YjciLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjQwNDcxOTIsImV4cCI6MTc2NDY1MTk5Mn0.z8yKZzX3gtwVRkanzhpQUQUchUsqPEF_AmhOVX1-TVo	2025-12-02 05:06:32.584	\N	\N	2025-11-25 05:06:32.585
\.


--
-- Data for Name: SpeakingSlot; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."SpeakingSlot" (id, "teacherId", "studentId", "testSessionId", "slotDate", "slotTime", "durationMinutes", status, score, feedback, "createdAt", "updatedAt") FROM stdin;
84e2fc3f-4cb5-4566-908f-7b93c3523180	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-19	06:15:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
d75408c8-98f6-4385-aeed-5d806d43a2e9	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-19	06:30:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
6ee84e36-8033-469f-a5f1-7ababf8db9fc	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-19	06:45:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
e973b884-6b29-49ca-9bd6-98370a8d48b5	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-19	07:00:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
91b0d571-5c68-4a83-af91-bfcc3792bd86	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-19	07:15:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
b34f446b-744b-4e97-ace6-756deab23964	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-19	07:30:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
3e7cbafb-c16c-4ccf-b93a-bc2cb60e7e4d	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-19	07:45:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
28176554-a06c-48ea-a543-53cac32ac003	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-19	08:00:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
1a51133a-0cf6-4c79-ba64-b783bb06538d	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-19	08:15:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
d11ff00d-4eab-4d67-848b-7e5369d6e490	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-19	08:45:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
1dc28863-899e-4c0d-b4ac-481ba81c26fc	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-21	11:00:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
e953f83a-83a5-4b2e-b6da-7c16bc5f894d	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-21	11:15:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
75508552-6a98-49cd-80e7-8fd52f866eac	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-21	11:30:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
a1d0d92e-bdb3-41dc-9d2f-a99c1633d27d	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-21	11:45:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
f1635f2e-84b4-4072-b612-0f445a77b28b	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-21	12:00:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
43c6f5b8-fede-4afa-8d31-34acf66de53a	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-21	12:15:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
a39d3904-5d4d-4964-940d-2735e5295724	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-21	12:30:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
071a419a-7d47-4f7b-8084-15cdc415f4d3	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-21	12:45:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
022c343d-6aa4-42b4-a292-f4c907840226	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-21	13:00:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
55c749a4-4390-49e0-8e4f-76ac865c7c3a	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-21	13:15:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
6909c479-2597-4013-9009-99013f5c8db8	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-21	13:30:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
0ec3a252-eeb4-4e3f-b0d4-613ffd698857	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-21	13:45:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
55822cfd-21be-4fab-bd3a-7658f57345ba	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-21	11:00:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
9599255f-3613-4fe2-b9de-9c9f6c89eb9f	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-21	11:15:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
680ed8aa-82fa-414d-bcb7-444a5d5f34a8	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-21	11:30:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
cf22742f-54cc-4e6c-9137-f0933dae81a9	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-21	11:45:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
f6ae606c-30da-4959-9a3c-b252a938d70b	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-21	12:00:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
e1249f8e-dea4-49ce-ad48-006fc2d84aa7	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-21	12:15:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
d65604ac-f67a-4cc8-8645-c76397102c8c	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-21	12:30:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
7b2e77b4-1cab-4f4d-be34-15e11689ffc3	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-21	12:45:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
f6ecc067-de87-42d3-ad4a-b866fe1f7704	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-21	13:00:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
b0fba2f2-671e-4424-bf56-de1c16e3201d	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-21	13:15:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
5727a1f0-9bb0-4db2-9e0d-ab1db7d99be7	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-21	13:30:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
772fd204-6b73-4b39-a3fa-58aaaa1249b2	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-21	13:45:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
ae48af3d-2ba1-437e-9da1-51f169d0f6ea	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-21	11:15:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
ad6eddc6-052a-4e7f-ae38-c3efb0e87c10	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-21	11:30:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
7393065b-8648-49e9-a2fc-338f3369ef29	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-21	11:45:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
d3a298d7-a8b4-4be1-97c9-dfe8cacb03da	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-21	12:00:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
af309206-2866-4027-b17b-abec9df4d7bc	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-21	12:15:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
fb718483-7137-4166-a9ee-620b9cc8d978	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-21	12:30:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
bb041a00-889e-4c86-b6aa-3d8cdeba991d	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-21	12:45:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
aa3457bf-2923-4e1e-90b2-7ef930e6d93a	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-21	13:00:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
99ae208c-b9a8-486b-8872-a6b5425f5552	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-21	13:15:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
98ab5ef7-bc4c-4902-be7b-89706ce1dc50	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-21	13:30:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
db0a186d-d10a-4b29-96c3-fbe74c0d1273	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-21	13:45:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
41260fd8-35b3-4e4d-a2c2-defd38b843d4	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-26	06:00:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
321be85a-b389-40d5-99c1-41cbbad67061	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-26	06:15:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
656cc735-ae62-4493-88fb-0f91db97ce7b	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-26	06:30:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
c7737950-fba9-4fda-85bd-fbb21ac9417b	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-26	06:45:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
fa50c850-c8de-4f2f-bbd8-93ed5f55f147	fd435948-d4a9-44ac-8f4e-e8c9887f696d	4919371f-313b-47db-b05c-c3c8b40697f5	fa2fdf01-acfb-464e-87dd-b21fc17f747d	2025-10-21	11:00:00	15	BOOKED	\N	\N	2025-11-19 06:00:20.67	2025-11-23 20:23:29.489
19b2a4bb-2318-4973-88f2-a6d106a5bb03	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-26	07:00:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
06aeb334-6519-4e58-8f5a-10c7bed72a7f	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-26	07:30:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
69c7dcb9-cea2-4c29-8f5f-4d83b4990569	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-26	07:45:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
7910fcaa-5e52-4b95-a1ec-fcc16f8dbadf	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-26	08:00:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
d2014b79-259f-4c89-a035-726717b8c390	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-26	08:15:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
8b9ea78b-7ae1-483a-a06f-8e010fca34ae	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-26	08:30:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
95dbdd6d-7330-446d-87e7-51208c47a782	fd435948-d4a9-44ac-8f4e-e8c9887f696d	\N	\N	2025-10-26	08:45:00	15	AVAILABLE	\N	\N	2025-11-19 06:00:20.67	2025-11-19 06:00:20.67
9c9f6a32-0daf-4b86-9023-648ee7a20bca	fd435948-d4a9-44ac-8f4e-e8c9887f696d	4919371f-313b-47db-b05c-c3c8b40697f5	67bd026b-c317-4745-9753-eca1f5c6af6e	2025-10-19	06:00:00	15	COMPLETED	82.50	Excellent fluency, minor grammar issues.	2025-11-19 06:00:20.67	2025-11-19 06:07:33.42
203565aa-b80d-4173-b6fc-bc8a51886883	fd435948-d4a9-44ac-8f4e-e8c9887f696d	612add14-6f89-4dcd-aa27-cdf0b69206b7	680cec3f-0522-4958-8451-a3d6f43425b2	2025-10-19	08:30:00	15	BOOKED	\N	\N	2025-11-19 06:00:20.67	2025-11-23 19:41:57.241
cdd53646-aeae-4120-97ce-51bdb3ab6333	fd435948-d4a9-44ac-8f4e-e8c9887f696d	404f6f2a-9353-4930-95be-7967e02288e3	6fb297b2-7b1a-48f3-bc08-d88c69d05887	2025-10-26	07:15:00	15	BOOKED	\N	\N	2025-11-19 06:00:20.67	2025-11-25 05:05:47.623
\.


--
-- Data for Name: Student; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Student" (id, "userId", cpr, "firstName", "createdAt", area, block, "dateOfBirth", email, gender, "healthIssues", "houseNo", "howHeardAbout", "isActive", "needsTransport", notes, "preferredCenter", "preferredTiming", "referralPerson", road, "schoolType", "schoolYear", "secondName", "thirdName", "updatedAt", "canSeePayment") FROM stdin;
44df7d55-02fe-4bf1-8944-478d4f9275ec	e20510e6-73e0-4b76-9fe9-fbca6965013e	950101234	Ahmed	2025-11-15 00:55:26.969	Manama	310	2005-05-15	ahmed.student@example.com	Male	\N	123	\N	t	f	\N	Country Mall	Evening	\N	45	Government	Grade 10	Ali	Hassan	2025-11-15 00:55:26.969	t
5f198ff9-cdb2-435d-b3b0-888461180c84	5682419f-939a-4ecc-a50b-dced7ad83a87	960202345	Fatima	2025-11-15 00:55:26.971	Riffa	\N	2006-08-20	fatima.student@example.com	Female	\N	\N	\N	t	t	\N	Riyadat Mall	Morning	\N	\N	Private	Grade 9	Mohammed	Ali	2025-11-15 00:55:26.971	t
cee2506e-8f68-40df-8fe8-4c5444cecda9	c34ea058-8186-43ea-970b-76d37838575c	070834567	Sara	2025-11-17 14:52:06.851	\N	\N	2008-07-10	parent@email.com	Female	\N	\N	\N	t	f	Young student using parent's email	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-17 14:52:06.851	t
9a617c37-a2ab-47db-9213-d1feac8add95	411435d1-5c48-4acb-9b35-79240babc55f	050623456	Fatima	2025-11-17 14:52:10.053	\N	\N	2006-05-20	\N	Female	\N	\N	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-17 14:52:10.053	t
b9314efd-8a0b-4a78-8a16-099cd6b4a6e9	926ae227-4cfe-4e21-950a-696920754d58	040512345	Ahmed	2025-11-17 03:35:18.795	Isa Town	901	2005-04-15	parent@email.com	Male	Asthma - mild	456	Instagram	t	t	Updated to Grade 11	Riyadat Mall	Morning	Family member	78	Private	Grade 11	Mohammed	Ali	2025-11-18 14:27:19.01	t
d363756f-2823-414e-b382-d8aad8818219	ab92aca3-350a-4c80-98bd-36a43fc81334	040704734	Sayed Qassim	2025-11-23 08:49:27.662	\N	\N	2004-07-13	Qassimahmed231@gmail.com	MALE	\N	\N	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-23 08:49:27.662	t
3ef322c1-f90d-4b51-bbae-7542e0fa7bba	a0993de2-971e-4cec-9aa1-cf4a1692349f	820704750	Sayed Ahmed	2025-11-23 10:19:33.939	\N	\N	2004-07-13	s.ahmed.bh@gmail.com	MALE	\N	\N	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-23 10:19:33.939	t
612add14-6f89-4dcd-aa27-cdf0b69206b7	731b7785-2fae-4405-b385-536205c887c5	741102285	Fatima Jasim	2025-11-23 11:38:49.053	\N	\N	2025-11-03	fatima8313@gmail.com	FEMALE	\N	\N	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-23 11:38:49.053	t
404f6f2a-9353-4930-95be-7967e02288e3	4e7225fd-ad80-4822-a0d4-765eef65cac5	050505055	Husain	2025-11-25 05:05:12.006	\N	\N	2025-10-03	Qassimclan231@gmail.com	MALE	\N	\N	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-25 05:05:12.006	t
4919371f-313b-47db-b05c-c3c8b40697f5	535a04d3-fc9a-4fbb-8097-fe5781c9760f	044512345	Ahmed	2025-11-18 14:23:25.637	Hamad Town	678	2005-04-15	ahmed.alisa@email.com	Male	None	123	Facebook	t	f	Very motivated student	Country Mall	Evening	Friend	45	Government	Grade 10	Mohammed	Ali	2025-11-18 14:23:25.637	t
\.


--
-- Data for Name: StudentCriteriaCompletion; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."StudentCriteriaCompletion" (id, "studentId", "criteriaId", "enrollmentId", completed, "completedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: StudentPaymentPlan; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."StudentPaymentPlan" (id, "enrollmentId", "totalAmount", "discountAmount", "discountReason", "finalAmount", "totalInstallments", status, "createdAt", "updatedAt") FROM stdin;
bfaa9aa3-c5ba-431a-9813-30961a0e572a	3ab2ef47-fb0e-41ea-895d-1c40b63b1971	400.00	50.00	Early bird discount	350.00	4	ACTIVE	2025-11-15 00:55:26.989	2025-11-15 00:55:26.989
f068ac0d-8b4f-4d5e-94bd-6220a8f37507	d3d32035-2cc9-4ab6-a025-8dfdca60af32	400.00	0.00	\N	400.00	2	ACTIVE	2025-11-15 00:55:26.991	2025-11-15 00:55:26.991
e40ab2b9-4fa2-4e4e-a57d-2e07e6f8bb13	75659e2c-393b-443f-a7a5-32bcd9442f28	600.00	50.00	Sibling discount	550.00	4	ACTIVE	2025-11-21 05:28:09.031	2025-11-21 05:28:09.031
\.


--
-- Data for Name: Teacher; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Teacher" (id, "userId", "firstName", "lastName", specialization, "isActive", "availableForSpeakingTests", "createdAt", "updatedAt") FROM stdin;
31b6851c-a0d1-4ccc-adcc-1073d6c9946a	4c6148b7-952a-45eb-b055-31d925e44d65	Sarah	Johnson	English Literature	t	t	2025-11-15 00:55:26.963	2025-11-15 00:55:26.963
964e3e82-84cd-4570-aa96-cf7510b20ded	dda36a62-ff73-4420-b1d8-b77540ecfd66	John	Smith	Grammar & Writing	t	t	2025-11-15 00:55:26.967	2025-11-15 00:55:26.967
2d1880c7-867b-4355-a4a3-49ec36c6de34	97a37ae6-2ff8-4243-9f45-9a53f5f82c81	Jane	Doe	\N	t	t	2025-11-17 02:36:12.865	2025-11-17 02:36:12.865
9a249a11-38dd-46bf-8460-354deb8b749b	e60baa64-0f6b-4cf5-87f3-2969f25d4535	Mike	Johnson	Conversation and Listening	t	f	2025-11-17 02:36:33.671	2025-11-17 02:36:33.671
b7f7b933-7a75-4833-999e-673e3bae6e37	581a51ff-1f27-4601-96f5-87fe1cdc9dfe	John	Smith	Grammar and Writing	t	t	2025-11-17 18:51:56.562	2025-11-17 18:51:56.562
fd435948-d4a9-44ac-8f4e-e8c9887f696d	9d05a428-a29a-4f30-9ccd-a6c88ac43aff	John	Smith	Advanced Grammar and Composition	f	f	2025-11-17 02:35:50.597	2025-11-17 18:53:17.723
\.


--
-- Data for Name: TeacherScheduleOverride; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."TeacherScheduleOverride" (id, "teacherId", "overrideDate", "isAvailable", "startTime", "endTime", reason, "createdAt") FROM stdin;
\.


--
-- Data for Name: TeacherScheduleTemplate; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."TeacherScheduleTemplate" (id, "teacherId", "dayOfWeek", "startTime", "endTime", "isActive", "createdAt") FROM stdin;
c86a68f7-951d-49cf-82ff-8864df23c5d9	fd435948-d4a9-44ac-8f4e-e8c9887f696d	1	09:00:00	12:00:00	t	2025-11-19 05:59:16.743
5d2d90cc-fa92-43e9-a573-884fe003c373	fd435948-d4a9-44ac-8f4e-e8c9887f696d	3	14:00:00	17:00:00	t	2025-11-19 05:59:22.364
b5961e9a-66bb-47b3-9eba-2d438658b25c	fd435948-d4a9-44ac-8f4e-e8c9887f696d	3	14:00:00	17:00:00	t	2025-11-19 05:59:24.1
d08d019d-510d-4ec8-b1d8-8e4e44ac6806	fd435948-d4a9-44ac-8f4e-e8c9887f696d	3	14:00:00	17:00:00	t	2025-11-19 05:59:31.956
\.


--
-- Data for Name: Term; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Term" (id, "programId", name, "startDate", "endDate", "isCurrent", "isActive", "createdAt") FROM stdin;
63a55ff4-d2e6-4560-9fc3-5c9e2dad84e4	742f6b2d-eb68-4b8c-afdd-c2af2c18b9d6	Fall 2025	2025-09-01	2025-12-31	f	t	2025-11-17 02:17:43.677
e561aa5f-24c0-49f6-bccd-111899bf77cf	686b7f25-b713-4e2d-b73b-968673c5e962	Fall 2025	2025-09-01	2025-11-30	f	t	2025-11-15 00:55:26.978
a62c586c-f3f1-43cd-ac1c-1fb38f120269	686b7f25-b713-4e2d-b73b-968673c5e962	Summer 1 2025	2025-06-01	2025-08-31	f	t	2025-11-15 00:55:26.977
49a33970-5bdf-44f7-8d50-8f4099a58f32	686b7f25-b713-4e2d-b73b-968673c5e962	Fall 2025 Updated	2025-09-01	2025-12-31	f	t	2025-11-17 14:01:35.71
cc921e72-1f65-4f23-82c5-ad913ac9a099	686b7f25-b713-4e2d-b73b-968673c5e962	Fall 2025	2025-09-01	2025-12-31	t	t	2025-11-17 14:12:11.266
\.


--
-- Data for Name: Test; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Test" (id, name, "testType", "levelId", "totalQuestions", "durationMinutes", "isActive", "createdAt") FROM stdin;
0e445487-b101-41e6-98bb-7cdbbdc3e4b6	B1 → B2 Upgrade Test	WRITTEN	\N	0	60	t	2025-11-19 05:02:21.79
76d17d7f-fe05-466d-8b7a-1b9eb9bfa90d	English Multiverse Placement Test (Ages 11-17)	PLACEMENT	\N	0	45	t	2025-11-20 02:36:21.127
e1d65018-e45c-4ba8-9728-4311e179a4ac	English Multiverse Placement Test (Ages 11-17)	PLACEMENT	\N	4	45	t	2025-11-19 05:02:10.002
ceda5913-a8aa-4ad4-a47e-b3196ead03cb	Level A1 to A2 Upgrade Test	UPGRADE	\N	0	30	t	2025-11-23 08:54:17.332
48a36f5b-1460-4433-aa2c-6e891fdaec9b	English Placement Test A1-A2	PLACEMENT	\N	5	45	t	2025-11-23 08:54:05.587
\.


--
-- Data for Name: TestQuestion; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."TestQuestion" (id, "testId", "questionText", "questionType", options, "correctAnswer", points, "orderNumber", "createdAt") FROM stdin;
fceaec13-53e6-43bf-9bd9-044cedc52c3f	e1d65018-e45c-4ba8-9728-4311e179a4ac	What is the past tense of 'go'?	MULTIPLE_CHOICE	["went", "goed", "gone", "going"]	went	2	1	2025-11-19 05:02:29.295
3843ec11-0206-47b7-9651-94c2a73aa5de	e1d65018-e45c-4ba8-9728-4311e179a4ac	English is an international language.	TRUE_FALSE	["True", "False"]	True	1	2	2025-11-19 05:02:43.191
4ab18dcd-a231-4890-b3aa-46849d23f56d	e1d65018-e45c-4ba8-9728-4311e179a4ac	What is the past tense of 'go'?	MULTIPLE_CHOICE	["went", "goed", "gone", "going"]	went	2	1	2025-11-20 02:36:45.447
e1572bdf-5809-4a05-9418-2bf282b9f425	e1d65018-e45c-4ba8-9728-4311e179a4ac	English is an international language.	TRUE_FALSE	["True", "False"]	True	1	2	2025-11-20 02:36:48.484
61a33eb1-42dc-4228-ad20-8e447921295c	48a36f5b-1460-4433-aa2c-6e891fdaec9b	What is the correct form of 'to be' for 'I'?	MULTIPLE_CHOICE	["am", "is", "are", "be"]	am	5	1	2025-11-23 08:54:56.236
88b8453f-4ca7-4e83-aaf5-c74eeee5fa9c	48a36f5b-1460-4433-aa2c-6e891fdaec9b	Choose the correct article: ___ apple a day keeps the doctor away.	MULTIPLE_CHOICE	["A", "An", "The", "No article"]	An	5	2	2025-11-23 08:54:58.643
bfdf6710-f3aa-42e0-8111-1357058ead22	48a36f5b-1460-4433-aa2c-6e891fdaec9b	What is the past tense of 'go'?	MULTIPLE_CHOICE	["goed", "went", "gone", "going"]	went	5	3	2025-11-23 08:55:00.236
f47f3a52-00ad-4356-b873-aabddd5e55a1	48a36f5b-1460-4433-aa2c-6e891fdaec9b	Which sentence is correct?	MULTIPLE_CHOICE	["She don't like pizza", "She doesn't likes pizza", "She doesn't like pizza", "She not like pizza"]	She doesn't like pizza	5	4	2025-11-23 08:55:08.287
036669c9-032c-4160-bd5f-0f5304cb7311	48a36f5b-1460-4433-aa2c-6e891fdaec9b	Complete: I ___ to school every day.	MULTIPLE_CHOICE	["go", "goes", "going", "gone"]	go	5	5	2025-11-23 08:55:10.407
\.


--
-- Data for Name: TestSession; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."TestSession" (id, "studentId", "testId", "startedAt", "completedAt", score, answers, status, "createdAt") FROM stdin;
5b8db633-2a8b-44cd-b5eb-1d0344713964	4919371f-313b-47db-b05c-c3c8b40697f5	e1d65018-e45c-4ba8-9728-4311e179a4ac	2025-11-19 05:54:49.043	\N	\N	\N	IN_PROGRESS	2025-11-19 05:54:49.047
d1a5752f-9014-40ef-938f-fb37ab429a26	612add14-6f89-4dcd-aa27-cdf0b69206b7	76d17d7f-fe05-466d-8b7a-1b9eb9bfa90d	2025-11-23 19:16:55.596	\N	\N	\N	IN_PROGRESS	2025-11-23 19:16:55.596
599cf9b2-d7d1-408f-8b5d-8f993ba78775	612add14-6f89-4dcd-aa27-cdf0b69206b7	76d17d7f-fe05-466d-8b7a-1b9eb9bfa90d	2025-11-23 19:30:06.706	\N	\N	\N	IN_PROGRESS	2025-11-23 19:30:06.707
67bd026b-c317-4745-9753-eca1f5c6af6e	4919371f-313b-47db-b05c-c3c8b40697f5	e1d65018-e45c-4ba8-9728-4311e179a4ac	2025-11-19 05:49:30.492	2025-11-19 05:51:22.743	0.00	{"type": "MCQ", "answers": {"3843ec11-0206-47b7-9651-94c2a73aa5de": {"given": null, "earned": 0, "points": 1, "correct": "True"}, "fceaec13-53e6-43bf-9bd9-044cedc52c3f": {"given": null, "earned": 0, "points": 2, "correct": "went"}}, "submittedAt": "2025-11-19T05:51:22.743Z", "totalPoints": 3, "earnedPoints": 0, "scorePercent": 0, "finalDecision": {"passed": true, "finalizedAt": "2025-11-19T05:58:36.094Z", "finalLevelId": null, "recommendation": null}}	SPEAKING_COMPLETED	2025-11-19 05:49:30.493
ce50d7a7-9d8d-4a3a-9eba-14b7735647c4	4919371f-313b-47db-b05c-c3c8b40697f5	e1d65018-e45c-4ba8-9728-4311e179a4ac	2025-11-20 02:37:06.853	\N	\N	\N	IN_PROGRESS	2025-11-20 02:37:06.854
8d04e9d9-2027-4e76-b7ba-61a5e3199458	612add14-6f89-4dcd-aa27-cdf0b69206b7	48a36f5b-1460-4433-aa2c-6e891fdaec9b	2025-11-23 19:01:45.931	2025-11-23 19:01:58.805	60.00	{"type": "MCQ", "answers": {"036669c9-032c-4160-bd5f-0f5304cb7311": {"given": "going", "earned": 0, "points": 5, "correct": "go"}, "61a33eb1-42dc-4228-ad20-8e447921295c": {"given": "am", "earned": 5, "points": 5, "correct": "am"}, "88b8453f-4ca7-4e83-aaf5-c74eeee5fa9c": {"given": "A", "earned": 0, "points": 5, "correct": "An"}, "bfdf6710-f3aa-42e0-8111-1357058ead22": {"given": "went", "earned": 5, "points": 5, "correct": "went"}, "f47f3a52-00ad-4356-b873-aabddd5e55a1": {"given": "She doesn't like pizza", "earned": 5, "points": 5, "correct": "She doesn't like pizza"}}, "submittedAt": "2025-11-23T19:01:58.804Z", "totalPoints": 25, "earnedPoints": 15, "scorePercent": 60}	MCQ_COMPLETED	2025-11-23 19:01:45.932
6b087d97-a235-4212-b152-19d452fe79e2	612add14-6f89-4dcd-aa27-cdf0b69206b7	76d17d7f-fe05-466d-8b7a-1b9eb9bfa90d	2025-11-23 19:15:05.112	\N	\N	\N	IN_PROGRESS	2025-11-23 19:15:05.113
7c6d7bd4-f6d3-4217-a22b-0c867379923e	612add14-6f89-4dcd-aa27-cdf0b69206b7	e1d65018-e45c-4ba8-9728-4311e179a4ac	2025-11-23 19:15:09.783	2025-11-23 19:15:18.637	50.00	{"type": "MCQ", "answers": {"3843ec11-0206-47b7-9651-94c2a73aa5de": {"given": "False", "earned": 0, "points": 1, "correct": "True"}, "4ab18dcd-a231-4890-b3aa-46849d23f56d": {"given": "gone", "earned": 0, "points": 2, "correct": "went"}, "e1572bdf-5809-4a05-9418-2bf282b9f425": {"given": "True", "earned": 1, "points": 1, "correct": "True"}, "fceaec13-53e6-43bf-9bd9-044cedc52c3f": {"given": "went", "earned": 2, "points": 2, "correct": "went"}}, "submittedAt": "2025-11-23T19:15:18.637Z", "totalPoints": 6, "earnedPoints": 3, "scorePercent": 50}	MCQ_COMPLETED	2025-11-23 19:15:09.784
14cbf1f3-3ee7-4b47-acf1-b574c2c7ec34	612add14-6f89-4dcd-aa27-cdf0b69206b7	48a36f5b-1460-4433-aa2c-6e891fdaec9b	2025-11-23 19:16:49.371	\N	\N	\N	IN_PROGRESS	2025-11-23 19:16:49.371
3c16213f-a07e-4ef1-9fd4-4733b21896f0	612add14-6f89-4dcd-aa27-cdf0b69206b7	48a36f5b-1460-4433-aa2c-6e891fdaec9b	2025-11-23 19:30:31.606	\N	\N	\N	IN_PROGRESS	2025-11-23 19:30:31.607
e0b9d047-dc5d-438e-aa87-e225cd871563	612add14-6f89-4dcd-aa27-cdf0b69206b7	48a36f5b-1460-4433-aa2c-6e891fdaec9b	2025-11-23 19:30:57.177	2025-11-23 19:35:20.917	20.00	{"type": "MCQ", "answers": {"036669c9-032c-4160-bd5f-0f5304cb7311": {"given": "gone", "earned": 0, "points": 5, "correct": "go"}, "61a33eb1-42dc-4228-ad20-8e447921295c": {"given": "am", "earned": 5, "points": 5, "correct": "am"}, "88b8453f-4ca7-4e83-aaf5-c74eeee5fa9c": {"given": "No article", "earned": 0, "points": 5, "correct": "An"}, "bfdf6710-f3aa-42e0-8111-1357058ead22": {"given": "gone", "earned": 0, "points": 5, "correct": "went"}, "f47f3a52-00ad-4356-b873-aabddd5e55a1": {"given": "She not like pizza", "earned": 0, "points": 5, "correct": "She doesn't like pizza"}}, "submittedAt": "2025-11-23T19:35:20.917Z", "totalPoints": 25, "earnedPoints": 5, "scorePercent": 20}	MCQ_COMPLETED	2025-11-23 19:30:57.178
680cec3f-0522-4958-8451-a3d6f43425b2	612add14-6f89-4dcd-aa27-cdf0b69206b7	e1d65018-e45c-4ba8-9728-4311e179a4ac	2025-11-23 19:41:03.087	2025-11-23 19:41:08.891	50.00	{"type": "MCQ", "answers": {"3843ec11-0206-47b7-9651-94c2a73aa5de": {"given": "False", "earned": 0, "points": 1, "correct": "True"}, "4ab18dcd-a231-4890-b3aa-46849d23f56d": {"given": "going", "earned": 0, "points": 2, "correct": "went"}, "e1572bdf-5809-4a05-9418-2bf282b9f425": {"given": "True", "earned": 1, "points": 1, "correct": "True"}, "fceaec13-53e6-43bf-9bd9-044cedc52c3f": {"given": "went", "earned": 2, "points": 2, "correct": "went"}}, "submittedAt": "2025-11-23T19:41:08.891Z", "totalPoints": 6, "earnedPoints": 3, "scorePercent": 50}	SPEAKING_SCHEDULED	2025-11-23 19:41:03.088
fa2fdf01-acfb-464e-87dd-b21fc17f747d	4919371f-313b-47db-b05c-c3c8b40697f5	e1d65018-e45c-4ba8-9728-4311e179a4ac	2025-11-23 20:23:18.934	2025-11-23 20:23:24.093	0.00	{"type": "MCQ", "answers": {"3843ec11-0206-47b7-9651-94c2a73aa5de": {"given": "False", "earned": 0, "points": 1, "correct": "True"}, "4ab18dcd-a231-4890-b3aa-46849d23f56d": {"given": "gone", "earned": 0, "points": 2, "correct": "went"}, "e1572bdf-5809-4a05-9418-2bf282b9f425": {"given": "False", "earned": 0, "points": 1, "correct": "True"}, "fceaec13-53e6-43bf-9bd9-044cedc52c3f": {"given": "goed", "earned": 0, "points": 2, "correct": "went"}}, "submittedAt": "2025-11-23T20:23:24.092Z", "totalPoints": 6, "earnedPoints": 0, "scorePercent": 0}	SPEAKING_SCHEDULED	2025-11-23 20:23:18.936
6fb297b2-7b1a-48f3-bc08-d88c69d05887	404f6f2a-9353-4930-95be-7967e02288e3	e1d65018-e45c-4ba8-9728-4311e179a4ac	2025-11-25 05:05:31.079	2025-11-25 05:05:37.846	33.33	{"type": "MCQ", "answers": {"3843ec11-0206-47b7-9651-94c2a73aa5de": {"given": "False", "earned": 0, "points": 1, "correct": "True"}, "4ab18dcd-a231-4890-b3aa-46849d23f56d": {"given": "gone", "earned": 0, "points": 2, "correct": "went"}, "e1572bdf-5809-4a05-9418-2bf282b9f425": {"given": "False", "earned": 0, "points": 1, "correct": "True"}, "fceaec13-53e6-43bf-9bd9-044cedc52c3f": {"given": "went", "earned": 2, "points": 2, "correct": "went"}}, "submittedAt": "2025-11-25T05:05:37.845Z", "totalPoints": 6, "earnedPoints": 2, "scorePercent": 33.33333333333333}	SPEAKING_SCHEDULED	2025-11-25 05:05:31.08
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."User" (id, email, phone, role, "isActive", "lastLogin", "createdAt", "updatedAt") FROM stdin;
dda36a62-ff73-4420-b1d8-b77540ecfd66	john.teacher@institute.com	33333333	TEACHER	t	\N	2025-11-15 00:55:26.961	2025-11-15 00:55:26.961
fd7d2c71-6405-42d3-bff6-4223d22c4b24	parent1@example.com	33998877	PARENT	t	\N	2025-11-15 00:55:26.962	2025-11-15 00:55:26.962
535a04d3-fc9a-4fbb-8097-fe5781c9760f	ahmed.alisa@email.com	+97333111242	STUDENT	t	2025-11-23 20:23:52.902	2025-11-18 14:23:25.635	2025-11-23 20:23:52.903
253c6444-40ee-4a06-87ca-d49034068066	parent@example.com	+97333999888	PARENT	f	\N	2025-11-17 15:45:18.209	2025-11-17 18:18:15.195
4e7225fd-ad80-4822-a0d4-765eef65cac5	Qassimclan231@gmail.com	+93739800117	STUDENT	t	2025-11-25 05:05:24.631	2025-11-25 05:05:11.998	2025-11-25 05:05:24.632
581a51ff-1f27-4601-96f5-87fe1cdc9dfe	john.smith@institute.com	+97333888999	TEACHER	t	\N	2025-11-17 18:51:56.559	2025-11-17 18:51:56.559
9d05a428-a29a-4f30-9ccd-a6c88ac43aff	newemail@institute.com	+97333111000	TEACHER	f	\N	2025-11-17 02:35:50.595	2025-11-17 18:53:17.723
731b7785-2fae-4405-b385-536205c887c5	fatima8313@gmail.com	+97339800117	STUDENT	t	2025-11-25 05:06:32.565	2025-11-23 11:38:49.048	2025-11-25 05:06:32.566
97a37ae6-2ff8-4243-9f45-9a53f5f82c81	jane.doe@institute.com	\N	TEACHER	t	\N	2025-11-17 02:36:12.862	2025-11-17 02:36:12.862
e60baa64-0f6b-4cf5-87f3-2969f25d4535	mike.johnson@institute.com	+97333777888	TEACHER	t	\N	2025-11-17 02:36:33.67	2025-11-17 02:36:33.67
5682419f-939a-4ecc-a50b-dced7ad83a87	ahmed.updated@example.com	33999889	ADMIN	f	\N	2025-11-15 00:55:26.962	2025-11-18 14:15:34.938
c34ea058-8186-43ea-970b-76d37838575c	parent@email.com	\N	STUDENT	t	\N	2025-11-17 14:52:06.846	2025-11-17 14:52:06.846
411435d1-5c48-4acb-9b35-79240babc55f	student-050623456@placeholder.local	\N	STUDENT	t	\N	2025-11-17 14:52:10.052	2025-11-17 14:52:10.052
926ae227-4cfe-4e21-950a-696920754d58	ahmed.updated@email.com	+97333111222	STUDENT	t	\N	2025-11-17 03:35:18.791	2025-11-18 14:27:19.008
e20510e6-73e0-4b76-9fe9-fbca6965013e	ahmed.student@example.com	33445566	STUDENT	t	2025-11-23 07:05:15.383	2025-11-15 00:55:26.961	2025-11-23 07:05:15.384
4c6148b7-952a-45eb-b055-31d925e44d65	sarah.teacher@institute.com	33222222	TEACHER	t	2025-11-23 07:05:39.137	2025-11-15 00:55:26.96	2025-11-23 07:05:39.138
462ccd39-1359-4616-81c2-3c31a81d8ce3	admin@institute.com	33111111	ADMIN	t	2025-11-23 08:53:55.659	2025-11-15 00:55:26.953	2025-11-23 08:53:55.662
ab92aca3-350a-4c80-98bd-36a43fc81334	Qassimahmed231@gmail.com	+973 35140480	STUDENT	t	2025-11-23 08:59:34.349	2025-11-23 08:49:27.657	2025-11-23 08:59:34.35
a0993de2-971e-4cec-9aa1-cf4a1692349f	s.ahmed.bh@gmail.com	+97333008200	STUDENT	t	2025-11-23 10:20:00.287	2025-11-23 10:19:33.929	2025-11-23 10:20:00.287
\.


--
-- Data for Name: Venue; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Venue" (id, name, code, address, "isActive", "createdAt") FROM stdin;
6186727a-8b3c-4455-9e69-495c843778de	Riyadat Mall	RM	Riyadat Mall, Muharraq, Bahrain	t	2025-11-15 00:55:26.98
f41e8e8e-ba98-479f-92bf-65138882e64b	Country Mall - Updated	CM	Country Mall, Saar, Bahrain	t	2025-11-15 00:55:26.979
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
8624122d-e981-4ed0-a0e6-f9b07c851b07	c1b086b1f5b143428c7b283a1be1d153242686a78380062ff78b9ebc662b550c	2025-11-14 17:02:36.514279+03	20251114140236_init	\N	\N	2025-11-14 17:02:36.508911+03	1
7beb23bd-6c0d-4f2e-bb84-6e5ffa47e493	d4268fb4dd1b0b59cfbb4e062bcc18725af150497203fce95b9ae7fd344bfaac	2025-11-14 19:26:35.150798+03	20251114162635_complete_database_schema	\N	\N	2025-11-14 19:26:35.089969+03	1
3ad7a265-d8a8-4bd4-ba88-76e8d390c72b	9721c7d957b2598c5b6388d1bc1afc33992223e5b0656ab00617a7d4fc7d5470	2025-11-19 16:41:59.684807+03	20251119134159_add_progress_tracking	\N	\N	2025-11-19 16:41:59.668789+03	1
713f6dbd-a528-46b1-961e-386552cafa9a	711425258f6e9f2b829c134b9e4635f719b2774727d6fa97478d11d019062fe0	2025-11-22 10:16:34.468428+03	20251122071634_add_installment_due_date	\N	\N	2025-11-22 10:16:34.466563+03	1
30516958-a04e-4e7c-8c3e-31a344526301	f91fc7b22ce6bbc1f2975608a86770ce132988813a25908e75dcd265d58deb9f	2025-11-22 10:23:31.315067+03	20251122072331_add_payment_reminder	\N	\N	2025-11-22 10:23:31.308478+03	1
7d47f0e7-3646-482a-981c-f4cb9ec76578	12b10bdd3234d73bb07a7ece7771a1999ed2c2f04c5837f8c320d17ebc40a59e	2025-11-22 10:28:43.911487+03	20251122072843_add_attendance_warning	\N	\N	2025-11-22 10:28:43.907257+03	1
b0c3c056-1d4a-46ea-bae0-656e536a0868	9a1ae951e5d24505e89166f64611c3f60b05b5becf93015f0a4f18245326dc71	2025-11-22 20:25:24.423608+03	20251122172524_make_payment_date_nullable	\N	\N	2025-11-22 20:25:24.421375+03	1
c707c1d8-d7a4-4dda-baee-fa63821f6bf2	52df0b2a47457748674f3a543a8898136d4a6170962576999da52a2791498bf1	2025-11-23 10:35:21.759041+03	20251123073521_added_can_see_payment_column_to_student	\N	\N	2025-11-23 10:35:21.756112+03	1
\.


--
-- Name: Announcement Announcement_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Announcement"
    ADD CONSTRAINT "Announcement_pkey" PRIMARY KEY (id);


--
-- Name: AttendanceWarning AttendanceWarning_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."AttendanceWarning"
    ADD CONSTRAINT "AttendanceWarning_pkey" PRIMARY KEY (id);


--
-- Name: Attendance Attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_pkey" PRIMARY KEY (id);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: ChatMessage ChatMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_pkey" PRIMARY KEY (id);


--
-- Name: ClassSession ClassSession_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."ClassSession"
    ADD CONSTRAINT "ClassSession_pkey" PRIMARY KEY (id);


--
-- Name: Enrollment Enrollment_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Enrollment"
    ADD CONSTRAINT "Enrollment_pkey" PRIMARY KEY (id);


--
-- Name: Group Group_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Group"
    ADD CONSTRAINT "Group_pkey" PRIMARY KEY (id);


--
-- Name: Hall Hall_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Hall"
    ADD CONSTRAINT "Hall_pkey" PRIMARY KEY (id);


--
-- Name: Installment Installment_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Installment"
    ADD CONSTRAINT "Installment_pkey" PRIMARY KEY (id);


--
-- Name: Level Level_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Level"
    ADD CONSTRAINT "Level_pkey" PRIMARY KEY (id);


--
-- Name: Material Material_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Material"
    ADD CONSTRAINT "Material_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: OtpCode OtpCode_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."OtpCode"
    ADD CONSTRAINT "OtpCode_pkey" PRIMARY KEY (id);


--
-- Name: ParentStudentLink ParentStudentLink_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."ParentStudentLink"
    ADD CONSTRAINT "ParentStudentLink_pkey" PRIMARY KEY (id);


--
-- Name: Parent Parent_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Parent"
    ADD CONSTRAINT "Parent_pkey" PRIMARY KEY (id);


--
-- Name: PaymentReminder PaymentReminder_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."PaymentReminder"
    ADD CONSTRAINT "PaymentReminder_pkey" PRIMARY KEY (id);


--
-- Name: Phone Phone_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Phone"
    ADD CONSTRAINT "Phone_pkey" PRIMARY KEY (id);


--
-- Name: Program Program_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Program"
    ADD CONSTRAINT "Program_pkey" PRIMARY KEY (id);


--
-- Name: ProgressCriteria ProgressCriteria_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."ProgressCriteria"
    ADD CONSTRAINT "ProgressCriteria_pkey" PRIMARY KEY (id);


--
-- Name: Refund Refund_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Refund"
    ADD CONSTRAINT "Refund_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: SpeakingSlot SpeakingSlot_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."SpeakingSlot"
    ADD CONSTRAINT "SpeakingSlot_pkey" PRIMARY KEY (id);


--
-- Name: StudentCriteriaCompletion StudentCriteriaCompletion_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."StudentCriteriaCompletion"
    ADD CONSTRAINT "StudentCriteriaCompletion_pkey" PRIMARY KEY (id);


--
-- Name: StudentPaymentPlan StudentPaymentPlan_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."StudentPaymentPlan"
    ADD CONSTRAINT "StudentPaymentPlan_pkey" PRIMARY KEY (id);


--
-- Name: Student Student_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_pkey" PRIMARY KEY (id);


--
-- Name: TeacherScheduleOverride TeacherScheduleOverride_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."TeacherScheduleOverride"
    ADD CONSTRAINT "TeacherScheduleOverride_pkey" PRIMARY KEY (id);


--
-- Name: TeacherScheduleTemplate TeacherScheduleTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."TeacherScheduleTemplate"
    ADD CONSTRAINT "TeacherScheduleTemplate_pkey" PRIMARY KEY (id);


--
-- Name: Teacher Teacher_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Teacher"
    ADD CONSTRAINT "Teacher_pkey" PRIMARY KEY (id);


--
-- Name: Term Term_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Term"
    ADD CONSTRAINT "Term_pkey" PRIMARY KEY (id);


--
-- Name: TestQuestion TestQuestion_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."TestQuestion"
    ADD CONSTRAINT "TestQuestion_pkey" PRIMARY KEY (id);


--
-- Name: TestSession TestSession_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."TestSession"
    ADD CONSTRAINT "TestSession_pkey" PRIMARY KEY (id);


--
-- Name: Test Test_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Test"
    ADD CONSTRAINT "Test_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Venue Venue_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Venue"
    ADD CONSTRAINT "Venue_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Announcement_groupId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Announcement_groupId_idx" ON public."Announcement" USING btree ("groupId");


--
-- Name: Announcement_isPublished_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Announcement_isPublished_idx" ON public."Announcement" USING btree ("isPublished");


--
-- Name: Announcement_publishedAt_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Announcement_publishedAt_idx" ON public."Announcement" USING btree ("publishedAt");


--
-- Name: Announcement_targetAudience_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Announcement_targetAudience_idx" ON public."Announcement" USING btree ("targetAudience");


--
-- Name: Announcement_termId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Announcement_termId_idx" ON public."Announcement" USING btree ("termId");


--
-- Name: AttendanceWarning_sentAt_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "AttendanceWarning_sentAt_idx" ON public."AttendanceWarning" USING btree ("sentAt");


--
-- Name: AttendanceWarning_studentId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "AttendanceWarning_studentId_idx" ON public."AttendanceWarning" USING btree ("studentId");


--
-- Name: Attendance_classSessionId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Attendance_classSessionId_idx" ON public."Attendance" USING btree ("classSessionId");


--
-- Name: Attendance_enrollmentId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Attendance_enrollmentId_idx" ON public."Attendance" USING btree ("enrollmentId");


--
-- Name: Attendance_status_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Attendance_status_idx" ON public."Attendance" USING btree (status);


--
-- Name: Attendance_studentId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Attendance_studentId_idx" ON public."Attendance" USING btree ("studentId");


--
-- Name: AuditLog_action_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "AuditLog_action_idx" ON public."AuditLog" USING btree (action);


--
-- Name: AuditLog_createdAt_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "AuditLog_createdAt_idx" ON public."AuditLog" USING btree ("createdAt");


--
-- Name: AuditLog_recordId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "AuditLog_recordId_idx" ON public."AuditLog" USING btree ("recordId");


--
-- Name: AuditLog_tableName_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "AuditLog_tableName_idx" ON public."AuditLog" USING btree ("tableName");


--
-- Name: AuditLog_userId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "AuditLog_userId_idx" ON public."AuditLog" USING btree ("userId");


--
-- Name: ChatMessage_createdAt_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "ChatMessage_createdAt_idx" ON public."ChatMessage" USING btree ("createdAt");


--
-- Name: ChatMessage_queryType_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "ChatMessage_queryType_idx" ON public."ChatMessage" USING btree ("queryType");


--
-- Name: ChatMessage_userId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "ChatMessage_userId_idx" ON public."ChatMessage" USING btree ("userId");


--
-- Name: ClassSession_groupId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "ClassSession_groupId_idx" ON public."ClassSession" USING btree ("groupId");


--
-- Name: ClassSession_sessionDate_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "ClassSession_sessionDate_idx" ON public."ClassSession" USING btree ("sessionDate");


--
-- Name: ClassSession_status_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "ClassSession_status_idx" ON public."ClassSession" USING btree (status);


--
-- Name: Enrollment_groupId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Enrollment_groupId_idx" ON public."Enrollment" USING btree ("groupId");


--
-- Name: Enrollment_status_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Enrollment_status_idx" ON public."Enrollment" USING btree (status);


--
-- Name: Enrollment_studentId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Enrollment_studentId_idx" ON public."Enrollment" USING btree ("studentId");


--
-- Name: Group_groupCode_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Group_groupCode_idx" ON public."Group" USING btree ("groupCode");


--
-- Name: Group_groupCode_key; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE UNIQUE INDEX "Group_groupCode_key" ON public."Group" USING btree ("groupCode");


--
-- Name: Group_levelId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Group_levelId_idx" ON public."Group" USING btree ("levelId");


--
-- Name: Group_teacherId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Group_teacherId_idx" ON public."Group" USING btree ("teacherId");


--
-- Name: Group_termId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Group_termId_idx" ON public."Group" USING btree ("termId");


--
-- Name: Hall_isActive_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Hall_isActive_idx" ON public."Hall" USING btree ("isActive");


--
-- Name: Hall_venueId_code_key; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE UNIQUE INDEX "Hall_venueId_code_key" ON public."Hall" USING btree ("venueId", code);


--
-- Name: Hall_venueId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Hall_venueId_idx" ON public."Hall" USING btree ("venueId");


--
-- Name: Installment_benefitReferenceNumber_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Installment_benefitReferenceNumber_idx" ON public."Installment" USING btree ("benefitReferenceNumber");


--
-- Name: Installment_benefitReferenceNumber_key; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE UNIQUE INDEX "Installment_benefitReferenceNumber_key" ON public."Installment" USING btree ("benefitReferenceNumber");


--
-- Name: Installment_paymentDate_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Installment_paymentDate_idx" ON public."Installment" USING btree ("paymentDate");


--
-- Name: Installment_paymentPlanId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Installment_paymentPlanId_idx" ON public."Installment" USING btree ("paymentPlanId");


--
-- Name: Installment_paymentPlanId_installmentNumber_key; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE UNIQUE INDEX "Installment_paymentPlanId_installmentNumber_key" ON public."Installment" USING btree ("paymentPlanId", "installmentNumber");


--
-- Name: Level_name_key; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE UNIQUE INDEX "Level_name_key" ON public."Level" USING btree (name);


--
-- Name: Level_orderNumber_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Level_orderNumber_idx" ON public."Level" USING btree ("orderNumber");


--
-- Name: Material_groupId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Material_groupId_idx" ON public."Material" USING btree ("groupId");


--
-- Name: Material_materialType_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Material_materialType_idx" ON public."Material" USING btree ("materialType");


--
-- Name: Material_uploadedBy_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Material_uploadedBy_idx" ON public."Material" USING btree ("uploadedBy");


--
-- Name: Notification_createdAt_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Notification_createdAt_idx" ON public."Notification" USING btree ("createdAt");


--
-- Name: Notification_isRead_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Notification_isRead_idx" ON public."Notification" USING btree ("isRead");


--
-- Name: Notification_type_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Notification_type_idx" ON public."Notification" USING btree (type);


--
-- Name: Notification_userId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Notification_userId_idx" ON public."Notification" USING btree ("userId");


--
-- Name: OtpCode_userId_expiresAt_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "OtpCode_userId_expiresAt_idx" ON public."OtpCode" USING btree ("userId", "expiresAt");


--
-- Name: ParentStudentLink_parentId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "ParentStudentLink_parentId_idx" ON public."ParentStudentLink" USING btree ("parentId");


--
-- Name: ParentStudentLink_parentId_studentId_key; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE UNIQUE INDEX "ParentStudentLink_parentId_studentId_key" ON public."ParentStudentLink" USING btree ("parentId", "studentId");


--
-- Name: ParentStudentLink_studentId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "ParentStudentLink_studentId_idx" ON public."ParentStudentLink" USING btree ("studentId");


--
-- Name: Parent_userId_key; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE UNIQUE INDEX "Parent_userId_key" ON public."Parent" USING btree ("userId");


--
-- Name: PaymentReminder_installmentId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "PaymentReminder_installmentId_idx" ON public."PaymentReminder" USING btree ("installmentId");


--
-- Name: PaymentReminder_sentAt_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "PaymentReminder_sentAt_idx" ON public."PaymentReminder" USING btree ("sentAt");


--
-- Name: Phone_isPrimary_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Phone_isPrimary_idx" ON public."Phone" USING btree ("isPrimary");


--
-- Name: Phone_parentId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Phone_parentId_idx" ON public."Phone" USING btree ("parentId");


--
-- Name: Phone_phoneNumber_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Phone_phoneNumber_idx" ON public."Phone" USING btree ("phoneNumber");


--
-- Name: Phone_phoneNumber_key; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE UNIQUE INDEX "Phone_phoneNumber_key" ON public."Phone" USING btree ("phoneNumber");


--
-- Name: Phone_studentId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Phone_studentId_idx" ON public."Phone" USING btree ("studentId");


--
-- Name: Program_code_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Program_code_idx" ON public."Program" USING btree (code);


--
-- Name: Program_code_key; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE UNIQUE INDEX "Program_code_key" ON public."Program" USING btree (code);


--
-- Name: Program_isActive_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Program_isActive_idx" ON public."Program" USING btree ("isActive");


--
-- Name: ProgressCriteria_groupId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "ProgressCriteria_groupId_idx" ON public."ProgressCriteria" USING btree ("groupId");


--
-- Name: ProgressCriteria_isActive_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "ProgressCriteria_isActive_idx" ON public."ProgressCriteria" USING btree ("isActive");


--
-- Name: ProgressCriteria_levelId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "ProgressCriteria_levelId_idx" ON public."ProgressCriteria" USING btree ("levelId");


--
-- Name: Refund_enrollmentId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Refund_enrollmentId_idx" ON public."Refund" USING btree ("enrollmentId");


--
-- Name: Refund_status_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Refund_status_idx" ON public."Refund" USING btree (status);


--
-- Name: Session_expiresAt_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Session_expiresAt_idx" ON public."Session" USING btree ("expiresAt");


--
-- Name: Session_token_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Session_token_idx" ON public."Session" USING btree (token);


--
-- Name: Session_token_key; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE UNIQUE INDEX "Session_token_key" ON public."Session" USING btree (token);


--
-- Name: Session_userId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Session_userId_idx" ON public."Session" USING btree ("userId");


--
-- Name: SpeakingSlot_slotDate_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "SpeakingSlot_slotDate_idx" ON public."SpeakingSlot" USING btree ("slotDate");


--
-- Name: SpeakingSlot_status_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "SpeakingSlot_status_idx" ON public."SpeakingSlot" USING btree (status);


--
-- Name: SpeakingSlot_studentId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "SpeakingSlot_studentId_idx" ON public."SpeakingSlot" USING btree ("studentId");


--
-- Name: SpeakingSlot_teacherId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "SpeakingSlot_teacherId_idx" ON public."SpeakingSlot" USING btree ("teacherId");


--
-- Name: StudentCriteriaCompletion_criteriaId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "StudentCriteriaCompletion_criteriaId_idx" ON public."StudentCriteriaCompletion" USING btree ("criteriaId");


--
-- Name: StudentCriteriaCompletion_studentId_criteriaId_enrollmentId_key; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE UNIQUE INDEX "StudentCriteriaCompletion_studentId_criteriaId_enrollmentId_key" ON public."StudentCriteriaCompletion" USING btree ("studentId", "criteriaId", "enrollmentId");


--
-- Name: StudentCriteriaCompletion_studentId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "StudentCriteriaCompletion_studentId_idx" ON public."StudentCriteriaCompletion" USING btree ("studentId");


--
-- Name: StudentPaymentPlan_enrollmentId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "StudentPaymentPlan_enrollmentId_idx" ON public."StudentPaymentPlan" USING btree ("enrollmentId");


--
-- Name: StudentPaymentPlan_enrollmentId_key; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE UNIQUE INDEX "StudentPaymentPlan_enrollmentId_key" ON public."StudentPaymentPlan" USING btree ("enrollmentId");


--
-- Name: StudentPaymentPlan_status_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "StudentPaymentPlan_status_idx" ON public."StudentPaymentPlan" USING btree (status);


--
-- Name: Student_cpr_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Student_cpr_idx" ON public."Student" USING btree (cpr);


--
-- Name: Student_cpr_key; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE UNIQUE INDEX "Student_cpr_key" ON public."Student" USING btree (cpr);


--
-- Name: Student_firstName_secondName_thirdName_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Student_firstName_secondName_thirdName_idx" ON public."Student" USING btree ("firstName", "secondName", "thirdName");


--
-- Name: Student_userId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Student_userId_idx" ON public."Student" USING btree ("userId");


--
-- Name: Student_userId_key; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE UNIQUE INDEX "Student_userId_key" ON public."Student" USING btree ("userId");


--
-- Name: TeacherScheduleOverride_overrideDate_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "TeacherScheduleOverride_overrideDate_idx" ON public."TeacherScheduleOverride" USING btree ("overrideDate");


--
-- Name: TeacherScheduleOverride_teacherId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "TeacherScheduleOverride_teacherId_idx" ON public."TeacherScheduleOverride" USING btree ("teacherId");


--
-- Name: TeacherScheduleTemplate_dayOfWeek_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "TeacherScheduleTemplate_dayOfWeek_idx" ON public."TeacherScheduleTemplate" USING btree ("dayOfWeek");


--
-- Name: TeacherScheduleTemplate_teacherId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "TeacherScheduleTemplate_teacherId_idx" ON public."TeacherScheduleTemplate" USING btree ("teacherId");


--
-- Name: Teacher_isActive_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Teacher_isActive_idx" ON public."Teacher" USING btree ("isActive");


--
-- Name: Teacher_userId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Teacher_userId_idx" ON public."Teacher" USING btree ("userId");


--
-- Name: Teacher_userId_key; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE UNIQUE INDEX "Teacher_userId_key" ON public."Teacher" USING btree ("userId");


--
-- Name: Term_isCurrent_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Term_isCurrent_idx" ON public."Term" USING btree ("isCurrent");


--
-- Name: Term_programId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Term_programId_idx" ON public."Term" USING btree ("programId");


--
-- Name: Term_startDate_endDate_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Term_startDate_endDate_idx" ON public."Term" USING btree ("startDate", "endDate");


--
-- Name: TestQuestion_orderNumber_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "TestQuestion_orderNumber_idx" ON public."TestQuestion" USING btree ("orderNumber");


--
-- Name: TestQuestion_testId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "TestQuestion_testId_idx" ON public."TestQuestion" USING btree ("testId");


--
-- Name: TestSession_status_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "TestSession_status_idx" ON public."TestSession" USING btree (status);


--
-- Name: TestSession_studentId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "TestSession_studentId_idx" ON public."TestSession" USING btree ("studentId");


--
-- Name: TestSession_testId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "TestSession_testId_idx" ON public."TestSession" USING btree ("testId");


--
-- Name: Test_isActive_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Test_isActive_idx" ON public."Test" USING btree ("isActive");


--
-- Name: Test_testType_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Test_testType_idx" ON public."Test" USING btree ("testType");


--
-- Name: User_email_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "User_email_idx" ON public."User" USING btree (email);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_phone_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "User_phone_idx" ON public."User" USING btree (phone);


--
-- Name: User_phone_key; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE UNIQUE INDEX "User_phone_key" ON public."User" USING btree (phone);


--
-- Name: User_role_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "User_role_idx" ON public."User" USING btree (role);


--
-- Name: Venue_code_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Venue_code_idx" ON public."Venue" USING btree (code);


--
-- Name: Venue_code_key; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE UNIQUE INDEX "Venue_code_key" ON public."Venue" USING btree (code);


--
-- Name: Announcement Announcement_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Announcement"
    ADD CONSTRAINT "Announcement_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public."Group"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Announcement Announcement_publishedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Announcement"
    ADD CONSTRAINT "Announcement_publishedBy_fkey" FOREIGN KEY ("publishedBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Announcement Announcement_termId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Announcement"
    ADD CONSTRAINT "Announcement_termId_fkey" FOREIGN KEY ("termId") REFERENCES public."Term"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AttendanceWarning AttendanceWarning_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."AttendanceWarning"
    ADD CONSTRAINT "AttendanceWarning_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Attendance Attendance_classSessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_classSessionId_fkey" FOREIGN KEY ("classSessionId") REFERENCES public."ClassSession"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Attendance Attendance_enrollmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES public."Enrollment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Attendance Attendance_markedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_markedBy_fkey" FOREIGN KEY ("markedBy") REFERENCES public."Teacher"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Attendance Attendance_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AuditLog AuditLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ChatMessage ChatMessage_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ClassSession ClassSession_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."ClassSession"
    ADD CONSTRAINT "ClassSession_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public."Group"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ClassSession ClassSession_hallId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."ClassSession"
    ADD CONSTRAINT "ClassSession_hallId_fkey" FOREIGN KEY ("hallId") REFERENCES public."Hall"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Enrollment Enrollment_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Enrollment"
    ADD CONSTRAINT "Enrollment_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public."Group"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Enrollment Enrollment_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Enrollment"
    ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Group Group_levelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Group"
    ADD CONSTRAINT "Group_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES public."Level"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Group Group_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Group"
    ADD CONSTRAINT "Group_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public."Teacher"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Group Group_termId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Group"
    ADD CONSTRAINT "Group_termId_fkey" FOREIGN KEY ("termId") REFERENCES public."Term"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Group Group_venueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Group"
    ADD CONSTRAINT "Group_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES public."Venue"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Hall Hall_venueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Hall"
    ADD CONSTRAINT "Hall_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES public."Venue"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Installment Installment_paymentPlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Installment"
    ADD CONSTRAINT "Installment_paymentPlanId_fkey" FOREIGN KEY ("paymentPlanId") REFERENCES public."StudentPaymentPlan"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Installment Installment_receiptMakerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Installment"
    ADD CONSTRAINT "Installment_receiptMakerId_fkey" FOREIGN KEY ("receiptMakerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Material Material_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Material"
    ADD CONSTRAINT "Material_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public."Group"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Material Material_uploadedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Material"
    ADD CONSTRAINT "Material_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES public."Teacher"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OtpCode OtpCode_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."OtpCode"
    ADD CONSTRAINT "OtpCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ParentStudentLink ParentStudentLink_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."ParentStudentLink"
    ADD CONSTRAINT "ParentStudentLink_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Parent"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ParentStudentLink ParentStudentLink_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."ParentStudentLink"
    ADD CONSTRAINT "ParentStudentLink_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Parent Parent_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Parent"
    ADD CONSTRAINT "Parent_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PaymentReminder PaymentReminder_installmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."PaymentReminder"
    ADD CONSTRAINT "PaymentReminder_installmentId_fkey" FOREIGN KEY ("installmentId") REFERENCES public."Installment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Phone Phone_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Phone"
    ADD CONSTRAINT "Phone_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Parent"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Phone Phone_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Phone"
    ADD CONSTRAINT "Phone_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProgressCriteria ProgressCriteria_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."ProgressCriteria"
    ADD CONSTRAINT "ProgressCriteria_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public."Group"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProgressCriteria ProgressCriteria_levelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."ProgressCriteria"
    ADD CONSTRAINT "ProgressCriteria_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES public."Level"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Refund Refund_approvedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Refund"
    ADD CONSTRAINT "Refund_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Refund Refund_enrollmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Refund"
    ADD CONSTRAINT "Refund_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES public."Enrollment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Refund Refund_installmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Refund"
    ADD CONSTRAINT "Refund_installmentId_fkey" FOREIGN KEY ("installmentId") REFERENCES public."Installment"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Refund Refund_processedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Refund"
    ADD CONSTRAINT "Refund_processedBy_fkey" FOREIGN KEY ("processedBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Refund Refund_requestedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Refund"
    ADD CONSTRAINT "Refund_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SpeakingSlot SpeakingSlot_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."SpeakingSlot"
    ADD CONSTRAINT "SpeakingSlot_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SpeakingSlot SpeakingSlot_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."SpeakingSlot"
    ADD CONSTRAINT "SpeakingSlot_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public."Teacher"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SpeakingSlot SpeakingSlot_testSessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."SpeakingSlot"
    ADD CONSTRAINT "SpeakingSlot_testSessionId_fkey" FOREIGN KEY ("testSessionId") REFERENCES public."TestSession"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StudentCriteriaCompletion StudentCriteriaCompletion_criteriaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."StudentCriteriaCompletion"
    ADD CONSTRAINT "StudentCriteriaCompletion_criteriaId_fkey" FOREIGN KEY ("criteriaId") REFERENCES public."ProgressCriteria"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StudentCriteriaCompletion StudentCriteriaCompletion_enrollmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."StudentCriteriaCompletion"
    ADD CONSTRAINT "StudentCriteriaCompletion_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES public."Enrollment"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: StudentCriteriaCompletion StudentCriteriaCompletion_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."StudentCriteriaCompletion"
    ADD CONSTRAINT "StudentCriteriaCompletion_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StudentPaymentPlan StudentPaymentPlan_enrollmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."StudentPaymentPlan"
    ADD CONSTRAINT "StudentPaymentPlan_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES public."Enrollment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Student Student_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TeacherScheduleOverride TeacherScheduleOverride_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."TeacherScheduleOverride"
    ADD CONSTRAINT "TeacherScheduleOverride_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public."Teacher"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TeacherScheduleTemplate TeacherScheduleTemplate_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."TeacherScheduleTemplate"
    ADD CONSTRAINT "TeacherScheduleTemplate_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public."Teacher"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Teacher Teacher_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Teacher"
    ADD CONSTRAINT "Teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Term Term_programId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Term"
    ADD CONSTRAINT "Term_programId_fkey" FOREIGN KEY ("programId") REFERENCES public."Program"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TestQuestion TestQuestion_testId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."TestQuestion"
    ADD CONSTRAINT "TestQuestion_testId_fkey" FOREIGN KEY ("testId") REFERENCES public."Test"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TestSession TestSession_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."TestSession"
    ADD CONSTRAINT "TestSession_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TestSession TestSession_testId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."TestSession"
    ADD CONSTRAINT "TestSession_testId_fkey" FOREIGN KEY ("testId") REFERENCES public."Test"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Test Test_levelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Test"
    ADD CONSTRAINT "Test_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES public."Level"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict Eou5z6RX0wAqgi5iGGWZG8hLBw99dCfiISA7RPzWF4sqlrSdIiTFrcOunZ5Mcdt

