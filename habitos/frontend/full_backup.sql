--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Postgres.app)
-- Dumped by pg_dump version 17.5 (Postgres.app)

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
-- Name: goalpriority; Type: TYPE; Schema: public; Owner: azim
--

CREATE TYPE public.goalpriority AS ENUM (
    'low',
    'medium',
    'high'
);


ALTER TYPE public.goalpriority OWNER TO azim;

--
-- Name: goalstatus; Type: TYPE; Schema: public; Owner: azim
--

CREATE TYPE public.goalstatus AS ENUM (
    'in_progress',
    'completed',
    'abandoned',
    'cancelled',
    'paused'
);


ALTER TYPE public.goalstatus OWNER TO azim;

--
-- Name: goaltype; Type: TYPE; Schema: public; Owner: azim
--

CREATE TYPE public.goaltype AS ENUM (
    'count',
    'duration',
    'distance',
    'weight',
    'custom'
);


ALTER TYPE public.goaltype OWNER TO azim;

--
-- Name: habitcategory; Type: TYPE; Schema: public; Owner: azim
--

CREATE TYPE public.habitcategory AS ENUM (
    'personal',
    'health',
    'fitness',
    'productivity',
    'mindfulness',
    'learning',
    'social',
    'creative',
    'other'
);


ALTER TYPE public.habitcategory OWNER TO azim;

--
-- Name: habitfrequency; Type: TYPE; Schema: public; Owner: azim
--

CREATE TYPE public.habitfrequency AS ENUM (
    'daily',
    'weekly',
    'monthly',
    'custom'
);


ALTER TYPE public.habitfrequency OWNER TO azim;

--
-- Name: sentimenttype; Type: TYPE; Schema: public; Owner: azim
--

CREATE TYPE public.sentimenttype AS ENUM (
    'POSITIVE',
    'NEUTRAL',
    'NEGATIVE',
    'very_negative',
    'very_positive',
    'negative',
    'neutral',
    'positive'
);


ALTER TYPE public.sentimenttype OWNER TO azim;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: azim
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO azim;

--
-- Name: check_ins; Type: TABLE; Schema: public; Owner: azim
--

CREATE TABLE public.check_ins (
    id character varying(36) NOT NULL,
    habit_id character varying(36) NOT NULL,
    user_id character varying(36) NOT NULL,
    date date NOT NULL,
    completed boolean,
    actual_value double precision,
    mood_rating integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.check_ins OWNER TO azim;

--
-- Name: goals; Type: TABLE; Schema: public; Owner: azim
--

CREATE TABLE public.goals (
    id character varying(36) NOT NULL,
    user_id character varying(36) NOT NULL,
    habit_id character varying(36) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    goal_type public.goaltype NOT NULL,
    target_value double precision NOT NULL,
    target_unit character varying(50),
    current_value double precision,
    status public.goalstatus DEFAULT 'in_progress'::public.goalstatus,
    due_date date,
    completed_date date,
    reminder_enabled boolean,
    reminder_days_before integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    start_date date NOT NULL
);


ALTER TABLE public.goals OWNER TO azim;

--
-- Name: habits; Type: TABLE; Schema: public; Owner: azim
--

CREATE TABLE public.habits (
    id character varying(36) NOT NULL,
    user_id character varying(36) NOT NULL,
    title character varying(255) NOT NULL,
    category public.habitcategory DEFAULT 'personal'::public.habitcategory NOT NULL,
    frequency public.habitfrequency DEFAULT 'daily'::public.habitfrequency NOT NULL,
    frequency_count integer,
    current_streak integer,
    longest_streak integer,
    active boolean,
    start_date date NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    occurrence_days text
);


ALTER TABLE public.habits OWNER TO azim;

--
-- Name: journal_entries; Type: TABLE; Schema: public; Owner: azim
--

CREATE TABLE public.journal_entries (
    id character varying(36) NOT NULL,
    user_id character varying(36) NOT NULL,
    checkin_id character varying(36) NOT NULL,
    content text NOT NULL,
    entry_date date NOT NULL,
    ai_insights text,
    ai_summary text,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    insights_generated_at timestamp without time zone
);


ALTER TABLE public.journal_entries OWNER TO azim;

--
-- Name: users; Type: TABLE; Schema: public; Owner: azim
--

CREATE TABLE public.users (
    id character varying(36) NOT NULL,
    email character varying(255) NOT NULL,
    username character varying(80),
    password_hash character varying(255),
    bio text,
    profile_picture_url character varying(255),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO azim;

--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: azim
--

COPY public.alembic_version (version_num) FROM stdin;
3a9902290eb4
\.


--
-- Data for Name: check_ins; Type: TABLE DATA; Schema: public; Owner: azim
--

COPY public.check_ins (id, habit_id, user_id, date, completed, actual_value, mood_rating, created_at, updated_at) FROM stdin;
4c960f27-443d-4bb7-a230-acbed1b4769a	de60fe82-f787-474b-ba91-df39298f3604	82197ab5-a740-462e-afbc-f50b05752b6e	2025-07-21	t	30	8	2025-07-21 13:39:06.874602	2025-07-21 13:39:06.874604
287c79cd-696c-4c5f-a9a2-b4e1b0d99d62	126a04e4-204d-47cd-9616-0209a9e02c05	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-21	t	\N	10	2025-07-21 13:51:11.383796	2025-07-21 13:51:11.383804
f2d1ddbf-6ddd-4ff8-b2bf-973c60b147bb	7acfa11a-d99e-4eda-ba60-58c7216858f7	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-21	t	\N	10	2025-07-21 13:51:11.383817	2025-07-21 13:51:11.383818
871fc224-0e0c-499b-a7cf-0229d621f3c9	1486f151-1b9c-444d-93fc-114e17dc9a90	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-21	t	\N	10	2025-07-21 13:51:11.383826	2025-07-21 13:51:11.383826
7c889b91-fe00-44b7-bd5f-cbe976c1d79f	4207ebb7-86ff-4372-993e-b652d3571916	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-21	t	\N	10	2025-07-21 13:51:11.383832	2025-07-21 13:51:11.383833
816b9698-c7f8-4f8a-aba8-e87e8c47672f	1486f151-1b9c-444d-93fc-114e17dc9a90	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-21	t	\N	1	2025-07-21 13:53:30.257649	2025-07-21 13:53:30.257654
8826cf5c-3fca-4b03-9d9b-6259e168b35e	126a04e4-204d-47cd-9616-0209a9e02c05	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-21	t	\N	1	2025-07-21 13:53:30.257663	2025-07-21 13:53:30.257664
275656ae-89ba-4a95-9f23-6d4a9c2ced11	7acfa11a-d99e-4eda-ba60-58c7216858f7	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-21	t	\N	1	2025-07-21 13:53:30.257714	2025-07-21 13:53:30.257716
8c8954b6-9aef-42a4-8572-fb6dd52e2477	126a04e4-204d-47cd-9616-0209a9e02c05	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-17	t	\N	5	2025-07-17 18:01:48.468971	2025-07-17 18:15:17.999148
f96c37e7-9536-4f2b-9e2a-14754e87d342	7acfa11a-d99e-4eda-ba60-58c7216858f7	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-17	t	\N	5	2025-07-17 18:01:48.468985	2025-07-17 18:15:17.999149
02a27c03-2691-4c86-b754-3f59ec56a7da	126a04e4-204d-47cd-9616-0209a9e02c05	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-22	t	\N	10	2025-07-22 12:36:20.799005	2025-07-22 12:36:20.799011
fdecd49d-4a53-4372-a32e-608ac02ec685	7acfa11a-d99e-4eda-ba60-58c7216858f7	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-22	t	\N	10	2025-07-22 12:36:20.799022	2025-07-22 12:36:20.799023
e50851f4-5402-46d8-8458-93b69284063b	c93d61bd-7a4b-455e-b368-4337d4891ff6	4f42df64-190a-4895-9e84-ed4c1e08331c	2025-07-22	t	\N	8	2025-07-22 13:26:48.087357	2025-07-22 13:26:48.087564
8920565f-13c1-474b-81f8-c393b855145f	c93d61bd-7a4b-455e-b368-4337d4891ff6	4f42df64-190a-4895-9e84-ed4c1e08331c	2025-07-23	t	\N	8	2025-07-23 10:58:00.896135	2025-07-23 10:58:00.896145
e2676a1e-fd83-4193-ad7c-a548ab8fc4e6	126a04e4-204d-47cd-9616-0209a9e02c05	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-23	t	\N	8	2025-07-23 13:42:07.819073	2025-07-23 13:42:07.819077
e15b927f-5bfe-47bf-a5f1-cf5c3c9f32d1	7acfa11a-d99e-4eda-ba60-58c7216858f7	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-23	t	\N	8	2025-07-23 13:42:07.819089	2025-07-23 13:42:07.819091
ce30405b-23b3-4155-9c3b-d0b0c0dad16d	126a04e4-204d-47cd-9616-0209a9e02c05	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-24	t	\N	7	2025-07-24 10:14:09.160002	2025-07-24 10:14:09.160007
7568855f-fe48-4b07-b357-15fff90ece75	126a04e4-204d-47cd-9616-0209a9e02c05	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-19	t	\N	9	2025-07-19 12:22:15.161872	2025-07-19 14:39:56.179145
86b0b640-9af7-4dee-8223-ac46962a9c41	7acfa11a-d99e-4eda-ba60-58c7216858f7	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-24	t	\N	7	2025-07-24 10:14:09.160016	2025-07-24 10:14:09.160017
40a04edb-4d95-411f-891e-7b99ef78ee4c	126a04e4-204d-47cd-9616-0209a9e02c05	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-18	f	\N	1	2025-07-18 14:20:37.498342	2025-07-18 14:44:37.548361
a60fd8b3-d662-41f5-a44f-a110b9b968f5	7acfa11a-d99e-4eda-ba60-58c7216858f7	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-18	f	\N	1	2025-07-18 14:20:37.498351	2025-07-18 14:44:37.548369
b01e7412-d8f6-4ad7-afc7-d39e5ef8e0f1	de60fe82-f787-474b-ba91-df39298f3604	82197ab5-a740-462e-afbc-f50b05752b6e	2025-07-19	t	10	8	2025-07-19 12:58:29.043819	2025-07-19 12:58:29.043824
2a608166-d444-4311-af84-57f16e2f4f6c	126a04e4-204d-47cd-9616-0209a9e02c05	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-25	t	\N	10	2025-07-25 14:11:19.622147	2025-07-25 14:11:19.622156
fca11d98-3840-4d59-b220-d2326cc7f17f	7acfa11a-d99e-4eda-ba60-58c7216858f7	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-19	t	\N	9	2025-07-19 12:22:15.16188	2025-07-19 14:39:56.179149
b7ebdb7f-4f1c-4ff2-aa0f-c417c7ff4ab2	7acfa11a-d99e-4eda-ba60-58c7216858f7	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-25	t	\N	10	2025-07-25 14:11:19.622169	2025-07-25 14:11:19.62217
e6f1795f-ab0a-4471-9fda-83622abe77e0	126a04e4-204d-47cd-9616-0209a9e02c05	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-20	t	\N	10	2025-07-20 12:23:24.859668	2025-07-20 12:23:24.859669
c022453c-b999-4439-8e79-a8b5ee9a6038	7acfa11a-d99e-4eda-ba60-58c7216858f7	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-20	t	\N	10	2025-07-20 12:23:24.859677	2025-07-20 12:23:24.859678
643ca309-7ca3-4778-952d-6516c3a1a8c1	d9bfd52d-a34b-4cb3-af28-ab4979d50ae6	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-20	t	\N	10	2025-07-20 16:19:34.69224	2025-07-20 16:19:34.692244
114b0b08-9e8f-4687-862d-c55dca7673fa	1486f151-1b9c-444d-93fc-114e17dc9a90	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-20	t	\N	10	2025-07-20 16:19:34.692248	2025-07-20 16:19:34.692249
3a90c97c-f164-4e1e-9dd4-4e58a8b2d61d	b8f0a17e-5885-4192-8839-79c3d04fad97	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-20	t	\N	10	2025-07-20 16:19:34.692254	2025-07-20 16:19:34.692255
4b0fee6a-2d26-4511-9d40-6263c0e6d56e	4207ebb7-86ff-4372-993e-b652d3571916	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-20	t	\N	10	2025-07-20 16:19:34.69226	2025-07-20 16:19:34.69226
ddaf53ff-762d-43da-9953-5954cda35480	126a04e4-204d-47cd-9616-0209a9e02c05	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-21	t	\N	10	2025-07-21 10:26:36.069465	2025-07-21 10:26:36.06947
af15e463-fb72-448f-a9d6-81a29caa573f	7acfa11a-d99e-4eda-ba60-58c7216858f7	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-21	t	\N	10	2025-07-21 10:26:36.069479	2025-07-21 10:26:36.06948
d3bddc01-d694-40ed-82bc-07fc0d431938	d9bfd52d-a34b-4cb3-af28-ab4979d50ae6	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-21	t	60	10	2025-07-21 10:26:36.069486	2025-07-21 10:26:36.069486
2c20dbe1-c5b5-4fde-bea6-f70779a20c89	1486f151-1b9c-444d-93fc-114e17dc9a90	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-21	t	\N	10	2025-07-21 10:26:36.069491	2025-07-21 10:26:36.069491
de19b298-a2ed-460e-a197-4db6d24a0fce	b8f0a17e-5885-4192-8839-79c3d04fad97	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-21	t	\N	10	2025-07-21 10:26:36.069496	2025-07-21 10:26:36.069497
d5834f03-46a7-428a-ae12-15bd1e8e1e73	4207ebb7-86ff-4372-993e-b652d3571916	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-21	t	\N	10	2025-07-21 10:26:36.069501	2025-07-21 10:26:36.069501
04d79cbe-29e0-4e7e-a5e6-236186dbccfe	fd0b4eb7-1fc3-46f5-8d29-5bb20708af2e	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-25	t	\N	10	2025-07-25 14:11:19.622202	2025-07-25 14:11:19.622202
4620cc15-0a29-46a6-a4fc-4b9afeb0b93b	126a04e4-204d-47cd-9616-0209a9e02c05	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-26	t	\N	10	2025-07-26 19:13:58.656921	2025-07-26 19:13:58.656927
bf719c93-c727-4003-bd3f-6fca77a9e934	7acfa11a-d99e-4eda-ba60-58c7216858f7	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-26	t	\N	10	2025-07-26 19:13:58.656936	2025-07-26 19:13:58.656937
49b795fe-a1d3-45b0-95db-5426ad3456e1	fd0b4eb7-1fc3-46f5-8d29-5bb20708af2e	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-26	t	\N	10	2025-07-26 19:13:58.656952	2025-07-26 19:13:58.656953
722bd1f7-64a1-4e54-b0d1-d8de22841309	126a04e4-204d-47cd-9616-0209a9e02c05	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-27	t	\N	10	2025-07-27 15:48:51.880139	2025-07-27 15:48:51.88015
0d527f16-c4b9-4015-8bc0-3c700adc128c	7acfa11a-d99e-4eda-ba60-58c7216858f7	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-27	t	\N	10	2025-07-27 15:48:51.88016	2025-07-27 15:48:51.880161
f697007a-2b05-4160-af71-870b9b662d0b	fd0b4eb7-1fc3-46f5-8d29-5bb20708af2e	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-27	t	\N	10	2025-07-27 15:48:51.880182	2025-07-27 15:48:51.880183
c70c08fd-943b-46ea-a88f-4bfed23d58c7	d9bfd52d-a34b-4cb3-af28-ab4979d50ae6	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-28	t	\N	10	2025-07-28 12:02:02.874079	2025-07-28 12:02:02.874086
3b904bf4-b9e2-4541-900a-110f279c3b99	1486f151-1b9c-444d-93fc-114e17dc9a90	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-28	t	\N	10	2025-07-28 12:02:02.874142	2025-07-28 12:02:02.874145
0107e990-5ab6-44fa-b1b9-59a8a1ecc272	4207ebb7-86ff-4372-993e-b652d3571916	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-28	t	\N	10	2025-07-28 12:02:02.87418	2025-07-28 12:02:02.874181
aa50b9de-3cd7-4a7b-b245-fd1adc158503	b8f0a17e-5885-4192-8839-79c3d04fad97	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-28	t	\N	10	2025-07-28 12:02:02.874189	2025-07-28 12:02:02.87419
5514d211-fff2-4e1c-ad7d-aa2dfeac7151	126a04e4-204d-47cd-9616-0209a9e02c05	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-28	t	\N	10	2025-07-28 12:02:02.874202	2025-07-28 12:02:02.874202
2fd9a828-b9c7-4fb8-8b83-9d55071071ba	7acfa11a-d99e-4eda-ba60-58c7216858f7	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-28	t	\N	10	2025-07-28 12:02:02.874208	2025-07-28 12:02:02.874209
4a72e8d4-6e7d-40d7-a97e-22872596fc07	fd0b4eb7-1fc3-46f5-8d29-5bb20708af2e	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-28	t	\N	10	2025-07-28 12:02:02.874226	2025-07-28 12:02:02.874227
e3d5221c-2519-4135-be7c-e607cf1eb47e	1486f151-1b9c-444d-93fc-114e17dc9a90	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-29	t	\N	10	2025-07-29 13:53:09.58198	2025-07-29 13:53:09.581993
16c27fd1-567d-437b-88be-a091250ffc8e	4207ebb7-86ff-4372-993e-b652d3571916	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-29	t	\N	10	2025-07-29 13:53:09.582002	2025-07-29 13:53:09.582003
1734aa5c-5b7d-47f2-b841-a4b95b0ffb64	fd0b4eb7-1fc3-46f5-8d29-5bb20708af2e	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-29	t	\N	10	2025-07-29 13:53:09.582033	2025-07-29 13:53:09.582034
2076f2e4-6a83-4f13-b67e-deca42173276	0bc35338-e42c-4305-b8e3-9b4e04e79fb3	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-29	t	\N	10	2025-07-29 13:53:09.582047	2025-07-29 13:53:09.582047
366b265c-478c-4708-92e5-74ce6059a38c	126a04e4-204d-47cd-9616-0209a9e02c05	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-29	t	\N	10	2025-07-29 13:53:09.582053	2025-07-29 13:53:09.582054
5a5d409f-fbdd-481b-97cc-a8ef8cee6215	7acfa11a-d99e-4eda-ba60-58c7216858f7	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-29	t	\N	10	2025-07-29 13:53:09.58206	2025-07-29 13:53:09.58206
a0cf66f7-c20e-44bd-89ef-de90f894d3a7	1486f151-1b9c-444d-93fc-114e17dc9a90	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-30	t	\N	9	2025-07-30 18:14:59.791579	2025-07-30 18:14:59.791588
d3c31ccf-14d3-4ac5-a564-308e9d71c91f	fd0b4eb7-1fc3-46f5-8d29-5bb20708af2e	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-30	t	\N	9	2025-07-30 18:14:59.791605	2025-07-30 18:14:59.791606
7b6698df-9784-4b53-8977-fdfa9e3e5793	126a04e4-204d-47cd-9616-0209a9e02c05	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-30	t	\N	9	2025-07-30 18:14:59.791619	2025-07-30 18:14:59.791619
3f8afe62-3d99-4102-a1a0-075a887b781f	7acfa11a-d99e-4eda-ba60-58c7216858f7	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-30	t	\N	9	2025-07-30 18:14:59.791625	2025-07-30 18:14:59.791626
0f5ff152-fea9-4f64-884a-373aebb6f982	b4dd8d6a-5d75-4e65-9c20-f89b5f417926	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-30	t	\N	9	2025-07-30 18:14:59.791638	2025-07-30 18:14:59.791639
4a4e1ae4-e95d-4b45-ad0e-ad41e5b68462	556925fb-2f9e-439b-853e-b0af06eb14f4	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-07-30	t	\N	9	2025-07-30 18:14:59.791644	2025-07-30 18:14:59.791645
def1fbf2-3b91-425c-bc23-7a1ab68009f9	7acfa11a-d99e-4eda-ba60-58c7216858f7	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-08-04	t	\N	10	2025-08-04 10:42:56.343828	2025-08-04 10:42:56.343833
595fd2f6-f35e-4237-b443-bd326b83b6a2	b4dd8d6a-5d75-4e65-9c20-f89b5f417926	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-08-04	t	\N	10	2025-08-04 10:42:56.343852	2025-08-04 10:42:56.343853
9547b19e-b490-4070-8883-10b2389ca459	4207ebb7-86ff-4372-993e-b652d3571916	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-08-04	t	\N	10	2025-08-04 10:42:56.343858	2025-08-04 10:42:56.343859
5061e87e-9cb7-44db-84d0-4629f94288b3	556925fb-2f9e-439b-853e-b0af06eb14f4	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-08-04	t	\N	10	2025-08-04 10:42:56.343864	2025-08-04 10:42:56.343864
80256605-47fa-4d9d-8b64-91ba204d8b2f	0bc35338-e42c-4305-b8e3-9b4e04e79fb3	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-08-04	t	\N	10	2025-08-04 10:42:56.343869	2025-08-04 10:42:56.343869
18299a35-7235-4a55-9ffd-b3fa360274a8	d9bfd52d-a34b-4cb3-af28-ab4979d50ae6	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-08-04	t	60	10	2025-08-04 10:42:56.34388	2025-08-04 10:42:56.34388
eace72b6-6e1f-41f1-a78d-f734924b8a1f	b8f0a17e-5885-4192-8839-79c3d04fad97	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-08-04	t	\N	10	2025-08-04 10:42:56.343885	2025-08-04 10:42:56.343885
101095e8-ae27-405c-ad2d-2cc91332acfe	1486f151-1b9c-444d-93fc-114e17dc9a90	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-08-04	t	\N	10	2025-08-04 10:42:56.34389	2025-08-04 10:42:56.34389
1ed1401c-10da-478c-82ed-597dc6a05876	fd0b4eb7-1fc3-46f5-8d29-5bb20708af2e	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-08-04	t	30	10	2025-08-04 10:42:56.3439	2025-08-04 10:42:56.343901
be1a6a27-919a-4b75-ae83-ddc791ee22a7	126a04e4-204d-47cd-9616-0209a9e02c05	754e6525-7d94-46da-a4b8-00641ff0b9c2	2025-08-04	t	\N	10	2025-08-04 10:42:56.34391	2025-08-04 10:42:56.343911
83f13534-4432-45bf-b1a7-e4db7ac3172e	531b6a13-0103-4eb0-82e5-83a0d64c6aa0	50ca6840-62f9-4bf1-a8b6-2f71b00ebd2c	2025-08-04	t	1	7	2025-08-04 12:42:07.810199	2025-08-04 12:42:07.8102
b4991cfa-29e3-4200-82cd-8b42dd910326	73c0c963-e5ae-442b-81b4-fe7510e9406d	82197ab5-a740-462e-afbc-f50b05752b6e	2025-08-04	f	\N	8	2025-08-04 13:28:13.333033	2025-08-04 13:28:13.333039
991d4919-a7d1-485e-ab13-521399bc3306	cc7894b6-d0ca-42bf-b1c3-d44f271cfcd0	82197ab5-a740-462e-afbc-f50b05752b6e	2025-08-04	f	\N	8	2025-08-04 13:28:34.324036	2025-08-04 13:28:34.324038
e14c3399-d002-4092-b187-7230818d7117	6ca94a7d-94f7-4b92-8a29-72a97b3b3a8f	82197ab5-a740-462e-afbc-f50b05752b6e	2025-08-04	f	\N	8	2025-08-04 13:29:47.085746	2025-08-04 13:29:47.085748
\.


--
-- Data for Name: goals; Type: TABLE DATA; Schema: public; Owner: azim
--

COPY public.goals (id, user_id, habit_id, title, description, goal_type, target_value, target_unit, current_value, status, due_date, completed_date, reminder_enabled, reminder_days_before, created_at, updated_at, start_date) FROM stdin;
d2f0e872-a279-4a02-84a3-80a3f088e8fd	4f42df64-190a-4895-9e84-ed4c1e08331c	603fda36-1ea0-4a19-bdb5-836214221e21	12 times this month Edit this	\N	count	12	check-ins	0	in_progress	2025-08-23	\N	t	1	2025-07-23 11:51:02.1454	2025-07-23 12:03:04.31194	2025-07-23
ec320ace-e3da-4df3-9f73-1326474a0f25	754e6525-7d94-46da-a4b8-00641ff0b9c2	0bc35338-e42c-4305-b8e3-9b4e04e79fb3	see a doctor this month	\N	count	1	check-ins	2	completed	2025-08-29	2025-08-04	t	1	2025-07-29 13:54:50.923177	2025-08-04 11:33:34.860474	2025-07-29
32f24681-3fe7-46dc-9f40-7b3224de68c0	754e6525-7d94-46da-a4b8-00641ff0b9c2	efb9b2ec-353c-4129-bee0-5a849b64c116	30 day Duolingo Challenge	\N	count	30	check-ins	0	in_progress	2025-09-04	\N	t	1	2025-08-04 17:42:55.611185	2025-08-04 17:42:55.611186	2025-08-04
c4e39cd5-c1e4-4336-9c54-9e3827838561	754e6525-7d94-46da-a4b8-00641ff0b9c2	1486f151-1b9c-444d-93fc-114e17dc9a90	30 times this month 	\N	count	30	check-ins	4	in_progress	2025-08-24	\N	t	1	2025-07-24 15:16:21.939683	2025-08-04 11:30:00.486863	2025-07-24
6e384471-f130-454f-a9b5-d448c15e2f07	754e6525-7d94-46da-a4b8-00641ff0b9c2	d9bfd52d-a34b-4cb3-af28-ab4979d50ae6	Workout 12 times this month	\N	count	12	check-ins	2	in_progress	2025-08-24	\N	t	1	2025-07-24 10:14:46.313217	2025-08-04 11:30:00.489887	2025-07-24
\.


--
-- Data for Name: habits; Type: TABLE DATA; Schema: public; Owner: azim
--

COPY public.habits (id, user_id, title, category, frequency, frequency_count, current_streak, longest_streak, active, start_date, created_at, updated_at, occurrence_days) FROM stdin;
8074019f-e90e-474d-ad58-c5489fb5a744	6d7a54ba-1685-4faa-aab5-729014cc15b0	halalalala	personal	daily	1	0	0	t	2025-07-16	2025-07-16 18:46:16.858715	2025-07-16 18:46:16.858717	\N
c93d61bd-7a4b-455e-b368-4337d4891ff6	4f42df64-190a-4895-9e84-ed4c1e08331c	Study for 30mins 	personal	daily	0	1	1	t	2025-07-22	2025-07-22 13:18:52.775688	2025-07-22 13:26:48.099622	\N
de60fe82-f787-474b-ba91-df39298f3604	82197ab5-a740-462e-afbc-f50b05752b6e	Test Habit	personal	daily	1	1	1	t	2025-07-19	2025-07-19 12:57:58.175592	2025-07-19 12:58:29.049863	\N
a66dcf3d-78b2-4797-823d-e5e703089042	4f42df64-190a-4895-9e84-ed4c1e08331c	Be Happy Everyday	personal	daily	0	0	0	t	2025-07-23	2025-07-23 11:52:40.519779	2025-07-23 11:52:40.519787	\N
58a51960-5a99-423f-beab-b2be6fa93979	4f42df64-190a-4895-9e84-ed4c1e08331c	eat | pray | love	personal	daily	0	0	0	t	2025-07-23	2025-07-23 12:02:05.332126	2025-07-23 12:02:05.332128	\N
603fda36-1ea0-4a19-bdb5-836214221e21	4f42df64-190a-4895-9e84-ed4c1e08331c	Work out 3x a week. 	fitness	weekly	3	0	0	t	2025-07-23	2025-07-23 11:02:35.33263	2025-07-23 11:02:35.332632	\N
b4dd8d6a-5d75-4e65-9c20-f89b5f417926	754e6525-7d94-46da-a4b8-00641ff0b9c2	exersice 	health	daily	0	1	1	t	2025-07-30	2025-07-30 16:23:55.342181	2025-07-30 18:14:59.823569	\N
556925fb-2f9e-439b-853e-b0af06eb14f4	754e6525-7d94-46da-a4b8-00641ff0b9c2	Read 30 pages	personal	daily	0	1	1	t	2025-07-30	2025-07-30 16:24:23.759656	2025-07-30 18:14:59.825498	\N
0bc35338-e42c-4305-b8e3-9b4e04e79fb3	754e6525-7d94-46da-a4b8-00641ff0b9c2	Go to a doctor	health	monthly	1	1	1	t	2025-07-28	2025-07-28 13:36:25.367569	2025-07-29 13:53:09.615808	\N
7acfa11a-d99e-4eda-ba60-58c7216858f7	754e6525-7d94-46da-a4b8-00641ff0b9c2	read 10 mins 	personal	daily	1	1	10	t	2025-07-17	2025-07-17 14:56:07.454662	2025-08-04 10:42:56.358552	\N
1486f151-1b9c-444d-93fc-114e17dc9a90	754e6525-7d94-46da-a4b8-00641ff0b9c2	Meditate 	mindfulness	weekly	3	1	3	t	2025-07-19	2025-07-19 15:14:10.459056	2025-08-04 10:42:56.376637	\N
d9bfd52d-a34b-4cb3-af28-ab4979d50ae6	754e6525-7d94-46da-a4b8-00641ff0b9c2	Workout 	fitness	weekly	1	1	2	t	2025-07-19	2025-07-19 14:54:55.753104	2025-07-28 12:02:02.883539	\N
b8f0a17e-5885-4192-8839-79c3d04fad97	754e6525-7d94-46da-a4b8-00641ff0b9c2	Family dinner 	social	weekly	1	1	2	t	2025-07-20	2025-07-20 12:48:26.965991	2025-07-28 12:02:02.887352	\N
fd0b4eb7-1fc3-46f5-8d29-5bb20708af2e	754e6525-7d94-46da-a4b8-00641ff0b9c2	Run 30 miles per day 	fitness	daily	0	1	6	t	2025-07-24	2025-07-24 15:29:54.49863	2025-08-04 10:42:56.380122	\N
126a04e4-204d-47cd-9616-0209a9e02c05	754e6525-7d94-46da-a4b8-00641ff0b9c2	Code for 50 mins	personal	daily	1	1	10	t	2025-07-17	2025-07-17 14:54:05.265673	2025-08-04 10:42:56.384498	\N
531b6a13-0103-4eb0-82e5-83a0d64c6aa0	50ca6840-62f9-4bf1-a8b6-2f71b00ebd2c	Test Habit	health	daily	0	0	0	t	2025-08-04	2025-08-04 12:42:07.799853	2025-08-04 12:42:07.799854	\N
904978ac-ffbf-4f42-adbc-2f64d9a26d7a	82197ab5-a740-462e-afbc-f50b05752b6e	Daily Journaling	mindfulness	daily	0	0	0	t	2025-08-04	2025-08-04 13:27:23.732196	2025-08-04 13:27:23.732197	\N
73c0c963-e5ae-442b-81b4-fe7510e9406d	82197ab5-a740-462e-afbc-f50b05752b6e	Daily Journaling	mindfulness	daily	0	0	0	t	2025-08-04	2025-08-04 13:28:13.319872	2025-08-04 13:28:13.319873	\N
cc7894b6-d0ca-42bf-b1c3-d44f271cfcd0	82197ab5-a740-462e-afbc-f50b05752b6e	Daily Journaling	mindfulness	daily	0	0	0	t	2025-08-04	2025-08-04 13:28:34.313246	2025-08-04 13:28:34.313247	\N
6ca94a7d-94f7-4b92-8a29-72a97b3b3a8f	82197ab5-a740-462e-afbc-f50b05752b6e	Daily Journaling	mindfulness	daily	0	0	0	t	2025-08-04	2025-08-04 13:29:47.074008	2025-08-04 13:29:47.074009	\N
4207ebb7-86ff-4372-993e-b652d3571916	754e6525-7d94-46da-a4b8-00641ff0b9c2	Algebra prep	learning	weekly	3	1	2	t	2025-07-20	2025-07-20 16:18:53.505179	2025-08-04 14:37:07.66798	\N
173d5082-e2a9-4fcb-b770-4446b802d80a	754e6525-7d94-46da-a4b8-00641ff0b9c2	Work out 	fitness	weekly	3	0	0	t	2025-08-04	2025-08-04 15:39:48.778915	2025-08-04 15:39:48.778917	["Monday", "Wednesday", "Friday"]
efb9b2ec-353c-4129-bee0-5a849b64c116	754e6525-7d94-46da-a4b8-00641ff0b9c2	Learn Spanish 30 mins a day 	learning	daily	0	0	0	t	2025-08-04	2025-08-04 17:41:51.116332	2025-08-04 17:41:51.116333	[]
\.


--
-- Data for Name: journal_entries; Type: TABLE DATA; Schema: public; Owner: azim
--

COPY public.journal_entries (id, user_id, checkin_id, content, entry_date, ai_insights, ai_summary, created_at, updated_at, insights_generated_at) FROM stdin;
b48647e2-8b88-41b7-939a-c33e8a52622f	50ca6840-62f9-4bf1-a8b6-2f71b00ebd2c	83f13534-4432-45bf-b1a7-e4db7ac3172e	I am feeling absolutely terrible today. Everything is going wrong and I hate my life.	2025-08-04	\N	\N	2025-08-04 12:42:52.096585	2025-08-04 12:42:52.096587	\N
bd1741a6-5180-474b-90fc-55016ad5fb96	50ca6840-62f9-4bf1-a8b6-2f71b00ebd2c	83f13534-4432-45bf-b1a7-e4db7ac3172e	Today was not great. I had some issues at work and felt frustrated.	2025-08-04	\N	\N	2025-08-04 12:42:52.099954	2025-08-04 12:42:52.099955	\N
90b8321d-3180-4316-a080-270fcc5684d5	50ca6840-62f9-4bf1-a8b6-2f71b00ebd2c	83f13534-4432-45bf-b1a7-e4db7ac3172e	Today was okay. Nothing special happened, just a regular day.	2025-08-04	\N	\N	2025-08-04 12:42:52.101244	2025-08-04 12:42:52.101245	\N
cfe711db-081e-491f-ad5d-e82031e03a69	50ca6840-62f9-4bf1-a8b6-2f71b00ebd2c	83f13534-4432-45bf-b1a7-e4db7ac3172e	I had a good day today! Work went well and I felt productive.	2025-08-04	\N	\N	2025-08-04 12:42:52.102292	2025-08-04 12:42:52.102293	\N
a78a8301-922a-4634-bb84-b9197941c4d0	50ca6840-62f9-4bf1-a8b6-2f71b00ebd2c	83f13534-4432-45bf-b1a7-e4db7ac3172e	Today was absolutely amazing! I achieved all my goals, had great conversations, and feel on top of the world!	2025-08-04	\N	\N	2025-08-04 12:42:52.103318	2025-08-04 12:42:52.103321	\N
e62a20c0-2a51-4a07-825c-58e1a65eaa9f	82197ab5-a740-462e-afbc-f50b05752b6e	4c960f27-443d-4bb7-a230-acbed1b4769a	Today was an amazing day! I completed my workout and felt really energized. The weather was perfect and I had a great time with friends. Looking forward to tomorrow!	2025-07-21	\N	\N	2025-07-21 13:39:06.875965	2025-07-21 13:39:06.875967	\N
35309634-aebb-4bab-b8b3-fd7ed3a8ee39	4f42df64-190a-4895-9e84-ed4c1e08331c	e50851f4-5402-46d8-8458-93b69284063b	It was a great day!! Hurray!!\n\n\nLONG TEXT>>>>>\n\n\n\nherehr	2025-07-22	\N	\N	2025-07-22 13:26:48.089855	2025-07-22 13:26:48.08987	\N
8fbd5405-a057-4c32-8fd1-8220bb9fee02	4f42df64-190a-4895-9e84-ed4c1e08331c	8920565f-13c1-474b-81f8-c393b855145f	Dear Dairy, \n\nIt is a great day today, even though I am slowly drowning the in the tears of sadness. LOL	2025-07-23	\N	\N	2025-07-23 10:58:00.899188	2025-07-23 10:58:00.899197	\N
35ca7efd-a701-47f3-8c25-9d19a16dc742	4f42df64-190a-4895-9e84-ed4c1e08331c	8920565f-13c1-474b-81f8-c393b855145f	Dear Dairy, \n\nIt is a great day today, even though I am slowly drowning the in the tears of sadness. LOL	2025-07-23	\N	\N	2025-07-23 10:58:03.457438	2025-07-23 10:58:03.457444	\N
2d6ce3f1-b4fa-4aae-9c9f-9e3129423ff6	4f42df64-190a-4895-9e84-ed4c1e08331c	8920565f-13c1-474b-81f8-c393b855145f	Dear Dairy, \n\nIt is a great day today, even though I am slowly drowning the in the tears of sadness. LOL	2025-07-23	\N	\N	2025-07-23 10:58:04.03221	2025-07-23 10:58:04.032218	\N
b106158d-ad85-455a-ad4d-67853b011d50	82197ab5-a740-462e-afbc-f50b05752b6e	991d4919-a7d1-485e-ab13-521399bc3306	Today was a productive day! I completed all my tasks and felt really accomplished. The weather was beautiful, and I took a nice walk in the park. I'm feeling grateful for the small moments of joy.	2025-07-30	\N	\N	2025-08-04 13:28:34.329824	2025-08-04 13:28:34.329825	\N
73b78b61-6ba4-4d0c-bb24-7062d4b9e189	82197ab5-a740-462e-afbc-f50b05752b6e	991d4919-a7d1-485e-ab13-521399bc3306	Had a challenging day at work, but I managed to stay positive. I learned that sometimes the best thing to do is take a step back and breathe. Tomorrow is a new day with new opportunities.	2025-08-01	\N	\N	2025-08-04 13:28:34.337725	2025-08-04 13:28:34.337726	\N
a9afacf5-1eb0-4c4d-9923-bc82255f9c01	82197ab5-a740-462e-afbc-f50b05752b6e	991d4919-a7d1-485e-ab13-521399bc3306	Spent quality time with family today. We had a great dinner together and shared lots of laughs. These moments remind me of what's truly important in life - connection and love.	2025-08-03	\N	\N	2025-08-04 13:28:34.343091	2025-08-04 13:28:34.343098	\N
719297b3-ef30-4c1d-98e1-26995bf77472	82197ab5-a740-462e-afbc-f50b05752b6e	991d4919-a7d1-485e-ab13-521399bc3306	Started reading a new book today and I'm already hooked! It's amazing how books can transport you to different worlds. I'm excited to see where this journey takes me.	2025-08-04	\N	\N	2025-08-04 13:28:34.348391	2025-08-04 13:28:34.348392	\N
b4bd3cd4-e3d6-4da5-aa61-43ff8ad9d529	754e6525-7d94-46da-a4b8-00641ff0b9c2	02a27c03-2691-4c86-b754-3f59ec56a7da	I have been having a great day, I could not solve the today's leetcode. So it's a bit disappointing. lol :sadface	2025-07-22	\N	\N	2025-07-22 12:36:20.80331	2025-07-22 12:36:20.803314	\N
c30ca658-0259-4425-8819-a01483b92654	4f42df64-190a-4895-9e84-ed4c1e08331c	8920565f-13c1-474b-81f8-c393b855145f	Dear Dairy, \n\nIt is a great day today, even though I am slowly drowning the in the tears of sadness. LOL	2025-07-23	\N	\N	2025-07-23 10:58:04.325591	2025-07-23 10:58:04.325598	\N
07ddc3f1-71d1-42ed-82d5-d2c7d5802feb	4f42df64-190a-4895-9e84-ed4c1e08331c	8920565f-13c1-474b-81f8-c393b855145f	Dear Dairy, \n\nIt is a great day today, even though I am slowly drowning the in the tears of sadness. LOL	2025-07-23	\N	\N	2025-07-23 10:58:04.531932	2025-07-23 10:58:04.531939	\N
fa35d9af-debb-481b-89f3-30d830f1baa1	4f42df64-190a-4895-9e84-ed4c1e08331c	8920565f-13c1-474b-81f8-c393b855145f	Dear Dairy, \n\nIt is a great day today, even though I am slowly drowning the in the tears of sadness. LOL	2025-07-23	\N	\N	2025-07-23 10:58:04.709046	2025-07-23 10:58:04.709053	\N
563224a6-b575-4b72-935f-077b5354da7a	4f42df64-190a-4895-9e84-ed4c1e08331c	8920565f-13c1-474b-81f8-c393b855145f	Dear Dairy, \n\nIt is a great day today, even though I am slowly drowning the in the tears of sadness. LOL	2025-07-23	\N	\N	2025-07-23 10:58:04.88561	2025-07-23 10:58:04.885615	\N
00647d6c-a787-406b-baa7-43c5efc67f0e	4f42df64-190a-4895-9e84-ed4c1e08331c	8920565f-13c1-474b-81f8-c393b855145f	Dear Dairy, \n\nIt is a great day today, even though I am slowly drowning the in the tears of sadness. LOL	2025-07-23	\N	\N	2025-07-23 10:58:05.036777	2025-07-23 10:58:05.036783	\N
c9c3822c-ede7-4583-b7b7-9a9ead1f4f9e	4f42df64-190a-4895-9e84-ed4c1e08331c	8920565f-13c1-474b-81f8-c393b855145f	Dear Dairy, \n\nIt is a great day today, even though I am slowly drowning the in the tears of sadness. LOL	2025-07-23	\N	\N	2025-07-23 10:58:05.191888	2025-07-23 10:58:05.191894	\N
43918416-cb81-46e5-a688-ab0d76ad8e15	4f42df64-190a-4895-9e84-ed4c1e08331c	8920565f-13c1-474b-81f8-c393b855145f	Dear Dairy, \n\nIt is a great day today, even though I am slowly drowning the in the tears of sadness. LOL	2025-07-23	\N	\N	2025-07-23 10:58:05.356853	2025-07-23 10:58:05.356859	\N
b7036fd5-02ad-4721-94f1-f218966228f4	754e6525-7d94-46da-a4b8-00641ff0b9c2	c70c08fd-943b-46ea-a88f-4bfed23d58c7	hello, this is a daily reflection of my life. May you have a beautiful day.\n\n\n\n\n\n\nHD >>>	2025-07-28	{"insight": "Writing about your experiences helps you process and understand them better.", "generated_at": "2025-07-30T19:53:10.984567", "type": "entry_insight"}	Writing about your experiences helps you process and understand them better.	2025-07-28 12:02:02.877692	2025-08-04 12:34:54.113334	2025-07-30 19:53:10.984668
b9a68337-81da-4d37-b18e-831288e6e82c	754e6525-7d94-46da-a4b8-00641ff0b9c2	722bd1f7-64a1-4e54-b0d1-d8de22841309	Feeling great, testing the long reflection. \n\n\nLong long text>>>>>\n\n\n\n\n\n>>>>>>\n\n\n>>>>>>\n\n>>>>>\n\n\n\n\n\n>>	2025-07-27	{"insight": "Writing about your experiences helps you process and understand them better.", "generated_at": "2025-07-30T19:50:37.252757", "type": "entry_insight"}	Writing about your experiences helps you process and understand them better.	2025-07-27 15:48:51.885839	2025-08-04 12:34:54.113335	2025-07-30 19:50:37.252848
57cf26dd-659c-4aa6-a453-45f6c414861d	82197ab5-a740-462e-afbc-f50b05752b6e	e14c3399-d002-4092-b187-7230818d7117	Today was a productive day! I completed all my tasks and felt really accomplished. The weather was beautiful, and I took a nice walk in the park. I'm feeling grateful for the small moments of joy.	2025-08-06	\N	\N	2025-08-04 13:29:47.091462	2025-08-04 13:29:47.091463	\N
1f9f397a-db20-4642-8cf1-fe53cc83cf89	82197ab5-a740-462e-afbc-f50b05752b6e	e14c3399-d002-4092-b187-7230818d7117	Had a challenging day at work, but I managed to stay positive. I learned that sometimes the best thing to do is take a step back and breathe. Tomorrow is a new day with new opportunities.	2025-08-11	\N	\N	2025-08-04 13:29:47.098052	2025-08-04 13:29:47.098053	\N
c6778b40-3d35-4d1c-a7ff-e90db0f8ee5f	4f42df64-190a-4895-9e84-ed4c1e08331c	8920565f-13c1-474b-81f8-c393b855145f	Dear Dairy, \n\nIt is a great day today, even though I am slowly drowning the in the tears of sadness. LOL	2025-07-23	\N	\N	2025-07-23 10:58:06.860031	2025-07-23 10:58:06.860039	\N
573e946e-fd5c-4789-8fa8-b2566834f356	4f42df64-190a-4895-9e84-ed4c1e08331c	8920565f-13c1-474b-81f8-c393b855145f	Dear Dairy, \n\nIt is a great day today, even though I am slowly drowning the in the tears of sadness. LOL	2025-07-23	\N	\N	2025-07-23 10:58:07.035387	2025-07-23 10:58:07.035389	\N
2222d696-a070-476b-bcd2-dadae30642f4	4f42df64-190a-4895-9e84-ed4c1e08331c	8920565f-13c1-474b-81f8-c393b855145f	Dear Dairy, \n\nIt is a great day today, even though I am slowly drowning the in the tears of sadness. LOL	2025-07-23	\N	\N	2025-07-23 10:58:07.207464	2025-07-23 10:58:07.207475	\N
4677f222-ff1e-403b-930b-1ea10dac58e5	4f42df64-190a-4895-9e84-ed4c1e08331c	8920565f-13c1-474b-81f8-c393b855145f	Dear Dairy, \n\nIt is a great day today, even though I am slowly drowning the in the tears of sadness. LOL	2025-07-23	\N	\N	2025-07-23 10:58:07.375634	2025-07-23 10:58:07.37564	\N
0d1301a9-d55a-4093-a545-5563435ef44d	754e6525-7d94-46da-a4b8-00641ff0b9c2	2a608166-d444-4311-af84-57f16e2f4f6c	I am having a hard morning, because I came home late last night and it was hard for me to go to sleep. I woke up super late, and I was feeling very drowsy. I had a nice breakfast, had some coffee and look forward to my evening. I am going to meet my brother at the beach today and head to Manhatten to have dinner and watch Formula one movie.	2025-07-25	{"insight": "Regular journaling builds self-awareness and emotional intelligence.", "generated_at": "2025-07-30T19:50:45.736212", "type": "entry_insight"}	Regular journaling builds self-awareness and emotional intelligence.	2025-07-25 14:11:19.62856	2025-07-30 15:50:45.737003	2025-07-30 19:50:45.736348
68b4f8cd-ff49-4de4-85aa-c360ddb22d9c	82197ab5-a740-462e-afbc-f50b05752b6e	e14c3399-d002-4092-b187-7230818d7117	Spent quality time with family today. We had a great dinner together and shared lots of laughs. These moments remind me of what's truly important in life - connection and love.	2025-08-16	\N	\N	2025-08-04 13:29:47.10343	2025-08-04 13:29:47.103431	\N
5f942a36-a2df-4348-8824-c37b6987e66d	82197ab5-a740-462e-afbc-f50b05752b6e	e14c3399-d002-4092-b187-7230818d7117	Started reading a new book today and I'm already hooked! It's amazing how books can transport you to different worlds. I'm excited to see where this journey takes me.	2025-08-21	\N	\N	2025-08-04 13:29:47.108314	2025-08-04 13:29:47.108315	\N
513e4acf-f508-4fb2-bc58-66244ed5cff4	754e6525-7d94-46da-a4b8-00641ff0b9c2	a0cf66f7-c20e-44bd-89ef-de90f894d3a7	What's something you're looking forward to?\n\nHoefsdfnklragnk lksngfm\n\n\nsgmlkrmg\nsdlmf;lrskjgm\nskldngmp\nnsgrmf\nsdmlf;slmg\ns;dlmf;slrmf	2025-07-30	\N	\N	2025-07-30 18:14:59.796191	2025-08-04 12:34:54.113333	\N
53d94fc0-d21b-4085-a730-d0efe27dfddb	4f42df64-190a-4895-9e84-ed4c1e08331c	8920565f-13c1-474b-81f8-c393b855145f	Dear Dairy, \n\nIt is a great day today, even though I am slowly drowning the in the tears of sadness. LOL	2025-07-23	\N	\N	2025-07-23 10:58:05.525758	2025-07-23 10:58:05.525765	\N
642e89b5-7879-4b6a-aa42-10e1deaa4a3d	4f42df64-190a-4895-9e84-ed4c1e08331c	8920565f-13c1-474b-81f8-c393b855145f	Dear Dairy, \n\nIt is a great day today, even though I am slowly drowning the in the tears of sadness. LOL	2025-07-23	\N	\N	2025-07-23 10:58:05.701795	2025-07-23 10:58:05.7018	\N
e2314412-1be6-4051-931d-288baaa225b1	4f42df64-190a-4895-9e84-ed4c1e08331c	8920565f-13c1-474b-81f8-c393b855145f	Dear Dairy, \n\nIt is a great day today, even though I am slowly drowning the in the tears of sadness. LOL	2025-07-23	\N	\N	2025-07-23 10:58:05.872729	2025-07-23 10:58:05.872741	\N
6577532c-4127-4428-a355-bee9c7453463	4f42df64-190a-4895-9e84-ed4c1e08331c	8920565f-13c1-474b-81f8-c393b855145f	Dear Dairy, \n\nIt is a great day today, even though I am slowly drowning the in the tears of sadness. LOL	2025-07-23	\N	\N	2025-07-23 10:58:06.03937	2025-07-23 10:58:06.039376	\N
84a15574-a21c-477a-954e-5dc51946f8a1	4f42df64-190a-4895-9e84-ed4c1e08331c	8920565f-13c1-474b-81f8-c393b855145f	Dear Dairy, \n\nIt is a great day today, even though I am slowly drowning the in the tears of sadness. LOL	2025-07-23	\N	\N	2025-07-23 10:58:06.22776	2025-07-23 10:58:06.227764	\N
bf150b75-7dd8-4467-9d95-990a2af10532	4f42df64-190a-4895-9e84-ed4c1e08331c	8920565f-13c1-474b-81f8-c393b855145f	Dear Dairy, \n\nIt is a great day today, even though I am slowly drowning the in the tears of sadness. LOL	2025-07-23	\N	\N	2025-07-23 10:58:06.436262	2025-07-23 10:58:06.43627	\N
9729e23d-c97a-47e4-aeca-db45c3581d7b	4f42df64-190a-4895-9e84-ed4c1e08331c	8920565f-13c1-474b-81f8-c393b855145f	Dear Dairy, \n\nIt is a great day today, even though I am slowly drowning the in the tears of sadness. LOL	2025-07-23	\N	\N	2025-07-23 10:58:06.670363	2025-07-23 10:58:06.670369	\N
a51498e3-5a8d-473c-8660-2c771100554f	754e6525-7d94-46da-a4b8-00641ff0b9c2	4620cc15-0a29-46a6-a4fc-4b9afeb0b93b	Hello aloha, \n\nOhana, happy duppy days. Feeling awesome, hare hare	2025-07-26	{"insight": "Writing about your experiences helps you process and understand them better.", "generated_at": "2025-07-30T19:52:49.890192", "type": "entry_insight"}	Writing about your experiences helps you process and understand them better.	2025-07-26 19:13:58.66277	2025-07-30 15:52:49.89106	2025-07-30 19:52:49.89028
29134af1-373c-4755-82e6-8e28d139800c	754e6525-7d94-46da-a4b8-00641ff0b9c2	def1fbf2-3b91-425c-bc23-7a1ab68009f9	How did you take care of yourself today?\n\n📝 Prompt: How did you take care of yourself today?\n\n📅 Date: August 4, 2025\n🕰 Time: 9:15 PM\n\nToday, I made a conscious effort to slow down and listen to what my body and mind needed. I started the morning with a quiet 10-minute meditation, which helped ground me before diving into a busy day of work. I kept my phone on Do Not Disturb for the first hour and focused on deep work—no multitasking, just one thing at a time. It felt good to not be pulled in a thousand directions.\n\nAt lunch, I took a short walk outside instead of eating at my desk. The fresh air and movement helped reset my energy. I also made sure to drink plenty of water throughout the day—something I usually neglect.\n\nMore importantly, I gave myself permission to rest this evening. Instead of pushing through more work or scrolling endlessly, I took a warm shower, made a simple dinner, and journaled with intention. No guilt, no productivity hacks—just real rest.\n\nTaking care of myself today wasn’t dramatic or “Instagrammable,” but it was enough. And that matters.	2025-08-04	\N	\N	2025-08-04 10:42:56.349916	2025-08-04 12:34:54.113326	\N
d5f1d71c-33d4-49a7-8ee1-d4251a6bbb48	754e6525-7d94-46da-a4b8-00641ff0b9c2	e3d5221c-2519-4135-be7c-e607cf1eb47e	🗓️ Date: July 29, 2025\n🕰️ Time: 8:42 PM\n🌤️ Mood: 😌 Calm\n🎯 Focus of the Day: Presence over Productivity\n\n📓 Journal Entry\nToday was a reminder that growth doesn’t always look like a checklist getting crossed off.\n\nI woke up late and missed my usual morning routine, which initially triggered guilt. But instead of spiraling, I paused and asked myself: What is this moment trying to teach me?\n\nThroughout the day, I focused on being present instead of hyper-productive. I made time to cook lunch mindfully, walked without my phone, and had a deep conversation with my brother. None of these were on my to-do list — yet they left me more grounded than any task ever could.\n\nI'm learning to decouple my worth from my output. Rest and connection are not distractions from growth; they are growth.\n\n🔍 Reflection\nWhat went well: Practiced presence and self-compassion.\n\nWhat I struggled with: Letting go of guilt for not being "productive."\n\nWhat I’m grateful for: Time with my brother and my ability to slow down.\n\nIntention for tomorrow: Begin the day with gentleness, not urgency.	2025-07-29	{"insight": "Regular journaling builds self-awareness and emotional intelligence.", "generated_at": "2025-07-30T20:42:11.644335", "type": "entry_insight"}	Regular journaling builds self-awareness and emotional intelligence.	2025-07-29 13:53:09.588759	2025-08-04 12:34:54.113335	2025-07-30 20:42:11.644448
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: azim
--

COPY public.users (id, email, username, password_hash, bio, profile_picture_url, created_at, updated_at) FROM stdin;
50ca6840-62f9-4bf1-a8b6-2f71b00ebd2c	test@test.com	testuser	scrypt:32768:8:1$bw80rRvjNqrx9ePq$eee6386a097a15683157ee53a6208db50be4ddeb1ba57f4b8c17a151e3c83831bfec4ad0d18616f58021ad15b75bb69cf8edf3c0a23fd574cf70a9ceebd767ad	\N	\N	2025-07-10 15:04:50.25246	2025-07-10 15:04:50.252467
3d59142e-3dba-4d8b-875b-11ef60bf22f7	surayannaewa@gmail.com	surayannaewa@gmail.com	scrypt:32768:8:1$JhxMwumrmoT462Jv$d42d5ac07499a8b1a48276b8a7b213e7b426d3115e5d23c6d7cf31c2862915b3ef3eb85dd02da270f4d8622490004670fa1a1ffe8edfb6f0eca1bfe445284560	\N	\N	2025-07-10 15:23:08.24364	2025-07-10 15:23:08.243648
49e83e63-8481-4dc9-8694-60fe44b11b81	alaska@gmail.com	alaska@gmail.com	scrypt:32768:8:1$NnYJbQ5DHq8LW0LX$11e5a8d98935d980604619f984d94e498cf9f7be76156686a8163970e0a939c671e5dfdabd02ab8212522bf1640230d562c0b28c05454e59de3434570ebb9760	\N	\N	2025-07-16 17:53:22.821568	2025-07-16 17:53:22.821578
6d7a54ba-1685-4faa-aab5-729014cc15b0	annayev.jumanazar@gmail.com	azimka 	scrypt:32768:8:1$ZweREDv9NN9l1fDS$aab6d9a44550d8ace24cb8057dbef80bfa0e48f6d32b48727e456957dfd071e77d5a6bbaa8f67a509525e2f50b6966c39469d00ce7a561cbc60b47036676a0f3	\N	\N	2025-07-16 18:45:52.25418	2025-07-16 18:45:52.254185
82197ab5-a740-462e-afbc-f50b05752b6e	test@example.com	testuser	scrypt:32768:8:1$ekBX0rZgl1S0Qk8O$b0ee644aa57e523b866cb9e8228f23d2b8d8d3683cc5a8093e758097729a9d65d2a86dcb47645e99ce6d762c8d8263b45860f937f17399abab907b8ce70906c5	\N	\N	2025-07-16 11:55:29.306466	2025-07-19 12:58:15.399953
4f42df64-190a-4895-9e84-ed4c1e08331c	jimmy@gmail.com	Jimmy	scrypt:32768:8:1$VJC8TOZSeoaNZPQC$14efe328ec0d73ee3420c18cd461f8e3d8895d053b199e88138a030af4a96877fcc369db7c8f9600ff477364f30afc33f226bf642f5b573a837a820f7f1ea1c0	\N	\N	2025-07-22 12:52:21.247713	2025-07-22 12:52:21.247722
754e6525-7d94-46da-a4b8-00641ff0b9c2	annayev.azim@gmail.com	Azim	scrypt:32768:8:1$ASE3B6VuXxD2n87p$88fd8b615544c8c698b6dce8d2c805e15b626c862e2416a1689017a6b977f45a9f8477c8152c6a9ba514ee85cd748144a7ccacdb4c5ddc8f8f38d6e8ea3552a1	Hi, I am Azim. \n\nI am a Software Engineering Fellow at Marcy Lab School. 		2025-07-10 15:17:29.865348	2025-07-26 19:49:54.609183
c070829c-8e2e-4114-9ec0-17c324fc932a	andreyka@gmail.com	Andrey	scrypt:32768:8:1$eH20dbJDVrgBwaOP$bcd337194a59fd29b842ae45fe8316334203685b437967c90b30b7f46097bd4e000ba87cf1c6e42c031e8b99de79251ca0f57d175bce8c165f88db92f134ff00	\N	\N	2025-08-04 17:49:36.466268	2025-08-04 17:49:36.466275
\.


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: azim
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: check_ins check_ins_id_key; Type: CONSTRAINT; Schema: public; Owner: azim
--

ALTER TABLE ONLY public.check_ins
    ADD CONSTRAINT check_ins_id_key UNIQUE (id);


--
-- Name: check_ins check_ins_pkey; Type: CONSTRAINT; Schema: public; Owner: azim
--

ALTER TABLE ONLY public.check_ins
    ADD CONSTRAINT check_ins_pkey PRIMARY KEY (id);


--
-- Name: goals goals_id_key; Type: CONSTRAINT; Schema: public; Owner: azim
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_id_key UNIQUE (id);


--
-- Name: goals goals_pkey; Type: CONSTRAINT; Schema: public; Owner: azim
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_pkey PRIMARY KEY (id);


--
-- Name: habits habits_id_key; Type: CONSTRAINT; Schema: public; Owner: azim
--

ALTER TABLE ONLY public.habits
    ADD CONSTRAINT habits_id_key UNIQUE (id);


--
-- Name: habits habits_pkey; Type: CONSTRAINT; Schema: public; Owner: azim
--

ALTER TABLE ONLY public.habits
    ADD CONSTRAINT habits_pkey PRIMARY KEY (id);


--
-- Name: journal_entries journal_entries_id_key; Type: CONSTRAINT; Schema: public; Owner: azim
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_id_key UNIQUE (id);


--
-- Name: journal_entries journal_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: azim
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_pkey PRIMARY KEY (id);


--
-- Name: goals unique_habit_goal; Type: CONSTRAINT; Schema: public; Owner: azim
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT unique_habit_goal UNIQUE (habit_id, user_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: azim
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_id_key; Type: CONSTRAINT; Schema: public; Owner: azim
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_id_key UNIQUE (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: azim
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: check_ins check_ins_habit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: azim
--

ALTER TABLE ONLY public.check_ins
    ADD CONSTRAINT check_ins_habit_id_fkey FOREIGN KEY (habit_id) REFERENCES public.habits(id);


--
-- Name: check_ins check_ins_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: azim
--

ALTER TABLE ONLY public.check_ins
    ADD CONSTRAINT check_ins_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: goals goals_habit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: azim
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_habit_id_fkey FOREIGN KEY (habit_id) REFERENCES public.habits(id);


--
-- Name: goals goals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: azim
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: habits habits_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: azim
--

ALTER TABLE ONLY public.habits
    ADD CONSTRAINT habits_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: journal_entries journal_entries_checkin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: azim
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_checkin_id_fkey FOREIGN KEY (checkin_id) REFERENCES public.check_ins(id);


--
-- Name: journal_entries journal_entries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: azim
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

