CREATE TABLE public."User" (
	user_id uuid NOT NULL,
	email text NOT NULL,
	fullname text NOT NULL,
	"password" text NOT NULL,
	company_name text NULL,
	CONSTRAINT user_pkey PRIMARY KEY (user_id, email)
);


CREATE TABLE public.Tax (
	id uuid NOT NULL,
	"name" text NOT NULL,
	rate numeric NOT NULL,
	CONSTRAINT tax_pkey PRIMARY KEY (id)
);


CREATE TABLE public.Product (
	id uuid NOT NULL,
	"name" text NOT NULL,
	sku text NULL,
	uom text NOT NULL,
	category text NOT NULL,
	item_cost numeric NOT NULL,
	item_price numeric NOT NULL,
	stock numeric NOT NULL,
	tax_id uuid NOT NULL,
	CONSTRAINT product_pkey PRIMARY KEY (id)
);