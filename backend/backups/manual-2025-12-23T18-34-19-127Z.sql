--
-- PostgreSQL database dump
--

\restrict GSFdMrIStdRoxLqehCU2lmCP3Cq5zvAagVF59fapzM6cGGApnFxXx1eEMkUUQZW

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
be06abf9-2533-47e7-a475-3fd0c5965769	3020d00c-fdc2-4fdc-bf21-11dfaa8043c6	\N	Welcome to Class!	Welcome everyone to the new term. Please bring your books.	STUDENTS	097669e6-5774-4a26-8de7-d519dadc8f3e	2025-12-22 15:58:06.618	\N	t	2025-12-22 15:58:06.619	2025-12-22 15:58:06.619
ef7bf9ca-0061-4f77-849c-8057670ad322	e8a36afb-9433-464d-86e5-18aa7b25c4a7	\N	Welcome to Class!	Welcome everyone to the new term. Please bring your books.	STUDENTS	097669e6-5774-4a26-8de7-d519dadc8f3e	2025-12-22 15:58:06.625	\N	t	2025-12-22 15:58:06.625	2025-12-22 15:58:06.625
f94ffefe-b9c0-47b8-9d59-3a3db96824bc	15aded75-570a-4f8d-b2fc-e308d8b6b666	\N	Welcome to Class!	Welcome everyone to the new term. Please bring your books.	STUDENTS	097669e6-5774-4a26-8de7-d519dadc8f3e	2025-12-22 15:58:06.627	\N	t	2025-12-22 15:58:06.628	2025-12-22 15:58:06.628
faad6dea-4a1d-448a-a90b-b3ccc26d72ff	bd5b5d59-9dac-4220-891b-f52b62b15e58	\N	Welcome to Class!	Welcome everyone to the new term. Please bring your books.	STUDENTS	097669e6-5774-4a26-8de7-d519dadc8f3e	2025-12-22 15:58:06.629	\N	t	2025-12-22 15:58:06.63	2025-12-22 15:58:06.63
7f29c237-1f32-4529-909f-be1235b548f8	46bf39dc-493d-470e-a7dd-4c759112cabc	\N	Welcome to Class!	Welcome everyone to the new term. Please bring your books.	STUDENTS	097669e6-5774-4a26-8de7-d519dadc8f3e	2025-12-22 15:58:06.631	\N	t	2025-12-22 15:58:06.632	2025-12-22 15:58:06.632
4213624a-b047-42f4-b608-088f38d361a5	dfe3e93d-eedb-44c6-8681-a1e069a70f09	\N	Welcome to Class!	Welcome everyone to the new term. Please bring your books.	STUDENTS	097669e6-5774-4a26-8de7-d519dadc8f3e	2025-12-22 15:58:06.634	\N	t	2025-12-22 15:58:06.635	2025-12-22 15:58:06.635
d40d2866-96a7-437e-b193-bd6d2d1af8dc	d75a25f5-297c-4a28-946a-539986fa0990	\N	Welcome to Class!	Welcome everyone to the new term. Please bring your books.	STUDENTS	097669e6-5774-4a26-8de7-d519dadc8f3e	2025-12-22 15:58:06.636	\N	t	2025-12-22 15:58:06.637	2025-12-22 15:58:06.637
800c4604-40fb-44ce-b949-ba8383271851	54186304-db41-446f-ba02-936c86da1e1e	\N	Welcome to Class!	Welcome everyone to the new term. Please bring your books.	STUDENTS	097669e6-5774-4a26-8de7-d519dadc8f3e	2025-12-22 15:58:06.638	\N	t	2025-12-22 15:58:06.639	2025-12-22 15:58:06.639
a29d4647-9ea3-46bd-8f93-3848c67753c5	0ffdb9f0-92a5-468a-b306-f97edb12663b	\N	Test announcements	hello	GROUP	097669e6-5774-4a26-8de7-d519dadc8f3e	2025-12-23 17:21:16.919	\N	t	2025-12-23 17:21:16.92	2025-12-23 17:21:16.92
\.


--
-- Data for Name: Attendance; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Attendance" (id, "classSessionId", "studentId", "enrollmentId", status, "markedAt", "markedBy", notes, "createdAt", "updatedAt") FROM stdin;
423af4ef-645d-4496-b739-b218885098b7	c8e25477-6b3e-45dd-ae50-18eb5aa34471	40e95b42-5ce4-4b9d-9ca3-451ccdc6c6e3	1a73b46e-595a-4ea9-a321-f4986e50b84d	PRESENT	2025-01-05 17:00:00	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	\N	2025-12-22 15:58:06.697	2025-12-22 15:58:06.697
a12401b9-b6df-40d3-8f43-cb406a6eed6a	c8e25477-6b3e-45dd-ae50-18eb5aa34471	6a8c993b-b24c-483f-8401-990de2a8468d	0268859a-d6f4-4a2b-83ad-664b1c290746	PRESENT	2025-01-05 17:00:00	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	\N	2025-12-22 15:58:06.698	2025-12-22 15:58:06.698
df5b1e54-421d-455f-9dde-47b9479bbcb5	c8e25477-6b3e-45dd-ae50-18eb5aa34471	5068fc24-7543-419a-a943-070583e1cf78	454225b5-0ebb-4513-a993-05258c5fa923	ABSENT	2025-01-05 17:00:00	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	\N	2025-12-22 15:58:06.699	2025-12-22 15:58:06.699
8d53dc30-16a7-4fe5-8013-f12624493924	c8e25477-6b3e-45dd-ae50-18eb5aa34471	8807e7f4-f1a9-4f75-9c00-3002e79bde62	e903193f-1c6d-4f00-be7d-04e17e41f539	PRESENT	2025-01-05 17:00:00	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	\N	2025-12-22 15:58:06.699	2025-12-22 15:58:06.699
f9698b25-926d-4ee4-b3a4-093fea48bbb6	c8e25477-6b3e-45dd-ae50-18eb5aa34471	ecfc2a74-33b6-4f53-b8b7-daa96fa7f849	32564ced-12ec-4296-8792-265b79f85a89	PRESENT	2025-01-05 17:00:00	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	\N	2025-12-22 15:58:06.699	2025-12-22 15:58:06.699
eee50d03-2e4f-4e7f-bf5a-974129c08251	c8e25477-6b3e-45dd-ae50-18eb5aa34471	fcccd1a2-b628-4e4e-af83-577800b87eb9	2a7a9425-f4c3-4cd0-b9d7-f468074dbc59	PRESENT	2025-01-05 17:00:00	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	\N	2025-12-22 15:58:06.7	2025-12-22 15:58:06.7
6b88148d-cb0d-48f8-9be1-c6cf0690378a	c8e25477-6b3e-45dd-ae50-18eb5aa34471	7cc8397c-dd7f-4a65-9038-7518e2b1f5c0	31b13097-364e-48ac-9c00-2a9fae96d510	PRESENT	2025-01-05 17:00:00	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	\N	2025-12-22 15:58:06.7	2025-12-22 15:58:06.7
9229c0fe-8ca1-4814-8399-b8f2eb013297	c8e25477-6b3e-45dd-ae50-18eb5aa34471	b1608691-8a22-4db4-b4fe-1b89ea1c39e1	3614045a-3550-4c1d-8c66-86909608d129	PRESENT	2025-01-05 17:00:00	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	\N	2025-12-22 15:58:06.7	2025-12-22 15:58:06.7
381a5f8c-1ed9-4d30-aab4-1d477554b812	544840be-aafd-4be0-828d-a54d38f6c41e	40e95b42-5ce4-4b9d-9ca3-451ccdc6c6e3	1a73b46e-595a-4ea9-a321-f4986e50b84d	PRESENT	2025-01-07 17:00:00	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	\N	2025-12-22 15:58:06.701	2025-12-22 15:58:06.701
15a91650-465d-427d-b5d0-4dba0fb9157f	544840be-aafd-4be0-828d-a54d38f6c41e	6a8c993b-b24c-483f-8401-990de2a8468d	0268859a-d6f4-4a2b-83ad-664b1c290746	PRESENT	2025-01-07 17:00:00	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	\N	2025-12-22 15:58:06.702	2025-12-22 15:58:06.702
e1fe505f-38cf-4a13-a866-87ecb9ec44c4	544840be-aafd-4be0-828d-a54d38f6c41e	5068fc24-7543-419a-a943-070583e1cf78	454225b5-0ebb-4513-a993-05258c5fa923	PRESENT	2025-01-07 17:00:00	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	\N	2025-12-22 15:58:06.702	2025-12-22 15:58:06.702
5bf9b51f-3be8-4658-820a-e998cfca37e0	544840be-aafd-4be0-828d-a54d38f6c41e	8807e7f4-f1a9-4f75-9c00-3002e79bde62	e903193f-1c6d-4f00-be7d-04e17e41f539	PRESENT	2025-01-07 17:00:00	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	\N	2025-12-22 15:58:06.702	2025-12-22 15:58:06.702
45ac0620-c51a-43e4-b569-958926258709	544840be-aafd-4be0-828d-a54d38f6c41e	ecfc2a74-33b6-4f53-b8b7-daa96fa7f849	32564ced-12ec-4296-8792-265b79f85a89	PRESENT	2025-01-07 17:00:00	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	\N	2025-12-22 15:58:06.702	2025-12-22 15:58:06.702
b643a0b1-4e4e-488f-adcf-b1afaf8f5058	544840be-aafd-4be0-828d-a54d38f6c41e	fcccd1a2-b628-4e4e-af83-577800b87eb9	2a7a9425-f4c3-4cd0-b9d7-f468074dbc59	PRESENT	2025-01-07 17:00:00	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	\N	2025-12-22 15:58:06.703	2025-12-22 15:58:06.703
049ed8df-4100-4f52-ba4a-fb9886c070fb	544840be-aafd-4be0-828d-a54d38f6c41e	7cc8397c-dd7f-4a65-9038-7518e2b1f5c0	31b13097-364e-48ac-9c00-2a9fae96d510	PRESENT	2025-01-07 17:00:00	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	\N	2025-12-22 15:58:06.703	2025-12-22 15:58:06.703
5e65c0ac-ec3f-4daa-8439-edfe77feda26	544840be-aafd-4be0-828d-a54d38f6c41e	b1608691-8a22-4db4-b4fe-1b89ea1c39e1	3614045a-3550-4c1d-8c66-86909608d129	PRESENT	2025-01-07 17:00:00	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	\N	2025-12-22 15:58:06.704	2025-12-22 15:58:06.704
2f9ebe5c-6e31-43a9-93d1-b67a7c7ec766	bb893a31-68d9-45ec-ac47-27fa931e7e71	40e95b42-5ce4-4b9d-9ca3-451ccdc6c6e3	1a73b46e-595a-4ea9-a321-f4986e50b84d	PRESENT	2025-01-12 17:00:00	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	\N	2025-12-22 15:58:06.705	2025-12-22 15:58:06.705
85d3fe8f-8d51-4541-bbca-b0100a062370	bb893a31-68d9-45ec-ac47-27fa931e7e71	6a8c993b-b24c-483f-8401-990de2a8468d	0268859a-d6f4-4a2b-83ad-664b1c290746	PRESENT	2025-01-12 17:00:00	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	\N	2025-12-22 15:58:06.705	2025-12-22 15:58:06.705
6cfb9daa-90a6-41c8-a5c1-e99ec4465ac8	bb893a31-68d9-45ec-ac47-27fa931e7e71	5068fc24-7543-419a-a943-070583e1cf78	454225b5-0ebb-4513-a993-05258c5fa923	PRESENT	2025-01-12 17:00:00	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	\N	2025-12-22 15:58:06.706	2025-12-22 15:58:06.706
68033a78-da4c-4214-8301-3edb86ad70d3	bb893a31-68d9-45ec-ac47-27fa931e7e71	8807e7f4-f1a9-4f75-9c00-3002e79bde62	e903193f-1c6d-4f00-be7d-04e17e41f539	PRESENT	2025-01-12 17:00:00	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	\N	2025-12-22 15:58:06.706	2025-12-22 15:58:06.706
dc106307-9292-4d43-a26c-893c746a4c15	bb893a31-68d9-45ec-ac47-27fa931e7e71	ecfc2a74-33b6-4f53-b8b7-daa96fa7f849	32564ced-12ec-4296-8792-265b79f85a89	PRESENT	2025-01-12 17:00:00	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	\N	2025-12-22 15:58:06.707	2025-12-22 15:58:06.707
ef2df469-5ce1-4b27-89f4-fa861a85e0e3	bb893a31-68d9-45ec-ac47-27fa931e7e71	fcccd1a2-b628-4e4e-af83-577800b87eb9	2a7a9425-f4c3-4cd0-b9d7-f468074dbc59	PRESENT	2025-01-12 17:00:00	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	\N	2025-12-22 15:58:06.707	2025-12-22 15:58:06.707
68471a8b-b56c-4d61-8258-7dd0bbba53bd	bb893a31-68d9-45ec-ac47-27fa931e7e71	7cc8397c-dd7f-4a65-9038-7518e2b1f5c0	31b13097-364e-48ac-9c00-2a9fae96d510	PRESENT	2025-01-12 17:00:00	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	\N	2025-12-22 15:58:06.707	2025-12-22 15:58:06.707
4123151b-a25e-431d-8bee-c065472fe984	bb893a31-68d9-45ec-ac47-27fa931e7e71	b1608691-8a22-4db4-b4fe-1b89ea1c39e1	3614045a-3550-4c1d-8c66-86909608d129	PRESENT	2025-01-12 17:00:00	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	\N	2025-12-22 15:58:06.707	2025-12-22 15:58:06.707
1413fddb-e994-4ae3-afe2-85bbfe7e2c88	fe433a64-8540-4e13-9551-9ea7af287b89	40e95b42-5ce4-4b9d-9ca3-451ccdc6c6e3	1a73b46e-595a-4ea9-a321-f4986e50b84d	PRESENT	2025-01-14 17:00:00	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	\N	2025-12-22 15:58:06.708	2025-12-22 15:58:06.708
63206918-66cc-44a1-a4aa-5d0673a1b26a	fe433a64-8540-4e13-9551-9ea7af287b89	6a8c993b-b24c-483f-8401-990de2a8468d	0268859a-d6f4-4a2b-83ad-664b1c290746	PRESENT	2025-01-14 17:00:00	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	\N	2025-12-22 15:58:06.709	2025-12-22 15:58:06.709
7a07d621-d61a-46eb-8ca0-5ed5bd51d8b6	fe433a64-8540-4e13-9551-9ea7af287b89	5068fc24-7543-419a-a943-070583e1cf78	454225b5-0ebb-4513-a993-05258c5fa923	PRESENT	2025-01-14 17:00:00	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	\N	2025-12-22 15:58:06.709	2025-12-22 15:58:06.709
d4c84726-3952-480c-a959-a92688973b7e	fe433a64-8540-4e13-9551-9ea7af287b89	8807e7f4-f1a9-4f75-9c00-3002e79bde62	e903193f-1c6d-4f00-be7d-04e17e41f539	PRESENT	2025-01-14 17:00:00	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	\N	2025-12-22 15:58:06.709	2025-12-22 15:58:06.709
ba443b22-c0b4-4b96-b047-d30f19e27a5d	fe433a64-8540-4e13-9551-9ea7af287b89	ecfc2a74-33b6-4f53-b8b7-daa96fa7f849	32564ced-12ec-4296-8792-265b79f85a89	PRESENT	2025-01-14 17:00:00	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	\N	2025-12-22 15:58:06.709	2025-12-22 15:58:06.709
e558e8a4-8606-4ce7-ba54-058f92f54e56	fe433a64-8540-4e13-9551-9ea7af287b89	fcccd1a2-b628-4e4e-af83-577800b87eb9	2a7a9425-f4c3-4cd0-b9d7-f468074dbc59	PRESENT	2025-01-14 17:00:00	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	\N	2025-12-22 15:58:06.71	2025-12-22 15:58:06.71
1cbf0a97-f09a-4628-8b81-fbf2b1efdec0	fe433a64-8540-4e13-9551-9ea7af287b89	7cc8397c-dd7f-4a65-9038-7518e2b1f5c0	31b13097-364e-48ac-9c00-2a9fae96d510	PRESENT	2025-01-14 17:00:00	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	\N	2025-12-22 15:58:06.71	2025-12-22 15:58:06.71
fc6d4d5d-ec22-44c5-a96f-3821bd413f7a	fe433a64-8540-4e13-9551-9ea7af287b89	b1608691-8a22-4db4-b4fe-1b89ea1c39e1	3614045a-3550-4c1d-8c66-86909608d129	PRESENT	2025-01-14 17:00:00	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	\N	2025-12-22 15:58:06.71	2025-12-22 15:58:06.71
644e0839-80df-4d34-b23b-880182f06544	a7a9079e-0995-4318-b120-f78e9fa0b1cd	fe27f0b0-c187-4980-a3b4-0d5a9305ea20	46490e9a-3c34-4117-af3a-6ae7557ecc37	PRESENT	2025-12-23 16:48:46.841	1ff1f9d0-3247-4da0-af17-c69ccbb16b4a	On time	2025-12-23 16:48:46.841	2025-12-23 16:48:46.841
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
d4fa09ad-700a-4f1e-b670-a7a7b022bd28	097669e6-5774-4a26-8de7-d519dadc8f3e	LOGIN	\N	\N	\N	{"role": "ADMIN", "method": "EMAIL"}	\N	\N	2025-12-22 15:59:03.222
414b24bb-948d-49d8-9b6b-62b3ac3d97f9	097669e6-5774-4a26-8de7-d519dadc8f3e	LOGIN	\N	\N	\N	{"role": "ADMIN", "method": "EMAIL"}	\N	\N	2025-12-23 14:40:44.126
03fb72a1-fd6e-4313-8356-7fdbca80a303	097669e6-5774-4a26-8de7-d519dadc8f3e	LOGIN	\N	\N	\N	{"role": "ADMIN", "method": "EMAIL"}	\N	\N	2025-12-23 14:43:24.461
596ac350-761f-49b8-b854-292b8d8414af	097669e6-5774-4a26-8de7-d519dadc8f3e	PAYMENT_RECEIVED	Installment	66ffabcc-f30f-41ec-a2f8-ed9bc8186129	\N	{"amount": 45, "studentName": "Sayed Qasim Ahmed", "paymentMethod": "BENEFIT_PAY", "receiptNumber": "recno"}	\N	\N	2025-12-23 16:25:30.183
8c01f165-1c70-4d1e-8aa3-3303519db1c8	097669e6-5774-4a26-8de7-d519dadc8f3e	PAYMENT_RECEIVED	Installment	5db4492f-9fed-4856-b61d-aec14678538d	\N	{"amount": 45, "studentName": "Sayed Qasim Ahmed", "paymentMethod": "BENEFIT_PAY", "receiptNumber": "asa"}	\N	\N	2025-12-23 16:25:56.685
07d6f8e0-c825-49cf-9be6-314eea64337c	097669e6-5774-4a26-8de7-d519dadc8f3e	MATERIAL_UPLOAD	Material	744e55e0-b513-4a17-b8e9-418ffcf7025f	\N	{"type": "LINK", "group": "0ffdb9f0-92a5-468a-b306-f97edb12663b", "title": "demo title"}	\N	\N	2025-12-23 16:59:15.959
48e1135b-72f4-4939-9510-020ff420971d	097669e6-5774-4a26-8de7-d519dadc8f3e	MATERIAL_DELETE	Material	744e55e0-b513-4a17-b8e9-418ffcf7025f	{"type": "LINK", "title": "demo title"}	\N	\N	\N	2025-12-23 16:59:23.385
02bec65e-21bb-4a8a-9322-28b6d0b7f000	097669e6-5774-4a26-8de7-d519dadc8f3e	MATERIAL_UPLOAD	Material	bfece7b6-cf12-490d-84ac-1ce72cfcf3d5	\N	{"type": "LINK", "group": "0ffdb9f0-92a5-468a-b306-f97edb12663b", "title": "demo title"}	\N	\N	2025-12-23 16:59:58.318
41e02e3f-72aa-492e-baf4-ea84d6e828d8	d86baa6c-a5e7-4052-9207-29e8849cde50	LOGIN	\N	\N	\N	{"role": "TEACHER", "method": "EMAIL"}	\N	\N	2025-12-23 18:16:43.215
f8f42fa8-d4d9-4afd-9340-b3ae516ec337	097669e6-5774-4a26-8de7-d519dadc8f3e	LOGIN	\N	\N	\N	{"role": "ADMIN", "method": "EMAIL"}	\N	\N	2025-12-23 18:18:01.743
175499f0-f813-4dd3-b14e-47bed1a4cf1a	d86baa6c-a5e7-4052-9207-29e8849cde50	LOGIN	\N	\N	\N	{"role": "TEACHER", "method": "EMAIL"}	\N	\N	2025-12-23 18:19:31.282
\.


--
-- Data for Name: ChatMessage; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."ChatMessage" (id, "userId", "userRole", message, response, context, "queryType", "createdAt") FROM stdin;
\.


--
-- Data for Name: ClassSession; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."ClassSession" (id, "groupId", "hallId", "sessionDate", "sessionNumber", "startTime", "endTime", topic, status, "cancellationReason", "createdAt", "updatedAt") FROM stdin;
c8e25477-6b3e-45dd-ae50-18eb5aa34471	3020d00c-fdc2-4fdc-bf21-11dfaa8043c6	\N	2025-01-05	1	16:00:00	17:30:00	Lesson 1	COMPLETED	\N	2025-12-22 15:58:06.695	2025-12-22 15:58:06.695
544840be-aafd-4be0-828d-a54d38f6c41e	3020d00c-fdc2-4fdc-bf21-11dfaa8043c6	\N	2025-01-07	2	16:00:00	17:30:00	Lesson 2	COMPLETED	\N	2025-12-22 15:58:06.7	2025-12-22 15:58:06.7
bb893a31-68d9-45ec-ac47-27fa931e7e71	3020d00c-fdc2-4fdc-bf21-11dfaa8043c6	\N	2025-01-12	3	16:00:00	17:30:00	Lesson 3	COMPLETED	\N	2025-12-22 15:58:06.704	2025-12-22 15:58:06.704
fe433a64-8540-4e13-9551-9ea7af287b89	3020d00c-fdc2-4fdc-bf21-11dfaa8043c6	\N	2025-01-14	4	16:00:00	17:30:00	Lesson 4	COMPLETED	\N	2025-12-22 15:58:06.708	2025-12-22 15:58:06.708
a7a9079e-0995-4318-b120-f78e9fa0b1cd	0ffdb9f0-92a5-468a-b306-f97edb12663b	\N	2025-12-23	1	15:39:00	16:39:00	\N	SCHEDULED	\N	2025-12-23 16:39:12.518	2025-12-23 16:39:12.518
b2ffa794-0c78-4b2e-889b-97e396575d1a	0ffdb9f0-92a5-468a-b306-f97edb12663b	\N	2025-12-24	2	16:06:00	17:06:00	hello	SCHEDULED	\N	2025-12-23 17:06:38.13	2025-12-23 17:06:38.13
1f0ffa58-983d-4265-ad28-b6daeca71667	0ffdb9f0-92a5-468a-b306-f97edb12663b	\N	2025-12-25	3	16:06:00	17:06:00	hi	SCHEDULED	\N	2025-12-23 17:07:09.952	2025-12-23 17:07:09.952
6c319b1a-9c2b-4968-a0ec-93b8624a5a39	0ffdb9f0-92a5-468a-b306-f97edb12663b	\N	2025-12-29	4	16:07:00	17:07:00	grammer	SCHEDULED	\N	2025-12-23 17:07:55.893	2025-12-23 17:07:55.893
30411eb8-ef84-4924-93e5-b245c1b95d15	0ffdb9f0-92a5-468a-b306-f97edb12663b	\N	2025-12-31	5	16:07:00	17:07:00	grammer	SCHEDULED	\N	2025-12-23 17:07:55.915	2025-12-23 17:07:55.915
\.


--
-- Data for Name: Enrollment; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Enrollment" (id, "studentId", "groupId", "enrollmentDate", status, "withdrawalDate", "withdrawalReason", "createdAt", "updatedAt", "areasForImprovement", "overallPerformance", strengths, "teacherComments") FROM stdin;
1a73b46e-595a-4ea9-a321-f4986e50b84d	40e95b42-5ce4-4b9d-9ca3-451ccdc6c6e3	3020d00c-fdc2-4fdc-bf21-11dfaa8043c6	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.64	2025-12-22 15:58:06.64	\N	\N	\N	\N
0268859a-d6f4-4a2b-83ad-664b1c290746	6a8c993b-b24c-483f-8401-990de2a8468d	3020d00c-fdc2-4fdc-bf21-11dfaa8043c6	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.645	2025-12-22 15:58:06.645	\N	\N	\N	\N
454225b5-0ebb-4513-a993-05258c5fa923	5068fc24-7543-419a-a943-070583e1cf78	3020d00c-fdc2-4fdc-bf21-11dfaa8043c6	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.646	2025-12-22 15:58:06.646	\N	\N	\N	\N
e903193f-1c6d-4f00-be7d-04e17e41f539	8807e7f4-f1a9-4f75-9c00-3002e79bde62	3020d00c-fdc2-4fdc-bf21-11dfaa8043c6	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.648	2025-12-22 15:58:06.648	\N	\N	\N	\N
32564ced-12ec-4296-8792-265b79f85a89	ecfc2a74-33b6-4f53-b8b7-daa96fa7f849	3020d00c-fdc2-4fdc-bf21-11dfaa8043c6	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.649	2025-12-22 15:58:06.649	\N	\N	\N	\N
2a7a9425-f4c3-4cd0-b9d7-f468074dbc59	fcccd1a2-b628-4e4e-af83-577800b87eb9	3020d00c-fdc2-4fdc-bf21-11dfaa8043c6	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.65	2025-12-22 15:58:06.65	\N	\N	\N	\N
31b13097-364e-48ac-9c00-2a9fae96d510	7cc8397c-dd7f-4a65-9038-7518e2b1f5c0	3020d00c-fdc2-4fdc-bf21-11dfaa8043c6	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.651	2025-12-22 15:58:06.651	\N	\N	\N	\N
3614045a-3550-4c1d-8c66-86909608d129	b1608691-8a22-4db4-b4fe-1b89ea1c39e1	3020d00c-fdc2-4fdc-bf21-11dfaa8043c6	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.653	2025-12-22 15:58:06.653	\N	\N	\N	\N
d5eacb33-23b2-432c-8e37-0ebe0fa5ddb0	030a6d76-514a-4d73-b282-b7811216a84b	e8a36afb-9433-464d-86e5-18aa7b25c4a7	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.654	2025-12-22 15:58:06.654	\N	\N	\N	\N
bcc1aa0b-59ed-4717-84ac-34bfd41f6d97	2afedb2b-c22b-4480-955d-a5096bc3b169	e8a36afb-9433-464d-86e5-18aa7b25c4a7	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.655	2025-12-22 15:58:06.655	\N	\N	\N	\N
528ce2ac-aa8c-4438-8f96-87e1861ee65f	4aa39146-1351-4fb5-96ce-35427e7779f2	e8a36afb-9433-464d-86e5-18aa7b25c4a7	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.656	2025-12-22 15:58:06.656	\N	\N	\N	\N
36cfccfa-f398-43b2-b279-99be727084d7	261b7b00-8786-46cb-977d-90e9966693af	e8a36afb-9433-464d-86e5-18aa7b25c4a7	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.656	2025-12-22 15:58:06.656	\N	\N	\N	\N
4658d618-177e-47d6-99fe-32803d76a679	60aad4b2-12ab-4811-9525-b6421cf5f09e	e8a36afb-9433-464d-86e5-18aa7b25c4a7	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.657	2025-12-22 15:58:06.657	\N	\N	\N	\N
456ef99b-638d-432a-91d0-1c16edad4a2e	0cf18f7d-d9bc-4660-9263-8bb9899ef4fa	e8a36afb-9433-464d-86e5-18aa7b25c4a7	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.658	2025-12-22 15:58:06.658	\N	\N	\N	\N
cbb1e0f1-7bbe-4488-b90d-12a52fa2eebd	6f550ee1-2210-40a3-8ce9-be314f58e9c6	e8a36afb-9433-464d-86e5-18aa7b25c4a7	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.659	2025-12-22 15:58:06.659	\N	\N	\N	\N
aac80ed0-3e9a-458c-8801-77316e993e7e	36df9b81-9a65-466e-b6a0-d3618296cdf0	15aded75-570a-4f8d-b2fc-e308d8b6b666	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.661	2025-12-22 15:58:06.661	\N	\N	\N	\N
17b61afe-1938-441a-819f-3f627fbc28d3	e3b9a51f-8309-45c9-aa76-a4634cffa605	15aded75-570a-4f8d-b2fc-e308d8b6b666	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.662	2025-12-22 15:58:06.662	\N	\N	\N	\N
c974b284-825b-4fba-961c-e3959a3244aa	b04b805b-3b78-4032-a3d9-0efc611cf949	15aded75-570a-4f8d-b2fc-e308d8b6b666	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.662	2025-12-22 15:58:06.662	\N	\N	\N	\N
fdd6acba-5c21-49dd-af9b-a42d11e93196	f3bcce20-bef5-4cd2-bc02-40c7aedb22b3	15aded75-570a-4f8d-b2fc-e308d8b6b666	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.663	2025-12-22 15:58:06.663	\N	\N	\N	\N
0c79fb07-7123-47ee-9506-a88e183287ff	88f9c112-9dd4-4f23-b8e0-0b221c103593	bd5b5d59-9dac-4220-891b-f52b62b15e58	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.664	2025-12-22 15:58:06.664	\N	\N	\N	\N
ffef78fc-d3d7-42bd-b69f-413ac5791dee	5efb68b1-a67d-4e81-b06e-ae3cc875a8ac	bd5b5d59-9dac-4220-891b-f52b62b15e58	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.665	2025-12-22 15:58:06.665	\N	\N	\N	\N
b0f61f7c-ec77-4b44-a451-177504e0d7d6	4c1889a4-245d-4703-b4c1-c8e06a65d744	bd5b5d59-9dac-4220-891b-f52b62b15e58	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.666	2025-12-22 15:58:06.666	\N	\N	\N	\N
02b46272-361a-460d-8e49-75707d402f5f	dd88c397-6b53-4e82-b7ae-2a1f7f3c2236	bd5b5d59-9dac-4220-891b-f52b62b15e58	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.668	2025-12-22 15:58:06.668	\N	\N	\N	\N
5e05797a-1e19-4688-8fff-0526251dc129	b35431ae-2e69-45ca-a54d-384d271e004c	bd5b5d59-9dac-4220-891b-f52b62b15e58	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.669	2025-12-22 15:58:06.669	\N	\N	\N	\N
f6d95abe-c5ef-403a-8963-b531b78b2a29	ae31df7a-cf48-4be7-84f9-f8ee6753b7d4	bd5b5d59-9dac-4220-891b-f52b62b15e58	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.669	2025-12-22 15:58:06.669	\N	\N	\N	\N
ae446a57-2d97-414e-a679-c76c9a5c04bc	b47fc07a-ee77-47ab-86b5-9d5b684baa91	46bf39dc-493d-470e-a7dd-4c759112cabc	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.67	2025-12-22 15:58:06.67	\N	\N	\N	\N
932eb119-dc3f-429b-aa04-c0c4beb91027	ac63ad7d-4bbd-40f7-a584-63100f95f39d	46bf39dc-493d-470e-a7dd-4c759112cabc	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.671	2025-12-22 15:58:06.671	\N	\N	\N	\N
14611bae-3d7c-43f0-be5f-07cf73098894	587127a3-91c4-4294-a0f3-183c33658655	46bf39dc-493d-470e-a7dd-4c759112cabc	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.672	2025-12-22 15:58:06.672	\N	\N	\N	\N
aee4a90a-bd89-4470-a2f0-1b4db2d14423	4b5a82f7-8ffc-481b-a7fa-e1c433477fb8	46bf39dc-493d-470e-a7dd-4c759112cabc	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.673	2025-12-22 15:58:06.673	\N	\N	\N	\N
02421bc7-ec30-44c0-847e-0019a7e788c4	e35a02ed-d6b1-4d48-9d25-07b7338f650c	46bf39dc-493d-470e-a7dd-4c759112cabc	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.674	2025-12-22 15:58:06.674	\N	\N	\N	\N
73973472-ccec-4ffa-b548-e6ced656185e	dab5bf12-9910-4425-97b8-ebc7ee5eb2cb	dfe3e93d-eedb-44c6-8681-a1e069a70f09	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.675	2025-12-22 15:58:06.675	\N	\N	\N	\N
bcfa1e2d-bf2a-4c39-aef5-fdaa7769c2e0	b111a2f6-b38e-4dc8-af66-806054736478	dfe3e93d-eedb-44c6-8681-a1e069a70f09	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.676	2025-12-22 15:58:06.676	\N	\N	\N	\N
aa370f2a-8902-4e1a-8285-1a825f61d4e9	ac145ef2-adc1-46aa-8a62-16c23a31d0e3	dfe3e93d-eedb-44c6-8681-a1e069a70f09	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.677	2025-12-22 15:58:06.677	\N	\N	\N	\N
50a588ea-2515-4b52-8e48-fa1990381dcd	232eea0e-769a-46d0-ac81-00311135730c	dfe3e93d-eedb-44c6-8681-a1e069a70f09	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.678	2025-12-22 15:58:06.678	\N	\N	\N	\N
f078d981-e81c-4efe-b649-627956478519	0af10065-58a8-4f9f-bbc9-6a7c5290c082	dfe3e93d-eedb-44c6-8681-a1e069a70f09	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.679	2025-12-22 15:58:06.679	\N	\N	\N	\N
60d909d7-4be1-4be9-a304-96c077b68440	d94bd343-a801-4c63-ab50-db0d69bd5fa8	dfe3e93d-eedb-44c6-8681-a1e069a70f09	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.68	2025-12-22 15:58:06.68	\N	\N	\N	\N
ef13cb5a-9a1f-4490-854b-3cea6b79b494	1b02d4d5-d86d-4b2f-9502-c8d3cd5421d1	dfe3e93d-eedb-44c6-8681-a1e069a70f09	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.681	2025-12-22 15:58:06.681	\N	\N	\N	\N
f3ccfe19-3e4e-4f42-b8dc-eebd187d220e	acb1333b-c149-43b4-998f-a426e491babd	d75a25f5-297c-4a28-946a-539986fa0990	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.682	2025-12-22 15:58:06.682	\N	\N	\N	\N
5f4f26e5-a631-408a-9770-3ba99ff42de5	1e85643a-4117-4c34-b575-9d71e04c64b3	d75a25f5-297c-4a28-946a-539986fa0990	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.683	2025-12-22 15:58:06.683	\N	\N	\N	\N
84850de5-8101-4f88-9cc3-005af7427183	907d7f4c-f6b2-4ea8-863b-dc2c7be3a65b	d75a25f5-297c-4a28-946a-539986fa0990	2025-01-02	ACTIVE	\N	\N	2025-12-22 15:58:06.684	2025-12-22 15:58:06.684	\N	\N	\N	\N
666c10bc-4f87-4f98-bf2b-a9070f2bcd78	af4d7cc1-61f0-4774-8ca5-6ba9ac0074dc	d75a25f5-297c-4a28-946a-539986fa0990	2025-01-02	COMPLETED	\N	\N	2025-12-22 15:58:06.685	2025-12-22 15:58:06.685	\N	\N	\N	\N
1d706e1c-9273-45aa-b8ab-aaf1e3e97ef1	14b40e29-07d0-49c5-ab33-2f32ad8a7da3	d75a25f5-297c-4a28-946a-539986fa0990	2025-01-02	WITHDRAWN	\N	\N	2025-12-22 15:58:06.686	2025-12-22 15:58:06.686	\N	\N	\N	\N
ef702641-b90f-4442-b076-1b2914447648	b9850bf7-2970-41ab-8d11-d20c302e6eaf	d75a25f5-297c-4a28-946a-539986fa0990	2025-01-02	COMPLETED	\N	\N	2025-12-22 15:58:06.686	2025-12-22 15:58:06.686	\N	\N	\N	\N
030313fa-931d-4007-a86b-1fecb9402767	b55a9d6f-667d-4b88-a7d9-0ac98ed16dee	d75a25f5-297c-4a28-946a-539986fa0990	2025-01-02	WITHDRAWN	\N	\N	2025-12-22 15:58:06.687	2025-12-22 15:58:06.687	\N	\N	\N	\N
b9cdf8f8-015d-49cb-9c95-f718f2af4790	ecca0758-12a6-426d-904f-107fe8619cac	d75a25f5-297c-4a28-946a-539986fa0990	2025-01-02	COMPLETED	\N	\N	2025-12-22 15:58:06.688	2025-12-22 15:58:06.688	\N	\N	\N	\N
a2da7538-b4f8-439d-b732-e40c750957b1	7b1653e0-df84-4f29-a2a1-58371a73b5ed	54186304-db41-446f-ba02-936c86da1e1e	2025-01-02	COMPLETED	\N	\N	2025-12-22 15:58:06.689	2025-12-22 15:58:06.689	\N	\N	\N	\N
07c15cf7-21a1-49b9-bf28-023a60032742	3713eaac-280c-461e-96c1-76acf150aede	54186304-db41-446f-ba02-936c86da1e1e	2025-01-02	COMPLETED	\N	\N	2025-12-22 15:58:06.691	2025-12-22 15:58:06.691	\N	\N	\N	\N
1a7d3104-51ff-466c-b6d5-48d18ae41aad	e78fdba9-0efc-4c2b-85c9-13848622f909	54186304-db41-446f-ba02-936c86da1e1e	2025-01-02	COMPLETED	\N	\N	2025-12-22 15:58:06.692	2025-12-22 15:58:06.692	\N	\N	\N	\N
3f00d18b-8e75-4a03-9768-4d38ab3ae185	4498dbaf-10dc-4632-ba4a-0303e89799a5	54186304-db41-446f-ba02-936c86da1e1e	2025-01-02	COMPLETED	\N	\N	2025-12-22 15:58:06.693	2025-12-22 15:58:06.693	\N	\N	\N	\N
ee37a274-16e6-46bc-a06b-fabee70987fe	01d5f030-fd19-443d-8be4-06a510eb91f5	54186304-db41-446f-ba02-936c86da1e1e	2025-01-02	WITHDRAWN	\N	\N	2025-12-22 15:58:06.694	2025-12-22 15:58:06.694	\N	\N	\N	\N
46490e9a-3c34-4117-af3a-6ae7557ecc37	fe27f0b0-c187-4980-a3b4-0d5a9305ea20	0ffdb9f0-92a5-468a-b306-f97edb12663b	2025-12-23	ACTIVE	\N	\N	2025-12-23 15:35:48.268	2025-12-23 16:38:26.121	\N	\N	\N	\N
\.


--
-- Data for Name: FAQ; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."FAQ" (id, question, keywords, answer, category, "isActive", roles, "order", "createdAt", "updatedAt") FROM stdin;
81828390-eccb-4587-b5e6-2772c186518a	How do I check my attendance?	\N	Go to the Dashboard and view the "Attendance" card.	General	t	{STUDENT,PARENT}	0	2025-12-22 15:58:06.53	2025-12-22 15:58:06.53
78dba64b-84a0-4fe2-953f-c50b34a29b83	When are the fees due?	\N	Fees are due on the 5th of each month. Check "Payments" tab.	Finance	t	{STUDENT,PARENT}	0	2025-12-22 15:58:06.53	2025-12-22 15:58:06.53
c3f3bd22-fbb4-4624-84ae-7b71fb0ad167	How to request a leave?	\N	Contact your coordinator or use the "Request Leave" button in Profile.	General	t	{TEACHER}	0	2025-12-22 15:58:06.53	2025-12-22 15:58:06.53
7d05d788-a0d5-49de-bda3-5e694afa59c1	Is parking available at Riyadat?	\N	Yes, free parking is available in the basement.	Logistics	t	{ALL}	0	2025-12-22 15:58:06.53	2025-12-22 15:58:06.53
8cabc90c-4c2a-41ec-99f3-3e2e810def7a	can I withdraw from the course	{Withdraw,registration}	under certain Circumstances withdrawal is applicable	Registration	t	{ALL}	0	2025-12-23 18:32:53.743	2025-12-23 18:33:08.02
\.


--
-- Data for Name: Group; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Group" (id, "termId", "levelId", "teacherId", "venueId", "groupCode", name, schedule, capacity, "isActive", "createdAt", "updatedAt", "hallId") FROM stdin;
3020d00c-fdc2-4fdc-bf21-11dfaa8043c6	db894dc3-0cc9-40b6-8ab0-17a0107892e8	5810c1ba-297d-4d8f-837f-e774dac5d090	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	e4a146e6-5437-412d-ba48-fe63b7348e5d	GE-A1-SUN	General English - A1 (Sun)	{"days": ["Sun", "Tue"], "time": "16:00"}	15	t	2025-12-22 15:58:06.612	2025-12-22 15:58:06.612	\N
e8a36afb-9433-464d-86e5-18aa7b25c4a7	db894dc3-0cc9-40b6-8ab0-17a0107892e8	b816a78e-fea7-4930-9076-07cce5aacfda	763e000a-2c75-41b4-8b81-f95249b7e1a1	e4a146e6-5437-412d-ba48-fe63b7348e5d	GE-A2-MON	General English - A2 (Mon)	{"days": ["Mon", "Wed"], "time": "17:30"}	15	t	2025-12-22 15:58:06.624	2025-12-22 15:58:06.624	\N
15aded75-570a-4f8d-b2fc-e308d8b6b666	db894dc3-0cc9-40b6-8ab0-17a0107892e8	ba5753d3-f6a8-4f2d-af70-dea2a69a5a37	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	e4a146e6-5437-412d-ba48-fe63b7348e5d	GE-B1-SUN	General English - B1 (Sun)	{"days": ["Sun", "Tue"], "time": "18:00"}	15	t	2025-12-22 15:58:06.627	2025-12-22 15:58:06.627	\N
bd5b5d59-9dac-4220-891b-f52b62b15e58	db894dc3-0cc9-40b6-8ab0-17a0107892e8	b1d5d55f-1ded-470d-aaa1-33dd2fc9d010	c33017e7-2df1-4af7-99b6-5265924f7e3a	e4a146e6-5437-412d-ba48-fe63b7348e5d	GE-B2-WEEK	General English - B2 (Fri)	{"days": ["Fri", "Sat"], "time": "10:00"}	15	t	2025-12-22 15:58:06.629	2025-12-22 15:58:06.629	\N
46bf39dc-493d-470e-a7dd-4c759112cabc	db894dc3-0cc9-40b6-8ab0-17a0107892e8	0730da4f-4538-439d-9ff1-cf1ce7fab690	4ff18cf0-6bc3-49fe-946e-8b73e16101ec	e4a146e6-5437-412d-ba48-fe63b7348e5d	IELTS-INT	General English - C1 (Sun)	{"days": ["Sun", "Tue", "Thu"], "time": "19:00"}	15	t	2025-12-22 15:58:06.631	2025-12-22 15:58:06.631	\N
dfe3e93d-eedb-44c6-8681-a1e069a70f09	db894dc3-0cc9-40b6-8ab0-17a0107892e8	5810c1ba-297d-4d8f-837f-e774dac5d090	57b9610f-c5e9-4473-afa7-0801d016ec78	e4a146e6-5437-412d-ba48-fe63b7348e5d	KIDS-A1	General English - A1 (Mon)	{"days": ["Mon", "Wed"], "time": "15:00"}	15	t	2025-12-22 15:58:06.634	2025-12-22 15:58:06.634	\N
d75a25f5-297c-4a28-946a-539986fa0990	db894dc3-0cc9-40b6-8ab0-17a0107892e8	b816a78e-fea7-4930-9076-07cce5aacfda	c33017e7-2df1-4af7-99b6-5265924f7e3a	e4a146e6-5437-412d-ba48-fe63b7348e5d	OFFICE-BE	General English - A2 (Sun)	{"days": ["Sun", "Tue"], "time": "19:30"}	15	t	2025-12-22 15:58:06.636	2025-12-22 15:58:06.636	\N
54186304-db41-446f-ba02-936c86da1e1e	db894dc3-0cc9-40b6-8ab0-17a0107892e8	0730da4f-4538-439d-9ff1-cf1ce7fab690	4ff18cf0-6bc3-49fe-946e-8b73e16101ec	e4a146e6-5437-412d-ba48-fe63b7348e5d	ADV-C1	General English - C1 (Sat)	{"days": ["Sat"], "time": "09:00"}	15	t	2025-12-22 15:58:06.638	2025-12-22 15:58:06.638	\N
0ffdb9f0-92a5-468a-b306-f97edb12663b	db894dc3-0cc9-40b6-8ab0-17a0107892e8	ba5753d3-f6a8-4f2d-af70-dea2a69a5a37	1ff1f9d0-3247-4da0-af17-c69ccbb16b4a	e4a146e6-5437-412d-ba48-fe63b7348e5d	B1-M-MBR	B1 morning class	{"days": ["Sunday", "Tuesday"], "endTime": "", "startTime": ""}	20	t	2025-12-23 15:32:40.386	2025-12-23 15:34:13.771	bfb3eab2-e145-4a9d-8e38-932de17771ea
\.


--
-- Data for Name: Hall; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Hall" (id, "venueId", name, code, capacity, floor, "isActive", "createdAt") FROM stdin;
bfb3eab2-e145-4a9d-8e38-932de17771ea	e4a146e6-5437-412d-ba48-fe63b7348e5d	Computer Lab	RM-LAB	15	\N	t	2025-12-22 15:58:06.519
33821f7d-b33c-4930-bd13-a4e7a86e52af	06738a99-bf75-4c5e-9c02-41c505146ba6	Classroom A	CM-A	25	\N	t	2025-12-22 15:58:06.519
59705aa0-3bc7-4ad8-814e-991167c5d9e8	06738a99-bf75-4c5e-9c02-41c505146ba6	Classroom B	CM-B	25	\N	t	2025-12-22 15:58:06.519
da211fb8-6bb0-443e-b9b2-268fb21995e4	e4a146e6-5437-412d-ba48-fe63b7348e5d	Training Room 1 - maintenance	RM-TR1	20	\N	f	2025-12-22 15:58:06.519
c147ebe0-028a-4383-9afe-13498ee05e2c	b03235c6-814f-4987-a065-fd109e173cf2	Hall Mainsadsad	HM	90	\N	f	2025-12-23 17:35:13.478
61546bce-faa1-4f59-b8c2-1e94c40c3cd6	b03235c6-814f-4987-a065-fd109e173cf2	Hall Main updated	aHM	90	\N	t	2025-12-23 17:35:47.502
\.


--
-- Data for Name: Installment; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Installment" (id, "paymentPlanId", "installmentNumber", amount, "paymentDate", "paymentMethod", "receiptNumber", "receiptUrl", "receiptMakerId", "benefitReferenceNumber", notes, "createdAt", "dueDate") FROM stdin;
1ef92c15-2f5d-485d-bef7-a34e327e9861	99cd4158-cc22-4031-9899-da104b5bb4bb	1	50.00	2025-01-05	BENEFIT_PAY	REC-99cd	\N	\N	\N	\N	2025-12-22 15:58:06.643	2025-01-05
e2c0642f-5034-4af8-a736-c9f5f8082c6b	f5fb65ff-10f6-44a1-9781-a1ce5769e803	1	50.00	2025-01-05	BENEFIT_PAY	REC-f5fb	\N	\N	\N	\N	2025-12-22 15:58:06.646	2025-01-05
bc4cf63e-5b7e-42df-bce8-bbecf8d72eb9	3b313050-24d2-4dc0-b299-92035cd1a2e4	1	50.00	2025-01-05	BENEFIT_PAY	REC-3b31	\N	\N	\N	\N	2025-12-22 15:58:06.647	2025-01-05
e48b0a30-2c0a-4f3f-be26-077c29218a24	efa54d82-da0b-4188-941f-944b5e9adc35	1	50.00	2025-01-05	BENEFIT_PAY	REC-efa5	\N	\N	\N	\N	2025-12-22 15:58:06.649	2025-01-05
5cb90415-e7bf-4702-8869-8792512afb8c	06294dbe-44fb-4fc1-a54a-e73296b21425	1	50.00	2025-01-05	BENEFIT_PAY	REC-0629	\N	\N	\N	\N	2025-12-22 15:58:06.65	2025-01-05
8fa197df-0a39-49d7-ae64-8504d18c20be	23ceca93-9ec0-4c95-b289-11c09afd1978	1	50.00	2025-01-05	BENEFIT_PAY	REC-23ce	\N	\N	\N	\N	2025-12-22 15:58:06.651	2025-01-05
8f4d4aed-db74-4a8b-8b25-02ac8a1a66e6	c5e99b3c-fe7e-49fe-96ec-95cd3714140e	1	50.00	2025-01-05	BENEFIT_PAY	REC-c5e9	\N	\N	\N	\N	2025-12-22 15:58:06.653	2025-01-05
7fb1f922-18f0-469b-a089-b68dd86696a8	1de5d637-b21c-40d3-8197-f5d54abb3091	1	50.00	2025-01-05	BENEFIT_PAY	REC-1de5	\N	\N	\N	\N	2025-12-22 15:58:06.654	2025-01-05
23ac749b-7d48-41fe-9136-0188cdd4f437	1f325665-e230-4669-97c5-1f58bc27827e	1	50.00	2025-01-05	BENEFIT_PAY	REC-1f32	\N	\N	\N	\N	2025-12-22 15:58:06.655	2025-01-05
811fc49d-475b-4334-b941-9830cf67fabc	aa99df66-513d-4eae-be0b-842a00e2b3a2	1	50.00	2025-01-05	BENEFIT_PAY	REC-aa99	\N	\N	\N	\N	2025-12-22 15:58:06.655	2025-01-05
cd980d05-e8bb-40e2-bd4a-47bffb397439	0612846d-0b7a-4538-95ea-dbf13e52a879	1	50.00	2025-01-05	BENEFIT_PAY	REC-0612	\N	\N	\N	\N	2025-12-22 15:58:06.656	2025-01-05
70bc367f-d670-4dac-8ea1-61c26b7ae00a	95cf3790-9e32-4596-9066-46b403b1b433	1	50.00	2025-01-05	BENEFIT_PAY	REC-95cf	\N	\N	\N	\N	2025-12-22 15:58:06.657	2025-01-05
e97164de-5861-4770-b50d-d497f73fe099	3817cd9d-620c-4310-8bed-8b7bfbc3f131	1	50.00	2025-01-05	BENEFIT_PAY	REC-3817	\N	\N	\N	\N	2025-12-22 15:58:06.658	2025-01-05
10898396-21d8-4824-8094-eb39c17bf865	a8f4a61f-9b38-49e8-a4a6-1d589f308a3e	1	50.00	2025-01-05	BENEFIT_PAY	REC-a8f4	\N	\N	\N	\N	2025-12-22 15:58:06.659	2025-01-05
85178537-d770-4cf1-acc9-1e5f0cbfa9af	b79595aa-2f2f-488b-8918-57d53136edfe	1	50.00	2025-01-05	BENEFIT_PAY	REC-b795	\N	\N	\N	\N	2025-12-22 15:58:06.66	2025-01-05
3685595d-73fa-480d-9496-048e9e0cf3b3	a4292a54-24f9-46fb-ba7d-a87c61c94211	1	50.00	2025-01-05	BENEFIT_PAY	REC-a429	\N	\N	\N	\N	2025-12-22 15:58:06.661	2025-01-05
10def165-2507-4a57-b1b2-09f3b9d441ac	b53d150d-2461-48aa-a3f1-3fafa983238d	1	50.00	2025-01-05	BENEFIT_PAY	REC-b53d	\N	\N	\N	\N	2025-12-22 15:58:06.662	2025-01-05
0de132ec-c393-48e1-b08d-aa7a09ef04fc	a2ae2276-f2f5-48e5-acd9-2a48673ebc22	1	50.00	2025-01-05	BENEFIT_PAY	REC-a2ae	\N	\N	\N	\N	2025-12-22 15:58:06.663	2025-01-05
8891c78d-c161-4416-ac79-c7b55032dcdf	02b4a786-9f40-4d7a-bf8c-1018b105547a	1	50.00	2025-01-05	BENEFIT_PAY	REC-02b4	\N	\N	\N	\N	2025-12-22 15:58:06.664	2025-01-05
a7c3b2dc-56ce-4a8f-942e-bb25c430d08d	855cc43e-93b3-4fe5-ae51-885b5714b9d7	1	50.00	2025-01-05	BENEFIT_PAY	REC-855c	\N	\N	\N	\N	2025-12-22 15:58:06.665	2025-01-05
9f75fb87-1508-4fe4-b359-8da49c8807bb	9e1dabcf-2bdb-4770-ab19-6b3568185dbe	1	50.00	2025-01-05	BENEFIT_PAY	REC-9e1d	\N	\N	\N	\N	2025-12-22 15:58:06.666	2025-01-05
266b5ff4-f75c-40dc-a013-68ea9eb0c579	fe7403fa-f49c-4826-931e-0da1ad56eec1	1	50.00	2025-01-05	BENEFIT_PAY	REC-fe74	\N	\N	\N	\N	2025-12-22 15:58:06.667	2025-01-05
20e42449-d0fc-4687-a3f7-290124e7eae9	e260f9e6-3dea-4b0c-a45d-fa447782852f	1	50.00	2025-01-05	BENEFIT_PAY	REC-e260	\N	\N	\N	\N	2025-12-22 15:58:06.668	2025-01-05
edf2690f-d12c-401d-83f8-418cd1096b7e	8cf14801-6684-4320-b7ad-2c24383eb18e	1	50.00	2025-01-05	BENEFIT_PAY	REC-8cf1	\N	\N	\N	\N	2025-12-22 15:58:06.669	2025-01-05
f6bd38b3-4eae-4c61-9895-6bab51409c50	cd88223d-4a32-40aa-a892-c0858fa95214	1	50.00	2025-01-05	BENEFIT_PAY	REC-cd88	\N	\N	\N	\N	2025-12-22 15:58:06.67	2025-01-05
5416c3dd-566f-49bd-b526-6a7917453d43	082dfd2d-c0b1-4ce5-9486-58e2612f3373	1	50.00	2025-01-05	BENEFIT_PAY	REC-082d	\N	\N	\N	\N	2025-12-22 15:58:06.671	2025-01-05
f8e5b9c5-5de6-461d-8a34-a12a4b4767c4	9b082b2e-57fb-4136-80cb-68c6feeabd7d	1	50.00	2025-01-05	BENEFIT_PAY	REC-9b08	\N	\N	\N	\N	2025-12-22 15:58:06.672	2025-01-05
f66e940c-db04-41e7-8a76-22a76bb1b5ed	40df3103-43da-4429-a64c-b9867594de4b	1	50.00	2025-01-05	BENEFIT_PAY	REC-40df	\N	\N	\N	\N	2025-12-22 15:58:06.673	2025-01-05
dfa7191f-92b5-47dd-a9c4-e322d4fc5bb7	b7f64ce3-f7bd-46ff-b78a-16ac8b5f947a	1	50.00	2025-01-05	BENEFIT_PAY	REC-b7f6	\N	\N	\N	\N	2025-12-22 15:58:06.674	2025-01-05
1217fcc9-1675-4702-a889-e8793cb7fa46	644c83d4-9b37-4fd2-b1ed-f5fae1699c86	1	50.00	2025-01-05	BENEFIT_PAY	REC-644c	\N	\N	\N	\N	2025-12-22 15:58:06.675	2025-01-05
056a1e1b-f2a5-41f7-82ca-a2c65c030cc9	4562482a-cac4-4418-ae50-2825382683c3	1	50.00	2025-01-05	BENEFIT_PAY	REC-4562	\N	\N	\N	\N	2025-12-22 15:58:06.676	2025-01-05
e93eddf9-a70a-485a-9f2b-74b4503a3235	a3bcd9af-3294-4228-928b-a81eef1631f3	1	50.00	2025-01-05	BENEFIT_PAY	REC-a3bc	\N	\N	\N	\N	2025-12-22 15:58:06.677	2025-01-05
f07a8cc1-30c7-4c93-ad66-6805ec37b03d	e2265eb5-314e-4a42-bafe-3a7759f154cc	1	50.00	2025-01-05	BENEFIT_PAY	REC-e226	\N	\N	\N	\N	2025-12-22 15:58:06.677	2025-01-05
db9bb1c2-06f7-49ae-8d77-7426cb9fddf4	3a4cafd3-ee03-427a-95e9-c639c1351a23	1	50.00	2025-01-05	BENEFIT_PAY	REC-3a4c	\N	\N	\N	\N	2025-12-22 15:58:06.679	2025-01-05
3e8353b6-45b5-485d-8fd4-aa7438a4cc02	84d7652b-a631-490e-b5e1-6567a008f5c4	1	50.00	2025-01-05	BENEFIT_PAY	REC-84d7	\N	\N	\N	\N	2025-12-22 15:58:06.68	2025-01-05
b5a40cba-430e-49d2-8d0b-e654be855f92	235f4e35-2c85-43b8-9aec-4cd4ce4821fd	1	50.00	2025-01-05	BENEFIT_PAY	REC-235f	\N	\N	\N	\N	2025-12-22 15:58:06.681	2025-01-05
9c8f3398-b33a-4cbe-b8e6-ac012914b991	684a716e-3e4b-4f03-965b-f5dc36dc3088	1	50.00	2025-01-05	BENEFIT_PAY	REC-684a	\N	\N	\N	\N	2025-12-22 15:58:06.682	2025-01-05
b96997ac-3d17-44bb-aa86-8e8f0eba584d	bb114f12-343d-4239-a154-b629a32ee826	1	50.00	2025-01-05	BENEFIT_PAY	REC-bb11	\N	\N	\N	\N	2025-12-22 15:58:06.683	2025-01-05
eefe4831-c5f7-4e59-93b6-f9aaf266e58f	eb84723d-3ed1-4334-b71b-08dd73062d7f	1	50.00	2025-01-05	BENEFIT_PAY	REC-eb84	\N	\N	\N	\N	2025-12-22 15:58:06.684	2025-01-05
9d95d1aa-3a36-4199-beeb-a8756b452eb1	45b3d302-d4fe-4505-b731-4190f7b418bf	1	50.00	2025-01-05	BENEFIT_PAY	REC-45b3	\N	\N	\N	\N	2025-12-22 15:58:06.684	2025-01-05
d7a3f2e7-4538-4065-a576-0f27f601fa0f	2f2d604f-2f54-4f12-bef7-c4ab8c76809f	1	50.00	2025-01-05	BENEFIT_PAY	REC-2f2d	\N	\N	\N	\N	2025-12-22 15:58:06.685	2025-01-05
7d9c4e08-0430-44b0-a93a-58558987f8dc	bb92ac79-fe2c-4c14-947d-b18dd01678a6	1	50.00	\N	\N	\N	\N	\N	\N	\N	2025-12-22 15:58:06.686	2025-01-05
851eee6a-701e-4de3-aaec-d97014936a40	d4c93c21-c2f9-418c-af1f-80a697c835a6	1	50.00	2025-01-05	BENEFIT_PAY	REC-d4c9	\N	\N	\N	\N	2025-12-22 15:58:06.687	2025-01-05
8e8ea6b1-af54-4bc6-9309-ff1402416fb3	50a39522-5152-43b7-82d9-b5b2d06bcccf	1	50.00	\N	\N	\N	\N	\N	\N	\N	2025-12-22 15:58:06.688	2025-01-05
5dc7eab6-f975-425e-a6f3-54d30587b8ea	f967b520-604a-446d-b2f0-12dbd9f217df	1	50.00	2025-01-05	BENEFIT_PAY	REC-f967	\N	\N	\N	\N	2025-12-22 15:58:06.688	2025-01-05
d09352c7-2a6f-4bee-8a1c-c7673c5bcb7a	ddc5e684-28f3-4899-8097-5c10b197dd73	1	50.00	2025-01-05	BENEFIT_PAY	REC-ddc5	\N	\N	\N	\N	2025-12-22 15:58:06.691	2025-01-05
65831ca2-bd10-402f-b406-61ac55af932d	87243507-7117-4a93-8a97-2dcabcc6189f	1	50.00	2025-01-05	BENEFIT_PAY	REC-8724	\N	\N	\N	\N	2025-12-22 15:58:06.692	2025-01-05
931c4bec-6b84-41f4-bc12-6e40e49f51fb	3f816b95-eba7-4a5e-92f1-af50ff517d7e	1	50.00	2025-01-05	BENEFIT_PAY	REC-3f81	\N	\N	\N	\N	2025-12-22 15:58:06.693	2025-01-05
e51fde85-cc90-4e41-9364-44d11fa5c872	7e31343f-609d-43d7-80fb-d123b8222216	1	50.00	2025-01-05	BENEFIT_PAY	REC-7e31	\N	\N	\N	\N	2025-12-22 15:58:06.694	2025-01-05
458f265b-173f-438e-81ec-c3ac7f668d75	585c1782-fbcc-4a39-870a-d1122da80ec9	1	50.00	\N	\N	\N	\N	\N	\N	\N	2025-12-22 15:58:06.695	2025-01-05
36c2aee5-d96a-4a04-9bee-438d658cc578	b8ce0d0f-b309-481d-81f2-133a7b682095	2	45.00	\N	\N	\N	\N	\N	\N	\N	2025-12-23 16:05:28.732	2026-02-23
edb14547-10ff-47a9-a058-16dfb10e5ad3	b8ce0d0f-b309-481d-81f2-133a7b682095	3	45.00	\N	\N	\N	\N	\N	\N	\N	2025-12-23 16:05:28.732	2026-03-23
66ffabcc-f30f-41ec-a2f8-ed9bc8186129	b8ce0d0f-b309-481d-81f2-133a7b682095	1	45.00	2025-12-23	BENEFIT_PAY	recno	\N	097669e6-5774-4a26-8de7-d519dadc8f3e	\N	testing	2025-12-23 16:05:28.73	2026-01-23
5db4492f-9fed-4856-b61d-aec14678538d	b8ce0d0f-b309-481d-81f2-133a7b682095	4	45.00	2025-12-23	BENEFIT_PAY	asa	\N	097669e6-5774-4a26-8de7-d519dadc8f3e	\N		2025-12-23 16:05:28.732	2026-04-23
\.


--
-- Data for Name: Level; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Level" (id, name, "displayName", "orderNumber", description, "isMixed", "mixedLevels", "createdAt") FROM stdin;
5810c1ba-297d-4d8f-837f-e774dac5d090	A1	CEFR A1	1	\N	f	\N	2025-12-22 15:58:06.527
b816a78e-fea7-4930-9076-07cce5aacfda	A2	CEFR A2	2	\N	f	\N	2025-12-22 15:58:06.528
ba5753d3-f6a8-4f2d-af70-dea2a69a5a37	B1	CEFR B1	3	\N	f	\N	2025-12-22 15:58:06.529
b1d5d55f-1ded-470d-aaa1-33dd2fc9d010	B2	CEFR B2	4	\N	f	\N	2025-12-22 15:58:06.529
0730da4f-4538-439d-9ff1-cf1ce7fab690	C1	CEFR C1	5	\N	f	\N	2025-12-22 15:58:06.529
3536635e-996e-4c6b-bc47-cb60910e0eb2	C2	CEFR C2	6	\N	f	\N	2025-12-22 15:58:06.53
0ee92328-d594-43fb-b1a1-98873dfddceb	C3	\N	7	No level updated	f	\N	2025-12-23 17:32:48.383
\.


--
-- Data for Name: Material; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Material" (id, "groupId", title, description, "materialType", "fileUrl", "fileSizeKb", "uploadedBy", "uploadedAt", "isActive", "isPublished", "publishedAt", "scheduledFor") FROM stdin;
87fc7157-6e9a-48af-977c-8d564d8074db	3020d00c-fdc2-4fdc-bf21-11dfaa8043c6	Course Syllabus	Detailed plan for the semester	PDF	https://example.com/syllabus.pdf	500	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	2025-12-22 15:58:06.616	t	t	2025-12-22 15:58:06.616	\N
66130d31-3192-4a08-b8ca-0a4e07979d31	3020d00c-fdc2-4fdc-bf21-11dfaa8043c6	Week 1 - Introduction Slides	\N	PDF	https://example.com/w1_intro.pdf	1200	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	2025-12-22 15:58:06.618	t	t	2025-12-22 15:58:06.618	\N
de3b0c8f-0d0f-42fc-9cbe-a416a29903ff	e8a36afb-9433-464d-86e5-18aa7b25c4a7	Course Syllabus	Detailed plan for the semester	PDF	https://example.com/syllabus.pdf	500	763e000a-2c75-41b4-8b81-f95249b7e1a1	2025-12-22 15:58:06.624	t	t	2025-12-22 15:58:06.624	\N
f8366160-34ae-4c58-b917-28e5f37580c6	e8a36afb-9433-464d-86e5-18aa7b25c4a7	Week 1 - Introduction Slides	\N	PDF	https://example.com/w1_intro.pdf	1200	763e000a-2c75-41b4-8b81-f95249b7e1a1	2025-12-22 15:58:06.625	t	t	2025-12-22 15:58:06.625	\N
91c62733-948e-43ec-a882-f22335922307	15aded75-570a-4f8d-b2fc-e308d8b6b666	Course Syllabus	Detailed plan for the semester	PDF	https://example.com/syllabus.pdf	500	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	2025-12-22 15:58:06.627	t	t	2025-12-22 15:58:06.627	\N
60502006-b39a-46d3-bae8-ad962fe2c13b	15aded75-570a-4f8d-b2fc-e308d8b6b666	Week 1 - Introduction Slides	\N	PDF	https://example.com/w1_intro.pdf	1200	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	2025-12-22 15:58:06.628	t	t	2025-12-22 15:58:06.628	\N
6aa845f4-ce36-4120-be4f-effd7887eeab	bd5b5d59-9dac-4220-891b-f52b62b15e58	Course Syllabus	Detailed plan for the semester	PDF	https://example.com/syllabus.pdf	500	c33017e7-2df1-4af7-99b6-5265924f7e3a	2025-12-22 15:58:06.629	t	t	2025-12-22 15:58:06.629	\N
32151468-487a-4a5d-91da-3c07a36168f2	bd5b5d59-9dac-4220-891b-f52b62b15e58	Week 1 - Introduction Slides	\N	PDF	https://example.com/w1_intro.pdf	1200	c33017e7-2df1-4af7-99b6-5265924f7e3a	2025-12-22 15:58:06.63	t	t	2025-12-22 15:58:06.63	\N
6befd250-4985-41ac-a50d-da47e3170c0b	46bf39dc-493d-470e-a7dd-4c759112cabc	Course Syllabus	Detailed plan for the semester	PDF	https://example.com/syllabus.pdf	500	4ff18cf0-6bc3-49fe-946e-8b73e16101ec	2025-12-22 15:58:06.631	t	t	2025-12-22 15:58:06.631	\N
3202b40b-0470-4016-a112-e37b328f04df	46bf39dc-493d-470e-a7dd-4c759112cabc	Week 1 - Introduction Slides	\N	PDF	https://example.com/w1_intro.pdf	1200	4ff18cf0-6bc3-49fe-946e-8b73e16101ec	2025-12-22 15:58:06.632	t	t	2025-12-22 15:58:06.632	\N
e723d503-0aee-49e5-9ccc-f346c58933e3	dfe3e93d-eedb-44c6-8681-a1e069a70f09	Course Syllabus	Detailed plan for the semester	PDF	https://example.com/syllabus.pdf	500	57b9610f-c5e9-4473-afa7-0801d016ec78	2025-12-22 15:58:06.634	t	t	2025-12-22 15:58:06.634	\N
77aa6e2c-bb6f-46f8-b542-520dd3bc0781	dfe3e93d-eedb-44c6-8681-a1e069a70f09	Week 1 - Introduction Slides	\N	PDF	https://example.com/w1_intro.pdf	1200	57b9610f-c5e9-4473-afa7-0801d016ec78	2025-12-22 15:58:06.634	t	t	2025-12-22 15:58:06.634	\N
98e1ef7a-0641-4902-a1e7-fd093242fd99	d75a25f5-297c-4a28-946a-539986fa0990	Course Syllabus	Detailed plan for the semester	PDF	https://example.com/syllabus.pdf	500	c33017e7-2df1-4af7-99b6-5265924f7e3a	2025-12-22 15:58:06.636	t	t	2025-12-22 15:58:06.636	\N
b324a46c-8b53-40b2-8eaf-299a6b8feca9	d75a25f5-297c-4a28-946a-539986fa0990	Week 1 - Introduction Slides	\N	PDF	https://example.com/w1_intro.pdf	1200	c33017e7-2df1-4af7-99b6-5265924f7e3a	2025-12-22 15:58:06.637	t	t	2025-12-22 15:58:06.637	\N
43693691-b399-4550-9c83-3af2773077bf	54186304-db41-446f-ba02-936c86da1e1e	Course Syllabus	Detailed plan for the semester	PDF	https://example.com/syllabus.pdf	500	4ff18cf0-6bc3-49fe-946e-8b73e16101ec	2025-12-22 15:58:06.638	t	t	2025-12-22 15:58:06.638	\N
79159d8f-0e39-4c43-86c1-3bea8e184c4b	54186304-db41-446f-ba02-936c86da1e1e	Week 1 - Introduction Slides	\N	PDF	https://example.com/w1_intro.pdf	1200	4ff18cf0-6bc3-49fe-946e-8b73e16101ec	2025-12-22 15:58:06.638	t	t	2025-12-22 15:58:06.638	\N
744e55e0-b513-4a17-b8e9-418ffcf7025f	0ffdb9f0-92a5-468a-b306-f97edb12663b	demo title	This is a demo	LINK	https://learn.reboot01.com/intra/bahrain/bh-module	\N	\N	2025-12-23 16:59:15.913	f	t	2025-12-23 16:59:15.911	\N
bfece7b6-cf12-490d-84ac-1ce72cfcf3d5	0ffdb9f0-92a5-468a-b306-f97edb12663b	demo title	this is a demo	LINK	https://learn.reboot01.com/intra/bahrain/bh-module/piscine-js?event=1346	\N	\N	2025-12-23 16:59:58.309	t	t	2025-12-23 16:59:58.307	\N
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Notification" (id, "userId", type, title, message, "linkUrl", "isRead", "readAt", "sentVia", "sentAt", "createdAt") FROM stdin;
616a4c7b-3aa5-477b-a0b1-adc6d17a3b61	e45c1727-0e7d-4c3c-8f67-5b5b0cbb6aa1	NEW_MATERIAL	New Material: demo title	New LINK material has been uploaded for B1 morning class.	/student/materials	f	\N	APP	\N	2025-12-23 16:59:15.977
ef0d5d93-67c3-4108-99e7-4f2822485a1e	e45c1727-0e7d-4c3c-8f67-5b5b0cbb6aa1	NEW_MATERIAL	New Material: demo title	New LINK material has been uploaded for B1 morning class.	/student/materials	f	\N	APP	\N	2025-12-23 16:59:58.325
b04c44a6-a506-4e0f-b748-2cec8aeee58a	03039459-7ed9-42da-b7ab-1cc9d58134ee	SPEAKING_SLOT_ASSIGNMENT	Speaking Test Booked	Sayed Qasim Ahmed booked a speaking test on 2025-12-25 at 06:00.	/teacher/speaking-tests	f	\N	APP	\N	2025-12-23 17:57:03.276
\.


--
-- Data for Name: OtpCode; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."OtpCode" (id, "userId", code, "expiresAt", "isUsed", attempts, "createdAt") FROM stdin;
e0bbc48d-4543-4a82-baa5-c98777aff025	097669e6-5774-4a26-8de7-d519dadc8f3e	123456	2025-12-22 16:04:01.396	t	1	2025-12-22 15:59:01.397
5a24c890-b58f-4229-b6c9-79659a3b542e	097669e6-5774-4a26-8de7-d519dadc8f3e	123456	2025-12-23 14:42:36.621	t	1	2025-12-23 14:37:36.622
4b6b5de0-7b49-4626-98f2-8ddbf91f2742	097669e6-5774-4a26-8de7-d519dadc8f3e	745916	2025-12-23 14:46:30.029	t	1	2025-12-23 14:41:30.03
87eb6e99-5a70-42c4-a174-4debd05a3040	d86baa6c-a5e7-4052-9207-29e8849cde50	571709	2025-12-23 18:21:22.509	t	1	2025-12-23 18:16:22.509
5a225579-243c-45a0-9622-c3469fb9d0bd	097669e6-5774-4a26-8de7-d519dadc8f3e	981546	2025-12-23 18:22:47.332	t	1	2025-12-23 18:17:47.333
7d2c38e5-2ec0-4036-acba-8040b6b66f27	d86baa6c-a5e7-4052-9207-29e8849cde50	721616	2025-12-23 18:24:16.916	t	1	2025-12-23 18:19:16.918
\.


--
-- Data for Name: Parent; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Parent" (id, "userId", "firstName", "lastName", "createdAt") FROM stdin;
c2ac7bb8-992c-4abe-bfd0-79d704f2f777	6550f9c3-daf2-4e2a-a7ab-23b77e11fee8	Ahmed	Mohammed	2025-12-22 15:58:06.582
8e4f42d2-aa81-41a5-aae8-418e4d56f596	8ec8acf6-d447-4eae-922d-2bba5580af8e	Ebrahim	Sharif	2025-12-22 15:58:06.587
1fabd926-4206-47aa-9ad4-3dd910641286	4745b6be-6cc3-4abc-90da-7f115ccf9c6b	Hussain	Kamal	2025-12-22 15:58:06.589
56f93e1b-9e3f-44d0-a01d-88fc1df65128	10a958c0-27dc-4631-8ade-31ccf5725bfa	Jassim	Al-Najjar	2025-12-22 15:58:06.592
0f1069eb-533a-4ae1-aadc-54d8e32f2c3f	f4c009e4-7930-438c-81d2-3871f02ec69e	Musa	Al-Alawi	2025-12-22 15:58:06.594
9e24d836-35cf-4333-b27b-8ecd57f5956d	3c58a363-9ac6-441d-889b-fcfedc05c952	Musa	Al-Musawi	2025-12-22 15:58:06.596
3318414e-42b0-4373-9aa3-aa6c935572ad	017ecec9-4546-44d7-accf-b602b49c2a1e	Ali	Al-Musawi	2025-12-22 15:58:06.598
a4813d6e-a9c8-4326-b5f7-589f0025aeb8	b41ecac7-7996-4ec8-a5b6-959ad1a9a836	Mahmood	Showaiter	2025-12-22 15:58:06.599
ac7f42de-e3c2-4f68-b675-6b3d4c7e765e	c890bbfe-b6f3-4338-9e0c-ad38febad401	Layla	Nasser	2025-12-22 15:58:06.601
6d1a3d33-2a39-4736-a524-95c6ef65e4a7	d4fda2a9-00ef-48a8-9da2-c61d29174d58	Zahra	Husain	2025-12-22 15:58:06.602
7c0c8283-db71-4d04-a800-385be53e96fa	fd94d9c8-57c4-4581-bddb-4d18a24a4c4a	Reem	Mohammed	2025-12-22 15:58:06.604
c063bc91-729a-4098-aa40-987429147bb3	a588dd13-c67a-4440-b40e-c9a8f843b8cc	Musa	Ali	2025-12-22 15:58:06.605
e8a91a52-a090-4aa9-aa2a-613987c120a0	ec6dced5-c088-4ffa-a4df-179eb51f1b61	Mohammed	Kanoo	2025-12-22 15:58:06.606
00cd9ffc-7597-4b67-aa2e-33e9b6684771	9446a6d6-ba4b-4101-8667-5c9d7ef16e58	Jassim	Haji	2025-12-22 15:58:06.607
55f77b41-d55a-4312-a9e3-c76ce1ce1647	aeb06948-a9f3-4788-8ef1-6b2d1e234488	Ali	Husain	2025-12-22 15:58:06.608
58b71e74-dc15-4739-860e-ec9ad731709a	162e226b-2606-4e67-9d3d-eb8ac90997dd	Hassan	Showaiter	2025-12-22 15:58:06.61
3b138af2-a8de-4645-8c69-947cad2e2770	a49f7581-82e7-4796-aa27-afea01f8d669	Sayed Ahmed	Alsari	2025-12-23 15:18:10.582
\.


--
-- Data for Name: ParentStudentLink; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."ParentStudentLink" (id, "parentId", "studentId", relationship, "createdAt") FROM stdin;
9a7b110e-6052-4743-8622-cd40ff3379ff	c2ac7bb8-992c-4abe-bfd0-79d704f2f777	40e95b42-5ce4-4b9d-9ca3-451ccdc6c6e3	Father	2025-12-22 15:58:06.586
eec31006-0e6f-401f-8cc2-cb6e0a3a8af5	c2ac7bb8-992c-4abe-bfd0-79d704f2f777	6a8c993b-b24c-483f-8401-990de2a8468d	Father	2025-12-22 15:58:06.587
e1e6fbc6-2c73-4771-aeb3-6c234ecc14ca	8e4f42d2-aa81-41a5-aae8-418e4d56f596	5068fc24-7543-419a-a943-070583e1cf78	Father	2025-12-22 15:58:06.588
abea2fe1-1ae7-4421-b7b7-298288ddf62e	1fabd926-4206-47aa-9ad4-3dd910641286	8807e7f4-f1a9-4f75-9c00-3002e79bde62	Father	2025-12-22 15:58:06.589
aa0bfba2-2c7f-4bb1-9ff6-cc4598562f19	1fabd926-4206-47aa-9ad4-3dd910641286	ecfc2a74-33b6-4f53-b8b7-daa96fa7f849	Father	2025-12-22 15:58:06.589
648afb3d-07c3-4620-beca-cc7ebb4722da	1fabd926-4206-47aa-9ad4-3dd910641286	fcccd1a2-b628-4e4e-af83-577800b87eb9	Father	2025-12-22 15:58:06.59
fb0be14f-3d90-48a1-9339-78f57b41a547	56f93e1b-9e3f-44d0-a01d-88fc1df65128	7cc8397c-dd7f-4a65-9038-7518e2b1f5c0	Father	2025-12-22 15:58:06.592
4a374df8-a46b-4139-9813-c28f5b8d25c3	56f93e1b-9e3f-44d0-a01d-88fc1df65128	b1608691-8a22-4db4-b4fe-1b89ea1c39e1	Father	2025-12-22 15:58:06.593
46aa8eca-d63c-4e40-8d85-daa78b37bf96	56f93e1b-9e3f-44d0-a01d-88fc1df65128	030a6d76-514a-4d73-b282-b7811216a84b	Father	2025-12-22 15:58:06.593
215f7126-683e-41a5-8061-c2294840df84	0f1069eb-533a-4ae1-aadc-54d8e32f2c3f	2afedb2b-c22b-4480-955d-a5096bc3b169	Father	2025-12-22 15:58:06.594
d54c12cd-8bf8-4541-b623-16e059e0ab54	9e24d836-35cf-4333-b27b-8ecd57f5956d	4aa39146-1351-4fb5-96ce-35427e7779f2	Father	2025-12-22 15:58:06.596
05e153ef-6fe5-4b91-8389-bb72855a6eea	9e24d836-35cf-4333-b27b-8ecd57f5956d	261b7b00-8786-46cb-977d-90e9966693af	Father	2025-12-22 15:58:06.597
c84d0afa-5aef-493c-96da-bca980b76b86	9e24d836-35cf-4333-b27b-8ecd57f5956d	60aad4b2-12ab-4811-9525-b6421cf5f09e	Father	2025-12-22 15:58:06.597
353781cc-49d3-423c-bab5-d8a9253cb94a	3318414e-42b0-4373-9aa3-aa6c935572ad	0cf18f7d-d9bc-4660-9263-8bb9899ef4fa	Father	2025-12-22 15:58:06.598
88f99fb3-ca08-42a8-b31b-4e74ddc92f83	a4813d6e-a9c8-4326-b5f7-589f0025aeb8	6f550ee1-2210-40a3-8ce9-be314f58e9c6	Father	2025-12-22 15:58:06.599
6682ce02-fe29-49f3-8ae8-754a3ba901bd	a4813d6e-a9c8-4326-b5f7-589f0025aeb8	36df9b81-9a65-466e-b6a0-d3618296cdf0	Father	2025-12-22 15:58:06.6
9277124d-1f4d-4b54-b66e-8c37893ed22e	ac7f42de-e3c2-4f68-b675-6b3d4c7e765e	e3b9a51f-8309-45c9-aa76-a4634cffa605	Mother	2025-12-22 15:58:06.601
e94e90c3-9bc9-4846-8479-6f907339ecb0	6d1a3d33-2a39-4736-a524-95c6ef65e4a7	b04b805b-3b78-4032-a3d9-0efc611cf949	Mother	2025-12-22 15:58:06.602
791a697a-4a5d-4ecd-bd41-a2f230ba13c5	6d1a3d33-2a39-4736-a524-95c6ef65e4a7	f3bcce20-bef5-4cd2-bc02-40c7aedb22b3	Mother	2025-12-22 15:58:06.603
26d3f292-18e8-4517-b3f0-a128acbd033a	7c0c8283-db71-4d04-a800-385be53e96fa	88f9c112-9dd4-4f23-b8e0-0b221c103593	Mother	2025-12-22 15:58:06.604
864eb858-7925-49a3-8b8e-91f0b508b275	c063bc91-729a-4098-aa40-987429147bb3	5efb68b1-a67d-4e81-b06e-ae3cc875a8ac	Father	2025-12-22 15:58:06.605
34159175-f608-421e-9283-e4c7bfc1dff9	e8a91a52-a090-4aa9-aa2a-613987c120a0	4c1889a4-245d-4703-b4c1-c8e06a65d744	Father	2025-12-22 15:58:06.607
7ea371ed-0887-4eae-a93c-54d8a0096250	00cd9ffc-7597-4b67-aa2e-33e9b6684771	dd88c397-6b53-4e82-b7ae-2a1f7f3c2236	Father	2025-12-22 15:58:06.608
caf2a281-fc8d-47c6-9eb6-1c83590006ac	55f77b41-d55a-4312-a9e3-c76ce1ce1647	b35431ae-2e69-45ca-a54d-384d271e004c	Father	2025-12-22 15:58:06.609
8c04c22b-d811-4da1-9ef1-c0f81637a854	58b71e74-dc15-4739-860e-ec9ad731709a	ae31df7a-cf48-4be7-84f9-f8ee6753b7d4	Father	2025-12-22 15:58:06.61
7617fc06-cbcc-4573-82dd-74f268699cbe	58b71e74-dc15-4739-860e-ec9ad731709a	b47fc07a-ee77-47ab-86b5-9d5b684baa91	Father	2025-12-22 15:58:06.611
145e80cf-2197-45d5-9604-8b6efc5010f8	58b71e74-dc15-4739-860e-ec9ad731709a	ac63ad7d-4bbd-40f7-a584-63100f95f39d	Father	2025-12-22 15:58:06.611
\.


--
-- Data for Name: PaymentReminder; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."PaymentReminder" (id, "installmentId", "reminderType", "sentAt", "sentVia") FROM stdin;
81f683a6-0ffe-40ea-97eb-1540dfd9d882	7d9c4e08-0430-44b0-a93a-58558987f8dc	OVERDUE	2025-12-23 06:00:02.799	EMAIL
bc65a176-cf48-46ed-99b5-c14251420372	7d9c4e08-0430-44b0-a93a-58558987f8dc	OVERDUE	2025-12-23 06:00:03.586	SMS
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
2c533e39-8e4a-417e-9a04-812379d60143	General English	GE	Standard English Program	\N	\N	t	2025-12-22 15:58:06.523	2025-12-22 15:58:06.523	\N
63febf7b-4613-497c-8909-c854c66025a7	IELTS Preparation	IELTS	Intensive exam preparation	\N	\N	t	2025-12-22 15:58:06.524	2025-12-22 15:58:06.524	\N
fd70d271-8e4e-49a2-8d3a-9644ae08aa0f	Business English	BE	Professional corporate communication	\N	\N	t	2025-12-22 15:58:06.524	2025-12-22 15:58:06.524	\N
41ab90f2-09f9-4235-8d0f-9623a804e139	Inactive - French 2020	FR-OLD	Discontinued Program	\N	\N	f	2025-12-22 15:58:06.524	2025-12-22 15:58:06.524	\N
d60a6818-26c9-4e7d-8ab9-ce32e5a2ff07	New Test Program	NEW-PG	a test program	\N	\N	t	2025-12-23 17:25:14.66	2025-12-23 17:25:14.66	\N
\.


--
-- Data for Name: ProgressCriteria; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."ProgressCriteria" (id, "levelId", "groupId", name, description, "orderNumber", "isActive", "createdAt", "updatedAt") FROM stdin;
87c6ee33-bf13-4457-9876-442f84830bb6	\N	3020d00c-fdc2-4fdc-bf21-11dfaa8043c6	Can introduce themselves	\N	1	t	2025-12-22 15:58:06.621	2025-12-22 15:58:06.621
906de974-9a81-42d3-8194-9c9b0ec666fb	\N	3020d00c-fdc2-4fdc-bf21-11dfaa8043c6	Can write a short paragraph	\N	2	t	2025-12-22 15:58:06.623	2025-12-22 15:58:06.623
6c04ec04-a8f6-4091-99bc-7e6ec8fe9f87	\N	3020d00c-fdc2-4fdc-bf21-11dfaa8043c6	Understands basic tenses	\N	3	t	2025-12-22 15:58:06.624	2025-12-22 15:58:06.624
859be5c4-b9f6-43c6-a5fe-330a4b51a470	\N	e8a36afb-9433-464d-86e5-18aa7b25c4a7	Can introduce themselves	\N	1	t	2025-12-22 15:58:06.625	2025-12-22 15:58:06.625
942855c8-bf2b-4259-a962-ad6da29e1efe	\N	e8a36afb-9433-464d-86e5-18aa7b25c4a7	Can write a short paragraph	\N	2	t	2025-12-22 15:58:06.626	2025-12-22 15:58:06.626
e93db2c5-4123-4e68-80e6-db925adf2838	\N	e8a36afb-9433-464d-86e5-18aa7b25c4a7	Understands basic tenses	\N	3	t	2025-12-22 15:58:06.627	2025-12-22 15:58:06.627
a8234d26-c474-413c-b846-a8a6958d7004	\N	15aded75-570a-4f8d-b2fc-e308d8b6b666	Can introduce themselves	\N	1	t	2025-12-22 15:58:06.628	2025-12-22 15:58:06.628
63c77d84-57a9-4041-b607-81d6f42106f9	\N	15aded75-570a-4f8d-b2fc-e308d8b6b666	Can write a short paragraph	\N	2	t	2025-12-22 15:58:06.629	2025-12-22 15:58:06.629
c2025fb2-7822-42b5-90f8-e4c7fd63d18b	\N	15aded75-570a-4f8d-b2fc-e308d8b6b666	Understands basic tenses	\N	3	t	2025-12-22 15:58:06.629	2025-12-22 15:58:06.629
3291a69e-7c4c-4c16-8d84-391e04392592	\N	bd5b5d59-9dac-4220-891b-f52b62b15e58	Can introduce themselves	\N	1	t	2025-12-22 15:58:06.63	2025-12-22 15:58:06.63
1b1524cc-6c3f-48b4-b8a6-a74709b51552	\N	bd5b5d59-9dac-4220-891b-f52b62b15e58	Can write a short paragraph	\N	2	t	2025-12-22 15:58:06.631	2025-12-22 15:58:06.631
27356875-a3a1-49dd-88e4-194c980bb566	\N	bd5b5d59-9dac-4220-891b-f52b62b15e58	Understands basic tenses	\N	3	t	2025-12-22 15:58:06.631	2025-12-22 15:58:06.631
f3c3ea04-2bbe-41ab-99cb-cd152b53af00	\N	46bf39dc-493d-470e-a7dd-4c759112cabc	Can introduce themselves	\N	1	t	2025-12-22 15:58:06.632	2025-12-22 15:58:06.632
2ee7de95-a91c-4144-88c1-5a55b479727f	\N	46bf39dc-493d-470e-a7dd-4c759112cabc	Can write a short paragraph	\N	2	t	2025-12-22 15:58:06.633	2025-12-22 15:58:06.633
61c0d33e-ca62-4e28-81ba-84a48f662c88	\N	46bf39dc-493d-470e-a7dd-4c759112cabc	Understands basic tenses	\N	3	t	2025-12-22 15:58:06.633	2025-12-22 15:58:06.633
6884683a-3e68-47aa-bbf7-2a4418233a7c	\N	dfe3e93d-eedb-44c6-8681-a1e069a70f09	Can introduce themselves	\N	1	t	2025-12-22 15:58:06.635	2025-12-22 15:58:06.635
daddffba-d430-4136-94e9-e09399a0f865	\N	dfe3e93d-eedb-44c6-8681-a1e069a70f09	Can write a short paragraph	\N	2	t	2025-12-22 15:58:06.635	2025-12-22 15:58:06.635
f1c5eac2-bde0-4285-97f2-302b01febefc	\N	dfe3e93d-eedb-44c6-8681-a1e069a70f09	Understands basic tenses	\N	3	t	2025-12-22 15:58:06.636	2025-12-22 15:58:06.636
211757cb-1f70-45fd-a2e5-9c31d0315093	\N	d75a25f5-297c-4a28-946a-539986fa0990	Can introduce themselves	\N	1	t	2025-12-22 15:58:06.637	2025-12-22 15:58:06.637
31a801ab-aa6f-4a47-b927-95261b71a232	\N	d75a25f5-297c-4a28-946a-539986fa0990	Can write a short paragraph	\N	2	t	2025-12-22 15:58:06.637	2025-12-22 15:58:06.637
148d341c-ce88-4690-ab7e-048380a702aa	\N	d75a25f5-297c-4a28-946a-539986fa0990	Understands basic tenses	\N	3	t	2025-12-22 15:58:06.638	2025-12-22 15:58:06.638
1c8787de-c21b-411b-8f69-84745dabb7f7	\N	54186304-db41-446f-ba02-936c86da1e1e	Can introduce themselves	\N	1	t	2025-12-22 15:58:06.639	2025-12-22 15:58:06.639
06745fa0-f15a-415d-bc1f-859bc2fa5ae5	\N	54186304-db41-446f-ba02-936c86da1e1e	Can write a short paragraph	\N	2	t	2025-12-22 15:58:06.639	2025-12-22 15:58:06.639
344d5044-9817-4285-8494-a7fd76c70d3e	\N	54186304-db41-446f-ba02-936c86da1e1e	Understands basic tenses	\N	3	t	2025-12-22 15:58:06.64	2025-12-22 15:58:06.64
9aa41fc8-04c3-4939-86b7-2effaf9dee76	0ee92328-d594-43fb-b1a1-98873dfddceb	\N	test criteria	testing adding 	25	f	2025-12-23 18:01:23.143	2025-12-23 18:01:39.188
e262bb54-c13c-4362-a335-3186c877513e	ba5753d3-f6a8-4f2d-af70-dea2a69a5a37	\N	b1 criteria 1	test mode	25	t	2025-12-23 18:18:36.741	2025-12-23 18:18:36.741
3e7e68cc-f6cf-4769-9b01-9ac59735632a	ba5753d3-f6a8-4f2d-af70-dea2a69a5a37	\N	b1 criteria 2	test mode 2	26	t	2025-12-23 18:18:50.68	2025-12-23 18:18:50.68
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
1bbf0112-f992-45be-a71d-9e3dcb66bfdb	097669e6-5774-4a26-8de7-d519dadc8f3e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwOTc2NjllNi01Nzc0LTRhMjYtOGRlNy1kNTE5ZGFkYzhmM2UiLCJlbWFpbCI6ImFkbWluQGluc3RpdHV0ZS5jb20iLCJyb2xlIjoiQURNSU4iLCJzdHVkZW50SWQiOm51bGwsInRlYWNoZXJJZCI6bnVsbCwicGFyZW50SWQiOm51bGwsImlhdCI6MTc2NjQxOTE0MywiZXhwIjoxNzY3MDIzOTQzfQ.EtL7nmeWe8iSrZfYw_N4ETOVtmhRlr5ykJCe171fULU	2025-12-29 15:59:03.166	\N	\N	2025-12-22 15:59:03.167
83e32364-9d0f-4947-9ee9-09232c65ec7b	097669e6-5774-4a26-8de7-d519dadc8f3e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwOTc2NjllNi01Nzc0LTRhMjYtOGRlNy1kNTE5ZGFkYzhmM2UiLCJlbWFpbCI6ImFkbWluQGluc3RpdHV0ZS5jb20iLCJyb2xlIjoiQURNSU4iLCJzdHVkZW50SWQiOm51bGwsInRlYWNoZXJJZCI6bnVsbCwicGFyZW50SWQiOm51bGwsImlhdCI6MTc2NjUwMDg0NCwiZXhwIjoxNzY3MTA1NjQ0fQ.b2Wu61Lb7vG9SHPoO3IXLOFUeAX78ZMY8rUD_r_EcDM	2025-12-30 14:40:44.107	\N	\N	2025-12-23 14:40:44.108
16778567-e87e-47dc-9fad-cff2a904715f	097669e6-5774-4a26-8de7-d519dadc8f3e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwOTc2NjllNi01Nzc0LTRhMjYtOGRlNy1kNTE5ZGFkYzhmM2UiLCJlbWFpbCI6ImFkbWluQGluc3RpdHV0ZS5jb20iLCJyb2xlIjoiQURNSU4iLCJzdHVkZW50SWQiOm51bGwsInRlYWNoZXJJZCI6bnVsbCwicGFyZW50SWQiOm51bGwsImlhdCI6MTc2NjUwMTAwNCwiZXhwIjoxNzY3MTA1ODA0fQ.2fgaYHr0Dqoa_08ZYU7JDdQtyXf6XOCDBrTV9cwhcv8	2025-12-30 14:43:24.453	\N	\N	2025-12-23 14:43:24.454
800ede40-a3e6-400b-9326-f883cadb945b	d86baa6c-a5e7-4052-9207-29e8849cde50	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkODZiYWE2Yy1hNWU3LTQwNTItOTIwNy0yOWU4ODQ5Y2RlNTAiLCJlbWFpbCI6IkFtYWxAZnVuY3Rpb24uYmgiLCJyb2xlIjoiVEVBQ0hFUiIsInN0dWRlbnRJZCI6bnVsbCwidGVhY2hlcklkIjoiMWZmMWY5ZDAtMzI0Ny00ZGEwLWFmMTctYzY5Y2NiYjE2YjRhIiwicGFyZW50SWQiOm51bGwsImlhdCI6MTc2NjUxMzgwMywiZXhwIjoxNzY3MTE4NjAzfQ.meU4WFsu8ntIrb87YBLJ2PUIv3_4AMKU2X1mC4IbMGs	2025-12-30 18:16:43.076	\N	\N	2025-12-23 18:16:43.077
6078e8b5-381c-40b0-b032-04480d9e242e	097669e6-5774-4a26-8de7-d519dadc8f3e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwOTc2NjllNi01Nzc0LTRhMjYtOGRlNy1kNTE5ZGFkYzhmM2UiLCJlbWFpbCI6ImFkbWluQGluc3RpdHV0ZS5jb20iLCJyb2xlIjoiQURNSU4iLCJzdHVkZW50SWQiOm51bGwsInRlYWNoZXJJZCI6bnVsbCwicGFyZW50SWQiOm51bGwsImlhdCI6MTc2NjUxMzg4MSwiZXhwIjoxNzY3MTE4NjgxfQ.PsGFeVYLIAZJ93zgT3WJr6iVnL5ab2keu841Tr8J76s	2025-12-30 18:18:01.721	\N	\N	2025-12-23 18:18:01.722
30cfba59-e782-4cc3-95a0-9eb448c0c16c	d86baa6c-a5e7-4052-9207-29e8849cde50	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkODZiYWE2Yy1hNWU3LTQwNTItOTIwNy0yOWU4ODQ5Y2RlNTAiLCJlbWFpbCI6IkFtYWxAZnVuY3Rpb24uYmgiLCJyb2xlIjoiVEVBQ0hFUiIsInN0dWRlbnRJZCI6bnVsbCwidGVhY2hlcklkIjoiMWZmMWY5ZDAtMzI0Ny00ZGEwLWFmMTctYzY5Y2NiYjE2YjRhIiwicGFyZW50SWQiOm51bGwsImlhdCI6MTc2NjUxMzk3MSwiZXhwIjoxNzY3MTE4NzcxfQ.et6yqGnKsQdVLbR6IomgdewV22tTuwRyLo9KvH5E1eU	2025-12-30 18:19:31.273	\N	\N	2025-12-23 18:19:31.274
\.


--
-- Data for Name: SpeakingSlot; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."SpeakingSlot" (id, "teacherId", "studentId", "testSessionId", "slotDate", "slotTime", "durationMinutes", status, feedback, "createdAt", "updatedAt", final_level, mcq_level, speaking_level) FROM stdin;
c86f6506-4f97-44ff-b35e-e94ba8a508ae	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	01d5f030-fd19-443d-8be4-06a510eb91f5	\N	2025-12-24	07:00:00	15	BOOKED	\N	2025-12-23 17:38:47.325	2025-12-23 17:38:47.325	\N	\N	\N
171755b1-a65a-46a8-9ba2-579ece7be36c	1ff1f9d0-3247-4da0-af17-c69ccbb16b4a	030a6d76-514a-4d73-b282-b7811216a84b	\N	2025-12-24	08:00:00	15	BOOKED	\N	2025-12-23 17:38:47.333	2025-12-23 17:38:47.333	\N	\N	\N
08f652d9-7db9-4679-91ce-3cdfbd11dfad	2ad3ea71-eca1-44e2-a1e5-e6f435e55316	0af10065-58a8-4f9f-bbc9-6a7c5290c082	\N	2025-12-24	09:00:00	15	BOOKED	\N	2025-12-23 17:38:47.334	2025-12-23 17:38:47.334	\N	\N	\N
1ecce4fb-e864-4792-bb3a-3f12d63940ef	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	0cf18f7d-d9bc-4660-9263-8bb9899ef4fa	\N	2025-12-22	14:00:00	15	COMPLETED	Good performance, needs more confidence.	2025-12-23 17:38:47.334	2025-12-23 17:38:47.334	B1	B1	B1
856662b4-2615-4eaa-af50-b91515d49536	1ff1f9d0-3247-4da0-af17-c69ccbb16b4a	14b40e29-07d0-49c5-ab33-2f32ad8a7da3	\N	2025-12-22	15:00:00	15	COMPLETED	Good performance, needs more confidence.	2025-12-23 17:38:47.335	2025-12-23 17:38:47.335	C1	C1	C1
a0968714-cc45-4da2-9112-7c3c370527fd	1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	fe27f0b0-c187-4980-a3b4-0d5a9305ea20	b0a2a3fd-de04-473e-8604-7edad9cc6a9c	2025-12-25	06:00:00	15	BOOKED	\N	2025-12-23 17:38:47.335	2025-12-23 17:57:03.245	\N	\N	\N
\.


--
-- Data for Name: Student; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Student" (id, "userId", cpr, "firstName", "createdAt", area, block, "dateOfBirth", email, gender, "healthIssues", "houseNo", "howHeardAbout", "isActive", "needsTransport", notes, "preferredCenter", "preferredTiming", "referralPerson", road, "schoolType", "schoolYear", "secondName", "thirdName", "updatedAt", "canSeePayment", current_level, "profilePicture") FROM stdin;
52056d5f-193e-4ed9-8726-6b9ca1864760	25e0842f-faec-417f-b271-fbdd8d7c2365	888887777	test	2025-12-23 17:45:55.299	\N	\N	2005-06-23	test@gmail.com	MALE	\N	\N	\N	t	f	\N	\N	\N	\N	\N	\N	\N	teste	test	2025-12-23 17:45:55.299	t	\N	\N
587127a3-91c4-4294-a0f3-183c33658655	ad0a6dd7-690b-420f-9b1c-6f0a2709e12b	110167841	Aysha	2025-12-22 15:58:06.563	Hamad Town	\N	2011-02-19	\N	FEMALE	\N	4912	\N	t	f	\N	\N	\N	\N	Road 1234	\N	\N	Nasser	Yusuf	2025-12-22 15:58:06.563	t	A1	\N
4b5a82f7-8ffc-481b-a7fa-e1c433477fb8	a1711337-a8c6-4104-8544-419e9b2b7f8e	090227024	Huda	2025-12-22 15:58:06.565	Budaiya	\N	2009-11-19	\N	FEMALE	\N	3312	\N	t	f	\N	\N	\N	\N	Road 4512	\N	\N	Nasser	Hassan	2025-12-22 15:58:06.565	t	A2	\N
e35a02ed-d6b1-4d48-9d25-07b7338f650c	8ed56d51-d091-4b35-bf11-c46c7fa89547	110443399	Ali	2025-12-22 15:58:06.566	Juffair	\N	2011-06-11	\N	MALE	\N	9954	\N	t	f	\N	\N	\N	\N	Road 1234	\N	\N	Fakhro	Musa	2025-12-22 15:58:06.566	t	C2	\N
dab5bf12-9910-4425-97b8-ebc7ee5eb2cb	c77cc0a1-dc61-4947-8b23-72ac901d52e8	070838009	Zahra	2025-12-22 15:58:06.567	Saar	\N	2007-05-31	\N	FEMALE	\N	8985	\N	t	f	\N	\N	\N	\N	Block 338	\N	\N	Abdulla	Hussain	2025-12-22 15:58:06.567	t	A2	\N
b111a2f6-b38e-4dc8-af66-806054736478	fd9b9098-85a0-4425-8cdb-8d580357c4fe	120423844	Ebrahim	2025-12-22 15:58:06.567	Saar	\N	2012-02-16	\N	MALE	\N	6807	\N	t	f	\N	\N	\N	\N	Ave 22	\N	\N	Al-Najjar	Hassan	2025-12-22 15:58:06.567	t	C2	\N
ac145ef2-adc1-46aa-8a62-16c23a31d0e3	a25d475a-4f53-4781-8cd4-9123e6901a64	070979346	Lulwa	2025-12-22 15:58:06.569	Hidd	\N	2007-07-19	\N	FEMALE	\N	4475	\N	t	f	\N	\N	\N	\N	Block 338	\N	\N	Abdulla	Mahmood	2025-12-22 15:58:06.569	t	C2	\N
232eea0e-769a-46d0-ac81-00311135730c	dea36523-ac89-4ad3-8043-f778bedef088	120545957	Dana	2025-12-22 15:58:06.57	Isa Town	\N	2012-10-23	\N	FEMALE	\N	4332	\N	t	f	\N	\N	\N	\N	Block 338	\N	\N	Al-Musawi	Ali	2025-12-22 15:58:06.57	t	C1	\N
0af10065-58a8-4f9f-bbc9-6a7c5290c082	ffd69f89-a2c6-4705-966b-d11d787c20bb	081140206	Salman	2025-12-22 15:58:06.57	Saar	\N	2008-09-20	\N	MALE	\N	8137	\N	t	f	\N	\N	\N	\N	Ave 22	\N	\N	Kamal	Salman	2025-12-22 15:58:06.57	t	A1	\N
d94bd343-a801-4c63-ab50-db0d69bd5fa8	29afb6ff-dbbc-48c3-89e0-ec7b0ad6f3d3	100134979	Salman	2025-12-22 15:58:06.571	Hidd	\N	2010-02-02	\N	MALE	\N	4005	\N	t	f	\N	\N	\N	\N	Ave 22	\N	\N	Sharif	Omar	2025-12-22 15:58:06.571	t	A2	\N
1b02d4d5-d86d-4b2f-9502-c8d3cd5421d1	cf5d14e8-36ff-4596-a711-5768b46d60e1	111140774	Hussain	2025-12-22 15:58:06.571	Budaiya	\N	2011-06-09	\N	MALE	\N	9276	\N	t	f	\N	\N	\N	\N	Highway 55	\N	\N	Al-Musawi	Hamad	2025-12-22 15:58:06.571	t	A1	\N
acb1333b-c149-43b4-998f-a426e491babd	a67daff6-0cc8-4ef0-b96f-9653443a5c8e	130582841	Ebrahim	2025-12-22 15:58:06.572	Aali	\N	2013-01-24	\N	MALE	\N	1617	\N	t	f	\N	\N	\N	\N	Ave 22	\N	\N	Al-Musawi	Salman	2025-12-22 15:58:06.572	t	B1	\N
1e85643a-4117-4c34-b575-9d71e04c64b3	1d350fcb-4db4-4e39-bc4d-5797ad7fe883	050960748	Hussain	2025-12-22 15:58:06.572	Muharraq	\N	2005-09-04	\N	MALE	\N	7042	\N	t	f	\N	\N	\N	\N	Highway 55	\N	\N	Kanoo	Yusuf	2025-12-22 15:58:06.572	t	A1	\N
6a8c993b-b24c-483f-8401-990de2a8468d	b794b6e5-4b28-481f-b891-7384181b8625	110135198	Sara	2025-12-22 15:58:06.541	Riffa	\N	2011-09-12	\N	FEMALE	\N	1927	\N	t	f	\N	\N	\N	\N	Ave 22	\N	\N	Al-Najjar	Zaid	2025-12-22 15:58:06.585	t	B1	\N
5068fc24-7543-419a-a943-070583e1cf78	925bc4d1-4525-4c5f-b6c8-5c0e9aa4ae04	060325574	Mahmood	2025-12-22 15:58:06.543	Riffa	\N	2006-03-10	\N	MALE	\N	9758	\N	t	f	\N	\N	\N	\N	Highway 55	\N	\N	Sharif	Ahmed	2025-12-22 15:58:06.588	t	A1	\N
8807e7f4-f1a9-4f75-9c00-3002e79bde62	0d0d6151-6d55-4a8c-b0a7-9c6ad4ff2fa3	090886176	Sara	2025-12-22 15:58:06.544	Riffa	\N	2009-10-26	\N	FEMALE	\N	6719	\N	t	f	\N	\N	\N	\N	Ave 11	\N	\N	Kamal	Zaid	2025-12-22 15:58:06.589	t	B1	\N
ecfc2a74-33b6-4f53-b8b7-daa96fa7f849	4ee94d18-73f6-4f6d-9b37-ccfb2238dea6	090850323	Hamad	2025-12-22 15:58:06.544	Saar	\N	2009-08-22	\N	MALE	\N	8975	\N	t	f	\N	\N	\N	\N	Highway 55	\N	\N	Kamal	Jassim	2025-12-22 15:58:06.59	t	B2	\N
fcccd1a2-b628-4e4e-af83-577800b87eb9	5bbb0fc3-5bd4-4969-a930-ec713c60208f	110621591	Hamad	2025-12-22 15:58:06.545	Muharraq	\N	2011-05-20	\N	MALE	\N	6121	\N	t	f	\N	\N	\N	\N	Block 338	\N	\N	Kamal	Abdullah	2025-12-22 15:58:06.59	t	A1	\N
7cc8397c-dd7f-4a65-9038-7518e2b1f5c0	268e9892-e02c-4d2f-bec0-cb3a58f8a98f	120672155	Aysha	2025-12-22 15:58:06.546	Isa Town	\N	2012-08-10	\N	FEMALE	\N	2107	\N	t	f	\N	\N	\N	\N	Road 1234	\N	\N	Al-Najjar	Zaid	2025-12-22 15:58:06.592	t	A2	\N
b1608691-8a22-4db4-b4fe-1b89ea1c39e1	d409c414-4fc2-4f2a-a9ec-6988a33daac6	120296158	Ali	2025-12-22 15:58:06.546	Riffa	\N	2012-11-03	\N	MALE	\N	9101	\N	t	f	\N	\N	\N	\N	Block 338	\N	\N	Al-Najjar	Hussain	2025-12-22 15:58:06.593	t	C2	\N
030a6d76-514a-4d73-b282-b7811216a84b	12b62f6c-347d-43a6-b173-6d68245d5ec1	070558477	Yasmin	2025-12-22 15:58:06.547	Saar	\N	2007-08-23	\N	FEMALE	\N	7594	\N	t	f	\N	\N	\N	\N	Ave 11	\N	\N	Al-Najjar	Hamad	2025-12-22 15:58:06.594	t	A1	\N
2afedb2b-c22b-4480-955d-a5096bc3b169	30ca3f7a-7c15-4823-9674-c5bd499800ac	111096706	Mohammed	2025-12-22 15:58:06.548	Hidd	\N	2011-04-09	\N	MALE	\N	8645	\N	t	f	\N	\N	\N	\N	Block 338	\N	\N	Al-Alawi	Hamad	2025-12-22 15:58:06.595	t	B1	\N
4aa39146-1351-4fb5-96ce-35427e7779f2	7fbfb7ce-7e38-4b5c-88f4-48c05ed81d02	100884064	Ebrahim	2025-12-22 15:58:06.549	Riffa	\N	2010-11-05	\N	MALE	\N	4135	\N	t	f	\N	\N	\N	\N	Ave 22	\N	\N	Al-Musawi	Bilal	2025-12-22 15:58:06.596	t	C2	\N
261b7b00-8786-46cb-977d-90e9966693af	dbc2ace2-080b-44a0-9d92-16ccfd5836f6	090362152	Ebrahim	2025-12-22 15:58:06.549	Juffair	\N	2009-05-13	\N	MALE	\N	1018	\N	t	f	\N	\N	\N	\N	Road 1234	\N	\N	Al-Musawi	Mohammed	2025-12-22 15:58:06.597	t	B2	\N
60aad4b2-12ab-4811-9525-b6421cf5f09e	6662e9e6-0c45-4f38-bbfa-08fe3548bdfe	050613387	Reem	2025-12-22 15:58:06.55	Riffa	\N	2005-04-03	\N	FEMALE	\N	5829	\N	t	f	\N	\N	\N	\N	Road 4512	\N	\N	Al-Musawi	Omar	2025-12-22 15:58:06.597	t	A2	\N
0cf18f7d-d9bc-4660-9263-8bb9899ef4fa	9e7bd0ec-4a9c-40fe-8d6c-f9e3b9625343	120452440	Dana	2025-12-22 15:58:06.551	Juffair	\N	2012-01-04	\N	FEMALE	\N	1832	\N	t	f	\N	\N	\N	\N	Ave 11	\N	\N	Al-Musawi	Isa	2025-12-22 15:58:06.599	t	A1	\N
6f550ee1-2210-40a3-8ce9-be314f58e9c6	1d5234e3-85c5-493b-8752-f9a7def7a461	140344735	Abdullah	2025-12-22 15:58:06.551	Aali	\N	2014-08-25	\N	MALE	\N	5811	\N	t	f	\N	\N	\N	\N	Block 338	\N	\N	Showaiter	Zaid	2025-12-22 15:58:06.6	t	B1	\N
e3b9a51f-8309-45c9-aa76-a4634cffa605	10a1b3f5-60b6-4666-9ca3-884e1d66406c	110740087	Jassim	2025-12-22 15:58:06.553	Isa Town	\N	2011-06-18	\N	MALE	\N	788	\N	t	f	\N	\N	\N	\N	Ave 22	\N	\N	Nasser	Ali	2025-12-22 15:58:06.601	t	B2	\N
b04b805b-3b78-4032-a3d9-0efc611cf949	ad98b0af-0760-4d5f-87b8-2656700e7276	131015927	Bilal	2025-12-22 15:58:06.553	Saar	\N	2013-07-13	\N	MALE	\N	1196	\N	t	f	\N	\N	\N	\N	Ave 22	\N	\N	Husain	Yusuf	2025-12-22 15:58:06.602	t	C2	\N
f3bcce20-bef5-4cd2-bc02-40c7aedb22b3	5d334dcd-ed86-48e0-8438-b09c53cf76af	071074086	Omar	2025-12-22 15:58:06.554	Manama	\N	2007-09-08	\N	MALE	\N	5474	\N	t	f	\N	\N	\N	\N	Ave 11	\N	\N	Husain	Khalid	2025-12-22 15:58:06.603	t	C2	\N
88f9c112-9dd4-4f23-b8e0-0b221c103593	a911c535-218a-44a0-9949-6c28eb9db1ae	110978160	Sara	2025-12-22 15:58:06.554	Aali	\N	2011-03-25	\N	FEMALE	\N	560	\N	t	f	\N	\N	\N	\N	Highway 55	\N	\N	Mohammed	Mahmood	2025-12-22 15:58:06.605	t	A2	\N
5efb68b1-a67d-4e81-b06e-ae3cc875a8ac	0cd13787-337e-4fdb-9cfe-d398a7a77961	070883198	Amal	2025-12-22 15:58:06.555	Juffair	\N	2007-04-11	\N	FEMALE	\N	1197	\N	t	f	\N	\N	\N	\N	Ave 22	\N	\N	Ali	Bilal	2025-12-22 15:58:06.606	t	C2	\N
4c1889a4-245d-4703-b4c1-c8e06a65d744	d16435dd-483e-4ee4-af7f-918c81d0fb88	110292904	Dana	2025-12-22 15:58:06.556	Budaiya	\N	2011-01-31	\N	FEMALE	\N	8846	\N	t	f	\N	\N	\N	\N	Road 1234	\N	\N	Kanoo	Ebrahim	2025-12-22 15:58:06.607	t	A1	\N
dd88c397-6b53-4e82-b7ae-2a1f7f3c2236	7b0923fd-10dc-4546-9a27-dd5a1695d26a	130889628	Bilal	2025-12-22 15:58:06.557	Manama	\N	2013-02-04	\N	MALE	\N	3067	\N	t	f	\N	\N	\N	\N	Road 1234	\N	\N	Haji	Ahmed	2025-12-22 15:58:06.608	t	A1	\N
b35431ae-2e69-45ca-a54d-384d271e004c	8fbb4c9c-fc2a-46bc-abf2-5814b42e8d01	060649269	Sara	2025-12-22 15:58:06.558	Manama	\N	2006-01-31	\N	FEMALE	\N	7542	\N	t	f	\N	\N	\N	\N	Road 1234	\N	\N	Husain	Omar	2025-12-22 15:58:06.609	t	B1	\N
ae31df7a-cf48-4be7-84f9-f8ee6753b7d4	a7c4efea-c916-4e42-bbf1-cfc3f87eae68	091178326	Lulwa	2025-12-22 15:58:06.559	Muharraq	\N	2009-09-06	\N	FEMALE	\N	2998	\N	t	f	\N	\N	\N	\N	Ave 22	\N	\N	Showaiter	Hamad	2025-12-22 15:58:06.61	t	A1	\N
b47fc07a-ee77-47ab-86b5-9d5b684baa91	e2955158-23a7-49a0-a2c8-be8db0d5318d	061061005	Noor	2025-12-22 15:58:06.559	Budaiya	\N	2006-08-04	\N	FEMALE	\N	7447	\N	t	f	\N	\N	\N	\N	Ave 11	\N	\N	Showaiter	Salman	2025-12-22 15:58:06.611	t	A1	\N
ac63ad7d-4bbd-40f7-a584-63100f95f39d	58fea127-a718-455a-9d42-a4538e0c865f	070135943	Musa	2025-12-22 15:58:06.561	Saar	\N	2007-11-23	\N	MALE	\N	8284	\N	t	f	\N	\N	\N	\N	Road 4512	\N	\N	Showaiter	Abdullah	2025-12-22 15:58:06.612	t	A2	\N
907d7f4c-f6b2-4ea8-863b-dc2c7be3a65b	5dd679ff-fae2-4797-a33c-582b804dc304	130468454	Layla	2025-12-22 15:58:06.573	Isa Town	\N	2013-01-06	\N	FEMALE	\N	450	\N	t	f	\N	\N	\N	\N	Ave 22	\N	\N	Ali	Bilal	2025-12-22 15:58:06.573	t	C2	\N
af4d7cc1-61f0-4774-8ca5-6ba9ac0074dc	fc747125-8c35-4db4-93ed-088483cf29f1	100776678	Noor	2025-12-22 15:58:06.575	Muharraq	\N	2010-06-03	\N	FEMALE	\N	5935	\N	f	f	\N	\N	\N	\N	Ave 11	\N	\N	Abdulla	Omar	2025-12-22 15:58:06.575	t	\N	\N
14b40e29-07d0-49c5-ab33-2f32ad8a7da3	1c044efc-7721-4f4d-af06-18c5ed882f82	110634696	Amal	2025-12-22 15:58:06.576	Muharraq	\N	2011-09-19	\N	FEMALE	\N	3864	\N	f	f	\N	\N	\N	\N	Road 1234	\N	\N	Haji	Jassim	2025-12-22 15:58:06.576	t	\N	\N
b9850bf7-2970-41ab-8d11-d20c302e6eaf	38e5892e-a5d5-435d-8baa-2640ebe5bd65	060982862	Sara	2025-12-22 15:58:06.576	Riffa	\N	2006-06-13	\N	FEMALE	\N	140	\N	f	f	\N	\N	\N	\N	Block 338	\N	\N	Kanoo	Hamad	2025-12-22 15:58:06.576	t	\N	\N
b55a9d6f-667d-4b88-a7d9-0ac98ed16dee	17bf7501-e2ae-4581-a0ca-4b82c9092429	110835278	Reem	2025-12-22 15:58:06.577	Manama	\N	2011-09-16	\N	FEMALE	\N	5111	\N	f	f	\N	\N	\N	\N	Road 1234	\N	\N	Al-Jalahma	Isa	2025-12-22 15:58:06.577	t	\N	\N
ecca0758-12a6-426d-904f-107fe8619cac	b0eca972-883f-48c1-8c5a-f99c6d1cd60c	100897024	Yusuf	2025-12-22 15:58:06.577	Hidd	\N	2010-10-13	\N	MALE	\N	4040	\N	f	f	\N	\N	\N	\N	Ave 22	\N	\N	Al-Najjar	Isa	2025-12-22 15:58:06.577	t	\N	\N
7b1653e0-df84-4f29-a2a1-58371a73b5ed	fcf854a2-d2d2-4501-a611-900a08a24210	080917860	Bilal	2025-12-22 15:58:06.578	Hidd	\N	2008-05-09	\N	MALE	\N	4746	\N	f	f	\N	\N	\N	\N	Ave 22	\N	\N	Nasser	Isa	2025-12-22 15:58:06.578	t	\N	\N
3713eaac-280c-461e-96c1-76acf150aede	f157d2d9-feb3-43b3-96e3-e6792fd9d509	060866131	Yasmin	2025-12-22 15:58:06.578	Isa Town	\N	2006-07-05	\N	FEMALE	\N	5214	\N	f	f	\N	\N	\N	\N	Highway 55	\N	\N	Kanoo	Jassim	2025-12-22 15:58:06.578	t	\N	\N
e78fdba9-0efc-4c2b-85c9-13848622f909	15ed3202-250b-4817-b771-619fc10d1504	110122662	Jassim	2025-12-22 15:58:06.579	Budaiya	\N	2011-01-18	\N	MALE	\N	4822	\N	f	f	\N	\N	\N	\N	Road 4512	\N	\N	Abdulla	Yusuf	2025-12-22 15:58:06.579	t	\N	\N
4498dbaf-10dc-4632-ba4a-0303e89799a5	0c6b25f5-9b68-469e-a563-57b15850f203	060447376	Abdullah	2025-12-22 15:58:06.581	Isa Town	\N	2006-02-24	\N	MALE	\N	1912	\N	f	f	\N	\N	\N	\N	Road 1234	\N	\N	Kamal	Mahmood	2025-12-22 15:58:06.581	t	\N	\N
01d5f030-fd19-443d-8be4-06a510eb91f5	d5cc2a10-0814-4174-ba9e-d3c9b51020f3	070379097	Lulwa	2025-12-22 15:58:06.581	Juffair	\N	2007-02-22	\N	FEMALE	\N	6385	\N	f	f	\N	\N	\N	\N	Highway 55	\N	\N	Mohammed	Mahmood	2025-12-22 15:58:06.581	t	\N	\N
40e95b42-5ce4-4b9d-9ca3-451ccdc6c6e3	8c9b68fb-0ade-4688-8e82-c579e66d9aec	050163014	Ali	2025-12-22 15:58:06.537	Riffa	\N	2005-05-05	\N	MALE	\N	9761	\N	t	f	\N	\N	\N	\N	Ave 22	\N	\N	Al-Alawi	Salman	2025-12-22 15:58:06.583	t	A2	\N
36df9b81-9a65-466e-b6a0-d3618296cdf0	4e3ab7ec-5a3f-403a-a4d0-e21f42311643	140558512	Lulwa	2025-12-22 15:58:06.552	Aali	\N	2014-07-15	\N	FEMALE	\N	3187	\N	t	f	\N	\N	\N	\N	Ave 11	\N	\N	Showaiter	Hassan	2025-12-22 15:58:06.6	t	C2	\N
fe27f0b0-c187-4980-a3b4-0d5a9305ea20	e45c1727-0e7d-4c3c-8f67-5b5b0cbb6aa1	040704734	Sayed Qasim	2025-12-23 15:01:17.427	\N	\N	2004-07-13	202202231@student.polytechnic.bh	MALE	\N	\N	\N	t	f	\N	\N	\N	\N	\N	\N	\N	Ahmed	Alsari	2025-12-23 15:01:43.334	t	B2	\N
\.


--
-- Data for Name: StudentCriteriaCompletion; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."StudentCriteriaCompletion" (id, "studentId", "criteriaId", "enrollmentId", completed, "completedAt", "createdAt") FROM stdin;
476bfff6-8eea-4045-97b1-359f5d0c4687	fe27f0b0-c187-4980-a3b4-0d5a9305ea20	e262bb54-c13c-4362-a335-3186c877513e	46490e9a-3c34-4117-af3a-6ae7557ecc37	t	2025-12-23 18:19:41.565	2025-12-23 18:19:41.568
\.


--
-- Data for Name: StudentPaymentPlan; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."StudentPaymentPlan" (id, "enrollmentId", "totalAmount", "discountAmount", "discountReason", "finalAmount", "totalInstallments", status, "createdAt", "updatedAt") FROM stdin;
99cd4158-cc22-4031-9899-da104b5bb4bb	1a73b46e-595a-4ea9-a321-f4986e50b84d	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.642	2025-12-22 15:58:06.642
f5fb65ff-10f6-44a1-9781-a1ce5769e803	0268859a-d6f4-4a2b-83ad-664b1c290746	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.645	2025-12-22 15:58:06.645
3b313050-24d2-4dc0-b299-92035cd1a2e4	454225b5-0ebb-4513-a993-05258c5fa923	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.647	2025-12-22 15:58:06.647
efa54d82-da0b-4188-941f-944b5e9adc35	e903193f-1c6d-4f00-be7d-04e17e41f539	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.648	2025-12-22 15:58:06.648
06294dbe-44fb-4fc1-a54a-e73296b21425	32564ced-12ec-4296-8792-265b79f85a89	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.65	2025-12-22 15:58:06.65
23ceca93-9ec0-4c95-b289-11c09afd1978	2a7a9425-f4c3-4cd0-b9d7-f468074dbc59	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.651	2025-12-22 15:58:06.651
c5e99b3c-fe7e-49fe-96ec-95cd3714140e	31b13097-364e-48ac-9c00-2a9fae96d510	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.652	2025-12-22 15:58:06.652
1de5d637-b21c-40d3-8197-f5d54abb3091	3614045a-3550-4c1d-8c66-86909608d129	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.653	2025-12-22 15:58:06.653
1f325665-e230-4669-97c5-1f58bc27827e	d5eacb33-23b2-432c-8e37-0ebe0fa5ddb0	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.654	2025-12-22 15:58:06.654
aa99df66-513d-4eae-be0b-842a00e2b3a2	bcc1aa0b-59ed-4717-84ac-34bfd41f6d97	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.655	2025-12-22 15:58:06.655
0612846d-0b7a-4538-95ea-dbf13e52a879	528ce2ac-aa8c-4438-8f96-87e1861ee65f	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.656	2025-12-22 15:58:06.656
95cf3790-9e32-4596-9066-46b403b1b433	36cfccfa-f398-43b2-b279-99be727084d7	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.657	2025-12-22 15:58:06.657
3817cd9d-620c-4310-8bed-8b7bfbc3f131	4658d618-177e-47d6-99fe-32803d76a679	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.657	2025-12-22 15:58:06.657
a8f4a61f-9b38-49e8-a4a6-1d589f308a3e	456ef99b-638d-432a-91d0-1c16edad4a2e	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.659	2025-12-22 15:58:06.659
b79595aa-2f2f-488b-8918-57d53136edfe	cbb1e0f1-7bbe-4488-b90d-12a52fa2eebd	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.66	2025-12-22 15:58:06.66
a4292a54-24f9-46fb-ba7d-a87c61c94211	aac80ed0-3e9a-458c-8801-77316e993e7e	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.661	2025-12-22 15:58:06.661
b53d150d-2461-48aa-a3f1-3fafa983238d	17b61afe-1938-441a-819f-3f627fbc28d3	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.662	2025-12-22 15:58:06.662
a2ae2276-f2f5-48e5-acd9-2a48673ebc22	c974b284-825b-4fba-961c-e3959a3244aa	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.663	2025-12-22 15:58:06.663
02b4a786-9f40-4d7a-bf8c-1018b105547a	fdd6acba-5c21-49dd-af9b-a42d11e93196	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.664	2025-12-22 15:58:06.664
855cc43e-93b3-4fe5-ae51-885b5714b9d7	0c79fb07-7123-47ee-9506-a88e183287ff	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.664	2025-12-22 15:58:06.664
9e1dabcf-2bdb-4770-ab19-6b3568185dbe	ffef78fc-d3d7-42bd-b69f-413ac5791dee	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.665	2025-12-22 15:58:06.665
fe7403fa-f49c-4826-931e-0da1ad56eec1	b0f61f7c-ec77-4b44-a451-177504e0d7d6	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.666	2025-12-22 15:58:06.666
e260f9e6-3dea-4b0c-a45d-fa447782852f	02b46272-361a-460d-8e49-75707d402f5f	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.668	2025-12-22 15:58:06.668
8cf14801-6684-4320-b7ad-2c24383eb18e	5e05797a-1e19-4688-8fff-0526251dc129	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.669	2025-12-22 15:58:06.669
cd88223d-4a32-40aa-a892-c0858fa95214	f6d95abe-c5ef-403a-8963-b531b78b2a29	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.67	2025-12-22 15:58:06.67
082dfd2d-c0b1-4ce5-9486-58e2612f3373	ae446a57-2d97-414e-a679-c76c9a5c04bc	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.67	2025-12-22 15:58:06.67
9b082b2e-57fb-4136-80cb-68c6feeabd7d	932eb119-dc3f-429b-aa04-c0c4beb91027	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.671	2025-12-22 15:58:06.671
40df3103-43da-4429-a64c-b9867594de4b	14611bae-3d7c-43f0-be5f-07cf73098894	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.673	2025-12-22 15:58:06.673
b7f64ce3-f7bd-46ff-b78a-16ac8b5f947a	aee4a90a-bd89-4470-a2f0-1b4db2d14423	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.674	2025-12-22 15:58:06.674
644c83d4-9b37-4fd2-b1ed-f5fae1699c86	02421bc7-ec30-44c0-847e-0019a7e788c4	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.674	2025-12-22 15:58:06.674
4562482a-cac4-4418-ae50-2825382683c3	73973472-ccec-4ffa-b548-e6ced656185e	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.675	2025-12-22 15:58:06.675
a3bcd9af-3294-4228-928b-a81eef1631f3	bcfa1e2d-bf2a-4c39-aef5-fdaa7769c2e0	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.676	2025-12-22 15:58:06.676
e2265eb5-314e-4a42-bafe-3a7759f154cc	aa370f2a-8902-4e1a-8285-1a825f61d4e9	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.677	2025-12-22 15:58:06.677
3a4cafd3-ee03-427a-95e9-c639c1351a23	50a588ea-2515-4b52-8e48-fa1990381dcd	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.678	2025-12-22 15:58:06.678
84d7652b-a631-490e-b5e1-6567a008f5c4	f078d981-e81c-4efe-b649-627956478519	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.68	2025-12-22 15:58:06.68
235f4e35-2c85-43b8-9aec-4cd4ce4821fd	60d909d7-4be1-4be9-a304-96c077b68440	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.681	2025-12-22 15:58:06.681
684a716e-3e4b-4f03-965b-f5dc36dc3088	ef13cb5a-9a1f-4490-854b-3cea6b79b494	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.682	2025-12-22 15:58:06.682
bb114f12-343d-4239-a154-b629a32ee826	f3ccfe19-3e4e-4f42-b8dc-eebd187d220e	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.683	2025-12-22 15:58:06.683
eb84723d-3ed1-4334-b71b-08dd73062d7f	5f4f26e5-a631-408a-9770-3ba99ff42de5	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.683	2025-12-22 15:58:06.683
45b3d302-d4fe-4505-b731-4190f7b418bf	84850de5-8101-4f88-9cc3-005af7427183	150.00	0.00	\N	150.00	3	ACTIVE	2025-12-22 15:58:06.684	2025-12-22 15:58:06.684
2f2d604f-2f54-4f12-bef7-c4ab8c76809f	666c10bc-4f87-4f98-bf2b-a9070f2bcd78	150.00	0.00	\N	150.00	3	COMPLETED	2025-12-22 15:58:06.685	2025-12-22 15:58:06.685
bb92ac79-fe2c-4c14-947d-b18dd01678a6	1d706e1c-9273-45aa-b8ab-aaf1e3e97ef1	150.00	0.00	\N	150.00	3	COMPLETED	2025-12-22 15:58:06.686	2025-12-22 15:58:06.686
d4c93c21-c2f9-418c-af1f-80a697c835a6	ef702641-b90f-4442-b076-1b2914447648	150.00	0.00	\N	150.00	3	COMPLETED	2025-12-22 15:58:06.687	2025-12-22 15:58:06.687
50a39522-5152-43b7-82d9-b5b2d06bcccf	030313fa-931d-4007-a86b-1fecb9402767	150.00	0.00	\N	150.00	3	COMPLETED	2025-12-22 15:58:06.687	2025-12-22 15:58:06.687
f967b520-604a-446d-b2f0-12dbd9f217df	b9cdf8f8-015d-49cb-9c95-f718f2af4790	150.00	0.00	\N	150.00	3	COMPLETED	2025-12-22 15:58:06.688	2025-12-22 15:58:06.688
ddc5e684-28f3-4899-8097-5c10b197dd73	a2da7538-b4f8-439d-b732-e40c750957b1	150.00	0.00	\N	150.00	3	COMPLETED	2025-12-22 15:58:06.69	2025-12-22 15:58:06.69
87243507-7117-4a93-8a97-2dcabcc6189f	07c15cf7-21a1-49b9-bf28-023a60032742	150.00	0.00	\N	150.00	3	COMPLETED	2025-12-22 15:58:06.691	2025-12-22 15:58:06.691
3f816b95-eba7-4a5e-92f1-af50ff517d7e	1a7d3104-51ff-466c-b6d5-48d18ae41aad	150.00	0.00	\N	150.00	3	COMPLETED	2025-12-22 15:58:06.692	2025-12-22 15:58:06.692
7e31343f-609d-43d7-80fb-d123b8222216	3f00d18b-8e75-4a03-9768-4d38ab3ae185	150.00	0.00	\N	150.00	3	COMPLETED	2025-12-22 15:58:06.694	2025-12-22 15:58:06.694
585c1782-fbcc-4a39-870a-d1122da80ec9	ee37a274-16e6-46bc-a06b-fabee70987fe	150.00	0.00	\N	150.00	3	COMPLETED	2025-12-22 15:58:06.695	2025-12-22 15:58:06.695
b8ce0d0f-b309-481d-81f2-133a7b682095	46490e9a-3c34-4117-af3a-6ae7557ecc37	200.00	20.00	Old Customer	180.00	4	ACTIVE	2025-12-23 16:05:28.725	2025-12-23 16:05:28.725
\.


--
-- Data for Name: Teacher; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Teacher" (id, "userId", "firstName", "lastName", specialization, "isActive", "availableForSpeakingTests", "createdAt", "updatedAt") FROM stdin;
1ebcb06b-01f1-48f9-9a4c-2b8a890bd5ef	03039459-7ed9-42da-b7ab-1cc9d58134ee	Fatima	Al-Sayed	General English	t	t	2025-12-22 15:58:06.533	2025-12-22 15:58:06.533
4ff18cf0-6bc3-49fe-946e-8b73e16101ec	d6e50cfd-8624-4911-b3a6-6c7ce3091e71	John	Thompson	IELTS	t	t	2025-12-22 15:58:06.534	2025-12-22 15:58:06.534
c33017e7-2df1-4af7-99b6-5265924f7e3a	84b39d41-cc1d-410a-a1b0-03db8d85658d	Sarah	Miller	Business English	t	t	2025-12-22 15:58:06.535	2025-12-22 15:58:06.535
763e000a-2c75-41b4-8b81-f95249b7e1a1	191fa461-84d7-4e99-9e63-1a410ce28fc4	Yusuf	Kamal	General English	t	t	2025-12-22 15:58:06.535	2025-12-22 15:58:06.535
57b9610f-c5e9-4473-afa7-0801d016ec78	6532b425-de72-4113-8953-e53ad6e64d10	Emma	Wilson	Kids	t	t	2025-12-22 15:58:06.536	2025-12-22 15:58:06.536
2ad3ea71-eca1-44e2-a1e5-e6f435e55316	a9599351-4d4d-440e-a315-71ef9aa26acd	Robert	Oldman	Retired	f	t	2025-12-22 15:58:06.536	2025-12-22 15:58:06.536
1ff1f9d0-3247-4da0-af17-c69ccbb16b4a	d86baa6c-a5e7-4052-9207-29e8849cde50	Amal	Ali	IELTS	t	t	2025-12-23 15:22:05.458	2025-12-23 15:22:05.458
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
db894dc3-0cc9-40b6-8ab0-17a0107892e8	2c533e39-8e4a-417e-9a04-812379d60143	Winter 2025	2025-01-01	2025-03-31	t	t	2025-12-22 15:58:06.525
21a63dc8-b4ae-47b7-b1aa-759afba071d7	2c533e39-8e4a-417e-9a04-812379d60143	Spring 2025	2025-04-01	2025-06-30	f	t	2025-12-22 15:58:06.526
53fd04cf-c5d2-4f31-bb47-f6588686e573	2c533e39-8e4a-417e-9a04-812379d60143	Fall 2024	2024-09-01	2024-12-31	f	f	2025-12-22 15:58:06.527
3e63b93b-7c80-4a28-abc6-878a1b3941ab	d60a6818-26c9-4e7d-8ab9-ce32e5a2ff07	fall 2025	2025-12-23	2026-02-26	f	t	2025-12-23 17:31:31.632
\.


--
-- Data for Name: Test; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Test" (id, name, "testType", "levelId", "totalQuestions", "durationMinutes", "isActive", "createdAt") FROM stdin;
5bc00280-1966-486d-b207-2a7460929b7e	General Placement Test	PLACEMENT	\N	50	60	t	2025-12-23 17:47:24.092
\.


--
-- Data for Name: TestQuestion; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."TestQuestion" (id, "testId", "questionText", "questionType", options, "correctAnswer", points, "orderNumber", "createdAt") FROM stdin;
\.


--
-- Data for Name: TestSession; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."TestSession" (id, "studentId", "testId", "startedAt", "completedAt", score, answers, status, "createdAt") FROM stdin;
b0a2a3fd-de04-473e-8604-7edad9cc6a9c	fe27f0b0-c187-4980-a3b4-0d5a9305ea20	5bc00280-1966-486d-b207-2a7460929b7e	2025-12-23 17:47:24.1	2025-12-23 17:47:24.1	85.50	\N	SPEAKING_SCHEDULED	2025-12-23 17:47:24.101
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."User" (id, email, phone, role, "isActive", "lastLogin", "createdAt", "updatedAt") FROM stdin;
03039459-7ed9-42da-b7ab-1cc9d58134ee	fatima.alsayed@institute.com	39001234	TEACHER	t	\N	2025-12-22 15:58:06.533	2025-12-22 15:58:06.533
d6e50cfd-8624-4911-b3a6-6c7ce3091e71	john.thompson@institute.com	39005678	TEACHER	t	\N	2025-12-22 15:58:06.534	2025-12-22 15:58:06.534
84b39d41-cc1d-410a-a1b0-03db8d85658d	sarah.miller@institute.com	39009012	TEACHER	t	\N	2025-12-22 15:58:06.535	2025-12-22 15:58:06.535
191fa461-84d7-4e99-9e63-1a410ce28fc4	yusuf.kamal@institute.com	39003456	TEACHER	t	\N	2025-12-22 15:58:06.535	2025-12-22 15:58:06.535
6532b425-de72-4113-8953-e53ad6e64d10	emma.wilson@institute.com	39007890	TEACHER	t	\N	2025-12-22 15:58:06.536	2025-12-22 15:58:06.536
a9599351-4d4d-440e-a315-71ef9aa26acd	robert.oldman@institute.com	39990000	TEACHER	f	\N	2025-12-22 15:58:06.536	2025-12-22 15:58:06.536
8c9b68fb-0ade-4688-8e82-c579e66d9aec	khalid.al-alawi.79@icloud.com	36877070	STUDENT	t	\N	2025-12-22 15:58:06.537	2025-12-22 15:58:06.537
b794b6e5-4b28-481f-b891-7384181b8625	lulwa.al-najjar.89@icloud.com	37765066	STUDENT	t	\N	2025-12-22 15:58:06.541	2025-12-22 15:58:06.541
925bc4d1-4525-4c5f-b6c8-5c0e9aa4ae04	mahmood.haji.86@icloud.com	36226561	STUDENT	t	\N	2025-12-22 15:58:06.542	2025-12-22 15:58:06.542
0d0d6151-6d55-4a8c-b0a7-9c6ad4ff2fa3	sara.ali.50@gmail.com	37343417	STUDENT	t	\N	2025-12-22 15:58:06.543	2025-12-22 15:58:06.543
4ee94d18-73f6-4f6d-9b37-ccfb2238dea6	hamad.radhi.83@icloud.com	34765640	STUDENT	t	\N	2025-12-22 15:58:06.544	2025-12-22 15:58:06.544
5bbb0fc3-5bd4-4969-a930-ec713c60208f	hamad.ali.11@outlook.com	36250321	STUDENT	t	\N	2025-12-22 15:58:06.545	2025-12-22 15:58:06.545
268e9892-e02c-4d2f-bec0-cb3a58f8a98f	aysha.haji.39@outlook.com	38587136	STUDENT	t	\N	2025-12-22 15:58:06.546	2025-12-22 15:58:06.546
d409c414-4fc2-4f2a-a9ec-6988a33daac6	ali.radhi.79@outlook.com	33377137	STUDENT	t	\N	2025-12-22 15:58:06.546	2025-12-22 15:58:06.546
12b62f6c-347d-43a6-b173-6d68245d5ec1	yasmin.kanoo.50@gmail.com	37812478	STUDENT	t	\N	2025-12-22 15:58:06.547	2025-12-22 15:58:06.547
30ca3f7a-7c15-4823-9674-c5bd499800ac	mohammed.fakhro.58@icloud.com	34468492	STUDENT	t	\N	2025-12-22 15:58:06.548	2025-12-22 15:58:06.548
7fbfb7ce-7e38-4b5c-88f4-48c05ed81d02	ebrahim.al-zayani.83@outlook.com	37353043	STUDENT	t	\N	2025-12-22 15:58:06.548	2025-12-22 15:58:06.548
dbc2ace2-080b-44a0-9d92-16ccfd5836f6	ebrahim.kanoo.96@outlook.com	38644135	STUDENT	t	\N	2025-12-22 15:58:06.549	2025-12-22 15:58:06.549
6662e9e6-0c45-4f38-bbfa-08fe3548bdfe	reem.al-haddad.21@outlook.com	34219619	STUDENT	t	\N	2025-12-22 15:58:06.55	2025-12-22 15:58:06.55
9e7bd0ec-4a9c-40fe-8d6c-f9e3b9625343	dana.mohammed.57@gmail.com	37431889	STUDENT	t	\N	2025-12-22 15:58:06.55	2025-12-22 15:58:06.55
1d5234e3-85c5-493b-8752-f9a7def7a461	abdullah.kamal.63@gmail.com	38984808	STUDENT	t	\N	2025-12-22 15:58:06.551	2025-12-22 15:58:06.551
4e3ab7ec-5a3f-403a-a4d0-e21f42311643	lulwa.mohammed.21@icloud.com	35290733	STUDENT	t	\N	2025-12-22 15:58:06.552	2025-12-22 15:58:06.552
10a1b3f5-60b6-4666-9ca3-884e1d66406c	jassim.showaiter.73@outlook.com	38803247	STUDENT	t	\N	2025-12-22 15:58:06.552	2025-12-22 15:58:06.552
ad98b0af-0760-4d5f-87b8-2656700e7276	bilal.al-zayani.81@icloud.com	34427221	STUDENT	t	\N	2025-12-22 15:58:06.553	2025-12-22 15:58:06.553
5d334dcd-ed86-48e0-8438-b09c53cf76af	omar.abdulla.41@outlook.com	33869395	STUDENT	t	\N	2025-12-22 15:58:06.554	2025-12-22 15:58:06.554
a911c535-218a-44a0-9949-6c28eb9db1ae	sara.sharif.91@gmail.com	34500694	STUDENT	t	\N	2025-12-22 15:58:06.554	2025-12-22 15:58:06.554
0cd13787-337e-4fdb-9cfe-d398a7a77961	amal.al-musawi.39@gmail.com	38467268	STUDENT	t	\N	2025-12-22 15:58:06.555	2025-12-22 15:58:06.555
d16435dd-483e-4ee4-af7f-918c81d0fb88	dana.radhi.24@outlook.com	38599679	STUDENT	t	\N	2025-12-22 15:58:06.555	2025-12-22 15:58:06.555
7b0923fd-10dc-4546-9a27-dd5a1695d26a	bilal.haji.69@gmail.com	35191850	STUDENT	t	\N	2025-12-22 15:58:06.556	2025-12-22 15:58:06.556
8fbb4c9c-fc2a-46bc-abf2-5814b42e8d01	sara.al-jalahma.25@gmail.com	38151977	STUDENT	t	\N	2025-12-22 15:58:06.558	2025-12-22 15:58:06.558
a7c4efea-c916-4e42-bbf1-cfc3f87eae68	lulwa.husain.59@icloud.com	33958189	STUDENT	t	\N	2025-12-22 15:58:06.558	2025-12-22 15:58:06.558
e2955158-23a7-49a0-a2c8-be8db0d5318d	noor.kamal.30@outlook.com	35587737	STUDENT	t	\N	2025-12-22 15:58:06.559	2025-12-22 15:58:06.559
58fea127-a718-455a-9d42-a4538e0c865f	musa.ali.25@icloud.com	33841643	STUDENT	t	\N	2025-12-22 15:58:06.561	2025-12-22 15:58:06.561
ad0a6dd7-690b-420f-9b1c-6f0a2709e12b	aysha.nasser.11@icloud.com	34435171	STUDENT	t	\N	2025-12-22 15:58:06.562	2025-12-22 15:58:06.562
a1711337-a8c6-4104-8544-419e9b2b7f8e	huda.nasser.82@outlook.com	36242264	STUDENT	t	\N	2025-12-22 15:58:06.564	2025-12-22 15:58:06.564
8ed56d51-d091-4b35-bf11-c46c7fa89547	ali.fakhro.79@gmail.com	36275797	STUDENT	t	\N	2025-12-22 15:58:06.566	2025-12-22 15:58:06.566
c77cc0a1-dc61-4947-8b23-72ac901d52e8	zahra.abdulla.89@outlook.com	38692309	STUDENT	t	\N	2025-12-22 15:58:06.567	2025-12-22 15:58:06.567
fd9b9098-85a0-4425-8cdb-8d580357c4fe	ebrahim.al-najjar.44@outlook.com	38687820	STUDENT	t	\N	2025-12-22 15:58:06.567	2025-12-22 15:58:06.567
a25d475a-4f53-4781-8cd4-9123e6901a64	lulwa.abdulla.77@outlook.com	36482586	STUDENT	t	\N	2025-12-22 15:58:06.569	2025-12-22 15:58:06.569
dea36523-ac89-4ad3-8043-f778bedef088	dana.al-musawi.16@gmail.com	34842232	STUDENT	t	\N	2025-12-22 15:58:06.569	2025-12-22 15:58:06.569
ffd69f89-a2c6-4705-966b-d11d787c20bb	salman.kamal.21@icloud.com	34493537	STUDENT	t	\N	2025-12-22 15:58:06.57	2025-12-22 15:58:06.57
29afb6ff-dbbc-48c3-89e0-ec7b0ad6f3d3	salman.sharif.66@outlook.com	33886442	STUDENT	t	\N	2025-12-22 15:58:06.57	2025-12-22 15:58:06.57
cf5d14e8-36ff-4596-a711-5768b46d60e1	hussain.al-musawi.25@outlook.com	37835406	STUDENT	t	\N	2025-12-22 15:58:06.571	2025-12-22 15:58:06.571
a67daff6-0cc8-4ef0-b96f-9653443a5c8e	ebrahim.al-musawi.76@outlook.com	33717927	STUDENT	t	\N	2025-12-22 15:58:06.572	2025-12-22 15:58:06.572
1d350fcb-4db4-4e39-bc4d-5797ad7fe883	hussain.kanoo.14@outlook.com	36752182	STUDENT	t	\N	2025-12-22 15:58:06.572	2025-12-22 15:58:06.572
5dd679ff-fae2-4797-a33c-582b804dc304	layla.ali.90@gmail.com	38339842	STUDENT	t	\N	2025-12-22 15:58:06.573	2025-12-22 15:58:06.573
fc747125-8c35-4db4-93ed-088483cf29f1	noor.abdulla.60@icloud.com	34638739	STUDENT	f	\N	2025-12-22 15:58:06.575	2025-12-22 15:58:06.575
1c044efc-7721-4f4d-af06-18c5ed882f82	amal.haji.61@outlook.com	37404550	STUDENT	f	\N	2025-12-22 15:58:06.575	2025-12-22 15:58:06.575
38e5892e-a5d5-435d-8baa-2640ebe5bd65	sara.kanoo.75@gmail.com	35999058	STUDENT	f	\N	2025-12-22 15:58:06.576	2025-12-22 15:58:06.576
17bf7501-e2ae-4581-a0ca-4b82c9092429	reem.al-jalahma.85@outlook.com	33494849	STUDENT	f	\N	2025-12-22 15:58:06.576	2025-12-22 15:58:06.576
b0eca972-883f-48c1-8c5a-f99c6d1cd60c	yusuf.al-najjar.11@outlook.com	35605969	STUDENT	f	\N	2025-12-22 15:58:06.577	2025-12-22 15:58:06.577
fcf854a2-d2d2-4501-a611-900a08a24210	bilal.nasser.56@gmail.com	37203779	STUDENT	f	\N	2025-12-22 15:58:06.578	2025-12-22 15:58:06.578
f157d2d9-feb3-43b3-96e3-e6792fd9d509	yasmin.kanoo.51@icloud.com	33627705	STUDENT	f	\N	2025-12-22 15:58:06.578	2025-12-22 15:58:06.578
15ed3202-250b-4817-b771-619fc10d1504	jassim.abdulla.96@icloud.com	34793890	STUDENT	f	\N	2025-12-22 15:58:06.579	2025-12-22 15:58:06.579
0c6b25f5-9b68-469e-a563-57b15850f203	abdullah.kamal.42@gmail.com	34552412	STUDENT	f	\N	2025-12-22 15:58:06.58	2025-12-22 15:58:06.58
d5cc2a10-0814-4174-ba9e-d3c9b51020f3	lulwa.mohammed.90@icloud.com	34865363	STUDENT	f	\N	2025-12-22 15:58:06.581	2025-12-22 15:58:06.581
6550f9c3-daf2-4e2a-a7ab-23b77e11fee8	parent.ahmed@test.com	33333333	PARENT	t	\N	2025-12-22 15:58:06.582	2025-12-22 15:58:06.582
8ec8acf6-d447-4eae-922d-2bba5580af8e	parent.1.sharif@test.com	33323359	PARENT	t	\N	2025-12-22 15:58:06.587	2025-12-22 15:58:06.587
4745b6be-6cc3-4abc-90da-7f115ccf9c6b	parent.2.kamal@test.com	33410406	PARENT	t	\N	2025-12-22 15:58:06.588	2025-12-22 15:58:06.588
10a958c0-27dc-4631-8ade-31ccf5725bfa	parent.3.al-najjar@test.com	33150645	PARENT	t	\N	2025-12-22 15:58:06.591	2025-12-22 15:58:06.591
f4c009e4-7930-438c-81d2-3871f02ec69e	parent.4.al-alawi@test.com	33630546	PARENT	t	\N	2025-12-22 15:58:06.594	2025-12-22 15:58:06.594
3c58a363-9ac6-441d-889b-fcfedc05c952	parent.5.al-musawi@test.com	33705836	PARENT	t	\N	2025-12-22 15:58:06.595	2025-12-22 15:58:06.595
017ecec9-4546-44d7-accf-b602b49c2a1e	parent.6.al-musawi@test.com	33831252	PARENT	t	\N	2025-12-22 15:58:06.598	2025-12-22 15:58:06.598
b41ecac7-7996-4ec8-a5b6-959ad1a9a836	parent.7.showaiter@test.com	33619456	PARENT	t	\N	2025-12-22 15:58:06.599	2025-12-22 15:58:06.599
c890bbfe-b6f3-4338-9e0c-ad38febad401	parent.8.nasser@test.com	33764932	PARENT	t	\N	2025-12-22 15:58:06.6	2025-12-22 15:58:06.6
d4fda2a9-00ef-48a8-9da2-c61d29174d58	parent.9.husain@test.com	33173112	PARENT	t	\N	2025-12-22 15:58:06.601	2025-12-22 15:58:06.601
fd94d9c8-57c4-4581-bddb-4d18a24a4c4a	parent.10.mohammed@test.com	33756034	PARENT	t	\N	2025-12-22 15:58:06.604	2025-12-22 15:58:06.604
a588dd13-c67a-4440-b40e-c9a8f843b8cc	parent.11.ali@test.com	33470566	PARENT	t	\N	2025-12-22 15:58:06.605	2025-12-22 15:58:06.605
ec6dced5-c088-4ffa-a4df-179eb51f1b61	parent.12.kanoo@test.com	33670345	PARENT	t	\N	2025-12-22 15:58:06.606	2025-12-22 15:58:06.606
9446a6d6-ba4b-4101-8667-5c9d7ef16e58	parent.13.haji@test.com	33613956	PARENT	t	\N	2025-12-22 15:58:06.607	2025-12-22 15:58:06.607
aeb06948-a9f3-4788-8ef1-6b2d1e234488	parent.14.husain@test.com	33128886	PARENT	t	\N	2025-12-22 15:58:06.608	2025-12-22 15:58:06.608
162e226b-2606-4e67-9d3d-eb8ac90997dd	parent.15.showaiter@test.com	33480496	PARENT	t	\N	2025-12-22 15:58:06.609	2025-12-22 15:58:06.609
e45c1727-0e7d-4c3c-8f67-5b5b0cbb6aa1	202202231@student.polytechnic.bh	35140480	STUDENT	t	\N	2025-12-23 15:01:17.422	2025-12-23 15:01:43.324
a49f7581-82e7-4796-aa27-afea01f8d669	s.ahmed.bh@gmail.com	\N	PARENT	t	\N	2025-12-23 15:18:10.577	2025-12-23 15:18:10.577
25e0842f-faec-417f-b271-fbdd8d7c2365	test@gmail.com	33984848	STUDENT	t	\N	2025-12-23 17:45:55.293	2025-12-23 17:45:55.293
097669e6-5774-4a26-8de7-d519dadc8f3e	admin@institute.com	33445566	ADMIN	t	2025-12-23 18:18:01.705	2025-12-22 15:58:06.531	2025-12-23 18:18:01.706
d86baa6c-a5e7-4052-9207-29e8849cde50	Amal@function.bh	38777289	TEACHER	t	2025-12-23 18:19:31.234	2025-12-23 15:22:05.452	2025-12-23 18:19:31.234
\.


--
-- Data for Name: Venue; Type: TABLE DATA; Schema: public; Owner: macbookairm3
--

COPY public."Venue" (id, name, code, address, "isActive", "createdAt") FROM stdin;
e4a146e6-5437-412d-ba48-fe63b7348e5d	Riyadat Mall	RM	Aali, Bahrain	t	2025-12-22 15:58:06.513
06738a99-bf75-4c5e-9c02-41c505146ba6	Country Mall	CM	Budaiya, Bahrain	t	2025-12-22 15:58:06.518
77bf60e0-62b5-45d4-b395-a205dfa80b5c	Manama Branch (Old)	MN-OLD	Manama	f	2025-12-22 15:58:06.519
b03235c6-814f-4987-a065-fd109e173cf2	Main Campus	Main-CC	99922222	t	2025-12-23 17:34:05.518
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

\unrestrict GSFdMrIStdRoxLqehCU2lmCP3Cq5zvAagVF59fapzM6cGGApnFxXx1eEMkUUQZW

