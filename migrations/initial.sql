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

CREATE TABLE public."Sequence" (
	id uuid NOT NULL,
	"type" text NOT NULL,
	"times" text NOT NULL,
	latest_seq int NOT NULL,	
	created_at timestamp not null,
	CONSTRAINT sequence_pkey PRIMARY KEY (id)
);

CREATE TABLE public."Purchase" (
	id uuid NOT NULL,
	"invoice_no" text NOT NULL,
	"invoice_date" timestamp NOT NULL,
	"note" text NOT NULL,
	total_before_tax decimal NOT NULL,
	total decimal NOT NULL,	
	"status" text not null,
	created_by text not null,
	created_at timestamp not null,
	CONSTRAINT purchase_pkey PRIMARY KEY (id)
);

CREATE TABLE public."PurchaseDetail" (
	id uuid not null,
	"purchase_id" uuid not null REFERENCES public."Purchase"(id),
	"product_id" uuid not null REFERENCES public."Product"(id),
	qty int NOT NULL,
	CONSTRAINT purchase_detail_pkey PRIMARY KEY (id)
);

CREATE TABLE public."Sales" (
	id uuid NOT NULL,
	"invoice_no" text NOT NULL,
	"invoice_date" timestamp NOT NULL,
	"note" text NOT NULL,
	total_before_tax decimal NOT NULL,
	total decimal NOT NULL,	
	"status" text not null,
	created_by text not null,
	created_at timestamp not null,
	CONSTRAINT sales_pkey PRIMARY KEY (id)
);

CREATE TABLE public."SalesDetail" (
	id uuid not null,
	"sales_id" uuid not null REFERENCES public."Sales"(id),
	"product_id" uuid not null REFERENCES public."Product"(id),
	qty int NOT NULL,
	CONSTRAINT sales_detail_pkey PRIMARY KEY (id)
);