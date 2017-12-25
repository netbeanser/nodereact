--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.6
-- Dumped by pg_dump version 9.6.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: authortbl; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE authortbl (
    id integer NOT NULL,
    name character varying(64) NOT NULL,
    lastpublished date,
    lastseen timestamp without time zone
);


--
-- Name: authortbl_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE authortbl_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: authortbl_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE authortbl_id_seq OWNED BY authortbl.id;


--
-- Name: opustbl; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE opustbl (
    id integer NOT NULL,
    description character varying(128),
    authorid integer NOT NULL,
    content text,
    published date,
    title character varying(48) NOT NULL
);


--
-- Name: opustbl_authorid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE opustbl_authorid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: opustbl_authorid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE opustbl_authorid_seq OWNED BY opustbl.authorid;


--
-- Name: opustbl_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE opustbl_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: opustbl_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE opustbl_id_seq OWNED BY opustbl.id;


--
-- Name: authortbl id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY authortbl ALTER COLUMN id SET DEFAULT nextval('authortbl_id_seq'::regclass);


--
-- Name: opustbl id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY opustbl ALTER COLUMN id SET DEFAULT nextval('opustbl_id_seq'::regclass);


--
-- Name: opustbl authorid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY opustbl ALTER COLUMN authorid SET DEFAULT nextval('opustbl_authorid_seq'::regclass);


--
-- Name: authortbl authortbl_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY authortbl
    ADD CONSTRAINT authortbl_pkey PRIMARY KEY (id);


--
-- Name: opustbl opustbl_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY opustbl
    ADD CONSTRAINT opustbl_pkey PRIMARY KEY (id);


--
-- Name: idx_authorid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_authorid ON opustbl USING btree (authorid);


--
-- Name: idx_name_uniq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_name_uniq ON authortbl USING btree (name);


--
-- Name: opustbl fk_authortbl; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY opustbl
    ADD CONSTRAINT fk_authortbl FOREIGN KEY (authorid) REFERENCES authortbl(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

