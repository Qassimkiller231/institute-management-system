--
-- PostgreSQL database dump
--

\restrict JvKag3xXD0R2hLofN759afXeNjo3xxnwPV87ZmH7sesfcakS4LjBxeDQMx6a990

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: macbookairm3
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO macbookairm3;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: macbookairm3
--

COMMENT ON SCHEMA public IS '';


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
-- Name: FAQ; Type: TABLE; Schema: public; Owner: macbookairm3
--

CREATE TABLE public."FAQ" (
    id text NOT NULL,
    question text NOT NULL,
    keywords text[],
    answer text NOT NULL,
    category text,
    "isActive" boolean DEFAULT true NOT NULL,
    roles text[] DEFAULT ARRAY['ALL'::text],
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."FAQ" OWNER TO macbookairm3;

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
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "hallId" text
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
    "paymentMethod" text,
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
    "isActive" boolean DEFAULT true NOT NULL,
    "isPublished" boolean DEFAULT true NOT NULL,
    "publishedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP,
    "scheduledFor" timestamp(3) without time zone
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
    "updatedAt" timestamp(3) without time zone NOT NULL,
    duration integer
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
    feedback text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    final_level character varying(3),
    mcq_level character varying(3),
    speaking_level character varying(3)
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
    "canSeePayment" boolean DEFAULT true NOT NULL,
    current_level character varying(3),
    "profilePicture" text
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
aebdf26f-6d73-45dd-b09a-48bbdf0e9ea1	\N	\N	Welcome to The Function Institute!	We are excited to have you join our English learning community. Classes start next week!	STUDENT	\N	2025-12-12 09:44:57.357	\N	t	2025-12-12 09:44:57.357	2025-12-12 09:44:57.357
6eaa63f3-6791-443d-a56e-cefe89f4187b	\N	\N	Upcoming Speaking Tests	Speaking test slots are now available for booking. Please book your slot at least 24 hours in advance.	STUDENT	\N	2025-12-12 09:44:57.357	\N	t	2025-12-12 09:44:57.36	2025-12-12 09:44:57.36
e829eb6e-4f7b-4358-8bc4-8bac06b73bd0	\N	\N	Payment Reminder	Please ensure all tuition fees are paid by the end of this month to avoid any interruptions to your classes.	PARENT	\N	2025-12-12 09:44:57.357	\N	t	2025-12-12 09:44:57.36	2025-12-12 09:44:57.36
a6154290-2d4e-4f14-a3c0-e9ff38bfafa5	\N	\N	New Study Materials Available	Check the Materials section for newly uploaded worksheets and practice exercises for levels A1-B2.	STUDENT	\N	2025-12-12 09:44:57.357	\N	t	2025-12-12 09:44:57.36	2025-12-12 09:44:57.36
edd842ac-03f4-4c90-84bc-b32ff995a203	\N	\N	Teacher Meeting Tomorrow	Reminder: Staff meeting tomorrow at 3 PM in the main hall. Attendance is mandatory.	TEACHER	\N	2025-12-12 09:44:57.357	\N	t	2025-12-12 09:44:57.361	2025-12-12 09:44:57.361
27242eb9-1a76-4aff-b1e5-e81910216828	\N	\N	Welcome to The Function Institute!	We are excited to have you join our English learning community. Classes start next week!	STUDENT	\N	2025-12-12 09:58:49.633	\N	t	2025-12-12 09:58:49.634	2025-12-12 09:58:49.634
e8eaa987-a4f6-4c62-a953-696bff36e8fc	\N	\N	Upcoming Speaking Tests	Speaking test slots are now available for booking. Please book your slot at least 24 hours in advance.	STUDENT	\N	2025-12-12 09:58:49.633	\N	t	2025-12-12 09:58:49.636	2025-12-12 09:58:49.636
fbd72b83-63d7-45a3-b0f5-eb7555d5a1b7	\N	\N	Payment Reminder	Please ensure all tuition fees are paid by the end of this month to avoid any interruptions to your classes.	PARENT	\N	2025-12-12 09:58:49.633	\N	t	2025-12-12 09:58:49.636	2025-12-12 09:58:49.636
f09efd11-a3ee-4606-96af-3ff0b4961713	\N	\N	New Study Materials Available	Check the Materials section for newly uploaded worksheets and practice exercises for levels A1-B2.	STUDENT	\N	2025-12-12 09:58:49.633	\N	t	2025-12-12 09:58:49.636	2025-12-12 09:58:49.636
4f8fd3ff-d2b8-4046-9347-77deda7a27ab	\N	\N	Teacher Meeting Tomorrow	Reminder: Staff meeting tomorrow at 3 PM in the main hall. Attendance is mandatory.	TEACHER	\N	2025-12-12 09:58:49.633	\N	t	2025-12-12 09:58:49.637	2025-12-12 09:58:49.637
68615c19-fdd6-4077-aaeb-f4f42a498a2e	\N	\N	Welcome to The Function Institute!	We are excited to have you join our English learning community. Classes start next week!	STUDENT	\N	2025-12-12 10:03:14.018	\N	t	2025-12-12 10:03:14.019	2025-12-12 10:03:14.019
8f4dfd8c-659a-4dac-a1e1-ba0faa202399	\N	\N	Upcoming Speaking Tests	Speaking test slots are now available for booking. Please book your slot at least 24 hours in advance.	STUDENT	\N	2025-12-12 10:03:14.018	\N	t	2025-12-12 10:03:14.02	2025-12-12 10:03:14.02
c91019aa-6ae1-4ade-8449-f4d2610081fb	\N	\N	Payment Reminder	Please ensure all tuition fees are paid by the end of this month to avoid any interruptions to your classes.	PARENT	\N	2025-12-12 10:03:14.018	\N	t	2025-12-12 10:03:14.02	2025-12-12 10:03:14.02
cc1ba542-d4a3-46c7-ba5e-97361f4cdd5f	\N	\N	New Study Materials Available	Check the Materials section for newly uploaded worksheets and practice exercises for levels A1-B2.	STUDENT	\N	2025-12-12 10:03:14.018	\N	t	2025-12-12 10:03:14.02	2025-12-12 10:03:14.02
381a2862-1dc5-429d-938a-2bcda14880aa	\N	\N	Teacher Meeting Tomorrow	Reminder: Staff meeting tomorrow at 3 PM in the main hall. Attendance is mandatory.	TEACHER	\N	2025-12-12 10:03:14.018	\N	t	2025-12-12 10:03:14.02	2025-12-12 10:03:14.02
381e3af9-6de6-47c5-bdb9-11beedb2a49c	c221259f-fa3b-44a9-98e2-d11e33f76193	\N	sadsad	asdsadsa	GROUP	de6a6cdb-65b7-410f-8908-54fd4e719d53	\N	\N	f	2025-12-13 10:13:15.141	2025-12-13 10:13:15.141
36e537ec-0d2a-4bbd-bdd9-11a145dbf382	c221259f-fa3b-44a9-98e2-d11e33f76193	\N	heeee	hjfjyf	GROUP	de6a6cdb-65b7-410f-8908-54fd4e719d53	\N	\N	f	2025-12-15 22:36:43.523	2025-12-15 22:36:43.523
4f828055-26f3-4dd4-9149-c5cdc6854fe8	\N	\N	🎉 Test Scheduled Announcement	This is a test announcement scheduled for automatic publication. If you received this notification via email and SMS, the scheduled announcement system is working perfectly!	STUDENTS	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	2025-12-18 17:35:00.412	2025-12-18 17:10:00	t	2025-12-18 17:11:45.301	2025-12-18 17:35:00.413
a0996d2e-6dfa-44a6-9e7b-4953603004a1	\N	\N	testing schedues	asdsadsadasd	ALL	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	2025-12-18 17:35:01.204	2025-12-18 17:31:00	t	2025-12-18 17:30:25.163	2025-12-18 17:35:01.205
e95c0d97-101f-4760-aefc-3b22a52c1fe7	\N	\N	testing last	last i say	ALL	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	2025-12-18 17:42:00.039	2025-12-18 17:42:00	t	2025-12-18 17:41:30.079	2025-12-18 17:42:00.04
\.


--
-- Data for Name: Attendance; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Attendance" (id, "classSessionId", "studentId", "enrollmentId", status, "markedAt", "markedBy", notes, "createdAt", "updatedAt") FROM stdin;
a1a7adbb-f423-43eb-b4aa-88dc0d07941e	ebcb1716-a5a2-456e-98aa-c3e13614f552	fda21647-8750-4c9c-9634-24a6729e2193	4f65596c-a70e-4b2e-acf0-d6ab6251f40e	PRESENT	2025-12-15 22:31:13.163	dd791e3a-1682-4bce-a5ca-26e2291c8e52	\N	2025-12-15 22:31:13.165	2025-12-15 22:31:33.096
03b77474-20a2-4b61-b4af-3041c4345fad	21525779-c7e9-414a-a8ae-283001c79b01	a0ab7534-1025-4f52-aeff-f96b83c49352	10e48ef2-712b-435d-9e03-196b957a49d7	PRESENT	2025-12-08 14:28:00.753	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	2025-12-08 14:28:00.754	2025-12-08 14:28:00.754
a94428b7-fe2f-42a5-b74c-44054556b259	21525779-c7e9-414a-a8ae-283001c79b01	0749ca86-8510-4ea2-9a26-624f338f4f07	77bfffa9-5176-4501-b41a-bf228ef16e3e	PRESENT	2025-12-08 14:28:00.753	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	2025-12-08 14:28:00.755	2025-12-08 14:28:00.755
34c19af7-b77e-4165-b40b-37eb43d8171d	21525779-c7e9-414a-a8ae-283001c79b01	8446e894-f588-470c-a1ea-9bef7b96244c	53935fbc-bd45-4fa9-8e5a-e9170d0b60ae	EXCUSED	2025-12-08 14:28:00.749	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	2025-12-08 14:28:00.754	2025-12-08 14:28:00.754
315912b3-4fa3-4e58-9644-60f0b2691d60	21525779-c7e9-414a-a8ae-283001c79b01	45a91646-db5f-4b06-b64e-9a02a87522ab	bb2c135a-61b1-4bc5-8d62-ae90f4635d30	PRESENT	2025-12-08 14:28:00.753	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	2025-12-08 14:28:00.755	2025-12-08 14:28:00.755
76dc62c5-616f-4155-873f-23dc8452d10e	ebcb1716-a5a2-456e-98aa-c3e13614f552	5d154f79-4d16-4f45-a4f9-0f7a9b0bc9a0	6c8e1a2a-7d62-4a26-ab16-4d62d33779de	PRESENT	2025-12-13 10:04:08	dd791e3a-1682-4bce-a5ca-26e2291c8e52	jgjkgj	2025-12-13 10:04:08.001	2025-12-15 22:31:33.096
4b45d76a-ef2d-428d-a62a-bc143c5d8021	ebcb1716-a5a2-456e-98aa-c3e13614f552	23659842-a120-4a96-a1e5-a93640df479a	8c725468-d781-4cd1-99d0-9928d84bcef4	PRESENT	2025-12-13 10:04:08	dd791e3a-1682-4bce-a5ca-26e2291c8e52	\N	2025-12-13 10:04:08.001	2025-12-15 22:31:33.096
26b24848-20fc-49f7-89bf-d38639020b16	059c1c00-d16f-4076-86fc-5ffd9f28275a	a0ab7534-1025-4f52-aeff-f96b83c49352	10e48ef2-712b-435d-9e03-196b957a49d7	ABSENT	2025-12-18 19:50:18.639	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	Sick	2025-12-18 19:50:18.64	2025-12-18 19:50:18.64
596dcd83-5990-45e6-8e76-3813ef6ef236	059c1c00-d16f-4076-86fc-5ffd9f28275a	0749ca86-8510-4ea2-9a26-624f338f4f07	77bfffa9-5176-4501-b41a-bf228ef16e3e	PRESENT	2025-12-18 19:50:18.648	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	2025-12-18 19:50:18.649	2025-12-18 19:50:18.649
ace2be59-a2b2-49a7-bedb-099687085e68	059c1c00-d16f-4076-86fc-5ffd9f28275a	45a91646-db5f-4b06-b64e-9a02a87522ab	bb2c135a-61b1-4bc5-8d62-ae90f4635d30	PRESENT	2025-12-18 19:50:18.65	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	2025-12-18 19:50:18.651	2025-12-18 19:50:18.651
8ef6a62a-f717-4c98-a6a9-d89fd0869c9c	059c1c00-d16f-4076-86fc-5ffd9f28275a	8446e894-f588-470c-a1ea-9bef7b96244c	53935fbc-bd45-4fa9-8e5a-e9170d0b60ae	ABSENT	2025-12-18 19:50:18.653	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	Sick	2025-12-18 19:50:18.653	2025-12-18 19:50:18.653
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
1613689d-122f-4c93-8d3f-2b66323c40dc	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	MATERIAL_UPLOAD	Material	1cdabcfe-0b31-4498-a387-22b84c85327e	\N	{"type": "LINK", "group": "aeb57d06-a371-4f1e-8f56-85060430aa68", "title": "sadsa"}	\N	\N	2025-12-18 18:34:31.891
a1730a2a-4cf2-4357-905f-5108a84ddb02	de6a6cdb-65b7-410f-8908-54fd4e719d53	LOGIN	\N	\N	\N	{"role": "TEACHER", "method": "EMAIL"}	\N	\N	2025-12-18 19:40:07.889
817210d6-f2c5-4b27-a5b0-7525175db8ef	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	LOGIN	\N	\N	\N	{"role": "ADMIN", "method": "EMAIL"}	\N	\N	2025-12-18 19:40:42.153
b4385c63-69ab-4c5c-b80c-9196dcd4fb77	b2e0ef76-8efa-4a0b-82bd-16e3422bc3fd	LOGIN	\N	\N	\N	{"role": "STUDENT", "method": "SMS"}	\N	\N	2025-12-18 22:57:05.082
df849500-ff01-4b80-9d98-aa1e530c5916	db412e3d-563d-43b1-aa12-dd1df03db412	LOGIN	\N	\N	\N	{"role": "STUDENT", "method": "EMAIL"}	\N	\N	2025-12-18 22:57:54.79
21e9a00f-484d-452d-af11-5e7a3fbadcda	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	LOGIN	\N	\N	\N	{"role": "ADMIN", "method": "EMAIL"}	\N	\N	2025-12-19 11:19:52.175
5c253381-16ec-4058-81df-312ef0abd804	de6a6cdb-65b7-410f-8908-54fd4e719d53	LOGIN	\N	\N	\N	{"role": "TEACHER", "method": "EMAIL"}	\N	\N	2025-12-19 15:19:02.383
0f93104a-2177-4b82-8b1f-f194d7be5fe8	554fe800-5b5d-4918-a8a0-45037debbe59	LOGIN	\N	\N	\N	{"role": "STUDENT", "method": "EMAIL"}	\N	\N	2025-12-19 15:21:34.623
8be8a5d3-b966-427d-b65c-f5bda4ab5909	51cd0567-ed77-4810-b9d9-5c3a99a79791	LOGIN	\N	\N	\N	{"role": "STUDENT", "method": "EMAIL"}	\N	\N	2025-12-19 15:23:44.947
\.


--
-- Data for Name: ChatMessage; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."ChatMessage" (id, "userId", "userRole", message, response, context, "queryType", "createdAt") FROM stdin;
4f0d85ef-b7f8-4482-b50b-69b0251d64b3	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	ADMIN	How many active students do we have?	Based on the current database, we have **11 active students** at The Function Institute. All 11 students are currently active with no inactive students recorded.	{"usedAI": true}	GENERAL	2025-12-16 14:05:18.846
5c6338b1-3293-4dc0-aabd-a4791a6757af	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	ADMIN	what is react	React is a popular JavaScript library developed by Facebook (now Meta) for building user interfaces, particularly web applications. Here are the key points:\n\n**What React is:**\n- A front-end JavaScript library for creating interactive user interfaces\n- Component-based architecture that allows you to build reusable UI components\n- Uses a virtual DOM for efficient rendering and better performance\n\n**Key Features:**\n- **Component-Based:** Build encapsulated components that manage their own state\n- **Declarative:** Describes what the UI should look like for any given state\n- **Virtual DOM:** Creates a virtual representation of the DOM for faster updates\n- **JSX:** Allows you to write HTML-like syntax within JavaScript\n\n**Common Uses:**\n- Single-page applications (SPAs)\n- Dynamic web interfaces\n- Mobile apps (with React Native)\n- Desktop applications (with frameworks like Electron)\n\nHowever, as an administrator at The Function Institute, I should note that this question seems outside our typical academic and administrative discussions. Is there a specific reason you're asking about React? Are you considering it for our institute's technology curriculum or website development?	{"usedAI": true}	GENERAL	2025-12-16 14:05:48.383
cfde5325-2665-47fa-8f20-e9422616d2a4	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	ADMIN	give me the names of the students that still did not pay	I don't have access to the specific names of individual students in the current database context provided to me. \n\nWhat I can tell you from the financial overview is that:\n- **3 students** currently have overdue payments\n- Total outstanding amount: **BHD 1,719.83**\n- We've collected BHD 1,230.17 out of BHD 2,950.00 expected\n\nTo get the specific names of students with outstanding payments, you would need to access the detailed student payment records in the institute's management system or financial module. This information would typically be found in the "Student Payments" or "Financial Records" section of your administrative dashboard.\n\nWould you like me to help you with any other financial insights or suggest follow-up actions for the overdue payments?	{"usedAI": true}	GENERAL	2025-12-16 14:24:13.529
708526f3-f0f1-4c7a-8f4a-25bdb796d17d	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	ADMIN	show me the faqs	I don't have access to the institute's FAQ database in my current system context. The information I have access to covers student enrollment, financial data, academic programs, and attendance statistics, but not the FAQ content.\n\nTo access the FAQs, you would typically find them in:\n- The institute's website admin panel\n- Student/parent portal documentation\n- Administrative knowledge base system\n- Marketing or communications module\n\n**Would you like me to help with:**\n- Creating standard FAQs based on our current programs and policies?\n- Analyzing common inquiry patterns from our student data?\n- Reviewing our academic offerings that might generate frequent questions?\n\nOur current programs include EMV, EM, GE, BE, IELTS, KIDS, CONV, AW, and AMR across 6 proficiency levels, which might be useful context for FAQ development.\n\nWhat specific aspect of the FAQs were you looking to review or update?	{"usedAI": true}	GENERAL	2025-12-16 14:27:05.895
\.


--
-- Data for Name: ClassSession; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."ClassSession" (id, "groupId", "hallId", "sessionDate", "sessionNumber", "startTime", "endTime", topic, status, "cancellationReason", "createdAt", "updatedAt") FROM stdin;
21525779-c7e9-414a-a8ae-283001c79b01	d0b385e5-3b93-4343-b296-3666f62f1b47	78493e7f-7767-4a1b-b611-0d31eb403dab	2025-12-04	1	14:00:00	15:30:00	Introduction & Greetings	SCHEDULED	\N	2025-12-05 10:55:19.232	2025-12-05 10:55:19.232
059c1c00-d16f-4076-86fc-5ffd9f28275a	d0b385e5-3b93-4343-b296-3666f62f1b47	78493e7f-7767-4a1b-b611-0d31eb403dab	2025-12-05	2	16:00:00	17:30:00	Family & Friends	SCHEDULED	\N	2025-12-05 10:55:19.233	2025-12-05 10:55:19.233
ebcb1716-a5a2-456e-98aa-c3e13614f552	c221259f-fa3b-44a9-98e2-d11e33f76193	64e055bc-f02d-4a1c-8747-a8d08bb68cc6	2025-12-04	1	10:00:00	11:30:00	Past Tense Review	SCHEDULED	\N	2025-12-05 10:55:19.233	2025-12-05 10:55:19.233
9d5abd5b-d787-4e43-b4df-9889bfd45ac4	19ebecfd-44b1-40b1-a8ba-612f39cc1a8d	\N	2025-12-30	1	06:00:00	08:00:00	Introduction to English	SCHEDULED	\N	2025-12-18 13:46:38.196	2025-12-18 13:46:38.196
b1c8eefa-09e8-4d15-9212-7b7f18e06eb7	aeb57d06-a371-4f1e-8f56-85060430aa68	\N	2025-12-25	1	07:00:00	09:00:00	Grammar Basics	SCHEDULED	\N	2025-12-18 13:46:44.616	2025-12-18 13:46:44.616
d84db515-eab7-415a-8cdb-6124addec6a4	aeb57d06-a371-4f1e-8f56-85060430aa68	\N	2025-12-25	1	10:00:00	12:00:00	Grammar Basics	SCHEDULED	\N	2025-12-18 13:46:50.046	2025-12-18 13:46:50.046
d7df82d9-b0ec-47a2-a1ce-81dde11e30e8	aeb57d06-a371-4f1e-8f56-85060430aa68	\N	2025-12-26	2	06:00:00	08:00:00	Vocabulary Building	SCHEDULED	\N	2025-12-18 13:46:53.045	2025-12-18 13:46:53.045
572dd796-421c-41b2-ac68-173e246d6a48	19ebecfd-44b1-40b1-a8ba-612f39cc1a8d	\N	2026-01-15	10	06:00:00	08:00:00	Conflict Test Session 1	SCHEDULED	\N	2025-12-18 13:48:41.376	2025-12-18 13:48:41.376
77cae8dd-560f-447a-affd-a6bf564a4c3b	aeb57d06-a371-4f1e-8f56-85060430aa68	\N	2026-01-15	10	07:00:00	09:00:00	Conflict Test Session 2 - SHOULD FAIL	SCHEDULED	\N	2025-12-18 13:48:44.198	2025-12-18 13:48:44.198
a2c288b6-d6b5-4525-a675-544f58921bbd	19ebecfd-44b1-40b1-a8ba-612f39cc1a8d	\N	2026-01-15	10	06:00:00	08:00:00	Conflict Test Session 1	SCHEDULED	\N	2025-12-18 13:48:57.88	2025-12-18 13:48:57.88
1de00084-1dc1-440c-85e1-5193e1d9ec65	19ebecfd-44b1-40b1-a8ba-612f39cc1a8d	\N	2026-01-15	10	06:00:00	08:00:00	Conflict Test Session 1	SCHEDULED	\N	2025-12-18 13:49:09.184	2025-12-18 13:49:09.184
164ad7be-ddd7-49ce-a635-9499f09d3fb9	19ebecfd-44b1-40b1-a8ba-612f39cc1a8d	\N	2026-01-15	10	06:00:00	08:00:00	Conflict Test Session 1	SCHEDULED	\N	2025-12-18 13:49:09.551	2025-12-18 13:49:09.551
26277b84-bba1-420d-bd98-773b002220de	19ebecfd-44b1-40b1-a8ba-612f39cc1a8d	\N	2026-01-15	10	06:00:00	08:00:00	Conflict Test Session 1	SCHEDULED	\N	2025-12-18 13:49:09.903	2025-12-18 13:49:09.903
ad58df4f-4cab-4d75-b1ae-e13fd9c84b46	19ebecfd-44b1-40b1-a8ba-612f39cc1a8d	\N	2026-01-15	10	06:00:00	08:00:00	Conflict Test Session 1	SCHEDULED	\N	2025-12-18 13:49:10.191	2025-12-18 13:49:10.191
466063ca-f6e5-402b-b594-c34041f06527	19ebecfd-44b1-40b1-a8ba-612f39cc1a8d	\N	2026-01-15	10	06:00:00	08:00:00	Conflict Test Session 1	SCHEDULED	\N	2025-12-18 13:49:10.367	2025-12-18 13:49:10.367
99b18929-3bd1-4953-89ae-45e47446aaca	aeb57d06-a371-4f1e-8f56-85060430aa68	\N	2026-01-15	11	06:30:00	07:30:00	Debug test - should conflict with 10:00-12:00 session	SCHEDULED	\N	2025-12-18 13:51:36.426	2025-12-18 13:51:36.426
ae9a0b80-644e-4af8-9157-b9ebb94a7dd7	aeb57d06-a371-4f1e-8f56-85060430aa68	\N	2026-01-15	11	06:30:00	07:30:00	Debug test - should conflict with 10:00-12:00 session	SCHEDULED	\N	2025-12-18 13:51:37.177	2025-12-18 13:51:37.177
248034af-8508-4b1d-aacd-f1dcf67dffff	aeb57d06-a371-4f1e-8f56-85060430aa68	\N	2026-01-15	11	06:30:00	07:30:00	Debug test - should conflict with 10:00-12:00 session	SCHEDULED	\N	2025-12-18 13:51:37.622	2025-12-18 13:51:37.622
46245cca-d6e8-412a-9b78-f62b5d6c185f	aeb57d06-a371-4f1e-8f56-85060430aa68	\N	2026-01-15	11	06:30:00	07:30:00	Debug test - should conflict with 10:00-12:00 session	SCHEDULED	\N	2025-12-18 13:53:58.805	2025-12-18 13:53:58.805
5bca29bd-f7d2-4c05-8847-69486e48ccf7	aeb57d06-a371-4f1e-8f56-85060430aa68	\N	2026-01-15	11	06:30:00	07:30:00	Debug test - should conflict with 10:00-12:00 session	SCHEDULED	\N	2025-12-18 13:53:59.441	2025-12-18 13:53:59.441
8aac7699-b306-4a13-be46-25a0c422dc77	19ebecfd-44b1-40b1-a8ba-612f39cc1a8d	\N	2025-12-31	17	15:06:00	16:06:00	\N	SCHEDULED	\N	2025-12-18 15:09:25.817	2025-12-18 15:09:25.817
ba80b29d-c783-4aa6-96d4-2f04222620e7	aeb57d06-a371-4f1e-8f56-85060430aa68	\N	2026-01-26	1	14:16:00	16:16:00	\N	SCHEDULED	\N	2025-12-18 15:16:10.937	2025-12-18 15:16:10.937
1e08f73f-e934-4637-8226-b69a76b78e96	aeb57d06-a371-4f1e-8f56-85060430aa68	\N	2026-01-28	2	14:16:00	16:16:00	\N	SCHEDULED	\N	2025-12-18 15:16:10.953	2025-12-18 15:16:10.953
\.


--
-- Data for Name: Enrollment; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Enrollment" (id, "studentId", "groupId", "enrollmentDate", status, "withdrawalDate", "withdrawalReason", "createdAt", "updatedAt", "areasForImprovement", "overallPerformance", strengths, "teacherComments") FROM stdin;
10e48ef2-712b-435d-9e03-196b957a49d7	a0ab7534-1025-4f52-aeff-f96b83c49352	d0b385e5-3b93-4343-b296-3666f62f1b47	2024-12-01	ACTIVE	\N	\N	2025-12-05 10:55:19.23	2025-12-05 10:55:19.23	\N	\N	\N	\N
77bfffa9-5176-4501-b41a-bf228ef16e3e	0749ca86-8510-4ea2-9a26-624f338f4f07	d0b385e5-3b93-4343-b296-3666f62f1b47	2024-12-01	ACTIVE	\N	\N	2025-12-05 10:55:19.231	2025-12-05 10:55:19.231	\N	\N	\N	\N
bb2c135a-61b1-4bc5-8d62-ae90f4635d30	45a91646-db5f-4b06-b64e-9a02a87522ab	d0b385e5-3b93-4343-b296-3666f62f1b47	2024-12-01	ACTIVE	\N	\N	2025-12-05 10:55:19.231	2025-12-05 10:55:19.231	\N	\N	\N	\N
8c725468-d781-4cd1-99d0-9928d84bcef4	23659842-a120-4a96-a1e5-a93640df479a	c221259f-fa3b-44a9-98e2-d11e33f76193	2024-12-01	ACTIVE	\N	\N	2025-12-05 10:55:19.232	2025-12-05 10:55:19.232	\N	\N	\N	\N
53935fbc-bd45-4fa9-8e5a-e9170d0b60ae	8446e894-f588-470c-a1ea-9bef7b96244c	d0b385e5-3b93-4343-b296-3666f62f1b47	2025-12-06	ACTIVE	\N	\N	2025-12-06 08:12:56.35	2025-12-06 08:12:56.35	\N	\N	\N	\N
6c8e1a2a-7d62-4a26-ab16-4d62d33779de	5d154f79-4d16-4f45-a4f9-0f7a9b0bc9a0	c221259f-fa3b-44a9-98e2-d11e33f76193	2025-12-13	ACTIVE	\N	\N	2025-12-13 09:50:00.666	2025-12-13 09:50:00.666	\N	\N	\N	\N
4f65596c-a70e-4b2e-acf0-d6ab6251f40e	fda21647-8750-4c9c-9634-24a6729e2193	c221259f-fa3b-44a9-98e2-d11e33f76193	2025-12-13	ACTIVE	\N	\N	2025-12-13 10:35:51.896	2025-12-13 10:35:51.896	\N	\N	\N	\N
9c1bc968-32a0-4a7b-8510-6f8ee0e75066	abb672be-e67b-48bb-905f-9748cf1bb025	c221259f-fa3b-44a9-98e2-d11e33f76193	2025-12-15	ACTIVE	\N	\N	2025-12-15 23:04:09.586	2025-12-15 23:04:09.586	\N	\N	\N	\N
a723fdb3-f3e2-40af-b37a-21aa3e35c717	1251fbf4-aab0-4963-8c04-bf8019724e4e	c221259f-fa3b-44a9-98e2-d11e33f76193	2025-12-16	ACTIVE	\N	\N	2025-12-16 14:14:33.729	2025-12-16 14:14:33.729	\N	\N	\N	\N
\.


--
-- Data for Name: FAQ; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."FAQ" (id, question, keywords, answer, category, "isActive", roles, "order", "createdAt", "updatedAt") FROM stdin;
9e1e203b-8476-4788-9634-88e7458cf7ee	wassup	{hey}	hey	hey	t	{ALL}	0	2025-12-16 20:58:31.882	2025-12-16 20:58:36.694
\.


--
-- Data for Name: Group; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Group" (id, "termId", "levelId", "teacherId", "venueId", "groupCode", name, schedule, capacity, "isActive", "createdAt", "updatedAt", "hallId") FROM stdin;
d0b385e5-3b93-4343-b296-3666f62f1b47	9c40be5f-e0a4-488d-b81b-42bb95dff258	6be96096-8c5c-42f2-8f54-97391d9588bc	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	efb63abe-1336-4ecc-abe9-303bb1ca2e0b	EMV-A1-G1	English Multiverse A1 - Group 1	\N	15	t	2025-12-05 10:55:19.229	2025-12-16 18:10:35.678	\N
19ebecfd-44b1-40b1-a8ba-612f39cc1a8d	5b552771-c4e9-4eb7-aff9-8838b1444c0b	6be96096-8c5c-42f2-8f54-97391d9588bc	dd791e3a-1682-4bce-a5ca-26e2291c8e52	efb63abe-1336-4ecc-abe9-303bb1ca2e0b	CONFLICT-TEST-G1	Test Group 1 - Conflict Demo	\N	15	t	2025-12-18 13:40:38.7	2025-12-18 13:40:38.7	\N
aeb57d06-a371-4f1e-8f56-85060430aa68	5b552771-c4e9-4eb7-aff9-8838b1444c0b	6be96096-8c5c-42f2-8f54-97391d9588bc	dd791e3a-1682-4bce-a5ca-26e2291c8e52	efb63abe-1336-4ecc-abe9-303bb1ca2e0b	CONFLICT-TEST-G2	Test Group 2 - Conflict Demo	\N	15	t	2025-12-18 13:41:48.317	2025-12-18 13:41:48.317	\N
c221259f-fa3b-44a9-98e2-d11e33f76193	9c40be5f-e0a4-488d-b81b-42bb95dff258	2e2c0d81-a6b5-4dd0-a05e-30b90aef83ad	dd791e3a-1682-4bce-a5ca-26e2291c8e52	efb63abe-1336-4ecc-abe9-303bb1ca2e0b	EMV-A2-G1	English Multiverse A2 - Group 1	\N	15	t	2025-12-05 10:55:19.23	2025-12-05 10:55:19.23	\N
\.


--
-- Data for Name: Hall; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Hall" (id, "venueId", name, code, capacity, floor, "isActive", "createdAt") FROM stdin;
78493e7f-7767-4a1b-b611-0d31eb403dab	efb63abe-1336-4ecc-abe9-303bb1ca2e0b	Room A	CM-A	20	Ground Floor	t	2025-12-05 10:55:19.226
64e055bc-f02d-4a1c-8747-a8d08bb68cc6	efb63abe-1336-4ecc-abe9-303bb1ca2e0b	Room B	CM-B	15	Ground Floor	t	2025-12-05 10:55:19.227
850c476d-d0fc-4f64-b000-d52d9f55dd31	d46d01fc-d0ad-4516-9c68-fe6f0fe65cb5	Hall A	RA	20	\N	f	2025-12-13 10:48:37.334
1694f745-915b-42db-b5c5-8cc01971c1c8	efb63abe-1336-4ecc-abe9-303bb1ca2e0b	Room A	RRA	20	\N	t	2025-12-15 18:02:32.004
\.


--
-- Data for Name: Installment; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Installment" (id, "paymentPlanId", "installmentNumber", amount, "paymentDate", "paymentMethod", "receiptNumber", "receiptUrl", "receiptMakerId", "benefitReferenceNumber", notes, "createdAt", "dueDate") FROM stdin;
f2a4b208-4d05-4c5f-8aee-501224df79dc	715c36e8-c268-42b4-9a8f-dd50a781a41a	1	166.67	2025-01-10	BENEFIT_PAY	REC-2025-001	\N	\N	BEN-2025-001	\N	2025-12-05 10:55:19.234	2025-01-15
1ede692d-eaa6-437f-85c3-91a95c6e1ea5	fce09de2-fab6-47ae-bab6-99035e1ebd6a	1	450.00	2024-12-01	CARD_MACHINE	REC-2024-099	\N	\N	\N	\N	2025-12-05 10:55:19.239	2024-12-01
bc25d5dd-0054-4dbf-932b-a39591d5f47a	ad915dba-cc39-4b26-be56-64eb7ec73d15	1	150.00	2025-12-05	ONLINE_PAYMENT	STRIPE-pi_3Sb3g2Rrt3Ua78Z21AUuszTP	https://pay.stripe.com/receipts/payment/CAcaFwoVYWNjdF8xU1ZvNGxScnQzVWE3OFoyKNjGzMkGMgZCZMcqAPw6LBaYYYesNnjosPF7xV3gB6aLuUmk_vJPV_Li0BSKr7NHNwazSAFeqZlTeuMU	db412e3d-563d-43b1-aa12-dd1df03db412	\N	Stripe Payment Intent: pi_3Sb3g2Rrt3Ua78Z21AUuszTP	2025-12-05 10:55:19.238	2025-01-05
13de9eeb-8fdc-41f4-840c-3a57d75bb5ba	dedf3123-435a-449d-b96b-8b105739e12b	1	450.00	2025-12-13	ONLINE_PAYMENT	STRIPE-pi_3SdwtyRrt3Ua78Z20w85ApCs	https://pay.stripe.com/receipts/payment/CAcaFwoVYWNjdF8xU1ZvNGxScnQzVWE3OFoyKITN9skGMga2QuizMQM6LBb_OobxtTtZi6duU9rlp3AArOJZkVld_OrC8X7ZjcXSGMGwaXtrlFReByBc	51cd0567-ed77-4810-b9d9-5c3a99a79791	\N	Stripe Payment Intent: pi_3SdwtyRrt3Ua78Z20w85ApCs	2025-12-07 20:27:49.961	2025-01-15
4d390e83-c3cc-4242-ac47-89b358b0285c	715c36e8-c268-42b4-9a8f-dd50a781a41a	2	166.67	\N	\N	\N	\N	\N	\N	\N	2025-12-05 10:55:19.236	2025-02-15
4aea151f-a786-4b7f-919b-911166003e3a	715c36e8-c268-42b4-9a8f-dd50a781a41a	3	166.66	\N	\N	\N	\N	\N	\N	\N	2025-12-05 10:55:19.236	2025-03-15
84d0ed84-0fb0-4732-a5af-ba5b0cdad154	cb9d4a7d-19ed-4f7b-ae6a-2f87692e4dd4	1	200.00	\N	\N	\N	\N	\N	\N	\N	2025-12-05 10:55:19.237	2025-01-20
c8b5db44-ff78-4302-aa83-03adc11529b7	cb9d4a7d-19ed-4f7b-ae6a-2f87692e4dd4	2	200.00	\N	\N	\N	\N	\N	\N	\N	2025-12-05 10:55:19.237	2025-02-20
03c3bab4-c1c4-4085-8141-8856dc697bd4	ad915dba-cc39-4b26-be56-64eb7ec73d15	4	150.00	\N	\N	\N	\N	\N	\N	\N	2025-12-05 10:55:19.239	2025-03-25
4b6ee241-88b3-43a8-8564-db3f864eab4e	ad915dba-cc39-4b26-be56-64eb7ec73d15	3	150.00	\N	\N	\N	\N	\N	\N	\N	2025-12-05 10:55:19.238	2025-02-25
6b575d2e-4380-48ea-888b-c0b935e5f2fb	ad915dba-cc39-4b26-be56-64eb7ec73d15	2	150.00	\N	\N	\N	\N	\N	\N	\N	2025-12-05 10:55:19.238	2025-01-25
ed289f2f-3b93-4468-bee5-3d9b04768c97	c37d16f1-aa48-498c-bf2c-d5365601d071	1	124.75	\N	\N	\N	\N	\N	\N	\N	2025-12-15 21:13:02.585	2026-01-15
8ce3f6d4-b643-4729-b036-3c4a1bd5651c	c37d16f1-aa48-498c-bf2c-d5365601d071	2	124.75	\N	\N	\N	\N	\N	\N	\N	2025-12-15 21:13:02.587	2026-02-15
c56804f8-271a-4525-85bd-e9c2c02b2824	c37d16f1-aa48-498c-bf2c-d5365601d071	3	124.75	\N	\N	\N	\N	\N	\N	\N	2025-12-15 21:13:02.588	2026-03-15
ba0a5f69-ad31-4abe-bfe7-e0337aba14a3	c37d16f1-aa48-498c-bf2c-d5365601d071	4	124.75	\N	\N	\N	\N	\N	\N	\N	2025-12-15 21:13:02.589	2026-04-15
99ce987d-2cb4-462c-a8d0-0ff267697169	6105db4c-3e3e-491a-9df6-6d4c696bcc96	1	1.00	2025-12-15	ONLINE_PAYMENT	STRIPE-pi_3SekTVRrt3Ua78Z21cfbJFEC	https://pay.stripe.com/receipts/payment/CAcaFwoVYWNjdF8xU1ZvNGxScnQzVWE3OFoyKOOdgsoGMgZg9nWrDsw6LBYG1OBGejE9U3Nb-OkUvcxgmfsr6wC_EExZKuiaw0PckZIX_In4vRqdfCRM	015ca870-ed1e-46bd-995e-8cc76cedce31	\N	Stripe Payment Intent: pi_3SekTVRrt3Ua78Z21cfbJFEC	2025-12-15 22:05:33.773	2026-01-15
1de85bb1-d9df-4d31-9f84-2c53a2fac203	3ab0f4fa-6583-49de-9b0b-017b29362eea	2	12.50	2025-12-16	BENEFIT_PAY	zxcxzc	\N	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	\N	bro	2025-12-16 14:16:43.938	2026-02-16
1cab1e88-bc67-4db9-9aca-859b663c5c8d	3ab0f4fa-6583-49de-9b0b-017b29362eea	3	12.50	2025-12-16	BENEFIT_PAY	qwew	\N	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	\N	sdasd	2025-12-16 14:16:43.938	2026-03-16
83795b3b-4fa8-4b4d-923e-13d0054f803d	3ab0f4fa-6583-49de-9b0b-017b29362eea	4	12.50	2025-12-16	BENEFIT_PAY	sdsdasd	\N	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	\N	sadsa	2025-12-16 14:16:43.94	2026-04-16
ae56ac12-d8b0-4245-b4d7-24986fcfef74	3ab0f4fa-6583-49de-9b0b-017b29362eea	5	10.00	2025-12-16	BENEFIT_PAY	sdsd	\N	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	\N	sadas	2025-12-16 14:17:02.123	2025-12-17
\.


--
-- Data for Name: Level; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Level" (id, name, "displayName", "orderNumber", description, "isMixed", "mixedLevels", "createdAt") FROM stdin;
6be96096-8c5c-42f2-8f54-97391d9588bc	A1	Beginner A1	1	Elementary level	f	\N	2025-12-05 10:55:19.228
2e2c0d81-a6b5-4dd0-a05e-30b90aef83ad	A2	Elementary A2	2	Pre-intermediate level	f	\N	2025-12-05 10:55:19.229
991a3ac0-665b-485d-946d-c151e5b97270	B1	Intermediate	3	Can deal with most situations while traveling	f	\N	2025-12-11 22:57:45.511
8da60b0f-34d6-4de7-90c3-ac61111d743d	B2	Upper Intermediate	4	Can interact with a degree of fluency and spontaneity	f	\N	2025-12-11 22:57:45.512
68b35888-f5f5-478e-a85e-a33d746fd28c	C1	Advanced	5	Can express ideas fluently and spontaneously	f	\N	2025-12-11 22:57:45.513
7b6bc5f4-156a-4dd0-a8e9-b400bf1c6495	C2	Proficient	6	Can express themselves spontaneously, very fluently and precisely	f	\N	2025-12-11 22:57:45.513
\.


--
-- Data for Name: Material; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Material" (id, "groupId", title, description, "materialType", "fileUrl", "fileSizeKb", "uploadedBy", "uploadedAt", "isActive", "isPublished", "publishedAt", "scheduledFor") FROM stdin;
ff4ac3ab-b72f-4f0d-b924-60da2e0e0cf3	d0b385e5-3b93-4343-b296-3666f62f1b47	Grammar Basics Worksheet	Practice present simple tense, articles, and basic sentence structure	PDF	https://example.com/materials/grammar-basics.pdf	\N	\N	2025-12-13 10:04:41.594	t	t	2025-12-18 20:45:57.042	\N
91b747f7-5377-4baa-bb42-a711b4ee94f6	d0b385e5-3b93-4343-b296-3666f62f1b47	Vocabulary List - Common Words	200 most common English words with examples and translations	PDF	https://example.com/materials/vocab-common.pdf	\N	\N	2025-12-13 10:04:41.598	t	t	2025-12-18 20:45:57.042	\N
b2bf0b62-7ebf-47e0-bc47-5f16a46354a9	d0b385e5-3b93-4343-b296-3666f62f1b47	Listening Exercise - Daily Conversations	Audio file with everyday English conversations	LINK	https://example.com/materials/listening-daily.mp3	\N	\N	2025-12-13 10:04:41.599	t	t	2025-12-18 20:45:57.042	\N
3a261146-074d-4211-846a-e99a754e4eea	d0b385e5-3b93-4343-b296-3666f62f1b47	Reading Comprehension - Short Stories	Collection of simple short stories for reading practice	PDF	https://example.com/materials/reading-stories.pdf	\N	\N	2025-12-13 10:04:41.599	t	t	2025-12-18 20:45:57.042	\N
d803900f-a401-4e4f-acd8-00f2bb608814	d0b385e5-3b93-4343-b296-3666f62f1b47	Pronunciation Guide Video	Video tutorial on English pronunciation basics	VIDEO	https://example.com/materials/pronunciation-guide.mp4	\N	\N	2025-12-13 10:04:41.6	t	t	2025-12-18 20:45:57.042	\N
16a21a11-f555-450f-868f-ecd3f9f1f491	c221259f-fa3b-44a9-98e2-d11e33f76193	Grammar Basics Worksheet	Practice present simple tense, articles, and basic sentence structure	PDF	https://example.com/materials/grammar-basics.pdf	\N	\N	2025-12-13 10:04:41.6	t	t	2025-12-18 20:45:57.042	\N
b47e5822-e8aa-4fe2-bf05-2c087f17e1a2	c221259f-fa3b-44a9-98e2-d11e33f76193	Vocabulary List - Common Words	200 most common English words with examples and translations	PDF	https://example.com/materials/vocab-common.pdf	\N	\N	2025-12-13 10:04:41.601	t	t	2025-12-18 20:45:57.042	\N
637d9994-c296-4b44-9c49-3b9d65c9fdaf	c221259f-fa3b-44a9-98e2-d11e33f76193	Listening Exercise - Daily Conversations	Audio file with everyday English conversations	LINK	https://example.com/materials/listening-daily.mp3	\N	\N	2025-12-13 10:04:41.601	t	t	2025-12-18 20:45:57.042	\N
cfebefe1-abdd-4f7e-a988-09a383ff6eaf	c221259f-fa3b-44a9-98e2-d11e33f76193	Pronunciation Guide Video	Video tutorial on English pronunciation basics	VIDEO	https://example.com/materials/pronunciation-guide.mp4	\N	\N	2025-12-13 10:04:41.602	t	t	2025-12-18 20:45:57.042	\N
4c0972b8-fb4d-40fe-816c-d55d987c15ad	c221259f-fa3b-44a9-98e2-d11e33f76193	test materials	description bro	LINK	https://www.youtube.com/	\N	dd791e3a-1682-4bce-a5ca-26e2291c8e52	2025-12-13 10:08:07.155	t	t	2025-12-18 20:45:57.042	\N
a1f6273b-51bc-404a-b650-0049754478d6	c221259f-fa3b-44a9-98e2-d11e33f76193	asdsad	sdasd	PDF	https://www.youtube.com/watch?v=7Xsg4hi97OQ&t=650s	\N	\N	2025-12-16 13:52:48.419	t	t	2025-12-18 20:45:57.042	\N
4470f6d1-e3d4-4a4b-bb9c-2351231a6faf	c221259f-fa3b-44a9-98e2-d11e33f76193	Reading Comprehension - Short Stories	Collection of simple short stories for reading practice	PDF	https://example.com/materials/reading-stories.pdf	\N	\N	2025-12-13 10:04:41.602	f	t	2025-12-18 20:45:57.042	\N
0d84360e-dfb7-4d55-b9a1-5029357498a9	c221259f-fa3b-44a9-98e2-d11e33f76193	test schedule material	moodle	LINK	https://moodle.polytechnic.bh/moodle/login/index.php	\N	\N	2025-12-18 17:54:04.475	f	t	2025-12-18 17:54:04.474	\N
7af3230c-9498-4131-b5df-92732ece1b0f	c221259f-fa3b-44a9-98e2-d11e33f76193	test schedule	moodle	LINK	https://moodle.polytechnic.bh/moodle/login/index.php	\N	\N	2025-12-18 17:56:37.232	f	t	2025-12-18 17:56:37.231	\N
1e9c4b36-24a8-498a-abe6-eb3e11d7e988	c221259f-fa3b-44a9-98e2-d11e33f76193	test scheduleS	moodle	LINK	https://moodle.polytechnic.bh/moodle/login/index.php	\N	\N	2025-12-18 18:02:45.356	f	t	2025-12-18 18:02:45.355	2025-12-18 18:02:00
b1269ea0-ddb5-4925-99c8-3977fd320545	c221259f-fa3b-44a9-98e2-d11e33f76193	test schedule	moodle	LINK	https://moodle.polytechnic.bh/moodle/login/index.php	\N	\N	2025-12-18 18:03:10.945	t	t	2025-12-18 18:03:10.944	2025-12-18 18:04:00
026eeccf-f70f-49b7-8259-f6958d1c7e45	c221259f-fa3b-44a9-98e2-d11e33f76193	tessda	sadas	LINK	https://moodle.polytechnic.bh/moodle/login/index.php	\N	\N	2025-12-18 18:06:35.93	t	t	2025-12-18 18:08:00.235	2025-12-18 18:08:00
1cdabcfe-0b31-4498-a387-22b84c85327e	aeb57d06-a371-4f1e-8f56-85060430aa68	sadsa	sadasd	LINK	https://moodle.polytechnic.bh/moodle/login/index.php	\N	\N	2025-12-18 18:34:31.886	t	t	2025-12-18 18:34:31.884	\N
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Notification" (id, "userId", type, title, message, "linkUrl", "isRead", "readAt", "sentVia", "sentAt", "createdAt") FROM stdin;
0a6245ba-a5f1-463d-9900-32608f321ba7	d56d6057-c762-4845-843b-02c8414113e8	OTP	SMS Notification	Your OTP code is: 123456. Valid for 5 minutes. Do not share this code.	\N	f	\N	SMS	2025-12-06 08:09:37.969	2025-12-06 08:09:38.043
b2117719-92c3-4af4-8a16-b2251ad00ecd	b2e0ef76-8efa-4a0b-82bd-16e3422bc3fd	OTP	SMS Notification	Your OTP code is: 123456. Valid for 5 minutes. Do not share this code.	\N	f	\N	SMS	2025-12-13 08:26:50.652	2025-12-13 08:26:50.71
ca73258e-bb62-4afc-a01d-6504b1322913	b2e0ef76-8efa-4a0b-82bd-16e3422bc3fd	OTP	SMS Notification	Your OTP code is: 123456. Valid for 5 minutes. Do not share this code.	\N	f	\N	SMS	2025-12-15 22:07:30.601	2025-12-15 22:07:30.651
d4e1f47b-ec7e-4db3-872c-6bcea01ab554	51cd0567-ed77-4810-b9d9-5c3a99a79791	ATTENDANCE_WARNING	Attendance Warning	Your attendance is below the required 75% threshold.	\N	f	\N	SMS	2025-12-18 15:26:00.234	2025-12-18 15:26:00.235
9ac6f99a-cd2a-44a0-b45c-ea6c11129abd	51cd0567-ed77-4810-b9d9-5c3a99a79791	ATTENDANCE_WARNING	Attendance Warning	Your attendance is below the required 75% threshold.	\N	f	\N	EMAIL	2025-12-18 15:41:16.291	2025-12-18 15:41:16.292
913fec44-2bfd-4d8f-aca2-77858a1348c0	51cd0567-ed77-4810-b9d9-5c3a99a79791	ATTENDANCE_WARNING	Attendance Warning	Your attendance is below the required 75% threshold.	\N	f	\N	SMS	2025-12-18 15:41:16.589	2025-12-18 15:41:16.591
3610a79d-2fa1-4689-ac3a-70ae2f053bac	b2e0ef76-8efa-4a0b-82bd-16e3422bc3fd	OTP	SMS Notification	Your OTP code is: 123456. Valid for 5 minutes. Do not share this code.	\N	f	\N	SMS	2025-12-18 16:03:30.53	2025-12-18 16:03:30.571
69fa960c-4887-4a08-b6ff-e42870243ac6	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	GENERAL	SMS Notification	🎉 TEST from Institute System! If you got this, SMS notifications are WORKING! ✅	\N	f	\N	SMS	2025-12-18 16:12:46.759	2025-12-18 16:12:46.8
25ab68cd-6bb9-472d-8832-8de9ec83dd3e	51cd0567-ed77-4810-b9d9-5c3a99a79791	ATTENDANCE_WARNING	Attendance Warning	Your attendance is below the required 75% threshold.	\N	f	\N	EMAIL	2025-12-18 16:16:12.139	2025-12-18 16:16:12.141
3e3ccf36-21bb-4375-8ae9-fc0715e92d3f	51cd0567-ed77-4810-b9d9-5c3a99a79791	ATTENDANCE_WARNING	Attendance Warning	Your attendance is below the required 75% threshold.	\N	f	\N	SMS	2025-12-18 16:16:12.46	2025-12-18 16:16:12.461
60fb2f3d-029d-47f6-869f-a92b5ffb91f2	51cd0567-ed77-4810-b9d9-5c3a99a79791	ATTENDANCE_WARNING	Attendance Warning	Your attendance is below the required 75% threshold.	\N	f	\N	EMAIL	2025-12-18 17:12:23.437	2025-12-18 17:12:23.438
47cff929-2633-402e-bdb3-ab4049664cf1	51cd0567-ed77-4810-b9d9-5c3a99a79791	ATTENDANCE_WARNING	Attendance Warning	Your attendance is below the required 75% threshold.	\N	f	\N	SMS	2025-12-18 17:12:24.13	2025-12-18 17:12:24.131
8159d8a9-2dd8-4b07-9279-5953c220f57a	51cd0567-ed77-4810-b9d9-5c3a99a79791	ATTENDANCE_WARNING	Attendance Warning	Your attendance is below the required 75% threshold.	\N	f	\N	EMAIL	2025-12-18 17:17:34.981	2025-12-18 17:17:34.983
81e3bf29-6d3e-45a7-8567-4b3305a8ca70	51cd0567-ed77-4810-b9d9-5c3a99a79791	ATTENDANCE_WARNING	Attendance Warning	Your attendance is below the required 75% threshold.	\N	f	\N	SMS	2025-12-18 17:17:35.288	2025-12-18 17:17:35.289
7a4629e4-b51d-401f-9fce-2d3885b08f0c	db412e3d-563d-43b1-aa12-dd1df03db412	ANNOUNCEMENT	🎉 Test Scheduled Announcement	This is a test announcement scheduled for automatic publication. If you received this notification via email and SMS, the scheduled announcement system is working perfectly!	/announcements/4f828055-26f3-4dd4-9149-c5cdc6854fe8	f	\N	SYSTEM	2025-12-18 17:35:00.428	2025-12-18 17:35:00.43
3d4fcf8d-6ead-44f2-8f2d-4295229c8b88	59ba26a8-dfc4-4eeb-9e15-25f88458c072	ANNOUNCEMENT	testing schedues	asdsadsadasd	/announcements/a0996d2e-6dfa-44a6-9e7b-4953603004a1	f	\N	SYSTEM	2025-12-18 17:35:01.207	2025-12-18 17:35:01.208
fc46037d-d308-43dd-bde7-5ce26d595245	59ba26a8-dfc4-4eeb-9e15-25f88458c072	ANNOUNCEMENT	testing last	last i say	/announcements/e95c0d97-101f-4760-aefc-3b22a52c1fe7	f	\N	SYSTEM	2025-12-18 17:42:00.052	2025-12-18 17:42:00.053
7fa9ed35-6206-475e-8072-e9df53651a39	d56d6057-c762-4845-843b-02c8414113e8	ATTENDANCE_WARNING	Attendance Warning	Your attendance is below the required 75% threshold.	\N	f	\N	EMAIL	2025-12-20 07:00:02.673	2025-12-20 07:00:02.675
b35946bf-0685-4986-a0b6-c17fa27d8565	d56d6057-c762-4845-843b-02c8414113e8	ATTENDANCE_WARNING	Attendance Warning	Your attendance is below the required 75% threshold.	\N	f	\N	SMS	2025-12-20 07:00:03.209	2025-12-20 07:00:03.211
\.


--
-- Data for Name: OtpCode; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."OtpCode" (id, "userId", code, "expiresAt", "isUsed", attempts, "createdAt") FROM stdin;
dfba77b8-7205-45d8-ab90-98690845ea92	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-05 11:05:25.753	t	1	2025-12-05 11:00:25.753
3cf16bf9-55d1-498b-ad53-c81d6f08273b	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-07 19:04:10.67	t	1	2025-12-07 18:59:10.671
4d026a91-df55-4249-bf84-645295ee5fbf	db412e3d-563d-43b1-aa12-dd1df03db412	123456	2025-12-05 17:27:44.856	t	1	2025-12-05 17:22:44.857
6ad44639-5e6b-4b2a-95f7-c96931021715	db412e3d-563d-43b1-aa12-dd1df03db412	123456	2025-12-05 17:41:45.239	t	1	2025-12-05 17:36:45.241
9fab645f-42f0-4102-b2ba-b047fe0ff198	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-12 17:43:31.609	t	1	2025-12-12 17:38:31.611
8cde7089-7927-4669-b15c-042dce5a75ec	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-05 17:46:36.746	t	1	2025-12-05 17:41:36.747
6ebeda5b-7d23-42d2-80d1-31f53adc406c	015ca870-ed1e-46bd-995e-8cc76cedce31	123456	2025-12-07 19:04:31.759	t	1	2025-12-07 18:59:31.76
77d2c237-96de-4a24-bc34-7064319be5a2	db412e3d-563d-43b1-aa12-dd1df03db412	123456	2025-12-05 17:59:08.429	t	1	2025-12-05 17:54:08.43
dc4b9d3c-9f6f-4972-8c7c-b4f2bfd0abc7	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-05 18:38:56.208	t	1	2025-12-05 18:33:56.209
ef5798a5-21d4-4687-a3ee-d770b8d3105a	b2e0ef76-8efa-4a0b-82bd-16e3422bc3fd	123456	2025-12-13 08:31:50.007	f	0	2025-12-13 08:26:50.01
6260b7fb-579e-4735-922f-18218e803b59	51cd0567-ed77-4810-b9d9-5c3a99a79791	123456	2025-12-05 18:41:27.159	t	1	2025-12-05 18:36:27.16
72033884-3733-46ed-8edf-96d61f11b5cb	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-08 14:02:10.802	t	1	2025-12-08 13:57:10.803
f78d01e4-e311-4099-a3e0-ff76a6a5d2a7	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-05 18:42:19.516	t	1	2025-12-05 18:37:19.517
f8c06f55-a9fb-4c37-8db9-6adcfbb8f954	51cd0567-ed77-4810-b9d9-5c3a99a79791	123456	2025-12-05 18:43:10.849	t	1	2025-12-05 18:38:10.85
a9ba3bf3-ab56-4549-b9aa-e18ae1ccf8f6	51cd0567-ed77-4810-b9d9-5c3a99a79791	123456	2025-12-06 06:03:58.222	t	1	2025-12-06 05:58:58.223
9c1034ee-ab6a-491b-bcfa-7770a2f95322	d56d6057-c762-4845-843b-02c8414113e8	123456	2025-12-06 08:10:42.883	f	0	2025-12-06 08:05:42.883
0120a1ff-e301-4172-988e-e2df3cafed7f	015ca870-ed1e-46bd-995e-8cc76cedce31	123456	2025-12-08 14:04:36.309	t	1	2025-12-08 13:59:36.31
854e2ce4-e437-424f-a770-642aebab63ac	d56d6057-c762-4845-843b-02c8414113e8	123456	2025-12-06 08:14:36.662	t	1	2025-12-06 08:09:36.664
ee12c493-ade7-4adc-95e5-0d9bb15f1dd0	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-06 08:16:08.942	t	1	2025-12-06 08:11:08.943
3680ead4-af74-4401-b08d-1824b9412b69	51cd0567-ed77-4810-b9d9-5c3a99a79791	123456	2025-12-13 09:56:43.087	t	1	2025-12-13 09:51:43.091
cd96ef90-ec97-4a4d-a781-a0ad1b9d5cfb	d24c6b10-90e0-4e44-8d69-58e0142ddb69	123456	2025-12-06 08:18:46.037	t	1	2025-12-06 08:13:46.037
95ffc620-5e5a-482c-8191-21b8f064e137	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-08 14:07:43.745	t	1	2025-12-08 14:02:43.746
ab120fdb-3f3f-4fb0-9447-637af726068f	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-06 09:41:42.294	t	1	2025-12-06 09:36:42.294
545c542e-4c83-4321-93eb-aa25c7be3cd2	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-06 10:29:06.803	t	1	2025-12-06 10:24:06.804
4c33f34c-b740-4819-95f7-ef002280cf53	4d2eff46-3148-4151-a909-1c88b2dde123	123456	2025-12-13 09:45:33.385	t	1	2025-12-13 09:40:33.386
a237a6c8-55f1-4167-8171-0b33b7319b2f	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-07 18:52:04.698	t	1	2025-12-07 18:47:04.699
58a50cc8-1e60-4008-8ef1-9aa2ee385d92	51cd0567-ed77-4810-b9d9-5c3a99a79791	123456	2025-12-08 14:24:51.273	t	1	2025-12-08 14:19:51.275
15fe253c-9319-462a-a271-90fa1e1ca978	015ca870-ed1e-46bd-995e-8cc76cedce31	123456	2025-12-07 19:03:53.955	t	1	2025-12-07 18:58:53.956
2438dc98-556a-49de-ba8a-5e96dffdacb6	b2e4046c-82bd-4afe-9022-5fdd74773011	123456	2025-12-08 14:28:57.618	t	1	2025-12-08 14:23:57.619
7601bc60-1695-4c0a-9fc9-4be6dc5128f8	d24c6b10-90e0-4e44-8d69-58e0142ddb69	123456	2025-12-08 14:32:17.963	t	1	2025-12-08 14:27:17.964
b7d12885-f177-4eee-8829-82c80df02878	b2e0ef76-8efa-4a0b-82bd-16e3422bc3fd	123456	2025-12-13 09:49:28.737	t	1	2025-12-13 09:44:28.738
cfad86de-95a1-49a4-893d-3f1e6a8de317	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-11 22:39:46.619	t	1	2025-12-11 22:34:46.62
e24201ee-ef16-4786-9d72-fb8388055d79	b2e0ef76-8efa-4a0b-82bd-16e3422bc3fd	123456	2025-12-12 08:06:19.218	t	1	2025-12-12 08:01:19.222
2563a407-ab3f-48d4-ae86-0a2c5e0327c8	de6a6cdb-65b7-410f-8908-54fd4e719d53	123456	2025-12-13 19:29:07.384	t	1	2025-12-13 19:24:07.385
30b9bf65-24ce-4972-86af-837712ba1499	b2e0ef76-8efa-4a0b-82bd-16e3422bc3fd	123456	2025-12-12 14:36:25.248	t	1	2025-12-12 14:31:25.25
c3b84188-fc79-4276-a4b2-3eb3b9749985	de6a6cdb-65b7-410f-8908-54fd4e719d53	123456	2025-12-13 09:50:02.856	t	1	2025-12-13 09:45:02.857
c725a694-be3e-4e3a-8a53-7b9a874b90c3	de6a6cdb-65b7-410f-8908-54fd4e719d53	123456	2025-12-13 10:16:57.958	t	1	2025-12-13 10:11:57.959
d2cf91f2-a788-4e22-af19-419301f31c4b	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-13 09:52:24.379	t	1	2025-12-13 09:47:24.379
a1db2eeb-7863-4d99-b422-16008cf1c2ce	85e1bf7e-b3ce-43a8-98c2-c19fd81535ab	123456	2025-12-13 09:55:47.281	t	1	2025-12-13 09:50:47.285
8ebfca80-bbb0-4d4f-a7b8-39fb364bea4d	5f63c10d-78b6-4c3d-a116-4d8f772eeb80	123456	2025-12-13 10:40:05.5	t	1	2025-12-13 10:35:05.501
5f749687-6580-4fd6-b63a-2414c9cb4340	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-13 09:56:05.504	t	1	2025-12-13 09:51:05.505
c403a527-0427-4fb2-9755-cbe6660afe60	4d2eff46-3148-4151-a909-1c88b2dde123	123456	2025-12-13 10:18:38.46	t	1	2025-12-13 10:13:38.461
0ef6e51f-2244-40f2-96a0-f909f36d8a86	015ca870-ed1e-46bd-995e-8cc76cedce31	123456	2025-12-13 10:21:07.285	t	1	2025-12-13 10:16:07.287
cf84f3f0-921c-4179-8c38-b72285922665	de6a6cdb-65b7-410f-8908-54fd4e719d53	123456	2025-12-13 18:48:48.998	t	1	2025-12-13 18:43:48.999
36270f61-a6f4-4b47-b725-542575ceeb78	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-13 10:31:01.023	t	1	2025-12-13 10:26:01.024
ebb9095a-10cc-4915-b496-16f6cff616dc	51cd0567-ed77-4810-b9d9-5c3a99a79791	123456	2025-12-13 17:42:05.447	t	1	2025-12-13 17:37:05.447
a9500b59-b1a2-4eff-a3d4-41197692bca8	015ca870-ed1e-46bd-995e-8cc76cedce31	123456	2025-12-13 17:59:08.346	t	1	2025-12-13 17:54:08.348
6cb5b90d-3fb6-4a08-b253-3c102a382060	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-13 19:28:32.835	t	1	2025-12-13 19:23:32.836
eba9c37b-af65-41de-9ade-13fe674b0ade	de6a6cdb-65b7-410f-8908-54fd4e719d53	123456	2025-12-13 19:06:54.12	t	1	2025-12-13 19:01:54.121
fe04585d-f466-4bc6-9cd2-013003e7eb27	51cd0567-ed77-4810-b9d9-5c3a99a79791	123456	2025-12-14 12:15:53.694	t	1	2025-12-14 12:10:53.695
3571c343-2bac-442e-8f4f-d0b7676481c0	de6a6cdb-65b7-410f-8908-54fd4e719d53	123456	2025-12-15 22:12:17.661	f	0	2025-12-15 22:07:17.662
8ff65ef8-9d81-4b55-b905-65061002ac62	51cd0567-ed77-4810-b9d9-5c3a99a79791	123456	2025-12-15 17:29:50.57	t	1	2025-12-15 17:24:50.571
a7a1b6f6-b872-4364-99d3-a2c23558e25f	b2e0ef76-8efa-4a0b-82bd-16e3422bc3fd	123456	2025-12-15 22:14:30.782	f	0	2025-12-15 22:09:30.783
15a7ac2a-20df-4df6-a7a4-ae250b86ba43	b2e0ef76-8efa-4a0b-82bd-16e3422bc3fd	123456	2025-12-15 22:12:29.829	t	1	2025-12-15 22:07:29.83
0eabb6f1-e2fd-4056-b3c5-8a3315df5e54	b2e0ef76-8efa-4a0b-82bd-16e3422bc3fd	123456	2025-12-15 22:15:50.19	f	0	2025-12-15 22:10:50.194
59dba91d-1ce2-4887-8cb8-f92bc6108abc	b2e0ef76-8efa-4a0b-82bd-16e3422bc3fd	123456	2025-12-15 22:22:14.14	f	0	2025-12-15 22:17:14.142
49fc4f88-7ce6-41b2-bf88-df7fad9a298f	b2e0ef76-8efa-4a0b-82bd-16e3422bc3fd	123456	2025-12-18 16:10:54.058	t	1	2025-12-18 16:05:54.059
347774bd-8fec-4d82-bd44-65a94963e11c	b2e0ef76-8efa-4a0b-82bd-16e3422bc3fd	123456	2025-12-15 22:24:22.812	t	1	2025-12-15 22:19:22.813
ce8976c3-44c1-4334-b228-5e17061b1cbb	2e04dbca-2e3f-4a5e-ac18-129576f7aef1	123456	2025-12-16 14:07:15.876	t	1	2025-12-16 14:02:15.878
d01325a6-4c20-4235-b8ae-9621b78ebaff	b2e0ef76-8efa-4a0b-82bd-16e3422bc3fd	123456	2025-12-15 22:25:15.19	t	1	2025-12-15 22:20:15.191
5b0982b4-eeaa-4aa5-b68e-07dce00a00cf	b2e0ef76-8efa-4a0b-82bd-16e3422bc3fd	123456	2025-12-15 22:26:13.64	f	0	2025-12-15 22:21:13.642
716b3140-c147-4348-87ee-6d8cc573aff0	b2e0ef76-8efa-4a0b-82bd-16e3422bc3fd	123456	2025-12-15 22:33:04.67	t	1	2025-12-15 22:28:04.671
8e14ac9c-6249-4f4f-8d79-ada090c6759f	de6a6cdb-65b7-410f-8908-54fd4e719d53	123456	2025-12-16 19:17:42.106	t	1	2025-12-16 19:12:42.107
a8824eaf-2cf0-4d6d-a482-44d348f7124e	51cd0567-ed77-4810-b9d9-5c3a99a79791	123456	2025-12-15 22:34:05.487	t	1	2025-12-15 22:29:05.488
178d524b-1a6d-4606-ad8d-be8d0eb711cc	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-16 14:10:07.416	t	1	2025-12-16 14:05:07.417
cda70668-f063-4b56-9bd6-bd779dd29710	de6a6cdb-65b7-410f-8908-54fd4e719d53	123456	2025-12-15 22:35:57.932	t	1	2025-12-15 22:30:57.933
3aac316c-e56d-4f30-80a7-c78c0243b048	015ca870-ed1e-46bd-995e-8cc76cedce31	123456	2025-12-15 22:42:03.401	t	1	2025-12-15 22:37:03.402
e8803e5e-1bf0-4806-b157-7031b95d76e3	015ca870-ed1e-46bd-995e-8cc76cedce31	123456	2025-12-15 22:42:32.538	t	1	2025-12-15 22:37:32.539
0e7cea69-d5c3-4c2a-84fe-d2ec1c78f454	de6a6cdb-65b7-410f-8908-54fd4e719d53	123456	2025-12-16 14:12:46.454	t	1	2025-12-16 14:07:46.456
69639fcb-a709-4883-a640-d74a92e8eeb0	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-15 22:42:47.802	t	1	2025-12-15 22:37:47.803
3ab9a6ca-9051-4f0a-8d3e-6c18ad93ad8d	554fe800-5b5d-4918-a8a0-45037debbe59	123456	2025-12-15 23:04:23.581	t	1	2025-12-15 22:59:23.582
04285795-b961-4c2e-a24b-1b860ca76886	de6a6cdb-65b7-410f-8908-54fd4e719d53	123456	2025-12-15 23:06:32.216	t	1	2025-12-15 23:01:32.216
0ede3679-c683-4f28-95fc-4814dcd88acb	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-16 14:17:18.175	t	1	2025-12-16 14:12:18.177
098b9100-09e1-4673-a5f4-323d7c52d0b7	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-15 23:08:49.794	t	1	2025-12-15 23:03:49.795
90d43c78-0560-438c-a199-bec3822bebaf	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-16 13:47:37.579	t	1	2025-12-16 13:42:37.58
41bb78d2-a3bf-4540-b36b-2f9cad1819ff	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-16 20:35:57.894	t	1	2025-12-16 20:30:57.894
3f4ae9e9-cc2e-4d38-b90e-a10ad2448c92	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-16 13:51:22.608	t	1	2025-12-16 13:46:22.608
27c94a62-8de6-486f-a270-2bc19df4f09f	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-16 14:18:18.45	t	1	2025-12-16 14:13:18.452
112b7b13-1e83-4d6a-9907-219b414772d4	de6a6cdb-65b7-410f-8908-54fd4e719d53	123456	2025-12-16 13:53:05.835	t	1	2025-12-16 13:48:05.837
df083136-9434-4087-bd3a-026098166f5a	4d2eff46-3148-4151-a909-1c88b2dde123	123456	2025-12-16 13:53:39.537	t	1	2025-12-16 13:48:39.538
fda1ab67-65ab-4c07-b373-2798896ec8ee	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-16 13:54:45.71	t	1	2025-12-16 13:49:45.711
63b94d41-721b-4835-b1cb-c6fd0ed0d1bd	2e04dbca-2e3f-4a5e-ac18-129576f7aef1	123456	2025-12-16 14:25:43.022	t	1	2025-12-16 14:20:43.024
082194bf-8360-46d8-b093-85e27a30400c	4d2eff46-3148-4151-a909-1c88b2dde123	123456	2025-12-16 14:02:08.91	t	1	2025-12-16 13:57:08.912
2f48714b-d0b9-4ac5-ad47-8773ed17d1ad	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-18 19:45:40.267	t	1	2025-12-18 19:40:40.268
55558867-b22d-46d5-a1d9-549fc2e48854	de6a6cdb-65b7-410f-8908-54fd4e719d53	123456	2025-12-16 14:26:03.236	t	1	2025-12-16 14:21:03.237
f41b09d7-3d08-4a31-bf5b-34ff04409c18	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-17 13:22:29.945	t	1	2025-12-17 13:17:29.946
8fa6c7e9-405d-4a85-9956-fee7feb1b5d1	2e04dbca-2e3f-4a5e-ac18-129576f7aef1	123456	2025-12-16 14:26:29.351	t	1	2025-12-16 14:21:29.353
a0e060f7-b2c9-48dc-894a-419587ec66dc	015ca870-ed1e-46bd-995e-8cc76cedce31	123456	2025-12-16 14:26:56.423	t	1	2025-12-16 14:21:56.424
bacd5cf0-aa96-478c-8a02-7442c00db156	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-18 16:13:51.631	t	1	2025-12-18 16:08:51.631
50ebcc20-8bca-48de-bc4f-7f4cf8377298	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-16 14:41:20.711	t	1	2025-12-16 14:36:20.712
6951cb1c-6209-45d7-a74e-668a42e2e5f7	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-18 13:32:05.474	t	1	2025-12-18 13:27:05.476
c95ff120-178b-49aa-a24e-e72f9eeb7961	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-16 15:44:31.023	t	1	2025-12-16 15:39:31.024
ee765c38-4053-4fbb-b2e7-74481ebd0f48	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-18 13:37:19.336	t	1	2025-12-18 13:32:19.337
180f7aee-b350-4521-ae58-1446307dd548	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-18 15:30:29.762	t	1	2025-12-18 15:25:29.763
67a03ecb-a35c-4359-a90a-ad44b6b4cd81	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-18 17:15:56.358	t	1	2025-12-18 17:10:56.359
f2dfe5bc-3ae6-414f-a9e3-3d43f81cbef6	b2e0ef76-8efa-4a0b-82bd-16e3422bc3fd	123456	2025-12-18 16:08:29.605	t	1	2025-12-18 16:03:29.606
ff03865f-ab6c-42af-94ff-2eeca7ab39c4	b2e0ef76-8efa-4a0b-82bd-16e3422bc3fd	123456	2025-12-18 23:02:01.287	t	1	2025-12-18 22:57:01.287
9d76bcdf-c061-4223-8d8b-1b19ea48aba0	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-18 17:26:36.8	t	1	2025-12-18 17:21:36.801
9068cf89-53fb-410b-b852-ef0073c45a08	de6a6cdb-65b7-410f-8908-54fd4e719d53	123456	2025-12-18 19:44:56.276	t	1	2025-12-18 19:39:56.277
c520f334-71cc-4448-8518-a4374f410e73	de6a6cdb-65b7-410f-8908-54fd4e719d53	123456	2025-12-19 15:23:56.083	t	1	2025-12-19 15:18:56.084
9b453e9d-ebdb-496a-9a4c-ec6fb2516a85	db412e3d-563d-43b1-aa12-dd1df03db412	123456	2025-12-18 23:02:51.264	t	1	2025-12-18 22:57:51.266
ea237909-ac51-4d89-a248-ce1eed018b15	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	123456	2025-12-19 11:24:47.948	t	1	2025-12-19 11:19:47.952
ede4188b-5212-472f-b66e-0edd6aeba9bd	51cd0567-ed77-4810-b9d9-5c3a99a79791	123456	2025-12-19 15:28:42.883	t	1	2025-12-19 15:23:42.884
cdcc19bb-512c-48bc-898c-b1e8a52c1da5	554fe800-5b5d-4918-a8a0-45037debbe59	123456	2025-12-19 15:26:31.493	t	1	2025-12-19 15:21:31.494
\.


--
-- Data for Name: Parent; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Parent" (id, "userId", "firstName", "lastName", "createdAt") FROM stdin;
2dfbf32f-ebc4-4c21-ad39-16513b037ca1	015ca870-ed1e-46bd-995e-8cc76cedce31	Sayed Ahmed	Eldsaru	2025-12-07 18:55:04.022
887312cd-be3e-4d04-a7d1-99e60ef92427	59ba26a8-dfc4-4eeb-9e15-25f88458c072	fdf	dsfdsf	2025-12-08 14:04:28.617
899c246e-1334-4a3f-b345-c29121b19570	ab04c255-88e0-46c5-a490-005c5c5f9560	parent2	me	2025-12-18 18:33:54.277
\.


--
-- Data for Name: ParentStudentLink; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."ParentStudentLink" (id, "parentId", "studentId", relationship, "createdAt") FROM stdin;
06814741-be92-456e-bf39-c9199c6baaee	2dfbf32f-ebc4-4c21-ad39-16513b037ca1	8446e894-f588-470c-a1ea-9bef7b96244c	Father	2025-12-07 18:55:18.033
e9994458-8035-4c13-a469-b2d9744c9966	887312cd-be3e-4d04-a7d1-99e60ef92427	a0ab7534-1025-4f52-aeff-f96b83c49352	\N	2025-12-08 14:04:42.664
85d12b9c-f440-4809-a45c-c42a8ad74945	2dfbf32f-ebc4-4c21-ad39-16513b037ca1	fda21647-8750-4c9c-9634-24a6729e2193	daddy	2025-12-15 22:38:49.293
\.


--
-- Data for Name: PaymentReminder; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."PaymentReminder" (id, "installmentId", "reminderType", "sentAt", "sentVia") FROM stdin;
02d62455-60d8-45d7-b08b-d6b9aedeb16a	4d390e83-c3cc-4242-ac47-89b358b0285c	OVERDUE	2025-12-06 06:00:00.865	SMS
c068dd7e-ad12-4a8e-a56d-e376353c96f6	4aea151f-a786-4b7f-919b-911166003e3a	OVERDUE	2025-12-06 06:00:01.079	SMS
d8cb0c05-9d73-4388-8a7e-1f9d1c0489d2	84d0ed84-0fb0-4732-a5af-ba5b0cdad154	OVERDUE	2025-12-06 06:00:01.29	SMS
a8e2ec02-0abb-48d1-9011-5fcd2a6f63c5	c8b5db44-ff78-4302-aa83-03adc11529b7	OVERDUE	2025-12-06 06:00:01.503	SMS
15cab364-e614-416d-aad9-a0a2b15c716b	03c3bab4-c1c4-4085-8141-8856dc697bd4	OVERDUE	2025-12-06 06:00:01.723	SMS
d6b1acec-2b9d-4f42-aed1-8b64ed25389b	4b6ee241-88b3-43a8-8564-db3f864eab4e	OVERDUE	2025-12-06 06:00:01.943	SMS
d67a142e-2115-4922-a17b-21c51547b782	6b575d2e-4380-48ea-888b-c0b935e5f2fb	OVERDUE	2025-12-06 06:00:02.154	SMS
6f855e5d-a17b-4df0-adca-38a756ea1ec0	4d390e83-c3cc-4242-ac47-89b358b0285c	OVERDUE	2025-12-18 15:25:56.906	SMS
a92c8158-5142-4df2-813a-0ce231163b5f	4aea151f-a786-4b7f-919b-911166003e3a	OVERDUE	2025-12-18 15:25:57.49	SMS
412a194d-d644-42f8-95c9-5664fbc2d0c1	84d0ed84-0fb0-4732-a5af-ba5b0cdad154	OVERDUE	2025-12-18 15:25:58.678	SMS
1436c6cb-8410-4ad1-bc23-9349b943f611	c8b5db44-ff78-4302-aa83-03adc11529b7	OVERDUE	2025-12-18 15:25:58.975	SMS
e8af1e71-3bf3-4bdd-a4f3-058dde0b213e	03c3bab4-c1c4-4085-8141-8856dc697bd4	OVERDUE	2025-12-18 15:25:59.315	SMS
e05ccf82-f22b-4486-b967-2afbe7ae9747	4b6ee241-88b3-43a8-8564-db3f864eab4e	OVERDUE	2025-12-18 15:25:59.609	SMS
7520dd56-9916-4f25-9dcf-25a742ff772c	6b575d2e-4380-48ea-888b-c0b935e5f2fb	OVERDUE	2025-12-18 15:25:59.9	SMS
17bf0b50-276b-4447-9897-cca5d5d22441	4d390e83-c3cc-4242-ac47-89b358b0285c	OVERDUE	2025-12-18 15:40:52.334	EMAIL
61a3c692-f066-4c55-a7dd-52b8b62fdee3	4d390e83-c3cc-4242-ac47-89b358b0285c	OVERDUE	2025-12-18 15:40:52.847	SMS
5e2f08f0-a01a-4663-af27-df7a9e41bacd	4aea151f-a786-4b7f-919b-911166003e3a	OVERDUE	2025-12-18 15:40:57.553	EMAIL
7f22abd4-97f2-4afe-ba7a-23341004da2c	4aea151f-a786-4b7f-919b-911166003e3a	OVERDUE	2025-12-18 15:40:57.859	SMS
dd7216aa-5a4c-4266-8c3a-fed9caf12027	84d0ed84-0fb0-4732-a5af-ba5b0cdad154	OVERDUE	2025-12-18 15:41:02.656	EMAIL
a6be8c5f-1895-46ab-9015-e9a323450027	84d0ed84-0fb0-4732-a5af-ba5b0cdad154	OVERDUE	2025-12-18 15:41:02.969	SMS
b092a65a-e9ea-4cbd-b866-48e3c9c47699	c8b5db44-ff78-4302-aa83-03adc11529b7	OVERDUE	2025-12-18 15:41:05.271	EMAIL
695cdb90-2207-4cf0-af88-edd311967ea9	c8b5db44-ff78-4302-aa83-03adc11529b7	OVERDUE	2025-12-18 15:41:05.582	SMS
7599791e-1d10-4940-9cfc-be058ed4455e	03c3bab4-c1c4-4085-8141-8856dc697bd4	OVERDUE	2025-12-18 15:41:07.977	EMAIL
7366d89f-ac3f-4a80-8773-9ebc63f33a24	03c3bab4-c1c4-4085-8141-8856dc697bd4	OVERDUE	2025-12-18 15:41:08.263	SMS
28c2faec-10d5-482d-b4f3-73d796f62c7a	4b6ee241-88b3-43a8-8564-db3f864eab4e	OVERDUE	2025-12-18 15:41:10.571	EMAIL
35169f90-3f1d-4eab-a96b-844c865084ee	4b6ee241-88b3-43a8-8564-db3f864eab4e	OVERDUE	2025-12-18 15:41:10.865	SMS
e55b6b72-884c-4399-8052-e47f2685e3a5	6b575d2e-4380-48ea-888b-c0b935e5f2fb	OVERDUE	2025-12-18 15:41:13.149	EMAIL
cb8c2706-ad7a-431e-80f2-3376e8ed0a3c	6b575d2e-4380-48ea-888b-c0b935e5f2fb	OVERDUE	2025-12-18 15:41:13.917	SMS
bb0a72bc-c9b3-40dc-b988-19524bbe4bd2	4d390e83-c3cc-4242-ac47-89b358b0285c	OVERDUE	2025-12-18 15:45:36.468	EMAIL
e00a880a-70d3-4a0b-95a1-444dcd1f847f	4d390e83-c3cc-4242-ac47-89b358b0285c	OVERDUE	2025-12-18 15:45:36.973	SMS
4502e90b-4f07-46ab-af9d-af568374d3a4	4d390e83-c3cc-4242-ac47-89b358b0285c	OVERDUE	2025-12-18 15:48:04.61	EMAIL
0050f608-0148-4380-a6c4-cd28608347f9	4d390e83-c3cc-4242-ac47-89b358b0285c	OVERDUE	2025-12-18 15:48:05.056	SMS
716b6eb9-ddea-4c1b-9d10-8b78235c9916	4aea151f-a786-4b7f-919b-911166003e3a	OVERDUE	2025-12-18 15:48:10.464	EMAIL
492af51d-b5e2-4512-a65c-3df10e7f5da1	4aea151f-a786-4b7f-919b-911166003e3a	OVERDUE	2025-12-18 15:48:10.766	SMS
7c675b26-1d8f-45ad-9ee1-60f1ba3baa2d	4d390e83-c3cc-4242-ac47-89b358b0285c	OVERDUE	2025-12-18 15:49:41.172	EMAIL
40d06f5b-dc34-4bdc-b42f-35f7a7f69209	4d390e83-c3cc-4242-ac47-89b358b0285c	OVERDUE	2025-12-18 15:49:41.574	SMS
5b8bbafa-272d-4f1c-85a7-06ebe803e572	4d390e83-c3cc-4242-ac47-89b358b0285c	OVERDUE	2025-12-18 15:59:42.977	EMAIL
7f6da9d3-122e-403c-8c47-7519646e4fc2	4d390e83-c3cc-4242-ac47-89b358b0285c	OVERDUE	2025-12-18 15:59:43.779	SMS
bbdf21e2-0b15-4521-8555-256f67bee0cb	4d390e83-c3cc-4242-ac47-89b358b0285c	OVERDUE	2025-12-18 16:16:06.959	EMAIL
97d7ec54-3c15-4571-a806-f1b4ce913b68	4d390e83-c3cc-4242-ac47-89b358b0285c	OVERDUE	2025-12-18 16:16:07.42	SMS
93b99f58-9be3-49b8-90e8-efed36ef0e3a	4d390e83-c3cc-4242-ac47-89b358b0285c	OVERDUE	2025-12-18 17:12:18.007	EMAIL
cc0a5a03-e7d6-4db4-b5ab-857b0ab2f0a0	4d390e83-c3cc-4242-ac47-89b358b0285c	OVERDUE	2025-12-18 17:12:18.608	SMS
c64efcbe-f2ec-4407-81b7-eb27b6b6cf70	4d390e83-c3cc-4242-ac47-89b358b0285c	OVERDUE	2025-12-18 17:17:29.833	EMAIL
37ae084b-2830-4eeb-9a3f-6c89e96c015e	4d390e83-c3cc-4242-ac47-89b358b0285c	OVERDUE	2025-12-18 17:17:30.195	SMS
39d0fa35-429b-4963-babe-7c4e97b7c26f	4d390e83-c3cc-4242-ac47-89b358b0285c	OVERDUE	2025-12-20 06:00:04.574	EMAIL
03a57d13-e141-4ac0-a38e-70fdbeb0a567	4d390e83-c3cc-4242-ac47-89b358b0285c	OVERDUE	2025-12-20 06:00:05.32	SMS
\.


--
-- Data for Name: Phone; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Phone" (id, "phoneNumber", "countryCode", "isVerified", "isPrimary", "studentId", "parentId", "isActive", "createdAt") FROM stdin;
\.


--
-- Data for Name: Program; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Program" (id, name, code, description, "minAge", "maxAge", "isActive", "createdAt", "updatedAt", duration) FROM stdin;
ab0b0987-3bc8-4e5a-9a4f-76060f2395ef	English Multiverse	EMV	Comprehensive English language program	6	18	t	2025-12-05 10:55:19.227	2025-12-05 10:55:19.227	\N
6d0f16b9-876d-450c-8b59-55017123ab4f	English Unlimited	EM	asdasd	\N	\N	t	2025-12-08 14:07:14.025	2025-12-08 14:07:14.025	\N
6cbcecf8-9fc7-4e89-b496-011bc02293ed	General English	GE	Comprehensive English language program for all levels	12	\N	t	2025-12-11 22:57:45.48	2025-12-11 22:57:45.48	\N
e3618a76-d028-4108-8f34-8308f1f94f26	Business English	BE	English for professional and business contexts	18	\N	t	2025-12-11 22:57:45.505	2025-12-11 22:57:45.505	\N
dc00580a-2cfd-43ac-a2b2-ae58cf7befbc	IELTS Preparation	IELTS	Intensive preparation for IELTS exam	16	\N	t	2025-12-11 22:57:45.506	2025-12-11 22:57:45.506	\N
73b49812-bb45-403f-ba98-932dcae75832	Kids English	KIDS	Fun and interactive English for children	6	12	t	2025-12-11 22:57:45.506	2025-12-11 22:57:45.506	\N
7d11ad93-7045-49d9-9d49-2b36bec91b04	Conversation Club	CONV	Practice speaking and conversation skills	14	\N	t	2025-12-11 22:57:45.507	2025-12-11 22:57:45.507	\N
340a0276-369f-4698-b4ff-0062a5fdb0db	Academic Writing	AW	Advanced academic writing skills	18	\N	t	2025-12-11 22:57:45.508	2025-12-11 22:57:45.508	\N
86ce1d25-bec3-4007-8a09-4122a93ab1b0	ammar program	AMR	asdasd	\N	\N	f	2025-12-13 10:37:51.912	2025-12-16 18:04:43.651	\N
\.


--
-- Data for Name: ProgressCriteria; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."ProgressCriteria" (id, "levelId", "groupId", name, description, "orderNumber", "isActive", "createdAt", "updatedAt") FROM stdin;
84836449-3106-49ed-9b5c-80e68773b107	6be96096-8c5c-42f2-8f54-97391d9588bc	\N	Basic Greetings	Can greet and say goodbye	1	t	2025-12-14 10:57:40.764	2025-12-14 10:57:40.764
7992201c-a785-4aa7-920a-8428d4975b16	6be96096-8c5c-42f2-8f54-97391d9588bc	\N	Numbers 1-20	Can count and use numbers 1-20	2	t	2025-12-14 10:57:40.773	2025-12-14 10:57:40.773
957dbb28-032c-4ef8-aba8-d92fdec8b077	6be96096-8c5c-42f2-8f54-97391d9588bc	\N	Present Simple	Can use present simple tense	3	t	2025-12-14 10:57:40.774	2025-12-14 10:57:40.774
d06e9f95-64dd-4ecb-9009-bbf54dade265	6be96096-8c5c-42f2-8f54-97391d9588bc	\N	Common Words	Knows 100+ common words	4	t	2025-12-14 10:57:40.775	2025-12-14 10:57:40.775
60715065-eb2f-4535-a8ee-6934a133973e	6be96096-8c5c-42f2-8f54-97391d9588bc	\N	Simple Questions	Can ask and answer simple questions	5	t	2025-12-14 10:57:40.775	2025-12-14 10:57:40.775
b93766f7-df63-4496-a4e3-886717059f51	2e2c0d81-a6b5-4dd0-a05e-30b90aef83ad	\N	Past Tense	Can use past simple tense	1	t	2025-12-14 10:57:40.776	2025-12-14 10:57:40.776
2d801df0-b3fa-4888-a5c5-a84a8295c747	2e2c0d81-a6b5-4dd0-a05e-30b90aef83ad	\N	Daily Routines	Can describe daily activities	2	t	2025-12-14 10:57:40.776	2025-12-14 10:57:40.776
e46fd64c-d6b7-40ac-8191-d8e0aac0b1aa	2e2c0d81-a6b5-4dd0-a05e-30b90aef83ad	\N	Numbers 1-100	Can count and use numbers 1-100	3	t	2025-12-14 10:57:40.777	2025-12-14 10:57:40.777
b885f77e-8c9c-4790-8bc7-46d67dbc57be	2e2c0d81-a6b5-4dd0-a05e-30b90aef83ad	\N	Short Paragraphs	Can write short paragraphs	4	t	2025-12-14 10:57:40.777	2025-12-14 10:57:40.777
5344f62f-7561-437d-828f-c4b31b0ca9ac	2e2c0d81-a6b5-4dd0-a05e-30b90aef83ad	\N	Simple Conversations	Can hold simple conversations	5	t	2025-12-14 10:57:40.777	2025-12-14 10:57:40.777
ee35a941-ff5d-4ac4-8ee6-0527928e2cb9	991a3ac0-665b-485d-946d-c151e5b97270	\N	Future Tenses	Can use future tenses correctly	1	t	2025-12-14 10:57:40.778	2025-12-14 10:57:40.778
d9c42597-858f-483c-8d71-feb556fa65ed	991a3ac0-665b-485d-946d-c151e5b97270	\N	Express Opinions	Can express and justify opinions	2	t	2025-12-14 10:57:40.778	2025-12-14 10:57:40.778
c66d4f87-fca5-4bbe-ab97-9e9b9872d608	991a3ac0-665b-485d-946d-c151e5b97270	\N	Conditionals	Can use first and second conditionals	3	t	2025-12-14 10:57:40.779	2025-12-14 10:57:40.779
4508378d-1d72-4c24-82ec-537d230bf737	991a3ac0-665b-485d-946d-c151e5b97270	\N	Longer Texts	Can understand longer texts	4	t	2025-12-14 10:57:40.779	2025-12-14 10:57:40.779
bacd6f2a-723f-49c4-aa3e-32b78dac0541	991a3ac0-665b-485d-946d-c151e5b97270	\N	Formal Writing	Can write formal emails/letters	5	t	2025-12-14 10:57:40.779	2025-12-14 10:57:40.779
0b4bebd0-b8bd-4bc5-a349-fac1ba4cd028	8da60b0f-34d6-4de7-90c3-ac61111d743d	\N	Complex Grammar	Can use complex grammatical structures	1	t	2025-12-14 10:57:40.781	2025-12-14 10:57:40.781
8485c3ed-9efa-4716-9541-7ddae2054ed7	8da60b0f-34d6-4de7-90c3-ac61111d743d	\N	Debates	Can participate in debates	2	t	2025-12-14 10:57:40.781	2025-12-14 10:57:40.781
b44af4f5-2d69-4971-a5ad-8103168bd6bc	8da60b0f-34d6-4de7-90c3-ac61111d743d	\N	Idiomatic Expressions	Can understand and use idioms	3	t	2025-12-14 10:57:40.782	2025-12-14 10:57:40.782
8b2bfae3-f765-4022-aef8-f7ec542a21fb	8da60b0f-34d6-4de7-90c3-ac61111d743d	\N	Academic Writing	Can write academic essays	4	t	2025-12-14 10:57:40.782	2025-12-14 10:57:40.782
86286fd8-4c26-4f6b-9c52-368c29bcc88f	8da60b0f-34d6-4de7-90c3-ac61111d743d	\N	Native Speed Listening	Can understand native speakers at normal speed	5	t	2025-12-14 10:57:40.783	2025-12-14 10:57:40.783
\.


--
-- Data for Name: Refund; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Refund" (id, "installmentId", "enrollmentId", "refundAmount", "refundReason", "refundMethod", "requestedBy", "requestedAt", "approvedBy", "approvedAt", "processedBy", "processedAt", status, "receiptUrl", notes, "createdAt") FROM stdin;
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Session" (id, "userId", token, "expiresAt", "ipAddress", "userAgent", "createdAt") FROM stdin;
60823c3e-06b3-4623-8070-29db51331fdc	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjQ5MzI0MjgsImV4cCI6MTc2NTUzNzIyOH0.SDk0YtZmClZWmT52T_bvojzZgLUfOtkhpIK4HQBf6cc	2025-12-12 11:00:28.67	\N	\N	2025-12-05 11:00:28.671
97e8996a-52a5-4101-8174-d2d90201f174	db412e3d-563d-43b1-aa12-dd1df03db412	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkYjQxMmUzZC01NjNkLTQzYjEtYWExMi1kZDFkZjAzZGI0MTIiLCJlbWFpbCI6Im1vaGFtbWVkLnN0dWRlbnRAdGVzdC5iaCIsInJvbGUiOiJTVFVERU5UIiwic3R1ZGVudElkIjoiNDVhOTE2NDYtZGI1Zi00YjA2LWI2NGUtOWEwMmE4NzUyMmFiIiwidGVhY2hlcklkIjpudWxsLCJwYXJlbnRJZCI6bnVsbCwiaWF0IjoxNzY0OTU1MzY3LCJleHAiOjE3NjU1NjAxNjd9.dqvs7MpltYodZfh9nhPZZ7TASW7n5lRJryz8ptip_qc	2025-12-12 17:22:47.238	\N	\N	2025-12-05 17:22:47.239
3b454821-9c06-4f7b-8fea-3c99aab1cac4	db412e3d-563d-43b1-aa12-dd1df03db412	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkYjQxMmUzZC01NjNkLTQzYjEtYWExMi1kZDFkZjAzZGI0MTIiLCJlbWFpbCI6Im1vaGFtbWVkLnN0dWRlbnRAdGVzdC5iaCIsInJvbGUiOiJTVFVERU5UIiwic3R1ZGVudElkIjoiNDVhOTE2NDYtZGI1Zi00YjA2LWI2NGUtOWEwMmE4NzUyMmFiIiwidGVhY2hlcklkIjpudWxsLCJwYXJlbnRJZCI6bnVsbCwiaWF0IjoxNzY0OTU2MjA4LCJleHAiOjE3NjU1NjEwMDh9.plX1itVPXGwXB2jhrgNpmghlzKPL4Evbx5lGSJp78_w	2025-12-12 17:36:48.173	\N	\N	2025-12-05 17:36:48.174
4ae1fb31-f40c-43b7-acc8-a022f40b2820	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjQ5NTY1MDAsImV4cCI6MTc2NTU2MTMwMH0.pVFUea9a9kBH2C0PTF0FY5vpQvhLXz3RnPt_AbOG9zM	2025-12-12 17:41:40.046	\N	\N	2025-12-05 17:41:40.047
481f8657-2e9d-4cab-877c-67f45e91ea74	db412e3d-563d-43b1-aa12-dd1df03db412	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkYjQxMmUzZC01NjNkLTQzYjEtYWExMi1kZDFkZjAzZGI0MTIiLCJlbWFpbCI6Im1vaGFtbWVkLnN0dWRlbnRAdGVzdC5iaCIsInJvbGUiOiJTVFVERU5UIiwic3R1ZGVudElkIjoiNDVhOTE2NDYtZGI1Zi00YjA2LWI2NGUtOWEwMmE4NzUyMmFiIiwidGVhY2hlcklkIjpudWxsLCJwYXJlbnRJZCI6bnVsbCwiaWF0IjoxNzY0OTU3MjUxLCJleHAiOjE3NjU1NjIwNTF9.DiSNj0CYxSFsmY6LzhrH09lAjQVtpq0OwNVYHADhVNs	2025-12-12 17:54:11.464	\N	\N	2025-12-05 17:54:11.465
f2d8c585-7037-426f-8978-08f79418758b	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjQ5NTk2NTgsImV4cCI6MTc2NTU2NDQ1OH0.b8Bbd4x1Hfe_J2DIP-62rX0pE8sJdIHvDZ6c9gZ-Gzw	2025-12-12 18:34:18.529	\N	\N	2025-12-05 18:34:18.531
aca00430-d510-4f57-84b0-13811d1e1254	51cd0567-ed77-4810-b9d9-5c3a99a79791	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MWNkMDU2Ny1lZDc3LTQ4MTAtYjlkOS01YzNhOTlhNzk3OTEiLCJlbWFpbCI6Ikh1c2FpbkFOYWJpQGdtYWlsLmNvbSIsInJvbGUiOiJTVFVERU5UIiwic3R1ZGVudElkIjoiODQ0NmU4OTQtZjU4OC00NzBjLWExZWEtOWJlZjdiOTYyNDRjIiwidGVhY2hlcklkIjpudWxsLCJwYXJlbnRJZCI6bnVsbCwiaWF0IjoxNzY0OTU5NzkxLCJleHAiOjE3NjU1NjQ1OTF9.YE6gLnGEmogHrupRyXzGqjNcvY8myu49AMM0Dmr0RvU	2025-12-12 18:36:31.831	\N	\N	2025-12-05 18:36:31.833
ad419c2d-45b1-4e20-a9b7-9a29bd63f75f	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjQ5NTk4NDIsImV4cCI6MTc2NTU2NDY0Mn0.k9nk2kZDC_w5wrA3Gn65IK9RmFMDSSRNzxskdu0V7t4	2025-12-12 18:37:22.168	\N	\N	2025-12-05 18:37:22.169
1601d452-07a0-42d1-adb9-a326e9ed3bca	51cd0567-ed77-4810-b9d9-5c3a99a79791	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MWNkMDU2Ny1lZDc3LTQ4MTAtYjlkOS01YzNhOTlhNzk3OTEiLCJlbWFpbCI6Ikh1c2FpbkFOYWJpQGdtYWlsLmNvbSIsInJvbGUiOiJTVFVERU5UIiwic3R1ZGVudElkIjoiODQ0NmU4OTQtZjU4OC00NzBjLWExZWEtOWJlZjdiOTYyNDRjIiwidGVhY2hlcklkIjpudWxsLCJwYXJlbnRJZCI6bnVsbCwiaWF0IjoxNzY0OTU5ODkyLCJleHAiOjE3NjU1NjQ2OTJ9.zr9_E-XWBkQes-q_eUSUdsj083m77I8GuyolhZs7Si8	2025-12-12 18:38:12.783	\N	\N	2025-12-05 18:38:12.784
ea683438-a0ba-45eb-bd39-14bc46e309e6	51cd0567-ed77-4810-b9d9-5c3a99a79791	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MWNkMDU2Ny1lZDc3LTQ4MTAtYjlkOS01YzNhOTlhNzk3OTEiLCJlbWFpbCI6Ikh1c2FpbkFOYWJpQGdtYWlsLmNvbSIsInJvbGUiOiJTVFVERU5UIiwic3R1ZGVudElkIjoiODQ0NmU4OTQtZjU4OC00NzBjLWExZWEtOWJlZjdiOTYyNDRjIiwidGVhY2hlcklkIjpudWxsLCJwYXJlbnRJZCI6bnVsbCwiaWF0IjoxNzY1MDAwNzQwLCJleHAiOjE3NjU2MDU1NDB9.we0EzDqkYFpKHTR7sKXj4iCjeIT4YUH0BvEzPQvjRV4	2025-12-13 05:59:00.387	\N	\N	2025-12-06 05:59:00.388
698ce77d-b93b-4921-9d42-661dbfcaf5f3	d56d6057-c762-4845-843b-02c8414113e8	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkNTZkNjA1Ny1jNzYyLTQ4NDUtODQzYi0wMmM4NDE0MTEzZTgiLCJlbWFpbCI6ImFsaS5zdHVkZW50QHRlc3QuYmgiLCJyb2xlIjoiU1RVREVOVCIsInN0dWRlbnRJZCI6ImEwYWI3NTM0LTEwMjUtNGY1Mi1hZWZmLWY5NmI4M2M0OTM1MiIsInRlYWNoZXJJZCI6bnVsbCwicGFyZW50SWQiOm51bGwsImlhdCI6MTc2NTAwODYyMiwiZXhwIjoxNzY1NjEzNDIyfQ.w1_PeukwKva1bv0qkQAkalJo0gnTx4vy4jFaNo9BBSQ	2025-12-13 08:10:22.921	\N	\N	2025-12-06 08:10:22.922
06a86f67-1ba3-4df5-bb41-b444b3f3ba05	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjUwMDg2NzIsImV4cCI6MTc2NTYxMzQ3Mn0.7mjWKtAfVEQ-nJCCxSxbmnreh2fdxImZ338YKQ8AgGo	2025-12-13 08:11:12.068	\N	\N	2025-12-06 08:11:12.069
c251f9c6-9e18-426f-9507-c9a8956554a2	d24c6b10-90e0-4e44-8d69-58e0142ddb69	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkMjRjNmIxMC05MGUwLTRlNDQtOGQ2OS01OGUwMTQyZGRiNjkiLCJlbWFpbCI6ImFobWVkLnRlYWNoZXJAZnVuY3Rpb24uYmgiLCJyb2xlIjoiVEVBQ0hFUiIsInN0dWRlbnRJZCI6bnVsbCwidGVhY2hlcklkIjoiNDZmMWZmYzAtODNmMy00MWE2LThiMDktZTkxZDljZTc5NTBlIiwicGFyZW50SWQiOm51bGwsImlhdCI6MTc2NTAwODgyOCwiZXhwIjoxNzY1NjEzNjI4fQ.kdg-mFHhB31phNgwmlyPxOc8UdZVeoXB1QB5Fuk3uxY	2025-12-13 08:13:48.769	\N	\N	2025-12-06 08:13:48.769
da251ff2-3987-4599-85bc-1f0e7cadd052	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjUwMTM4MDQsImV4cCI6MTc2NTYxODYwNH0.NMAXakilZqd2Ue8mkzA4mT5oTZgng5urEdeR_5vRDto	2025-12-13 09:36:44.954	\N	\N	2025-12-06 09:36:44.955
198e720f-62f2-4f68-a74c-3cce53aedfec	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjUwMTY2NDgsImV4cCI6MTc2NTYyMTQ0OH0.zYNrrQ5aOHms46STuCs7LTiQEmIkbiWgwYYle61zEYQ	2025-12-13 10:24:08.943	\N	\N	2025-12-06 10:24:08.944
03a7e35c-d086-476b-a97b-b7068a0199ca	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjUxMzMyMjcsImV4cCI6MTc2NTczODAyN30.uc5l7RuXwy7Pfh6IgBTU0add0ZetTSqUC6gYLqv_5HA	2025-12-14 18:47:07.736	\N	\N	2025-12-07 18:47:07.738
935144f8-b31d-4947-8a0d-0853639cbc2e	015ca870-ed1e-46bd-995e-8cc76cedce31	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwMTVjYTg3MC1lZDFlLTQ2YmQtOTk1ZS04Y2M3NmNlZGNlMzEiLCJlbWFpbCI6InBhcmVudEBnbWFpbC5jb20iLCJyb2xlIjoiUEFSRU5UIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjoiMmRmYmYzMmYtZWJjNC00YzIxLWFkMzktMTY1MTNiMDM3Y2ExIiwiaWF0IjoxNzY1MTMzOTM2LCJleHAiOjE3NjU3Mzg3MzZ9.LHsyHX1l-8x3Gm2gxQk2uB3zjPzK_DlqFTu9Pr17l7A	2025-12-14 18:58:56.327	\N	\N	2025-12-07 18:58:56.328
3e895fc7-88c9-42f5-943e-e55761283530	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjUxMzM5NTIsImV4cCI6MTc2NTczODc1Mn0.cEtU8-cqYvnum90CIV7JqjCX1UHm9aH6eXcmeyBuJRc	2025-12-14 18:59:12.727	\N	\N	2025-12-07 18:59:12.727
2309827a-b045-4ec7-b31c-612bfd3d5ca7	015ca870-ed1e-46bd-995e-8cc76cedce31	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwMTVjYTg3MC1lZDFlLTQ2YmQtOTk1ZS04Y2M3NmNlZGNlMzEiLCJlbWFpbCI6InBhcmVudEBnbWFpbC5jb20iLCJyb2xlIjoiUEFSRU5UIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjoiMmRmYmYzMmYtZWJjNC00YzIxLWFkMzktMTY1MTNiMDM3Y2ExIiwiaWF0IjoxNzY1MTMzOTczLCJleHAiOjE3NjU3Mzg3NzN9.FidQONQeb2xm1Hgx_u20T9IYQIr-HesE0Y4Hlxb_Jdo	2025-12-14 18:59:33.905	\N	\N	2025-12-07 18:59:33.907
3b62c925-4286-41d0-bfe3-8af85a73d885	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjUyMDIyMzQsImV4cCI6MTc2NTgwNzAzNH0.gLhPzv87aGBq97fJBNlN1a5adR9RasFscG-Ke4PRAyk	2025-12-15 13:57:14.051	\N	\N	2025-12-08 13:57:14.051
cfef8744-b4a2-4e43-bf80-5bb319d5e744	015ca870-ed1e-46bd-995e-8cc76cedce31	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwMTVjYTg3MC1lZDFlLTQ2YmQtOTk1ZS04Y2M3NmNlZGNlMzEiLCJlbWFpbCI6InBhcmVudEBnbWFpbC5jb20iLCJyb2xlIjoiUEFSRU5UIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjoiMmRmYmYzMmYtZWJjNC00YzIxLWFkMzktMTY1MTNiMDM3Y2ExIiwiaWF0IjoxNzY1MjAyMzc4LCJleHAiOjE3NjU4MDcxNzh9.ZI1NVyudNvA98kit-jwedDnA95ANdRwHZHimm3y9B6I	2025-12-15 13:59:38.781	\N	\N	2025-12-08 13:59:38.782
99ef7c1d-e22b-4ec0-ad4f-758ea9e511e1	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjUyMDI1NjgsImV4cCI6MTc2NTgwNzM2OH0.7aPh5W1Us7NKDsmOHTN25FW1j3ZJudYpnusvfUvWPpw	2025-12-15 14:02:48.909	\N	\N	2025-12-08 14:02:48.91
6cdd348e-2338-435c-94b2-39f28cd48a83	51cd0567-ed77-4810-b9d9-5c3a99a79791	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MWNkMDU2Ny1lZDc3LTQ4MTAtYjlkOS01YzNhOTlhNzk3OTEiLCJlbWFpbCI6Ikh1c2FpbkFOYWJpQGdtYWlsLmNvbSIsInJvbGUiOiJTVFVERU5UIiwic3R1ZGVudElkIjoiODQ0NmU4OTQtZjU4OC00NzBjLWExZWEtOWJlZjdiOTYyNDRjIiwidGVhY2hlcklkIjpudWxsLCJwYXJlbnRJZCI6bnVsbCwiaWF0IjoxNzY1MjAzNTkzLCJleHAiOjE3NjU4MDgzOTN9.H5peLz0yc-jtQKGW-X2_fHjPY8Za7BiKjlx583BLIwY	2025-12-15 14:19:53.44	\N	\N	2025-12-08 14:19:53.441
3d20cffa-1b80-4474-8e2f-f2a5b9f24e6e	b2e4046c-82bd-4afe-9022-5fdd74773011	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiMmU0MDQ2Yy04MmJkLTRhZmUtOTAyMi01ZmRkNzQ3NzMwMTEiLCJlbWFpbCI6ImFobWVkYWhtZWRAZ21haWwuY29tIiwicm9sZSI6IlNUVURFTlQiLCJzdHVkZW50SWQiOiI1NWM2NzY0Ny0xZjI3LTRmNzktOTI5OC03NTMxOGM5Mjc0ODUiLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjUyMDM4MzksImV4cCI6MTc2NTgwODYzOX0.qGcbHCg57e0g5UMxdReKJmC2m4bWykyL4Zx_dtVeJTQ	2025-12-15 14:23:59.965	\N	\N	2025-12-08 14:23:59.966
0ee41f60-17e3-4eb7-8ba7-ea7cce84058b	d24c6b10-90e0-4e44-8d69-58e0142ddb69	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkMjRjNmIxMC05MGUwLTRlNDQtOGQ2OS01OGUwMTQyZGRiNjkiLCJlbWFpbCI6ImFobWVkLnRlYWNoZXJAZnVuY3Rpb24uYmgiLCJyb2xlIjoiVEVBQ0hFUiIsInN0dWRlbnRJZCI6bnVsbCwidGVhY2hlcklkIjoiNDZmMWZmYzAtODNmMy00MWE2LThiMDktZTkxZDljZTc5NTBlIiwicGFyZW50SWQiOm51bGwsImlhdCI6MTc2NTIwNDA0MCwiZXhwIjoxNzY1ODA4ODQwfQ.3b4ezqabu_opAS2satkikGWzGK21CPxJJSJG9EkoGOM	2025-12-15 14:27:20.33	\N	\N	2025-12-08 14:27:20.331
603cc70f-f29f-4d82-85c8-6720d03d0e76	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjU0OTI0ODksImV4cCI6MTc2NjA5NzI4OX0.CZhOA7vIRGcL3nPd3AV3Vhim0ijYcmLnQX_wdpgsGmQ	2025-12-18 22:34:49.397	\N	\N	2025-12-11 22:34:49.399
df6c5a19-26f6-484e-ade7-afb1b86ac9e5	b2e0ef76-8efa-4a0b-82bd-16e3422bc3fd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiMmUwZWY3Ni04ZWZhLTRhMGItODJiZC0xNmUzNDIyYmMzZmQiLCJlbWFpbCI6IlFhc3NpbWFobWVkMjMxQGdtYWlsLmNvbSIsInJvbGUiOiJTVFVERU5UIiwic3R1ZGVudElkIjoiZDY3ZWExNjgtOTM3Yy00MjI5LWFiM2QtNmY2YWNmNzBkNDI4IiwidGVhY2hlcklkIjpudWxsLCJwYXJlbnRJZCI6bnVsbCwiaWF0IjoxNzY1NTI2NDgxLCJleHAiOjE3NjYxMzEyODF9.frzTBmuzRGsuCkpC5Oa7bE1feRlQ2FqX9i0nUWkOpUs	2025-12-19 08:01:21.541	\N	\N	2025-12-12 08:01:21.543
c54e7d06-51e4-4abf-b2aa-c7aa63f09369	b2e0ef76-8efa-4a0b-82bd-16e3422bc3fd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiMmUwZWY3Ni04ZWZhLTRhMGItODJiZC0xNmUzNDIyYmMzZmQiLCJlbWFpbCI6IlFhc3NpbWFobWVkMjMxQGdtYWlsLmNvbSIsInJvbGUiOiJTVFVERU5UIiwic3R1ZGVudElkIjoiZDY3ZWExNjgtOTM3Yy00MjI5LWFiM2QtNmY2YWNmNzBkNDI4IiwidGVhY2hlcklkIjpudWxsLCJwYXJlbnRJZCI6bnVsbCwiaWF0IjoxNzY1NTQ5ODg5LCJleHAiOjE3NjYxNTQ2ODl9._vCBwEVgiTbfWFuT7e2BVurgPgvJSWmbUzK_VkIIl1w	2025-12-19 14:31:29.411	\N	\N	2025-12-12 14:31:29.412
6c9aef19-81d5-4b46-8fe6-057ac95da99e	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjU1NjExMTUsImV4cCI6MTc2NjE2NTkxNX0.oOqh6zZ18-WpkS0xDYYJ6kD7FPh1kTqxlwy6Lb4HuY0	2025-12-19 17:38:35.111	\N	\N	2025-12-12 17:38:35.112
6c2ba2ef-4609-4ada-876c-fad794b9b495	4d2eff46-3148-4151-a909-1c88b2dde123	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0ZDJlZmY0Ni0zMTQ4LTQxNTEtYTkwOS0xYzg4YjJkZGUxMjMiLCJlbWFpbCI6ImFtbWFyQGdtYWlsLmNvbSIsInJvbGUiOiJTVFVERU5UIiwic3R1ZGVudElkIjoiNWQxNTRmNzktNGQxNi00ZjQ1LWE0ZjktMGY3YTliMGJjOWEwIiwidGVhY2hlcklkIjpudWxsLCJwYXJlbnRJZCI6bnVsbCwiaWF0IjoxNzY1NjE4ODM3LCJleHAiOjE3NjYyMjM2Mzd9.JOFl1CBXX83a8XAL1qertjXzAiJQxsBYK-bakQc3cCs	2025-12-20 09:40:37.014	\N	\N	2025-12-13 09:40:37.015
7c61acd2-d576-4a68-ac82-602e07b43c97	b2e0ef76-8efa-4a0b-82bd-16e3422bc3fd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiMmUwZWY3Ni04ZWZhLTRhMGItODJiZC0xNmUzNDIyYmMzZmQiLCJlbWFpbCI6IlFhc3NpbWFobWVkMjMxQGdtYWlsLmNvbSIsInJvbGUiOiJTVFVERU5UIiwic3R1ZGVudElkIjoiZDY3ZWExNjgtOTM3Yy00MjI5LWFiM2QtNmY2YWNmNzBkNDI4IiwidGVhY2hlcklkIjpudWxsLCJwYXJlbnRJZCI6bnVsbCwiaWF0IjoxNzY1NjE5MDcxLCJleHAiOjE3NjYyMjM4NzF9.z4-Jk4Qx0NJlvm84PNNj2gbXcascemQeXx8OO3eScGA	2025-12-20 09:44:31.093	\N	\N	2025-12-13 09:44:31.094
2e6d8176-7975-4998-aaaf-8c557972d62b	de6a6cdb-65b7-410f-8908-54fd4e719d53	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZTZhNmNkYi02NWI3LTQxMGYtODkwOC01NGZkNGU3MTlkNTMiLCJlbWFpbCI6ImZhdGltYS50ZWFjaGVyQGZ1bmN0aW9uLmJoIiwicm9sZSI6IlRFQUNIRVIiLCJzdHVkZW50SWQiOm51bGwsInRlYWNoZXJJZCI6ImRkNzkxZTNhLTE2ODItNGJjZS1hNWNhLTI2ZTIyOTFjOGU1MiIsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjU2MTkxMDQsImV4cCI6MTc2NjIyMzkwNH0.fW7oXioJvWNoYyK6ZXAOy8l7HU_yGnSEJHqBC2RFDSY	2025-12-20 09:45:04.832	\N	\N	2025-12-13 09:45:04.833
a968ad21-6ddf-4c28-988b-5d62f7c4bb74	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjU2MTkyNDYsImV4cCI6MTc2NjIyNDA0Nn0.yMo2mNRV5_KRPL12gXC5MUoAv7aiHppEUmm4uJYB9cQ	2025-12-20 09:47:26.785	\N	\N	2025-12-13 09:47:26.786
aa8375a8-0c5c-4172-a56f-7c4328777a55	85e1bf7e-b3ce-43a8-98c2-c19fd81535ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4NWUxYmY3ZS1iM2NlLTQzYTgtOThjMi1jMTlmZDgxNTM1YWIiLCJlbWFpbCI6ImxheWxhLnN0dWRlbnRAdGVzdC5iaCIsInJvbGUiOiJTVFVERU5UIiwic3R1ZGVudElkIjoiMjM2NTk4NDItYTEyMC00YTk2LWExZTUtYTkzNjQwZGY0NzlhIiwidGVhY2hlcklkIjpudWxsLCJwYXJlbnRJZCI6bnVsbCwiaWF0IjoxNzY1NjE5NDQ5LCJleHAiOjE3NjYyMjQyNDl9.ghzQVZXuNuRM3Gz196yqS3Cwh1peNi4NFZWpa6wHwCo	2025-12-20 09:50:49.578	\N	\N	2025-12-13 09:50:49.581
f60c9dcd-e2ef-44c5-bb7d-895c931afd58	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjU2MTk0NjksImV4cCI6MTc2NjIyNDI2OX0.di7h5-TvB5DIFg9I3B9jvsUpa1VgjgFoRUB_cWzLNFs	2025-12-20 09:51:09.359	\N	\N	2025-12-13 09:51:09.36
8fdf0790-2703-45ff-b9e9-d49e36c9202c	51cd0567-ed77-4810-b9d9-5c3a99a79791	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MWNkMDU2Ny1lZDc3LTQ4MTAtYjlkOS01YzNhOTlhNzk3OTEiLCJlbWFpbCI6Ikh1c2FpbkFOYWJpQGdtYWlsLmNvbSIsInJvbGUiOiJTVFVERU5UIiwic3R1ZGVudElkIjoiODQ0NmU4OTQtZjU4OC00NzBjLWExZWEtOWJlZjdiOTYyNDRjIiwidGVhY2hlcklkIjpudWxsLCJwYXJlbnRJZCI6bnVsbCwiaWF0IjoxNzY1NjE5NTA1LCJleHAiOjE3NjYyMjQzMDV9.hXe0qrT7KTo2qo3ELbGCM6Sd4Hi_MVxKxyQLeaJXgSI	2025-12-20 09:51:45.427	\N	\N	2025-12-13 09:51:45.428
8512ae90-a1da-40c3-ae42-0f094a772318	de6a6cdb-65b7-410f-8908-54fd4e719d53	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZTZhNmNkYi02NWI3LTQxMGYtODkwOC01NGZkNGU3MTlkNTMiLCJlbWFpbCI6ImZhdGltYS50ZWFjaGVyQGZ1bmN0aW9uLmJoIiwicm9sZSI6IlRFQUNIRVIiLCJzdHVkZW50SWQiOm51bGwsInRlYWNoZXJJZCI6ImRkNzkxZTNhLTE2ODItNGJjZS1hNWNhLTI2ZTIyOTFjOGU1MiIsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjU2MjA3MjAsImV4cCI6MTc2NjIyNTUyMH0._tRa7REOVSVj6ANXrHDy2t6sntvp0AQZpOQ9RTuquSU	2025-12-20 10:12:00.273	\N	\N	2025-12-13 10:12:00.275
3ef9f317-a060-4ca9-8c74-24f23f6b9034	4d2eff46-3148-4151-a909-1c88b2dde123	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0ZDJlZmY0Ni0zMTQ4LTQxNTEtYTkwOS0xYzg4YjJkZGUxMjMiLCJlbWFpbCI6ImFtbWFyQGdtYWlsLmNvbSIsInJvbGUiOiJTVFVERU5UIiwic3R1ZGVudElkIjoiNWQxNTRmNzktNGQxNi00ZjQ1LWE0ZjktMGY3YTliMGJjOWEwIiwidGVhY2hlcklkIjpudWxsLCJwYXJlbnRJZCI6bnVsbCwiaWF0IjoxNzY1NjIwODIwLCJleHAiOjE3NjYyMjU2MjB9.MqJREdbX-HCQ9EM6jMiJ4USgAoHfsb_61zLKS2a2SI0	2025-12-20 10:13:40.804	\N	\N	2025-12-13 10:13:40.805
6511245d-61ed-49ac-8f5f-77432776e450	015ca870-ed1e-46bd-995e-8cc76cedce31	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwMTVjYTg3MC1lZDFlLTQ2YmQtOTk1ZS04Y2M3NmNlZGNlMzEiLCJlbWFpbCI6InBhcmVudEBnbWFpbC5jb20iLCJyb2xlIjoiUEFSRU5UIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjoiMmRmYmYzMmYtZWJjNC00YzIxLWFkMzktMTY1MTNiMDM3Y2ExIiwiaWF0IjoxNzY1NjIwOTY5LCJleHAiOjE3NjYyMjU3Njl9.e019HCLgH94NaNaTaDAtb_kZFES6iPwxxsZDBi27p-U	2025-12-20 10:16:09.523	\N	\N	2025-12-13 10:16:09.526
00d9b101-ac57-4b8b-b5aa-15eb86e2d42b	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjU2MjE1NjQsImV4cCI6MTc2NjIyNjM2NH0.UgaPzTMtCHZL_xENc8WEJ9CobKlv7MObcCaHHbJFivI	2025-12-20 10:26:04.852	\N	\N	2025-12-13 10:26:04.853
d734ee5c-8f70-483c-8934-3d4edbde0af3	5f63c10d-78b6-4c3d-a116-4d8f772eeb80	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZjYzYzEwZC03OGI2LTRjM2QtYTExNi00ZDhmNzcyZWViODAiLCJlbWFpbCI6Im1vaGFtbWVkQUBnbWFpbC5jb20iLCJyb2xlIjoiU1RVREVOVCIsInN0dWRlbnRJZCI6ImZkYTIxNjQ3LTg3NTAtNGM5Yy05NjM0LTI0YTY3MjllMjE5MyIsInRlYWNoZXJJZCI6bnVsbCwicGFyZW50SWQiOm51bGwsImlhdCI6MTc2NTYyMjEwNywiZXhwIjoxNzY2MjI2OTA3fQ.jHb_fnFghMCkt-1-XPSlHTkEb5r7Otcy-3SylHF2Nwk	2025-12-20 10:35:07.781	\N	\N	2025-12-13 10:35:07.784
11c2a0c6-89bb-44d3-90d3-4e9f49ab9f8b	51cd0567-ed77-4810-b9d9-5c3a99a79791	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MWNkMDU2Ny1lZDc3LTQ4MTAtYjlkOS01YzNhOTlhNzk3OTEiLCJlbWFpbCI6Ikh1c2FpbkFOYWJpQGdtYWlsLmNvbSIsInJvbGUiOiJTVFVERU5UIiwic3R1ZGVudElkIjoiODQ0NmU4OTQtZjU4OC00NzBjLWExZWEtOWJlZjdiOTYyNDRjIiwidGVhY2hlcklkIjpudWxsLCJwYXJlbnRJZCI6bnVsbCwiaWF0IjoxNzY1NjQ3NDI4LCJleHAiOjE3NjYyNTIyMjh9.89t8ZJgwGcnIi7_VcMd_t009by200yNjIVs_1bRE4zs	2025-12-20 17:37:08.209	\N	\N	2025-12-13 17:37:08.21
4b9bd4bd-08fe-4147-a238-3f1986eceda2	015ca870-ed1e-46bd-995e-8cc76cedce31	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwMTVjYTg3MC1lZDFlLTQ2YmQtOTk1ZS04Y2M3NmNlZGNlMzEiLCJlbWFpbCI6InBhcmVudEBnbWFpbC5jb20iLCJyb2xlIjoiUEFSRU5UIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjoiMmRmYmYzMmYtZWJjNC00YzIxLWFkMzktMTY1MTNiMDM3Y2ExIiwiaWF0IjoxNzY1NjQ4NDUxLCJleHAiOjE3NjYyNTMyNTF9.-02pfsSgm9JJ1SSZs7AJrXZGlD6cZ_k1nW2t40ZRqz0	2025-12-20 17:54:11.559	\N	\N	2025-12-13 17:54:11.559
95e2ce36-bfd7-4153-b8b8-4691b4fc9e80	de6a6cdb-65b7-410f-8908-54fd4e719d53	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZTZhNmNkYi02NWI3LTQxMGYtODkwOC01NGZkNGU3MTlkNTMiLCJlbWFpbCI6ImZhdGltYS50ZWFjaGVyQGZ1bmN0aW9uLmJoIiwicm9sZSI6IlRFQUNIRVIiLCJzdHVkZW50SWQiOm51bGwsInRlYWNoZXJJZCI6ImRkNzkxZTNhLTE2ODItNGJjZS1hNWNhLTI2ZTIyOTFjOGU1MiIsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjU2NTE0MzEsImV4cCI6MTc2NjI1NjIzMX0.UeFDsVmNU5SxctYVmcqoD3p6wO1nxCj2JXlaUjCsMFg	2025-12-20 18:43:51.966	\N	\N	2025-12-13 18:43:51.967
45aa37c6-1efb-4a4c-bf57-8baced303261	de6a6cdb-65b7-410f-8908-54fd4e719d53	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZTZhNmNkYi02NWI3LTQxMGYtODkwOC01NGZkNGU3MTlkNTMiLCJlbWFpbCI6ImZhdGltYS50ZWFjaGVyQGZ1bmN0aW9uLmJoIiwicm9sZSI6IlRFQUNIRVIiLCJzdHVkZW50SWQiOm51bGwsInRlYWNoZXJJZCI6ImRkNzkxZTNhLTE2ODItNGJjZS1hNWNhLTI2ZTIyOTFjOGU1MiIsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjU2NTI1MTgsImV4cCI6MTc2NjI1NzMxOH0.abeHOc2ghX9nIWZh1ujIqdG_IZ9UEq8fU1buWM-gk8I	2025-12-20 19:01:58.012	\N	\N	2025-12-13 19:01:58.013
f6687d33-a743-4805-8b66-3c02f17672b7	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjU2NTM4MTUsImV4cCI6MTc2NjI1ODYxNX0.QVUsCIoPcIbmtTI37yNGoz7GQxs2Q2sXmgkPyNtgklo	2025-12-20 19:23:35.104	\N	\N	2025-12-13 19:23:35.105
b4d2478a-9ed0-49d2-884b-ab3a753033ee	de6a6cdb-65b7-410f-8908-54fd4e719d53	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZTZhNmNkYi02NWI3LTQxMGYtODkwOC01NGZkNGU3MTlkNTMiLCJlbWFpbCI6ImZhdGltYS50ZWFjaGVyQGZ1bmN0aW9uLmJoIiwicm9sZSI6IlRFQUNIRVIiLCJzdHVkZW50SWQiOm51bGwsInRlYWNoZXJJZCI6ImRkNzkxZTNhLTE2ODItNGJjZS1hNWNhLTI2ZTIyOTFjOGU1MiIsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjU2NTM4NDksImV4cCI6MTc2NjI1ODY0OX0.43_XMtOZMKxUGdE9lhrDMrxvMkr_0e5vAueQVu_x22E	2025-12-20 19:24:09.11	\N	\N	2025-12-13 19:24:09.111
7f1369b8-c0cb-4fa4-8ee0-8660e3b60d32	51cd0567-ed77-4810-b9d9-5c3a99a79791	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MWNkMDU2Ny1lZDc3LTQ4MTAtYjlkOS01YzNhOTlhNzk3OTEiLCJlbWFpbCI6Ikh1c2FpbkFOYWJpQGdtYWlsLmNvbSIsInJvbGUiOiJTVFVERU5UIiwic3R1ZGVudElkIjoiODQ0NmU4OTQtZjU4OC00NzBjLWExZWEtOWJlZjdiOTYyNDRjIiwidGVhY2hlcklkIjpudWxsLCJwYXJlbnRJZCI6bnVsbCwiaWF0IjoxNzY1NzE0MjU2LCJleHAiOjE3NjYzMTkwNTZ9.3iXXvrWNt1ul6bHkO9AAYB3ZwKRdUHcNawznheiHlpA	2025-12-21 12:10:56.432	\N	\N	2025-12-14 12:10:56.433
a5e18e02-294e-434f-84f0-e128f4c4251b	51cd0567-ed77-4810-b9d9-5c3a99a79791	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MWNkMDU2Ny1lZDc3LTQ4MTAtYjlkOS01YzNhOTlhNzk3OTEiLCJlbWFpbCI6Ikh1c2FpbkFOYWJpQGdtYWlsLmNvbSIsInJvbGUiOiJTVFVERU5UIiwic3R1ZGVudElkIjoiODQ0NmU4OTQtZjU4OC00NzBjLWExZWEtOWJlZjdiOTYyNDRjIiwidGVhY2hlcklkIjpudWxsLCJwYXJlbnRJZCI6bnVsbCwiaWF0IjoxNzY1ODE5NDkyLCJleHAiOjE3NjY0MjQyOTJ9.cXeYZQDt24N2Wyyd4C3XzrZa0OfsefII8vtZVREXsYg	2025-12-22 17:24:52.455	\N	\N	2025-12-15 17:24:52.456
6861941c-fd31-41ab-923a-24398a4471e5	b2e0ef76-8efa-4a0b-82bd-16e3422bc3fd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiMmUwZWY3Ni04ZWZhLTRhMGItODJiZC0xNmUzNDIyYmMzZmQiLCJlbWFpbCI6IlFhc3NpbWFobWVkMjMxQGdtYWlsLmNvbSIsInJvbGUiOiJTVFVERU5UIiwic3R1ZGVudElkIjoiZDY3ZWExNjgtOTM3Yy00MjI5LWFiM2QtNmY2YWNmNzBkNDI4IiwidGVhY2hlcklkIjpudWxsLCJwYXJlbnRJZCI6bnVsbCwiaWF0IjoxNzY1ODM2NTUwLCJleHAiOjE3NjY0NDEzNTB9.05FvH_m13tS8koH604bQFxpm5OKzDiNaoXSm0ib5QA4	2025-12-22 22:09:10.653	\N	\N	2025-12-15 22:09:10.654
24dc3788-9e1b-4b99-85b6-8f0f99fae79d	b2e0ef76-8efa-4a0b-82bd-16e3422bc3fd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiMmUwZWY3Ni04ZWZhLTRhMGItODJiZC0xNmUzNDIyYmMzZmQiLCJlbWFpbCI6IlFhc3NpbWFobWVkMjMxQGdtYWlsLmNvbSIsInJvbGUiOiJTVFVERU5UIiwic3R1ZGVudElkIjoiZDY3ZWExNjgtOTM3Yy00MjI5LWFiM2QtNmY2YWNmNzBkNDI4IiwidGVhY2hlcklkIjpudWxsLCJwYXJlbnRJZCI6bnVsbCwiaWF0IjoxNzY1ODM3MjA4LCJleHAiOjE3NjY0NDIwMDh9.IlS9TtBsmiSCqTv2yu4C8RRnpUY90rEmtUn_GrQcs4o	2025-12-22 22:20:08.785	\N	\N	2025-12-15 22:20:08.785
2769cfa0-dc03-4463-9708-49422c652d3c	b2e0ef76-8efa-4a0b-82bd-16e3422bc3fd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiMmUwZWY3Ni04ZWZhLTRhMGItODJiZC0xNmUzNDIyYmMzZmQiLCJlbWFpbCI6IlFhc3NpbWFobWVkMjMxQGdtYWlsLmNvbSIsInJvbGUiOiJTVFVERU5UIiwic3R1ZGVudElkIjoiZDY3ZWExNjgtOTM3Yy00MjI5LWFiM2QtNmY2YWNmNzBkNDI4IiwidGVhY2hlcklkIjpudWxsLCJwYXJlbnRJZCI6bnVsbCwiaWF0IjoxNzY1ODM3MjY1LCJleHAiOjE3NjY0NDIwNjV9.XaLR0riLTtZdYZ4z5gObOtLqxwRtrl6-H_XxM19CtTg	2025-12-22 22:21:05.708	\N	\N	2025-12-15 22:21:05.709
26c303af-f412-449d-9bbd-8948248487a1	b2e0ef76-8efa-4a0b-82bd-16e3422bc3fd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiMmUwZWY3Ni04ZWZhLTRhMGItODJiZC0xNmUzNDIyYmMzZmQiLCJlbWFpbCI6IlFhc3NpbWFobWVkMjMxQGdtYWlsLmNvbSIsInJvbGUiOiJTVFVERU5UIiwic3R1ZGVudElkIjoiZDY3ZWExNjgtOTM3Yy00MjI5LWFiM2QtNmY2YWNmNzBkNDI4IiwidGVhY2hlcklkIjpudWxsLCJwYXJlbnRJZCI6bnVsbCwiaWF0IjoxNzY1ODM3NzE0LCJleHAiOjE3NjY0NDI1MTR9.gc0S6gxBrqGER-ELlmNUSe_RBQcIDcP1Ds9-YMONXh8	2025-12-22 22:28:34.868	\N	\N	2025-12-15 22:28:34.869
8b9b6f49-9697-427e-87ba-16d1c9209149	51cd0567-ed77-4810-b9d9-5c3a99a79791	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MWNkMDU2Ny1lZDc3LTQ4MTAtYjlkOS01YzNhOTlhNzk3OTEiLCJlbWFpbCI6Ikh1c2FpbkFOYWJpQGdtYWlsLmNvbSIsInJvbGUiOiJTVFVERU5UIiwic3R1ZGVudElkIjoiODQ0NmU4OTQtZjU4OC00NzBjLWExZWEtOWJlZjdiOTYyNDRjIiwidGVhY2hlcklkIjpudWxsLCJwYXJlbnRJZCI6bnVsbCwiaWF0IjoxNzY1ODM3Nzg4LCJleHAiOjE3NjY0NDI1ODh9.ljF0tU_1RDMSPFC4m3jK24uGgD5ywSSL67_oYuLLiMk	2025-12-22 22:29:48.467	\N	\N	2025-12-15 22:29:48.468
27c8a623-8669-42e9-8d25-5791bf17da98	de6a6cdb-65b7-410f-8908-54fd4e719d53	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZTZhNmNkYi02NWI3LTQxMGYtODkwOC01NGZkNGU3MTlkNTMiLCJlbWFpbCI6ImZhdGltYS50ZWFjaGVyQGZ1bmN0aW9uLmJoIiwicm9sZSI6IlRFQUNIRVIiLCJzdHVkZW50SWQiOm51bGwsInRlYWNoZXJJZCI6ImRkNzkxZTNhLTE2ODItNGJjZS1hNWNhLTI2ZTIyOTFjOGU1MiIsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjU4Mzc4NjAsImV4cCI6MTc2NjQ0MjY2MH0.kYYmmjDZ8saOmk2JuwgSBfq2obzG7Y4xLAsYyjoJ0mI	2025-12-22 22:31:00.192	\N	\N	2025-12-15 22:31:00.193
f92018d5-015c-4213-b594-7a8dd9b61cb1	015ca870-ed1e-46bd-995e-8cc76cedce31	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwMTVjYTg3MC1lZDFlLTQ2YmQtOTk1ZS04Y2M3NmNlZGNlMzEiLCJlbWFpbCI6InBhcmVudEBnbWFpbC5jb20iLCJyb2xlIjoiUEFSRU5UIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjoiMmRmYmYzMmYtZWJjNC00YzIxLWFkMzktMTY1MTNiMDM3Y2ExIiwiaWF0IjoxNzY1ODM4MjI1LCJleHAiOjE3NjY0NDMwMjV9.rg8fmBi2HsyZeFBrrk-dHUpBqDcAzfzeL0U3yf6-CnE	2025-12-22 22:37:05.901	\N	\N	2025-12-15 22:37:05.902
7a028400-3aeb-49b4-8f59-0d9ef67cb7e9	015ca870-ed1e-46bd-995e-8cc76cedce31	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwMTVjYTg3MC1lZDFlLTQ2YmQtOTk1ZS04Y2M3NmNlZGNlMzEiLCJlbWFpbCI6InBhcmVudEBnbWFpbC5jb20iLCJyb2xlIjoiUEFSRU5UIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjoiMmRmYmYzMmYtZWJjNC00YzIxLWFkMzktMTY1MTNiMDM3Y2ExIiwiaWF0IjoxNzY1ODM4MjU0LCJleHAiOjE3NjY0NDMwNTR9.Mbgsnm0suFJ2CNshZ1FpEtnpj72TWo6BhnnIpi6O8HE	2025-12-22 22:37:34.612	\N	\N	2025-12-15 22:37:34.613
f4c7b69e-d9af-4467-bb25-cfd4720ea019	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjU4MzgyNzAsImV4cCI6MTc2NjQ0MzA3MH0.G3Sr67aheCuNeXNDgZFHRVodoBzdDdXZKVMPRVgKO2A	2025-12-22 22:37:50.23	\N	\N	2025-12-15 22:37:50.238
289efe5f-21cc-4571-9b20-19be0f6ab280	554fe800-5b5d-4918-a8a0-45037debbe59	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTRmZTgwMC01YjVkLTQ5MTgtYThhMC00NTAzN2RlYmJlNTkiLCJlbWFpbCI6Im1vaGFtZWRhbG1hdHJvb2s3QGdtYWlsLmNvbSIsInJvbGUiOiJTVFVERU5UIiwic3R1ZGVudElkIjoiYWJiNjcyYmUtZTY3Yi00OGJiLTkwNWYtOTc0OGNmMWJiMDI1IiwidGVhY2hlcklkIjpudWxsLCJwYXJlbnRJZCI6bnVsbCwiaWF0IjoxNzY1ODM5NTg0LCJleHAiOjE3NjY0NDQzODR9.kxmIxhY-EXsTIiKVQIJI3IMVRPvxV1VfSnTX5-HeN-s	2025-12-22 22:59:44.787	\N	\N	2025-12-15 22:59:44.788
ce2f1ec0-1c29-4017-9224-d590118ba181	de6a6cdb-65b7-410f-8908-54fd4e719d53	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZTZhNmNkYi02NWI3LTQxMGYtODkwOC01NGZkNGU3MTlkNTMiLCJlbWFpbCI6ImZhdGltYS50ZWFjaGVyQGZ1bmN0aW9uLmJoIiwicm9sZSI6IlRFQUNIRVIiLCJzdHVkZW50SWQiOm51bGwsInRlYWNoZXJJZCI6ImRkNzkxZTNhLTE2ODItNGJjZS1hNWNhLTI2ZTIyOTFjOGU1MiIsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjU4Mzk2OTQsImV4cCI6MTc2NjQ0NDQ5NH0.vJg15i-8-IiDfFFKznohv9XCUFLey1hRWr-RMLGZ4U0	2025-12-22 23:01:34.69	\N	\N	2025-12-15 23:01:34.691
82b4f99c-9695-48d6-896f-0bd77e5f1582	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjU4Mzk4MzIsImV4cCI6MTc2NjQ0NDYzMn0.sX0zDQRD_U8xdFBiLSdrUosJhLsksFIvsZsV36b-53k	2025-12-22 23:03:52.151	\N	\N	2025-12-15 23:03:52.152
715f3ee3-7685-4bb3-9db1-ecaba0281bf2	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjU4OTI1NTksImV4cCI6MTc2NjQ5NzM1OX0.w445QkTxC0brwL_D8b0D3sw-sQd1LHmjMOoUZnTEFBw	2025-12-23 13:42:39.828	\N	\N	2025-12-16 13:42:39.829
5c72776f-e1cb-46f5-96fc-b5dcec0c7e50	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjU4OTI3ODQsImV4cCI6MTc2NjQ5NzU4NH0.KbVGnMu34Zl5nGDuiKVh-47vf9mjE08vr4-W5kN3Z-I	2025-12-23 13:46:24.687	\N	\N	2025-12-16 13:46:24.688
c88de7af-0198-4273-a97f-81fa6b80bc58	de6a6cdb-65b7-410f-8908-54fd4e719d53	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZTZhNmNkYi02NWI3LTQxMGYtODkwOC01NGZkNGU3MTlkNTMiLCJlbWFpbCI6ImZhdGltYS50ZWFjaGVyQGZ1bmN0aW9uLmJoIiwicm9sZSI6IlRFQUNIRVIiLCJzdHVkZW50SWQiOm51bGwsInRlYWNoZXJJZCI6ImRkNzkxZTNhLTE2ODItNGJjZS1hNWNhLTI2ZTIyOTFjOGU1MiIsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjU4OTI4ODcsImV4cCI6MTc2NjQ5NzY4N30.kFZgniOsUY3-LmjKstVVVBfZWwe7e2sYUlcTk-440Jw	2025-12-23 13:48:07.798	\N	\N	2025-12-16 13:48:07.799
48f7c4ba-80ee-4a24-872e-5f7d699749bf	4d2eff46-3148-4151-a909-1c88b2dde123	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0ZDJlZmY0Ni0zMTQ4LTQxNTEtYTkwOS0xYzg4YjJkZGUxMjMiLCJlbWFpbCI6ImFtbWFyQGdtYWlsLmNvbSIsInJvbGUiOiJTVFVERU5UIiwic3R1ZGVudElkIjoiNWQxNTRmNzktNGQxNi00ZjQ1LWE0ZjktMGY3YTliMGJjOWEwIiwidGVhY2hlcklkIjpudWxsLCJwYXJlbnRJZCI6bnVsbCwiaWF0IjoxNzY1ODkyOTIxLCJleHAiOjE3NjY0OTc3MjF9.tY2h1mlFAuXq4U2RQzprLtiM4KgMq8kJgMZrkhop488	2025-12-23 13:48:41.303	\N	\N	2025-12-16 13:48:41.304
fe0a1603-031b-4bfe-b272-7ea36cf5425e	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjU4OTI5ODgsImV4cCI6MTc2NjQ5Nzc4OH0.0hXmSZys2ZD_RwXi8lhDEPC-dcyHjBKfgLwdIwKV9RE	2025-12-23 13:49:48.326	\N	\N	2025-12-16 13:49:48.327
c20c4d6d-67aa-4233-a239-2a67aa1e934f	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjYwNzE1NDQsImV4cCI6MTc2NjY3NjM0NH0.kxUi264qK3AcNdighT1VUrjNr_IRMACADfz47Nym4FQ	2025-12-25 15:25:44.431	\N	\N	2025-12-18 15:25:44.432
a72f01c2-bd44-465e-ab73-b3ea8c862713	4d2eff46-3148-4151-a909-1c88b2dde123	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0ZDJlZmY0Ni0zMTQ4LTQxNTEtYTkwOS0xYzg4YjJkZGUxMjMiLCJlbWFpbCI6ImFtbWFyQGdtYWlsLmNvbSIsInJvbGUiOiJTVFVERU5UIiwic3R1ZGVudElkIjoiNWQxNTRmNzktNGQxNi00ZjQ1LWE0ZjktMGY3YTliMGJjOWEwIiwidGVhY2hlcklkIjpudWxsLCJwYXJlbnRJZCI6bnVsbCwiaWF0IjoxNzY1ODkzNDMwLCJleHAiOjE3NjY0OTgyMzB9.yndBDfV351dVcMDscTDLN5w96FjBhkAVpnINk2OUq_0	2025-12-23 13:57:10.758	\N	\N	2025-12-16 13:57:10.76
67b1c34f-37b5-4c55-a122-0eb0cd0fe157	2e04dbca-2e3f-4a5e-ac18-129576f7aef1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyZTA0ZGJjYS0yZTNmLTRhNWUtYWMxOC0xMjk1NzZmN2FlZjEiLCJlbWFpbCI6ImFtbWFyb0BnbWFpbC5jb20iLCJyb2xlIjoiU1RVREVOVCIsInN0dWRlbnRJZCI6IjEyNTFmYmY0LWFhYjAtNDk2My04YzA0LWJmODAxOTcyNGU0ZSIsInRlYWNoZXJJZCI6bnVsbCwicGFyZW50SWQiOm51bGwsImlhdCI6MTc2NTg5MzczOSwiZXhwIjoxNzY2NDk4NTM5fQ.CrDy0g8Am6dxbeexx1vRbCWNExeKpHdvw6wCuxWCW3o	2025-12-23 14:02:19.111	\N	\N	2025-12-16 14:02:19.113
18e35782-d280-40ef-9ce4-f6778fdb9297	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjU4OTM5MDksImV4cCI6MTc2NjQ5ODcwOX0.oZ2VMuKqb_bqHNZnsDFIwDMqie_4wEMEZEwxOsSi0F4	2025-12-23 14:05:09.88	\N	\N	2025-12-16 14:05:09.881
5755568e-a535-4b2d-a5e3-02e41ff03e7e	de6a6cdb-65b7-410f-8908-54fd4e719d53	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZTZhNmNkYi02NWI3LTQxMGYtODkwOC01NGZkNGU3MTlkNTMiLCJlbWFpbCI6ImZhdGltYS50ZWFjaGVyQGZ1bmN0aW9uLmJoIiwicm9sZSI6IlRFQUNIRVIiLCJzdHVkZW50SWQiOm51bGwsInRlYWNoZXJJZCI6ImRkNzkxZTNhLTE2ODItNGJjZS1hNWNhLTI2ZTIyOTFjOGU1MiIsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjU4OTQwNjgsImV4cCI6MTc2NjQ5ODg2OH0.yANOjRBlAaSJnsckQvKehjfOgg3E7QpiHz-eLoZEWdg	2025-12-23 14:07:48.6	\N	\N	2025-12-16 14:07:48.602
62935949-a571-45a9-b4d3-bb51d53cf4df	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjU4OTQzNDAsImV4cCI6MTc2NjQ5OTE0MH0.MGxQ9LLotdL3Eh3Q77k_VTFauThbGuXAFdB-EvnYpxI	2025-12-23 14:12:20.641	\N	\N	2025-12-16 14:12:20.642
7132480a-99fd-41a9-8d96-eb9d4a9606c0	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjU4OTQ0MDAsImV4cCI6MTc2NjQ5OTIwMH0.vDKml6TN8sHmlxjhgYm6j-x22M4-X4QcHbpIGn4rBa4	2025-12-23 14:13:20.104	\N	\N	2025-12-16 14:13:20.105
a9695260-9f84-414a-9cb0-0db72a6a7447	2e04dbca-2e3f-4a5e-ac18-129576f7aef1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyZTA0ZGJjYS0yZTNmLTRhNWUtYWMxOC0xMjk1NzZmN2FlZjEiLCJlbWFpbCI6ImFtbWFyb0BnbWFpbC5jb20iLCJyb2xlIjoiU1RVREVOVCIsInN0dWRlbnRJZCI6IjEyNTFmYmY0LWFhYjAtNDk2My04YzA0LWJmODAxOTcyNGU0ZSIsInRlYWNoZXJJZCI6bnVsbCwicGFyZW50SWQiOm51bGwsImlhdCI6MTc2NTg5NDg0NSwiZXhwIjoxNzY2NDk5NjQ1fQ.YkKdQbEXoWVVO_v-IDSEEFptnpzXk3b_S2Q43DzGFZU	2025-12-23 14:20:45.523	\N	\N	2025-12-16 14:20:45.524
055eab0b-a8bd-47a1-b637-2062cf7c9dc1	de6a6cdb-65b7-410f-8908-54fd4e719d53	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZTZhNmNkYi02NWI3LTQxMGYtODkwOC01NGZkNGU3MTlkNTMiLCJlbWFpbCI6ImZhdGltYS50ZWFjaGVyQGZ1bmN0aW9uLmJoIiwicm9sZSI6IlRFQUNIRVIiLCJzdHVkZW50SWQiOm51bGwsInRlYWNoZXJJZCI6ImRkNzkxZTNhLTE2ODItNGJjZS1hNWNhLTI2ZTIyOTFjOGU1MiIsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjU4OTQ4NjQsImV4cCI6MTc2NjQ5OTY2NH0.qwSlYCa61cVyYccnqTe6WjjKjPhmvcj_zaLkHwHr2mE	2025-12-23 14:21:04.875	\N	\N	2025-12-16 14:21:04.877
50f3e29c-cc26-4083-98a9-2423237ef05e	2e04dbca-2e3f-4a5e-ac18-129576f7aef1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyZTA0ZGJjYS0yZTNmLTRhNWUtYWMxOC0xMjk1NzZmN2FlZjEiLCJlbWFpbCI6ImFtbWFyb0BnbWFpbC5jb20iLCJyb2xlIjoiU1RVREVOVCIsInN0dWRlbnRJZCI6IjEyNTFmYmY0LWFhYjAtNDk2My04YzA0LWJmODAxOTcyNGU0ZSIsInRlYWNoZXJJZCI6bnVsbCwicGFyZW50SWQiOm51bGwsImlhdCI6MTc2NTg5NDg5MSwiZXhwIjoxNzY2NDk5NjkxfQ.klrCHDZ1kBHBw-B5IyHH7YE5uytg2jmpuErrz7UxIlo	2025-12-23 14:21:31.834	\N	\N	2025-12-16 14:21:31.835
794a04dc-f4bc-48e4-9160-7fc68b6e5573	015ca870-ed1e-46bd-995e-8cc76cedce31	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwMTVjYTg3MC1lZDFlLTQ2YmQtOTk1ZS04Y2M3NmNlZGNlMzEiLCJlbWFpbCI6InBhcmVudEBnbWFpbC5jb20iLCJyb2xlIjoiUEFSRU5UIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjoiMmRmYmYzMmYtZWJjNC00YzIxLWFkMzktMTY1MTNiMDM3Y2ExIiwiaWF0IjoxNzY1ODk0OTE4LCJleHAiOjE3NjY0OTk3MTh9.cRTPcaUIWQNm8fOomkn2ZdkD-pq_tORxbMYLBHZo4a4	2025-12-23 14:21:58.215	\N	\N	2025-12-16 14:21:58.216
5d711c78-ecfa-400f-82d8-b85eb2606181	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjU4OTU4MDUsImV4cCI6MTc2NjUwMDYwNX0.LrXVL-eP8biPqP7SoQfPEd3QAbpjAjxSjF8MZPFWPjU	2025-12-23 14:36:45.189	\N	\N	2025-12-16 14:36:45.192
1f4fa93c-8314-4515-914b-0660b8adb2f9	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjU4OTk1NzUsImV4cCI6MTc2NjUwNDM3NX0.dlI6tcBb9tQk0ioIKPYJjRhYt0j67YbW7jOO4BNXEyQ	2025-12-23 15:39:35.303	\N	\N	2025-12-16 15:39:35.304
9fec4a0d-af2b-40b3-8be5-04f1a28cc8a8	de6a6cdb-65b7-410f-8908-54fd4e719d53	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZTZhNmNkYi02NWI3LTQxMGYtODkwOC01NGZkNGU3MTlkNTMiLCJlbWFpbCI6ImZhdGltYS50ZWFjaGVyQGZ1bmN0aW9uLmJoIiwicm9sZSI6IlRFQUNIRVIiLCJzdHVkZW50SWQiOm51bGwsInRlYWNoZXJJZCI6ImRkNzkxZTNhLTE2ODItNGJjZS1hNWNhLTI2ZTIyOTFjOGU1MiIsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjU5MTIzNjUsImV4cCI6MTc2NjUxNzE2NX0.OtmvYc7xesVs_iTLPD34-1q1MYL84F6HAH3IEHqOcS8	2025-12-23 19:12:45.589	\N	\N	2025-12-16 19:12:45.59
977837c3-605c-4977-815d-fae603993c00	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjU5MTcwNTksImV4cCI6MTc2NjUyMTg1OX0.4qU-lUqj6r3d107jWv4-DWBC-_ukRVjqLDDekg9PSQY	2025-12-23 20:30:59.717	\N	\N	2025-12-16 20:30:59.718
855d3843-8508-4c32-b442-a0433dc2e419	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjU5Nzc0NTQsImV4cCI6MTc2NjU4MjI1NH0.xL1wCoPSQjpQ0PC_PWG83QN1zU9RAFSMmDuuxmlcbCU	2025-12-24 13:17:34.909	\N	\N	2025-12-17 13:17:34.911
b3c8c9da-7dc7-4b38-8d34-7bd2abc61acf	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjYwNjQ0ODAsImV4cCI6MTc2NjY2OTI4MH0.TY3-zOJ4XhtpRJr8IaJXcYew9I9suKa6g0kFc4vn3AM	2025-12-25 13:28:00.472	\N	\N	2025-12-18 13:28:00.474
f68294cf-e15b-45d6-97f4-161eea05db14	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjYwNjQ3NDEsImV4cCI6MTc2NjY2OTU0MX0.k2VJpnD2U4obrGHo9EpgFJmbR9A-_BuVUjdfZnnmkoU	2025-12-25 13:32:21.327	\N	\N	2025-12-18 13:32:21.328
947b231a-d932-4f24-968f-332b67b27972	b2e0ef76-8efa-4a0b-82bd-16e3422bc3fd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiMmUwZWY3Ni04ZWZhLTRhMGItODJiZC0xNmUzNDIyYmMzZmQiLCJlbWFpbCI6IlFhc3NpbWFobWVkMjMxQGdtYWlsLmNvbSIsInJvbGUiOiJTVFVERU5UIiwic3R1ZGVudElkIjoiZDY3ZWExNjgtOTM3Yy00MjI5LWFiM2QtNmY2YWNmNzBkNDI4IiwidGVhY2hlcklkIjpudWxsLCJwYXJlbnRJZCI6bnVsbCwiaWF0IjoxNzY2MDczOTM5LCJleHAiOjE3NjY2Nzg3Mzl9.Qy75A-rCRdaMLDBUDvV4h7mL4FX58PuJwQRoMscMQQw	2025-12-25 16:05:39.043	\N	\N	2025-12-18 16:05:39.043
773076da-4f28-4bf9-8b08-0afa35be9f81	b2e0ef76-8efa-4a0b-82bd-16e3422bc3fd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiMmUwZWY3Ni04ZWZhLTRhMGItODJiZC0xNmUzNDIyYmMzZmQiLCJlbWFpbCI6IlFhc3NpbWFobWVkMjMxQGdtYWlsLmNvbSIsInJvbGUiOiJTVFVERU5UIiwic3R1ZGVudElkIjoiZDY3ZWExNjgtOTM3Yy00MjI5LWFiM2QtNmY2YWNmNzBkNDI4IiwidGVhY2hlcklkIjpudWxsLCJwYXJlbnRJZCI6bnVsbCwiaWF0IjoxNzY2MDc0MDEwLCJleHAiOjE3NjY2Nzg4MTB9.892576fmPTFkzdb5yddMOoCL7RKQVbM0_AnOstG9aqU	2025-12-25 16:06:50.938	\N	\N	2025-12-18 16:06:50.939
051dd633-7fe6-4db7-824c-15bd6a035777	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjYwNzQxMzQsImV4cCI6MTc2NjY3ODkzNH0.FAFSAFTPgbxCQMARU6sMyuIpdxOZIAqGbHwNLN6qERU	2025-12-25 16:08:54.095	\N	\N	2025-12-18 16:08:54.096
d848ee51-8404-43b3-95b2-7d8a633821ad	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjYwNzc4NTgsImV4cCI6MTc2NjY4MjY1OH0.GaT42uIdoXfTcNjeYxPcREFcS_3r-kXkILpzVlhoQNc	2025-12-25 17:10:58.899	\N	\N	2025-12-18 17:10:58.9
58b60c44-a294-421b-a4ff-d5a07a2534e2	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjYwNzg0OTksImV4cCI6MTc2NjY4MzI5OX0.oY-wSEAGi1cPdY0wkLvqJ8JJb07yL22XnsXKb1KaSGE	2025-12-25 17:21:39.468	\N	\N	2025-12-18 17:21:39.469
17841ceb-c179-44f7-9a45-eb389853a737	de6a6cdb-65b7-410f-8908-54fd4e719d53	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZTZhNmNkYi02NWI3LTQxMGYtODkwOC01NGZkNGU3MTlkNTMiLCJlbWFpbCI6ImZhdGltYS50ZWFjaGVyQGZ1bmN0aW9uLmJoIiwicm9sZSI6IlRFQUNIRVIiLCJzdHVkZW50SWQiOm51bGwsInRlYWNoZXJJZCI6ImRkNzkxZTNhLTE2ODItNGJjZS1hNWNhLTI2ZTIyOTFjOGU1MiIsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjYwODY4MDcsImV4cCI6MTc2NjY5MTYwN30.2HCRtjylDD6_nyEZeq_xThSAICQmZoDAybN-Rh4ejEs	2025-12-25 19:40:07.833	\N	\N	2025-12-18 19:40:07.834
4a49d612-a7ee-4ffb-bce3-0ee194122db6	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjYwODY4NDIsImV4cCI6MTc2NjY5MTY0Mn0.NHfSQPidLKonn-LX3bKrB7zQTAnEJ70zd8ADLiYSZyU	2025-12-25 19:40:42.148	\N	\N	2025-12-18 19:40:42.149
bcecfd69-ef65-427e-9133-be78468bbca5	b2e0ef76-8efa-4a0b-82bd-16e3422bc3fd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiMmUwZWY3Ni04ZWZhLTRhMGItODJiZC0xNmUzNDIyYmMzZmQiLCJlbWFpbCI6IlFhc3NpbWFobWVkMjMxQGdtYWlsLmNvbSIsInJvbGUiOiJTVFVERU5UIiwic3R1ZGVudElkIjoiZDY3ZWExNjgtOTM3Yy00MjI5LWFiM2QtNmY2YWNmNzBkNDI4IiwidGVhY2hlcklkIjpudWxsLCJwYXJlbnRJZCI6bnVsbCwiaWF0IjoxNzY2MDk4NjI1LCJleHAiOjE3NjY3MDM0MjV9.McBSJvKn4uNI3J8LUWpyAuG4NXKsITBTTnpJBweq_w8	2025-12-25 22:57:05.01	\N	\N	2025-12-18 22:57:05.011
52539af4-cda5-40b4-bb29-86b407d0c5ed	db412e3d-563d-43b1-aa12-dd1df03db412	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkYjQxMmUzZC01NjNkLTQzYjEtYWExMi1kZDFkZjAzZGI0MTIiLCJlbWFpbCI6Im1vaGFtbWVkLnN0dWRlbnRAdGVzdC5iaCIsInJvbGUiOiJTVFVERU5UIiwic3R1ZGVudElkIjoiNDVhOTE2NDYtZGI1Zi00YjA2LWI2NGUtOWEwMmE4NzUyMmFiIiwidGVhY2hlcklkIjpudWxsLCJwYXJlbnRJZCI6bnVsbCwiaWF0IjoxNzY2MDk4Njc0LCJleHAiOjE3NjY3MDM0NzR9.T5XpM1f9rNMFinPXdbp93KbuxqDnfA2lnpOmd2W1dC8	2025-12-25 22:57:54.785	\N	\N	2025-12-18 22:57:54.786
70be8046-9b2d-4893-9b56-47a049cdbfa7	0e82a0a0-d439-4401-98ac-5f2f612ba3ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTgyYTBhMC1kNDM5LTQ0MDEtOThhYy01ZjJmNjEyYmEzYWIiLCJlbWFpbCI6ImFkbWluQGZ1bmN0aW9uLmJoIiwicm9sZSI6IkFETUlOIiwic3R1ZGVudElkIjpudWxsLCJ0ZWFjaGVySWQiOm51bGwsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjYxNDMxOTIsImV4cCI6MTc2Njc0Nzk5Mn0.TS-ab1Yft5miOYdIsHjn7XNIwwO3uNLB7GJl7nettVA	2025-12-26 11:19:52.106	\N	\N	2025-12-19 11:19:52.107
375810cc-4331-42b9-bf80-5a453c63d2a4	de6a6cdb-65b7-410f-8908-54fd4e719d53	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZTZhNmNkYi02NWI3LTQxMGYtODkwOC01NGZkNGU3MTlkNTMiLCJlbWFpbCI6ImZhdGltYS50ZWFjaGVyQGZ1bmN0aW9uLmJoIiwicm9sZSI6IlRFQUNIRVIiLCJzdHVkZW50SWQiOm51bGwsInRlYWNoZXJJZCI6ImRkNzkxZTNhLTE2ODItNGJjZS1hNWNhLTI2ZTIyOTFjOGU1MiIsInBhcmVudElkIjpudWxsLCJpYXQiOjE3NjYxNTc1NDIsImV4cCI6MTc2Njc2MjM0Mn0.WxoY55D6_-MvK3_AroVoid0-7KnXgZnDSESxYr-Tvzg	2025-12-26 15:19:02.367	\N	\N	2025-12-19 15:19:02.368
bbae970c-4426-42d8-b71b-266e64afca53	554fe800-5b5d-4918-a8a0-45037debbe59	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTRmZTgwMC01YjVkLTQ5MTgtYThhMC00NTAzN2RlYmJlNTkiLCJlbWFpbCI6Im1vaGFtZWRhbG1hdHJvb2s3QGdtYWlsLmNvbSIsInJvbGUiOiJTVFVERU5UIiwic3R1ZGVudElkIjoiYWJiNjcyYmUtZTY3Yi00OGJiLTkwNWYtOTc0OGNmMWJiMDI1IiwidGVhY2hlcklkIjpudWxsLCJwYXJlbnRJZCI6bnVsbCwiaWF0IjoxNzY2MTU3Njk0LCJleHAiOjE3NjY3NjI0OTR9.HwTBekTs2-BjTkrhAqhkulpP6R3oidqhT9w2eYKQRBU	2025-12-26 15:21:34.616	\N	\N	2025-12-19 15:21:34.617
1a5ad918-d079-4241-9bba-f89abdee60d3	51cd0567-ed77-4810-b9d9-5c3a99a79791	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MWNkMDU2Ny1lZDc3LTQ4MTAtYjlkOS01YzNhOTlhNzk3OTEiLCJlbWFpbCI6Ikh1c2FpbkFOYWJpQGdtYWlsLmNvbSIsInJvbGUiOiJTVFVERU5UIiwic3R1ZGVudElkIjoiODQ0NmU4OTQtZjU4OC00NzBjLWExZWEtOWJlZjdiOTYyNDRjIiwidGVhY2hlcklkIjpudWxsLCJwYXJlbnRJZCI6bnVsbCwiaWF0IjoxNzY2MTU3ODI0LCJleHAiOjE3NjY3NjI2MjR9.9HbWzF1S3-_bYNgDdRvoZYczWeUlMLB-4lO6zzv1o34	2025-12-26 15:23:44.943	\N	\N	2025-12-19 15:23:44.944
\.


--
-- Data for Name: SpeakingSlot; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."SpeakingSlot" (id, "teacherId", "studentId", "testSessionId", "slotDate", "slotTime", "durationMinutes", status, feedback, "createdAt", "updatedAt", final_level, mcq_level, speaking_level) FROM stdin;
f249a6d0-1edb-43be-b3cb-eba21feae8b3	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-12	06:00:00	15	AVAILABLE	\N	2025-12-12 08:57:23.866	2025-12-12 08:57:23.866	\N	\N	\N
bff46ef9-2d48-44be-a152-01baac2e1b55	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-12	07:00:00	15	AVAILABLE	\N	2025-12-12 08:57:23.878	2025-12-12 08:57:23.878	\N	\N	\N
8c6a93fd-1a68-4bf2-9d08-04b3ddebee3c	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-12	08:00:00	15	AVAILABLE	\N	2025-12-12 08:57:23.879	2025-12-12 08:57:23.879	\N	\N	\N
bd7409ff-9773-46f5-9c8e-94aa8819e450	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-13	06:00:00	15	AVAILABLE	\N	2025-12-12 08:57:23.88	2025-12-12 08:57:23.88	\N	\N	\N
7ac38ff8-4c08-4011-96e4-1588aa3d3d7f	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-13	07:00:00	15	AVAILABLE	\N	2025-12-12 08:57:23.88	2025-12-12 08:57:23.88	\N	\N	\N
45f71975-a2db-4fb2-a9a1-e9c63e755e49	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-13	11:00:00	15	AVAILABLE	\N	2025-12-12 08:57:23.88	2025-12-12 08:57:23.88	\N	\N	\N
d06e358c-49f6-4b0b-8896-249e3cc80dae	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-14	06:00:00	15	AVAILABLE	\N	2025-12-12 08:57:23.881	2025-12-12 08:57:23.881	\N	\N	\N
c8fc3981-ce5f-456a-a6c2-95939b27f9c8	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-14	12:00:00	15	AVAILABLE	\N	2025-12-12 08:57:23.882	2025-12-12 08:57:23.882	\N	\N	\N
9c648a1f-e297-4bdd-b681-12c8a25bdfec	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-12	06:00:00	15	AVAILABLE	\N	2025-12-12 08:59:22.239	2025-12-12 08:59:22.239	\N	\N	\N
9064fb06-1f46-40f9-9571-125f70477b41	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-12	07:00:00	15	AVAILABLE	\N	2025-12-12 08:59:22.244	2025-12-12 08:59:22.244	\N	\N	\N
f58f1034-0582-4b7f-800f-ed11d4d2ac42	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-12	08:00:00	15	AVAILABLE	\N	2025-12-12 08:59:22.244	2025-12-12 08:59:22.244	\N	\N	\N
5e3a48b3-fc55-4000-bac6-4b50fc67c5f8	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-13	06:00:00	15	AVAILABLE	\N	2025-12-12 08:59:22.245	2025-12-12 08:59:22.245	\N	\N	\N
abc41e9a-2052-47cc-9ddb-3207612fe83b	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-13	07:00:00	15	AVAILABLE	\N	2025-12-12 08:59:22.245	2025-12-12 08:59:22.245	\N	\N	\N
56864a5f-c8b6-4611-afd4-a0534503f9df	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-13	11:00:00	15	AVAILABLE	\N	2025-12-12 08:59:22.246	2025-12-12 08:59:22.246	\N	\N	\N
8c485ee4-bb88-4c0d-a240-59e91f742261	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-14	06:00:00	15	AVAILABLE	\N	2025-12-12 08:59:22.246	2025-12-12 08:59:22.246	\N	\N	\N
d3329325-b0a5-4108-8267-355c95125bc3	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-14	12:00:00	15	AVAILABLE	\N	2025-12-12 08:59:22.247	2025-12-12 08:59:22.247	\N	\N	\N
403f77b3-51eb-4aff-a1cc-bf0e81c724cc	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-12	06:00:00	15	AVAILABLE	\N	2025-12-12 09:44:57.347	2025-12-12 09:44:57.347	\N	\N	\N
9d74ad0e-dcfa-46c0-ae8a-d2a378b7a54a	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-12	07:00:00	15	AVAILABLE	\N	2025-12-12 09:44:57.354	2025-12-12 09:44:57.354	\N	\N	\N
7467ed54-6c12-4a84-b844-6a6a452fa7b6	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-12	08:00:00	15	AVAILABLE	\N	2025-12-12 09:44:57.355	2025-12-12 09:44:57.355	\N	\N	\N
d0de87b4-8814-4da6-a93e-708035fb068f	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-13	06:00:00	15	AVAILABLE	\N	2025-12-12 09:44:57.355	2025-12-12 09:44:57.355	\N	\N	\N
28c53b4c-44c4-443e-b928-9f067ec4f57d	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-13	07:00:00	15	AVAILABLE	\N	2025-12-12 09:44:57.356	2025-12-12 09:44:57.356	\N	\N	\N
fbec8390-55a8-4ec0-a764-ad5b5cb5bf00	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-13	11:00:00	15	AVAILABLE	\N	2025-12-12 09:44:57.356	2025-12-12 09:44:57.356	\N	\N	\N
1a15d207-20ce-4bfe-aaac-83380faba9d7	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-14	06:00:00	15	AVAILABLE	\N	2025-12-12 09:44:57.356	2025-12-12 09:44:57.356	\N	\N	\N
78b97e75-3268-40c3-af3c-717ed770ebb3	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-14	12:00:00	15	AVAILABLE	\N	2025-12-12 09:44:57.357	2025-12-12 09:44:57.357	\N	\N	\N
539da6cd-4cc3-4cf4-9b11-f2c7da07d54d	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-12	06:00:00	15	AVAILABLE	\N	2025-12-12 09:58:49.623	2025-12-12 09:58:49.623	\N	\N	\N
ed51533d-c9ed-4fff-ba37-36f7610f06b9	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-12	07:00:00	15	AVAILABLE	\N	2025-12-12 09:58:49.63	2025-12-12 09:58:49.63	\N	\N	\N
2c6dce29-ad1a-44ef-8979-8374a52b0fa4	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-12	08:00:00	15	AVAILABLE	\N	2025-12-12 09:58:49.631	2025-12-12 09:58:49.631	\N	\N	\N
d1c4cfb1-7d21-41a9-9166-2e7581b4388b	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-13	06:00:00	15	AVAILABLE	\N	2025-12-12 09:58:49.631	2025-12-12 09:58:49.631	\N	\N	\N
eda1e27f-b45d-489d-8654-238d1a115bef	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-13	07:00:00	15	AVAILABLE	\N	2025-12-12 09:58:49.632	2025-12-12 09:58:49.632	\N	\N	\N
204dc93a-497b-4d3c-9cac-ffee26b385f5	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-13	11:00:00	15	AVAILABLE	\N	2025-12-12 09:58:49.633	2025-12-12 09:58:49.633	\N	\N	\N
edb89ab4-965c-4c16-a724-12fe3bf77193	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-14	06:00:00	15	AVAILABLE	\N	2025-12-12 09:58:49.633	2025-12-12 09:58:49.633	\N	\N	\N
c32b44e4-b116-4876-a136-2158dc89e462	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-14	12:00:00	15	AVAILABLE	\N	2025-12-12 09:58:49.634	2025-12-12 09:58:49.634	\N	\N	\N
797f9d4e-7ddc-4e20-88e5-ae5ee5f95a92	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-12	06:00:00	15	AVAILABLE	\N	2025-12-12 10:03:14.003	2025-12-12 10:03:14.003	\N	\N	\N
54a24450-97cf-44c7-9e1a-cfa0635f1f78	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-12	07:00:00	15	AVAILABLE	\N	2025-12-12 10:03:14.012	2025-12-12 10:03:14.012	\N	\N	\N
4145b623-8ae7-4fd5-b55c-f173bcee765f	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-12	08:00:00	15	AVAILABLE	\N	2025-12-12 10:03:14.013	2025-12-12 10:03:14.013	\N	\N	\N
cd578554-0ec3-4839-b3a1-ed36a493dea0	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-13	06:00:00	15	AVAILABLE	\N	2025-12-12 10:03:14.013	2025-12-12 10:03:14.013	\N	\N	\N
b5afc809-bc92-4294-b500-e08587431728	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-13	07:00:00	15	AVAILABLE	\N	2025-12-12 10:03:14.013	2025-12-12 10:03:14.013	\N	\N	\N
046d6e01-1002-42ca-ae73-ed25c1a4c20c	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-13	11:00:00	15	AVAILABLE	\N	2025-12-12 10:03:14.014	2025-12-12 10:03:14.014	\N	\N	\N
7c2f74eb-fcad-45d5-ad9a-ef44fb11149f	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-14	06:00:00	15	AVAILABLE	\N	2025-12-12 10:03:14.014	2025-12-12 10:03:14.014	\N	\N	\N
3d9bc5f3-154b-4fd8-8504-c1e6366028a1	46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	\N	\N	2025-12-14	12:00:00	15	AVAILABLE	\N	2025-12-12 10:03:14.015	2025-12-12 10:03:14.015	\N	\N	\N
e5d6f4e5-ffb0-4034-86c6-e2c9314c7b63	dd791e3a-1682-4bce-a5ca-26e2291c8e52	\N	\N	2025-12-12	07:00:00	15	AVAILABLE	\N	2025-12-12 10:03:14.016	2025-12-12 10:03:14.016	\N	\N	\N
9a75d038-2c36-41b0-a92c-54588223c0aa	dd791e3a-1682-4bce-a5ca-26e2291c8e52	\N	\N	2025-12-12	08:00:00	15	AVAILABLE	\N	2025-12-12 10:03:14.016	2025-12-12 10:03:14.016	\N	\N	\N
9d1a86f1-54e1-47d5-8ef0-1f8c4acaa3f3	dd791e3a-1682-4bce-a5ca-26e2291c8e52	\N	\N	2025-12-12	06:00:00	15	AVAILABLE	\N	2025-12-12 10:03:14.015	2025-12-12 17:46:28.354	\N	\N	\N
95ae02d7-865e-45f5-bb42-5439ef5e5572	dd791e3a-1682-4bce-a5ca-26e2291c8e52	5d154f79-4d16-4f45-a4f9-0f7a9b0bc9a0	a88f9d0f-cc75-4f6f-a98a-348ed0e2766d	2025-12-13	07:00:00	15	COMPLETED	hello ammar	2025-12-12 10:03:14.017	2025-12-13 09:48:49.817	C1	C2	C1
fa5ffebe-7743-4b38-be8a-5d1f1600910c	dd791e3a-1682-4bce-a5ca-26e2291c8e52	abb672be-e67b-48bb-905f-9748cf1bb025	d208002d-8f21-40b9-9fd4-af81b9fee3f9	2025-12-14	12:00:00	15	COMPLETED	hala good boy	2025-12-12 10:03:14.018	2025-12-15 23:03:16.312	C1	C1	C1
212cbc76-a2d6-4c06-a87f-97bbc50a7453	dd791e3a-1682-4bce-a5ca-26e2291c8e52	1251fbf4-aab0-4963-8c04-bf8019724e4e	07dd5fce-3a38-484e-9d87-17d44bdfabaa	2025-12-13	11:00:00	15	COMPLETED	sad	2025-12-12 10:03:14.017	2025-12-16 14:21:15.918	C2	C2	C2
\.


--
-- Data for Name: Student; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Student" (id, "userId", cpr, "firstName", "createdAt", area, block, "dateOfBirth", email, gender, "healthIssues", "houseNo", "howHeardAbout", "isActive", "needsTransport", notes, "preferredCenter", "preferredTiming", "referralPerson", road, "schoolType", "schoolYear", "secondName", "thirdName", "updatedAt", "canSeePayment", current_level, "profilePicture") FROM stdin;
45a91646-db5f-4b06-b64e-9a02a87522ab	db412e3d-563d-43b1-aa12-dd1df03db412	090310789	Mohammed	2025-12-05 10:55:19.225	\N	\N	2009-03-10	\N	MALE	\N	\N	\N	t	f	\N	\N	\N	\N	\N	\N	\N	Khalid	\N	2025-12-05 10:55:19.225	t	\N	\N
23659842-a120-4a96-a1e5-a93640df479a	85e1bf7e-b3ce-43a8-98c2-c19fd81535ab	121105234	Layla	2025-12-05 10:55:19.225	\N	\N	2012-11-05	\N	FEMALE	\N	\N	\N	t	f	\N	\N	\N	\N	\N	\N	\N	Ibrahim	\N	2025-12-05 10:55:19.225	t	\N	\N
8446e894-f588-470c-a1ea-9bef7b96244c	51cd0567-ed77-4810-b9d9-5c3a99a79791	767676767	Husain	2025-12-05 18:36:27.121	\N	\N	2004-06-04	HusainANabi@gmail.com	MALE	\N	\N	\N	t	f	\N	\N	\N	\N	\N	\N	\N			2025-12-05 18:37:35.829	t	A2	\N
55c67647-1f27-4f79-9298-75318c927485	b2e4046c-82bd-4afe-9022-5fdd74773011	000000092	Matrook	2025-12-08 14:23:57.594	\N	\N	2002-01-01	ahmedahmed@gmail.com	MALE	\N	\N	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-08 14:23:57.594	t	\N	\N
d67ea168-937c-4229-ab3d-6f6acf70d428	b2e0ef76-8efa-4a0b-82bd-16e3422bc3fd	040704734	Sayed Qassim	2025-12-12 08:01:19.14	\N	\N	2004-01-01	Qassimahmed231@gmail.com	MALE	\N	\N	\N	t	f	\N	\N	\N	\N	\N	\N	\N			2025-12-13 09:48:05.579	t	C2	/uploads/students/student_d67ea168-937c-4229-ab3d-6f6acf70d428_1765562630269.jpeg
5d154f79-4d16-4f45-a4f9-0f7a9b0bc9a0	4d2eff46-3148-4151-a909-1c88b2dde123	050109537	Ammaro	2025-12-13 09:40:33.34	\N	\N	2005-01-01	ammar@gmail.com	MALE	\N	\N	\N	t	f	\N	\N	\N	\N	\N	\N	\N	Mohsen	Hassan	2025-12-13 10:32:51.589	t	C1	\N
a0ab7534-1025-4f52-aeff-f96b83c49352	d56d6057-c762-4845-843b-02c8414113e8	100515123	Ali	2025-12-05 10:55:19.223	\N	\N	2010-05-15	\N	MALE	\N	\N	\N	t	f	\N	\N	\N	\N	\N	\N	\N	Mohammed	\N	2025-12-05 10:55:19.223	t	\N	\N
0749ca86-8510-4ea2-9a26-624f338f4f07	afbc161c-a882-49b6-9763-b8f45cd83736	110822456	Sara	2025-12-05 10:55:19.225	\N	\N	2011-08-22	\N	FEMALE	\N	\N	\N	t	f	\N	\N	\N	\N	\N	\N	\N	Ahmed	\N	2025-12-05 10:55:19.225	t	\N	\N
fda21647-8750-4c9c-9634-24a6729e2193	5f63c10d-78b6-4c3d-a116-4d8f772eeb80	129358390	mohammed	2025-12-13 10:34:05.289	\N	\N	2002-10-15	mohammedA@gmail.com	MALE	\N	\N	\N	t	f	\N	\N	\N	\N	\N	\N	\N	aqeel	almatrook	2025-12-15 21:49:30.575	t	A2	\N
abb672be-e67b-48bb-905f-9748cf1bb025	554fe800-5b5d-4918-a8a0-45037debbe59	918236897	ali	2025-12-15 22:59:23.527	\N	\N	2003-11-12	mohamedalmatrook7@gmail.com	MALE	\N	\N	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-15 23:03:16.323	t	C1	\N
1251fbf4-aab0-4963-8c04-bf8019724e4e	2e04dbca-2e3f-4a5e-ac18-129576f7aef1	324324234	ammar	2025-12-16 14:02:15.751	\N	\N	2007-06-16	ammaro@gmail.com	MALE	\N	\N	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-16 14:21:15.93	t	C2	\N
\.


--
-- Data for Name: StudentCriteriaCompletion; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."StudentCriteriaCompletion" (id, "studentId", "criteriaId", "enrollmentId", completed, "completedAt", "createdAt") FROM stdin;
6ace982a-857a-4396-ac81-466acf187317	fda21647-8750-4c9c-9634-24a6729e2193	2d801df0-b3fa-4888-a5c5-a84a8295c747	4f65596c-a70e-4b2e-acf0-d6ab6251f40e	f	2025-12-14 11:09:02.609	2025-12-14 11:09:02.61
b6f5e685-e280-4d7e-8182-2a61a86941eb	23659842-a120-4a96-a1e5-a93640df479a	b93766f7-df63-4496-a4e3-886717059f51	8c725468-d781-4cd1-99d0-9928d84bcef4	f	2025-12-14 11:09:23.949	2025-12-14 11:09:23.95
97c074e6-6eac-4c2e-b648-3eee943087d1	23659842-a120-4a96-a1e5-a93640df479a	2d801df0-b3fa-4888-a5c5-a84a8295c747	8c725468-d781-4cd1-99d0-9928d84bcef4	f	2025-12-14 11:09:23.955	2025-12-14 11:09:23.955
60d4fec3-e057-4b94-a956-02a11f206018	23659842-a120-4a96-a1e5-a93640df479a	e46fd64c-d6b7-40ac-8191-d8e0aac0b1aa	8c725468-d781-4cd1-99d0-9928d84bcef4	f	2025-12-14 11:09:23.958	2025-12-14 11:09:23.959
485fefaa-a03f-4cca-b5f3-4b5a7f2b5a37	23659842-a120-4a96-a1e5-a93640df479a	b885f77e-8c9c-4790-8bc7-46d67dbc57be	8c725468-d781-4cd1-99d0-9928d84bcef4	f	2025-12-14 11:09:23.96	2025-12-14 11:09:23.961
cea58f22-6edd-4c34-89dc-c14e39035a8f	23659842-a120-4a96-a1e5-a93640df479a	5344f62f-7561-437d-828f-c4b31b0ca9ac	8c725468-d781-4cd1-99d0-9928d84bcef4	f	2025-12-14 11:09:23.963	2025-12-14 11:09:23.964
e4d33b83-e1b8-4669-b380-d205c37a3f04	fda21647-8750-4c9c-9634-24a6729e2193	b93766f7-df63-4496-a4e3-886717059f51	4f65596c-a70e-4b2e-acf0-d6ab6251f40e	t	2025-12-14 11:20:11.618	2025-12-14 11:09:02.579
f23f85be-9aaa-487d-83ee-342ad6d218aa	fda21647-8750-4c9c-9634-24a6729e2193	e46fd64c-d6b7-40ac-8191-d8e0aac0b1aa	4f65596c-a70e-4b2e-acf0-d6ab6251f40e	t	2025-12-14 11:20:23.806	2025-12-14 11:09:02.613
577147d8-cb2d-4352-a0e2-27736e62112f	fda21647-8750-4c9c-9634-24a6729e2193	b885f77e-8c9c-4790-8bc7-46d67dbc57be	4f65596c-a70e-4b2e-acf0-d6ab6251f40e	t	2025-12-14 11:20:23.81	2025-12-14 11:09:02.614
efe80802-845b-4b91-92df-7e4da5d9fea8	fda21647-8750-4c9c-9634-24a6729e2193	5344f62f-7561-437d-828f-c4b31b0ca9ac	4f65596c-a70e-4b2e-acf0-d6ab6251f40e	t	2025-12-15 22:33:47.736	2025-12-14 11:09:02.617
\.


--
-- Data for Name: StudentPaymentPlan; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."StudentPaymentPlan" (id, "enrollmentId", "totalAmount", "discountAmount", "discountReason", "finalAmount", "totalInstallments", status, "createdAt", "updatedAt") FROM stdin;
715c36e8-c268-42b4-9a8f-dd50a781a41a	10e48ef2-712b-435d-9e03-196b957a49d7	500.00	0.00	\N	500.00	3	ACTIVE	2025-12-05 10:55:19.233	2025-12-05 10:55:19.233
cb9d4a7d-19ed-4f7b-ae6a-2f87692e4dd4	77bfffa9-5176-4501-b41a-bf228ef16e3e	450.00	50.00	10% early bird discount	400.00	2	ACTIVE	2025-12-05 10:55:19.236	2025-12-05 10:55:19.236
ad915dba-cc39-4b26-be56-64eb7ec73d15	bb2c135a-61b1-4bc5-8d62-ae90f4635d30	600.00	0.00	\N	600.00	4	ACTIVE	2025-12-05 10:55:19.237	2025-12-05 10:55:19.237
fce09de2-fab6-47ae-bab6-99035e1ebd6a	8c725468-d781-4cd1-99d0-9928d84bcef4	550.00	100.00	Full payment discount	450.00	1	COMPLETED	2025-12-05 10:55:19.239	2025-12-05 10:55:19.239
dedf3123-435a-449d-b96b-8b105739e12b	53935fbc-bd45-4fa9-8e5a-e9170d0b60ae	450.00	0.00		450.00	1	COMPLETED	2025-12-07 20:27:49.954	2025-12-15 21:12:21.743
c37d16f1-aa48-498c-bf2c-d5365601d071	6c8e1a2a-7d62-4a26-ab16-4d62d33779de	999.00	500.00	bro	499.00	4	ACTIVE	2025-12-15 21:13:02.579	2025-12-15 21:13:02.579
6105db4c-3e3e-491a-9df6-6d4c696bcc96	4f65596c-a70e-4b2e-acf0-d6ab6251f40e	1000.00	999.00	my brother	1.00	1	COMPLETED	2025-12-15 22:05:33.765	2025-12-15 22:42:43.647
3ab0f4fa-6583-49de-9b0b-017b29362eea	a723fdb3-f3e2-40af-b37a-21aa3e35c717	100.00	50.00	my friend	50.00	4	ACTIVE	2025-12-16 14:16:43.913	2025-12-16 14:16:43.913
\.


--
-- Data for Name: Teacher; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Teacher" (id, "userId", "firstName", "lastName", specialization, "isActive", "availableForSpeakingTests", "createdAt", "updatedAt") FROM stdin;
46f1ffc0-83f3-41a6-8b09-e91d9ce7950e	d24c6b10-90e0-4e44-8d69-58e0142ddb69	Ahmed	Hassan	English Language Teaching	t	t	2025-12-05 10:55:19.221	2025-12-05 10:55:19.221
dd791e3a-1682-4bce-a5ca-26e2291c8e52	de6a6cdb-65b7-410f-8908-54fd4e719d53	Fatima	Ali	IELTS Preparation	t	t	2025-12-05 10:55:19.222	2025-12-16 18:06:21.146
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
\.


--
-- Data for Name: Term; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Term" (id, "programId", name, "startDate", "endDate", "isCurrent", "isActive", "createdAt") FROM stdin;
9c40be5f-e0a4-488d-b81b-42bb95dff258	ab0b0987-3bc8-4e5a-9a4f-76060f2395ef	Winter 2024	2024-12-01	2025-02-28	t	t	2025-12-05 10:55:19.227
c9e2d21a-6df8-4c23-ae1d-d293458796e7	6d0f16b9-876d-450c-8b59-55017123ab4f	fall 2026	2025-12-08	2026-01-13	f	t	2025-12-08 14:07:47.184
7882279a-e1ea-4538-9fb2-8dba4714aa79	e3618a76-d028-4108-8f34-8308f1f94f26	Fall 2024	2024-09-01	2024-12-20	t	t	2025-12-11 22:57:45.518
7f796481-5f1e-421a-8500-1e4da591d3e2	e3618a76-d028-4108-8f34-8308f1f94f26	Spring 2025	2025-01-05	2025-04-30	f	t	2025-12-11 22:57:45.518
eb75db32-8987-46c2-bd8d-ee69beeccec3	dc00580a-2cfd-43ac-a2b2-ae58cf7befbc	Fall 2024	2024-09-01	2024-12-20	t	t	2025-12-11 22:57:45.518
bd0e8d96-54b6-48cd-88c8-0ad00266867e	dc00580a-2cfd-43ac-a2b2-ae58cf7befbc	Spring 2025	2025-01-05	2025-04-30	f	t	2025-12-11 22:57:45.519
12366a45-a8f4-442d-a915-a023ac05764c	73b49812-bb45-403f-ba98-932dcae75832	Fall 2024	2024-09-01	2024-12-20	t	t	2025-12-11 22:57:45.519
5b6e05cb-a052-4e49-9b83-26b9f662331e	73b49812-bb45-403f-ba98-932dcae75832	Spring 2025	2025-01-05	2025-04-30	f	t	2025-12-11 22:57:45.52
4e79d9ea-5461-4e43-9f1f-9bef2dcec247	7d11ad93-7045-49d9-9d49-2b36bec91b04	Fall 2024	2024-09-01	2024-12-20	t	t	2025-12-11 22:57:45.521
4560ec09-fffa-4376-9b86-cedb51d9fee5	7d11ad93-7045-49d9-9d49-2b36bec91b04	Spring 2025	2025-01-05	2025-04-30	f	t	2025-12-11 22:57:45.521
cf9af2c1-2e42-41cc-b4e6-f394a9b053b7	340a0276-369f-4698-b4ff-0062a5fdb0db	Fall 2024	2024-09-01	2024-12-20	t	t	2025-12-11 22:57:45.521
9e69defc-4bab-46bb-9771-879dc6bc14a0	340a0276-369f-4698-b4ff-0062a5fdb0db	Spring 2025	2025-01-05	2025-04-30	f	t	2025-12-11 22:57:45.521
234fd237-829d-4a9f-9d05-fcbee2e3714c	340a0276-369f-4698-b4ff-0062a5fdb0db	Fall 2025	2025-12-13	2025-12-31	f	f	2025-12-13 10:40:34.662
5b552771-c4e9-4eb7-aff9-8838b1444c0b	ab0b0987-3bc8-4e5a-9a4f-76060f2395ef	fff	2025-12-16	2025-12-18	f	t	2025-12-15 21:56:00.344
55646c3c-2e07-4f88-9d4b-5e47d4506912	6cbcecf8-9fc7-4e89-b496-011bc02293ed	Fall 2024	2024-09-01	2024-12-20	f	t	2025-12-11 22:57:45.515
32c5c9ed-a8e2-4516-a22e-426f31d66033	6cbcecf8-9fc7-4e89-b496-011bc02293ed	Spring 2025	2025-01-05	2025-04-30	t	t	2025-12-11 22:57:45.517
\.


--
-- Data for Name: Test; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Test" (id, name, "testType", "levelId", "totalQuestions", "durationMinutes", "isActive", "createdAt") FROM stdin;
8b5854d1-b29c-43ac-9af9-acde4ff2ce35	English Placement Test (A1-C2)	PLACEMENT	\N	50	60	t	2025-12-11 22:57:45.522
f14de4b3-dcd1-4a33-a5b9-baba33341335	A1 Grammar and Vocabulary Test	WRITTEN	6be96096-8c5c-42f2-8f54-97391d9588bc	8	45	t	2025-12-12 08:16:21.417
5d9e0c18-85a3-4e15-934c-5c266754c02b	A1 Level Placement Test	PLACEMENT	6be96096-8c5c-42f2-8f54-97391d9588bc	10	30	t	2025-12-12 08:37:05.952
\.


--
-- Data for Name: TestQuestion; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."TestQuestion" (id, "testId", "questionText", "questionType", options, "correctAnswer", points, "orderNumber", "createdAt") FROM stdin;
6dc79157-6601-4afb-805d-e1d05d5d0954	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	I ___ a student.	MULTIPLE_CHOICE	["am", "is", "are", "be"]	am	1	1	2025-12-11 22:57:45.523
75eea22b-0a63-4a30-a7d8-9116013f91e6	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	She ___ from England.	MULTIPLE_CHOICE	["am", "is", "are", "be"]	is	1	2	2025-12-11 22:57:45.525
e0495f96-633f-4be1-a374-5e94d176b69c	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	We ___ happy.	MULTIPLE_CHOICE	["am", "is", "are", "be"]	are	1	3	2025-12-11 22:57:45.526
b7e6888b-6b5e-442e-b899-7d6e465e8e4a	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	This ___ my book.	MULTIPLE_CHOICE	["am", "is", "are", "be"]	is	1	4	2025-12-11 22:57:45.526
daba12ac-8e96-46b5-8fb2-f37afb9eb861	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	They ___ teachers.	MULTIPLE_CHOICE	["am", "is", "are", "be"]	are	1	5	2025-12-11 22:57:45.526
b26d0f61-9c47-421d-af71-f8ff497bf668	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	What ___ your name?	MULTIPLE_CHOICE	["am", "is", "are", "be"]	is	1	6	2025-12-11 22:57:45.526
aa6585a1-1ad5-47bd-9dcf-2865ceab88c7	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	I ___ water every day.	MULTIPLE_CHOICE	["drink", "drinks", "drinking", "drank"]	drink	1	7	2025-12-11 22:57:45.527
da760aca-6642-4c4e-af7f-696367db6df7	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	She ___ to school.	MULTIPLE_CHOICE	["go", "goes", "going", "went"]	goes	1	8	2025-12-11 22:57:45.527
0236af95-9b04-4784-a579-4382d296feee	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	The cat ___ on the table.	MULTIPLE_CHOICE	["is", "are", "am", "be"]	is	1	9	2025-12-11 22:57:45.527
a519a8d3-2de8-4c7d-a521-2bc71c6cc4c1	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	There ___ seven days in a week.	MULTIPLE_CHOICE	["is", "are", "am", "was"]	are	1	10	2025-12-11 22:57:45.528
02ff7e4d-6464-4b18-a6d3-67132c1df66b	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	He ___ a car.	MULTIPLE_CHOICE	["have", "has", "having", "had"]	has	1	11	2025-12-11 22:57:45.528
c1fbdd48-dedb-4acd-a8de-8e9c91a93ef1	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	We ___ English.	MULTIPLE_CHOICE	["study", "studies", "studying", "studied"]	study	1	12	2025-12-11 22:57:45.528
3bcfa37c-188b-4391-8e57-1667fc621595	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	The book ___ on the table.	MULTIPLE_CHOICE	["is", "are", "am", "be"]	is	1	13	2025-12-11 22:57:45.528
2415a213-e811-406d-864a-14ca8e0eec2b	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	I ___ coffee.	MULTIPLE_CHOICE	["like", "likes", "liking", "liked"]	like	1	14	2025-12-11 22:57:45.529
175bddd0-1287-41f4-bde0-e0224f0784f6	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	She ___ at home.	MULTIPLE_CHOICE	["is", "are", "am", "be"]	is	1	15	2025-12-11 22:57:45.53
47311656-2743-4629-8b10-76f68399b410	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	You ___ my friend.	MULTIPLE_CHOICE	["is", "are", "am", "be"]	are	1	16	2025-12-11 22:57:45.53
41dc0e09-5f08-458d-ae96-dfe95e1d394e	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	The dog ___ brown.	MULTIPLE_CHOICE	["is", "are", "am", "be"]	is	1	17	2025-12-11 22:57:45.531
7d0b843d-784a-4dfb-9491-ed9512654c28	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	Children ___ in the park.	MULTIPLE_CHOICE	["play", "plays", "playing", "played"]	play	1	18	2025-12-11 22:57:45.531
28e6e5d2-d247-4003-9864-c43ef812b40e	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	Yesterday, I ___ to the park.	MULTIPLE_CHOICE	["go", "goes", "went", "going"]	went	1	19	2025-12-11 22:57:45.531
40063434-1b13-450a-ac6f-1855246da58a	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	She ___ TV now.	MULTIPLE_CHOICE	["watch", "watches", "is watching", "watched"]	is watching	1	20	2025-12-11 22:57:45.532
c38bdead-817b-4f57-99c3-fc94246625c8	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	I ___ breakfast at 7 AM every day.	MULTIPLE_CHOICE	["have", "has", "having", "had"]	have	1	21	2025-12-11 22:57:45.532
63389088-a6c2-46d7-a81b-0b20175de944	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	There ___ many people in the room.	MULTIPLE_CHOICE	["is", "are", "was", "were"]	are	1	22	2025-12-11 22:57:45.532
6eeff545-6479-4a9d-a3cc-3c2b1e2e6a55	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	I need ___ apple.	MULTIPLE_CHOICE	["a", "an", "the", "some"]	an	1	23	2025-12-11 22:57:45.533
530baddf-770d-4b9b-9fdd-aa0193897092	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	She is ___ than her sister.	MULTIPLE_CHOICE	["tall", "taller", "tallest", "more tall"]	taller	1	24	2025-12-11 22:57:45.533
ad587fc5-9050-4205-94ac-0c566aa477c2	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	We ___ to London last year.	MULTIPLE_CHOICE	["travel", "travels", "traveled", "traveling"]	traveled	1	25	2025-12-11 22:57:45.534
41e6c08e-3dbc-4f6a-8836-8aa89ff5eed3	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	If I ___ you, I would study harder.	MULTIPLE_CHOICE	["am", "was", "were", "be"]	were	1	26	2025-12-11 22:57:45.534
d239f833-24a3-4141-b7d6-e1a04b7004fe	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	She ___ here for five years.	MULTIPLE_CHOICE	["lives", "is living", "has lived", "lived"]	has lived	1	27	2025-12-11 22:57:45.535
a6533947-a989-4799-968d-b157455379c6	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	The book ___ by millions of people.	MULTIPLE_CHOICE	["reads", "is reading", "has been read", "was reading"]	has been read	1	28	2025-12-11 22:57:45.535
68fa4ce6-4182-4882-bbbb-baa2fef6a058	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	I wish I ___ more time.	MULTIPLE_CHOICE	["have", "has", "had", "having"]	had	1	29	2025-12-11 22:57:45.535
a4b9b461-3051-4090-9f04-745bd0e4e21e	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	By the time you arrive, I ___ dinner.	MULTIPLE_CHOICE	["finish", "finished", "will finish", "will have finished"]	will have finished	1	30	2025-12-11 22:57:45.536
ae905e88-16f9-44ed-90e1-efe27f046c24	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	She suggested ___ early.	MULTIPLE_CHOICE	["leave", "to leave", "leaving", "left"]	leaving	1	31	2025-12-11 22:57:45.536
26ed3c40-46de-4f2a-951d-a1b21c369707	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	I am used to ___ up early.	MULTIPLE_CHOICE	["wake", "waking", "woke", "woken"]	waking	1	32	2025-12-11 22:57:45.536
d48c210d-40cb-4d49-877d-401ca6fab8c1	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	Had I known, I ___ differently.	MULTIPLE_CHOICE	["act", "acted", "would act", "would have acted"]	would have acted	1	33	2025-12-11 22:57:45.536
64aa89aa-9736-429c-817f-1e021c8ec5d3	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	She ___ working when I called.	MULTIPLE_CHOICE	["is", "was", "has been", "had been"]	had been	1	34	2025-12-11 22:57:45.537
f49ef49c-dbab-4c04-b472-6b379e676b0f	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	The proposal ___ by the committee next week.	MULTIPLE_CHOICE	["reviews", "reviewed", "will be reviewed", "has reviewed"]	will be reviewed	1	35	2025-12-11 22:57:45.537
35594b08-2dbc-48d5-b820-928b2b21bbab	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	Not only ___ late, but he also forgot the documents.	MULTIPLE_CHOICE	["he was", "was he", "he is", "is he"]	was he	1	36	2025-12-11 22:57:45.538
6943cefc-8d54-48ca-aed0-e1514e95ba1e	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	I would rather you ___ that.	MULTIPLE_CHOICE	["not do", "didn't do", "don't do", "not did"]	didn't do	1	37	2025-12-11 22:57:45.538
2b132564-f057-4ca6-a6d7-fd9f5bcc8ad6	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	By this time tomorrow, we ___ the project.	MULTIPLE_CHOICE	["complete", "completed", "will complete", "will have completed"]	will have completed	1	38	2025-12-11 22:57:45.538
9e4d1687-339e-4eb3-b2eb-c9aec1ea54ef	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	___ the weather, we decided to cancel the trip.	MULTIPLE_CHOICE	["Despite", "Although", "Given", "However"]	Given	1	39	2025-12-11 22:57:45.538
63fc7312-59b5-406f-bf6b-85987499f08d	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	Seldom ___ such dedication.	MULTIPLE_CHOICE	["I have seen", "have I seen", "I saw", "did I see"]	have I seen	1	40	2025-12-11 22:57:45.539
890c89be-a8be-4d49-b00e-3937c12b5226	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	The research ___ considerable insight.	MULTIPLE_CHOICE	["yielded", "produced", "generated", "made"]	yielded	1	41	2025-12-11 22:57:45.539
790047ad-c1e1-4928-afa5-bd472a0db46c	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	She spoke with such ___ that everyone was convinced.	MULTIPLE_CHOICE	["eloquence", "fluency", "clarity", "precision"]	eloquence	1	42	2025-12-11 22:57:45.539
966d78bc-3c88-4492-af25-aef7cd4a3cdb	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	___ circumstances would I agree to that.	MULTIPLE_CHOICE	["Under no", "In no", "At no", "On no"]	Under no	1	43	2025-12-11 22:57:45.539
750d946f-734d-4bf0-a57a-a98f611f31b1	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	The solution proved to be rather ___.	MULTIPLE_CHOICE	["elusive", "illusive", "exclusive", "inclusive"]	elusive	1	44	2025-12-11 22:57:45.54
a8de1260-80cd-45d7-b1cb-1e7b09715919	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	His argument was ___ by substantial evidence.	MULTIPLE_CHOICE	["corroborated", "collaborated", "cooperated", "coordinated"]	corroborated	1	45	2025-12-11 22:57:45.54
9e4e509c-fdc3-41d6-ad31-c205493a5cc2	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	The policy had far-reaching ___.	MULTIPLE_CHOICE	["ramifications", "complications", "implications", "specifications"]	ramifications	1	46	2025-12-11 22:57:45.54
49f4c64f-3193-4b75-aa0f-5420594393cb	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	The scholarly work exemplifies ___ erudition.	MULTIPLE_CHOICE	["profound", "deep", "intense", "strong"]	profound	1	47	2025-12-11 22:57:45.541
2343761f-9e1c-4907-9021-e2111a02591d	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	Her dissertation ___ new ground in the field.	MULTIPLE_CHOICE	["broke", "made", "took", "found"]	broke	1	48	2025-12-11 22:57:45.541
9dab0974-b336-4be3-9505-87389fd9ec99	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	The testimony served to ___ his alibi.	MULTIPLE_CHOICE	["substantiate", "substitute", "subsidize", "subjugate"]	substantiate	1	49	2025-12-11 22:57:45.541
8d504ee6-e0d3-424b-999e-03e30efb09a9	8b5854d1-b29c-43ac-9af9-acde4ff2ce35	His work represents a ___ achievement.	MULTIPLE_CHOICE	["seminal", "terminal", "nominal", "cardinal"]	seminal	1	50	2025-12-11 22:57:45.541
ae203b63-597d-4d16-b64d-00e920380f31	f14de4b3-dcd1-4a33-a5b9-baba33341335	Choose the correct form: I ___ happy.	MULTIPLE_CHOICE	"[\\"am\\",\\"is\\",\\"are\\"]"	am	2	1	2025-12-12 08:16:21.417
64306d59-9edd-4a5d-9da6-3a6eddb2c456	f14de4b3-dcd1-4a33-a5b9-baba33341335	What time ___ it?	MULTIPLE_CHOICE	"[\\"am\\",\\"is\\",\\"are\\",\\"be\\"]"	is	2	2	2025-12-12 08:16:21.418
79fcf84f-f54e-4425-936f-acc617cf88b6	f14de4b3-dcd1-4a33-a5b9-baba33341335	They ___ students.	MULTIPLE_CHOICE	"[\\"am\\",\\"is\\",\\"are\\"]"	are	2	3	2025-12-12 08:16:21.418
efdb3005-cf13-4e61-a470-6f5906cc049d	f14de4b3-dcd1-4a33-a5b9-baba33341335	Complete: This is ___ apple.	MULTIPLE_CHOICE	"[\\"a\\",\\"an\\",\\"the\\"]"	an	2	4	2025-12-12 08:16:21.418
51eefffb-64a0-4048-aee4-cb9a7f72be1a	f14de4b3-dcd1-4a33-a5b9-baba33341335	My sister ___ to music every day.	MULTIPLE_CHOICE	"[\\"listen\\",\\"listens\\",\\"listening\\",\\"listened\\"]"	listens	2	5	2025-12-12 08:16:21.419
ae808381-992f-4be6-a274-55c31c1c0bc8	f14de4b3-dcd1-4a33-a5b9-baba33341335	There ___ many books on the shelf.	MULTIPLE_CHOICE	"[\\"is\\",\\"are\\",\\"am\\",\\"be\\"]"	are	2	6	2025-12-12 08:16:21.419
8ac9f7f2-b85e-40be-968e-ac87511aee50	f14de4b3-dcd1-4a33-a5b9-baba33341335	I don't ___ coffee.	MULTIPLE_CHOICE	"[\\"like\\",\\"likes\\",\\"liking\\",\\"liked\\"]"	like	2	7	2025-12-12 08:16:21.419
4925bf69-6bc2-486c-933b-b1a900e622e4	f14de4b3-dcd1-4a33-a5b9-baba33341335	___ does she live?	MULTIPLE_CHOICE	"[\\"What\\",\\"Where\\",\\"When\\",\\"Who\\"]"	Where	2	8	2025-12-12 08:16:21.42
ff66f4dc-158f-43ed-a5e2-12a8db251104	5d9e0c18-85a3-4e15-934c-5c266754c02b	I ___ from Bahrain.	MULTIPLE_CHOICE	"[\\"am\\",\\"is\\",\\"are\\",\\"be\\"]"	am	1	1	2025-12-12 08:37:05.953
404bb7fe-ab27-4409-98de-516fb9c092ac	5d9e0c18-85a3-4e15-934c-5c266754c02b	Complete the sentence: I ___ a student.	MULTIPLE_CHOICE	"[\\"am\\",\\"is\\",\\"are\\",\\"be\\"]"	am	1	2	2025-12-12 08:37:05.955
0d678dee-5972-4c1f-a92b-452c250e8e4f	5d9e0c18-85a3-4e15-934c-5c266754c02b	What is the opposite of "hot"?	MULTIPLE_CHOICE	"[\\"cold\\",\\"warm\\",\\"cool\\",\\"freeze\\"]"	cold	1	3	2025-12-12 08:37:05.955
a6b7f636-2c30-4b1e-b0ac-541d29fd4717	5d9e0c18-85a3-4e15-934c-5c266754c02b	The sun rises in the ___.	MULTIPLE_CHOICE	"[\\"east\\",\\"west\\",\\"north\\",\\"south\\"]"	east	1	4	2025-12-12 08:37:05.955
5feb57e3-d86f-4f99-835c-41be8cc495ec	5d9e0c18-85a3-4e15-934c-5c266754c02b	I ___ to school every day.	MULTIPLE_CHOICE	"[\\"go\\",\\"goes\\",\\"going\\",\\"went\\"]"	go	1	5	2025-12-12 08:37:05.956
4963c994-bb18-441d-af04-16fdbc9d9dd1	5d9e0c18-85a3-4e15-934c-5c266754c02b	She ___ a teacher.	MULTIPLE_CHOICE	"[\\"am\\",\\"is\\",\\"are\\",\\"be\\"]"	is	1	6	2025-12-12 08:37:05.956
16677cc4-7fcc-49f3-af1c-e0c86de1a4f9	5d9e0c18-85a3-4e15-934c-5c266754c02b	The cat is ___ the table.	MULTIPLE_CHOICE	"[\\"on\\",\\"at\\",\\"in\\",\\"to\\"]"	on	1	7	2025-12-12 08:37:05.956
c9276ed6-3348-44d7-ae40-97781b3b2d56	5d9e0c18-85a3-4e15-934c-5c266754c02b	How many days are in a week?	MULTIPLE_CHOICE	"[\\"5\\",\\"6\\",\\"7\\",\\"8\\"]"	7	1	8	2025-12-12 08:37:05.957
4d3e1d5f-e1d3-4834-9ae4-04496a3f874d	5d9e0c18-85a3-4e15-934c-5c266754c02b	The plural of "child" is ___.	MULTIPLE_CHOICE	"[\\"childs\\",\\"children\\",\\"childes\\",\\"child\\"]"	children	1	9	2025-12-12 08:37:05.957
ab16e589-c890-4173-bd06-b84c89b83af8	5d9e0c18-85a3-4e15-934c-5c266754c02b	English is spoken in ___.	MULTIPLE_CHOICE	"[\\"America\\",\\"France\\",\\"Spain\\",\\"Italy\\"]"	America	1	10	2025-12-12 08:37:05.957
\.


--
-- Data for Name: TestSession; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."TestSession" (id, "studentId", "testId", "startedAt", "completedAt", score, answers, status, "createdAt") FROM stdin;
a88f9d0f-cc75-4f6f-a98a-348ed0e2766d	5d154f79-4d16-4f45-a4f9-0f7a9b0bc9a0	5d9e0c18-85a3-4e15-934c-5c266754c02b	2025-12-13 09:41:05.399	2025-12-13 09:41:32.369	100.00	{"type": "MCQ", "answers": {"0d678dee-5972-4c1f-a92b-452c250e8e4f": {"given": "cold", "earned": 1, "points": 1, "correct": "cold"}, "16677cc4-7fcc-49f3-af1c-e0c86de1a4f9": {"given": "on", "earned": 1, "points": 1, "correct": "on"}, "404bb7fe-ab27-4409-98de-516fb9c092ac": {"given": "am", "earned": 1, "points": 1, "correct": "am"}, "4963c994-bb18-441d-af04-16fdbc9d9dd1": {"given": "is", "earned": 1, "points": 1, "correct": "is"}, "4d3e1d5f-e1d3-4834-9ae4-04496a3f874d": {"given": "children", "earned": 1, "points": 1, "correct": "children"}, "5feb57e3-d86f-4f99-835c-41be8cc495ec": {"given": "go", "earned": 1, "points": 1, "correct": "go"}, "a6b7f636-2c30-4b1e-b0ac-541d29fd4717": {"given": "east", "earned": 1, "points": 1, "correct": "east"}, "ab16e589-c890-4173-bd06-b84c89b83af8": {"given": "America", "earned": 1, "points": 1, "correct": "America"}, "c9276ed6-3348-44d7-ae40-97781b3b2d56": {"given": "7", "earned": 1, "points": 1, "correct": "7"}, "ff66f4dc-158f-43ed-a5e2-12a8db251104": {"given": "am", "earned": 1, "points": 1, "correct": "am"}}, "submittedAt": "2025-12-13T09:41:32.369Z", "totalPoints": 10, "earnedPoints": 10, "scorePercent": 100}	COMPLETED	2025-12-13 09:41:05.4
d208002d-8f21-40b9-9fd4-af81b9fee3f9	abb672be-e67b-48bb-905f-9748cf1bb025	5d9e0c18-85a3-4e15-934c-5c266754c02b	2025-12-15 22:59:49.153	2025-12-15 23:00:12.6	40.00	{"type": "MCQ", "answers": {"0d678dee-5972-4c1f-a92b-452c250e8e4f": {"given": "cold", "earned": 1, "points": 1, "correct": "cold"}, "16677cc4-7fcc-49f3-af1c-e0c86de1a4f9": {"given": "in", "earned": 0, "points": 1, "correct": "on"}, "404bb7fe-ab27-4409-98de-516fb9c092ac": {"given": "am", "earned": 1, "points": 1, "correct": "am"}, "4963c994-bb18-441d-af04-16fdbc9d9dd1": {"given": "are", "earned": 0, "points": 1, "correct": "is"}, "4d3e1d5f-e1d3-4834-9ae4-04496a3f874d": {"given": "children", "earned": 1, "points": 1, "correct": "children"}, "5feb57e3-d86f-4f99-835c-41be8cc495ec": {"given": "goes", "earned": 0, "points": 1, "correct": "go"}, "a6b7f636-2c30-4b1e-b0ac-541d29fd4717": {"given": "west", "earned": 0, "points": 1, "correct": "east"}, "ab16e589-c890-4173-bd06-b84c89b83af8": {"given": "Spain", "earned": 0, "points": 1, "correct": "America"}, "c9276ed6-3348-44d7-ae40-97781b3b2d56": {"given": "8", "earned": 0, "points": 1, "correct": "7"}, "ff66f4dc-158f-43ed-a5e2-12a8db251104": {"given": "am", "earned": 1, "points": 1, "correct": "am"}}, "submittedAt": "2025-12-15T23:00:12.599Z", "totalPoints": 10, "earnedPoints": 4, "scorePercent": 40}	COMPLETED	2025-12-15 22:59:49.154
07dd5fce-3a38-484e-9d87-17d44bdfabaa	1251fbf4-aab0-4963-8c04-bf8019724e4e	5d9e0c18-85a3-4e15-934c-5c266754c02b	2025-12-16 14:02:22.394	2025-12-16 14:02:36.015	60.00	{"type": "MCQ", "answers": {"0d678dee-5972-4c1f-a92b-452c250e8e4f": {"given": "cold", "earned": 1, "points": 1, "correct": "cold"}, "16677cc4-7fcc-49f3-af1c-e0c86de1a4f9": {"given": "on", "earned": 1, "points": 1, "correct": "on"}, "404bb7fe-ab27-4409-98de-516fb9c092ac": {"given": "am", "earned": 1, "points": 1, "correct": "am"}, "4963c994-bb18-441d-af04-16fdbc9d9dd1": {"given": "am", "earned": 0, "points": 1, "correct": "is"}, "4d3e1d5f-e1d3-4834-9ae4-04496a3f874d": {"given": "childs", "earned": 0, "points": 1, "correct": "children"}, "5feb57e3-d86f-4f99-835c-41be8cc495ec": {"given": "go", "earned": 1, "points": 1, "correct": "go"}, "a6b7f636-2c30-4b1e-b0ac-541d29fd4717": {"given": "west", "earned": 0, "points": 1, "correct": "east"}, "ab16e589-c890-4173-bd06-b84c89b83af8": {"given": "America", "earned": 1, "points": 1, "correct": "America"}, "c9276ed6-3348-44d7-ae40-97781b3b2d56": {"given": "5", "earned": 0, "points": 1, "correct": "7"}, "ff66f4dc-158f-43ed-a5e2-12a8db251104": {"given": "am", "earned": 1, "points": 1, "correct": "am"}}, "submittedAt": "2025-12-16T14:02:36.014Z", "totalPoints": 10, "earnedPoints": 6, "scorePercent": 60}	COMPLETED	2025-12-16 14:02:22.395
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."User" (id, email, phone, role, "isActive", "lastLogin", "createdAt", "updatedAt") FROM stdin;
59ba26a8-dfc4-4eeb-9e15-25f88458c072	parent-1765202668607@placeholder.local	\N	PARENT	t	\N	2025-12-08 14:04:28.609	2025-12-08 14:04:28.609
ab04c255-88e0-46c5-a490-005c5c5f9560	parent-1766082834269@placeholder.local	\N	PARENT	t	\N	2025-12-18 18:33:54.27	2025-12-18 18:33:54.27
d24c6b10-90e0-4e44-8d69-58e0142ddb69	ahmed.teacher@function.bh	39001122	TEACHER	t	2025-12-08 14:27:20.321	2025-12-05 10:55:19.22	2025-12-08 14:27:20.321
b2e0ef76-8efa-4a0b-82bd-16e3422bc3fd	Qassimahmed231@gmail.com	35140480	STUDENT	t	2025-12-18 22:57:04.989	2025-12-12 08:01:19.128	2025-12-18 22:57:04.989
d56d6057-c762-4845-843b-02c8414113e8	ali.student@test.bh	39800118	STUDENT	t	2025-12-06 08:10:22.9	2025-12-05 10:55:19.22	2025-12-13 08:09:47.408
db412e3d-563d-43b1-aa12-dd1df03db412	mohammed.student@test.bh	36003333	STUDENT	t	2025-12-18 22:57:54.775	2025-12-05 10:55:19.221	2025-12-18 22:57:54.776
b2e4046c-82bd-4afe-9022-5fdd74773011	ahmedahmed@gmail.com	39711157	STUDENT	t	2025-12-08 14:23:59.952	2025-12-08 14:23:57.587	2025-12-13 08:20:33.162
0e82a0a0-d439-4401-98ac-5f2f612ba3ab	admin@function.bh	33445566	ADMIN	t	2025-12-19 11:19:52.089	2025-12-05 10:55:19.216	2025-12-19 11:19:52.09
de6a6cdb-65b7-410f-8908-54fd4e719d53	fatima.teacher@function.bh	39003344	TEACHER	t	2025-12-19 15:19:02.344	2025-12-05 10:55:19.22	2025-12-19 15:19:02.345
554fe800-5b5d-4918-a8a0-45037debbe59	mohamedalmatrook7@gmail.com	38353928	STUDENT	t	2025-12-19 15:21:34.602	2025-12-15 22:59:23.521	2025-12-19 15:21:34.603
51cd0567-ed77-4810-b9d9-5c3a99a79791	HusainANabi@gmail.com	23232323	STUDENT	t	2025-12-19 15:23:44.934	2025-12-05 18:36:27.113	2025-12-19 15:23:44.935
85e1bf7e-b3ce-43a8-98c2-c19fd81535ab	layla.student@test.bh	36004444	STUDENT	t	2025-12-13 09:50:49.557	2025-12-05 10:55:19.221	2025-12-13 09:50:49.558
4d2eff46-3148-4151-a909-1c88b2dde123	ammar@gmail.com	66762228	STUDENT	t	2025-12-16 13:57:10.738	2025-12-13 09:40:33.332	2025-12-16 13:57:10.739
2e04dbca-2e3f-4a5e-ac18-129576f7aef1	ammaro@gmail.com	66762528	STUDENT	t	2025-12-16 14:21:31.827	2025-12-16 14:02:15.742	2025-12-16 14:21:31.827
015ca870-ed1e-46bd-995e-8cc76cedce31	parent@gmail.com	\N	PARENT	t	2025-12-16 14:21:58.207	2025-12-07 18:55:04.013	2025-12-16 14:21:58.208
5f63c10d-78b6-4c3d-a116-4d8f772eeb80	mohammedA@gmail.com	23544029	STUDENT	t	2025-12-13 10:35:07.751	2025-12-13 10:34:05.281	2025-12-15 21:49:30.526
afbc161c-a882-49b6-9763-b8f45cd83736	sara.student@test.bh	36002222	STUDENT	t	\N	2025-12-05 10:55:19.221	2025-12-05 10:55:19.221
\.


--
-- Data for Name: Venue; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Venue" (id, name, code, address, "isActive", "createdAt") FROM stdin;
efb63abe-1336-4ecc-abe9-303bb1ca2e0b	Country Mall	CM	Country Mall, Manama	t	2025-12-05 10:55:19.226
23c0324e-ce43-4dc5-aea7-df790e749ee3	poly	pol	polytechnic	f	2025-12-13 10:45:24.608
6a8a67c0-0d85-4337-a139-d20778015fbe	Riyadat	RM	Riyadat broo	f	2025-12-15 22:00:09.702
d46d01fc-d0ad-4516-9c68-fe6f0fe65cb5	Riyadat	Rey	asdd	t	2025-12-08 14:08:52.75
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
d3278391-c00e-4089-9312-19b8ec77220c	c1b086b1f5b143428c7b283a1be1d153242686a78380062ff78b9ebc662b550c	2025-11-27 10:40:24.989462+03	20251114140236_init	\N	\N	2025-11-27 10:40:24.984443+03	1
0240ba19-689b-4ab7-acb5-c7e3fb11ecb3	d4268fb4dd1b0b59cfbb4e062bcc18725af150497203fce95b9ae7fd344bfaac	2025-11-27 10:40:25.044556+03	20251114162635_complete_database_schema	\N	\N	2025-11-27 10:40:24.989851+03	1
d5610756-4354-4e81-932b-ca4cb500f762	9ccde4089a5ba12845a827d5b5eb496ac3a0f7bc24230966d69ae18f2dc1e31c	2025-12-16 23:41:08.725642+03	20251216204108_add_faq_model	\N	\N	2025-12-16 23:41:08.713208+03	1
de2c4aa5-21cc-49d7-a694-bc32123cfcb0	9721c7d957b2598c5b6388d1bc1afc33992223e5b0656ab00617a7d4fc7d5470	2025-11-27 10:40:25.050135+03	20251119134159_add_progress_tracking	\N	\N	2025-11-27 10:40:25.044776+03	1
475cd627-cb0d-42b6-83f8-91a176e73184	711425258f6e9f2b829c134b9e4635f719b2774727d6fa97478d11d019062fe0	2025-11-27 10:40:25.050841+03	20251122071634_add_installment_due_date	\N	\N	2025-11-27 10:40:25.050272+03	1
7de3b526-1c92-4769-b084-236c04dff2b4	f91fc7b22ce6bbc1f2975608a86770ce132988813a25908e75dcd265d58deb9f	2025-11-27 10:40:25.053353+03	20251122072331_add_payment_reminder	\N	\N	2025-11-27 10:40:25.051028+03	1
fe634274-47c8-4170-9f21-59d7a0d0cbbc	12b10bdd3234d73bb07a7ece7771a1999ed2c2f04c5837f8c320d17ebc40a59e	2025-11-27 10:40:25.054968+03	20251122072843_add_attendance_warning	\N	\N	2025-11-27 10:40:25.053505+03	1
7d37fb93-3afa-4830-a558-e04138cfa8c7	9a1ae951e5d24505e89166f64611c3f60b05b5becf93015f0a4f18245326dc71	2025-11-27 10:40:25.055663+03	20251122172524_make_payment_date_nullable	\N	\N	2025-11-27 10:40:25.055147+03	1
f60208c8-e540-4f8b-a4f7-a25d3740f664	52df0b2a47457748674f3a543a8898136d4a6170962576999da52a2791498bf1	2025-11-27 10:40:25.056532+03	20251123073521_added_can_see_payment_column_to_student	\N	\N	2025-11-27 10:40:25.055806+03	1
4e09e45d-1c89-454f-bddc-1724ea9669d8	7e674b251f35047635d3b1278482185d3d9524f666bc283db6f88300d400a286	2025-12-01 09:42:08.827195+03	20251201064208_fix_schema_and_add_levels	\N	\N	2025-12-01 09:42:08.821603+03	1
92ec8f32-b80f-4ba5-9d68-360126035933	d00c425c3c266228530424ef4775f0da9112dc1c47ed28ba905eb7d2d5d925ae	2025-12-04 01:34:55.965591+03	20251203223455_add_program_duration	\N	\N	2025-12-04 01:34:55.963518+03	1
62ebec94-babc-453d-87ef-5056689c747c	d835f2c3454fdb0bc051cee6709ad653376c8289dbd14e9fdf3028bca4335964	2025-12-12 20:54:04.246841+03	20251212175404_add_student_profile_picture	\N	\N	2025-12-12 20:54:04.24496+03	1
c5e4508f-8c77-48c2-bfbe-088a0bfdd9fd	342006cceec896296df07bdcb095293ca072d7b41f75b32e17e7a47246273860	2025-12-15 20:42:46.41042+03	20251215174246_make_payment_method_nullable	\N	\N	2025-12-15 20:42:46.392114+03	1
f090bced-756c-4ced-a726-00c37f210e73	9a07dec3eeea027f9cb28225cd50e6a588e3b81d7c3a3f45d1050824f44ee02a	2025-12-16 15:07:19.930118+03	20251216120719_add_hall_to_group	\N	\N	2025-12-16 15:07:19.920432+03	1
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
-- Name: FAQ FAQ_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."FAQ"
    ADD CONSTRAINT "FAQ_pkey" PRIMARY KEY (id);


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
-- Name: FAQ_category_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "FAQ_category_idx" ON public."FAQ" USING btree (category);


--
-- Name: FAQ_createdAt_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "FAQ_createdAt_idx" ON public."FAQ" USING btree ("createdAt");


--
-- Name: FAQ_isActive_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "FAQ_isActive_idx" ON public."FAQ" USING btree ("isActive");


--
-- Name: Group_groupCode_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Group_groupCode_idx" ON public."Group" USING btree ("groupCode");


--
-- Name: Group_groupCode_key; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE UNIQUE INDEX "Group_groupCode_key" ON public."Group" USING btree ("groupCode");


--
-- Name: Group_hallId_idx; Type: INDEX; Schema: public; Owner: macbookairm3
--

CREATE INDEX "Group_hallId_idx" ON public."Group" USING btree ("hallId");


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
-- Name: Group Group_hallId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookairm3
--

ALTER TABLE ONLY public."Group"
    ADD CONSTRAINT "Group_hallId_fkey" FOREIGN KEY ("hallId") REFERENCES public."Hall"(id) ON UPDATE CASCADE ON DELETE SET NULL;


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
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: macbookairm3
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict JvKag3xXD0R2hLofN759afXeNjo3xxnwPV87ZmH7sesfcakS4LjBxeDQMx6a990

