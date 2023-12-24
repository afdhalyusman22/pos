CREATE DATABASE pos;

CREATE TABLE public."User" (
	user_id uuid NOT NULL,
	email text NOT NULL,
	fullname text NOT NULL,
	"password" text NOT NULL,
	company_name text NULL,
	CONSTRAINT user_pkey PRIMARY KEY (user_id, email)
);


CREATE TABLE public."Tax" (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	rate numeric NOT NULL,
	CONSTRAINT tax_pkey PRIMARY KEY (id)
);

CREATE TABLE public."Product" (
	id uuid NOT NULL,
	"name" text NOT NULL,
	sku text NULL,
	uom text NOT NULL,
	category text NOT NULL,
	item_cost numeric NOT NULL,
	item_price numeric NOT NULL,
	stock numeric null,
	tax_id uuid NOT null REFERENCES public."Tax"(id),
	created_by text not null,
	created_at timestamp not null,
	CONSTRAINT product_pkey PRIMARY KEY (id)
);