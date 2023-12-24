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
	id uuid NOT NULL DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	rate numeric NOT NULL,
	CONSTRAINT tax_pkey PRIMARY KEY (id)
);

CREATE TABLE public."Sequence" (
	id uuid NOT NULL,
	"type" text NOT NULL,
	times text NOT NULL,
	latest_seq int4 NOT NULL,
	created_at timestamp NOT NULL,
	CONSTRAINT sequence_pkey PRIMARY KEY (id)
);

CREATE TABLE public."Product" (
	id uuid NOT NULL,
	"name" text NOT NULL,
	sku text NULL,
	uom text NOT NULL,
	category text NOT NULL,
	item_cost numeric NOT NULL,
	item_price numeric NOT NULL,
	stock numeric NULL,
	tax_id uuid NOT NULL,
	created_by text NOT NULL,
	created_at timestamp NOT NULL,
	CONSTRAINT product_pkey PRIMARY KEY (id)
);

ALTER TABLE public."Product" ADD CONSTRAINT "Product_tax_id_fkey" FOREIGN KEY (tax_id) REFERENCES public."Tax"(id);

CREATE TABLE public."Purchase" (
	id uuid NOT NULL,
	invoice_no text NOT NULL,
	invoice_date timestamp NOT NULL,
	note text NOT NULL,
	total_before_tax numeric NOT NULL,
	total numeric NOT NULL,
	status text NOT NULL,
	created_by text NOT NULL,
	created_at timestamp NOT NULL,
	CONSTRAINT purchase_pkey PRIMARY KEY (id)
);

CREATE TABLE public."PurchaseDetail" (
	id uuid NOT NULL,
	purchase_id uuid NOT NULL,
	product_id uuid NOT NULL,
	item_price numeric NOT NULL,
	total_before_tax numeric NOT NULL,
	total numeric NOT NULL,
	qty int4 NOT NULL,
	CONSTRAINT purchase_detail_pkey PRIMARY KEY (id)
);

ALTER TABLE public."PurchaseDetail" ADD CONSTRAINT "PurchaseDetail_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public."Product"(id);
ALTER TABLE public."PurchaseDetail" ADD CONSTRAINT "PurchaseDetail_purchase_id_fkey" FOREIGN KEY (purchase_id) REFERENCES public."Purchase"(id);

CREATE TABLE public."Sales" (
	id uuid NOT NULL,
	invoice_no text NOT NULL,
	invoice_date timestamp NOT NULL,
	note text NOT NULL,
	total_before_tax numeric NOT NULL,
	total numeric NOT NULL,
	status text NOT NULL,
	created_by text NOT NULL,
	created_at timestamp NOT NULL,
	CONSTRAINT sales_pkey PRIMARY KEY (id)
);

CREATE TABLE public."SalesDetail" (
	id uuid NOT NULL,
	sales_id uuid NOT NULL,
	product_id uuid NOT NULL,
	item_price numeric NOT NULL,
	total_before_tax numeric NOT NULL,
	total numeric NOT NULL,
	qty int4 NOT NULL,
	CONSTRAINT sales_detail_pkey PRIMARY KEY (id)
);

ALTER TABLE public."SalesDetail" ADD CONSTRAINT "SalesDetail_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public."Product"(id);
ALTER TABLE public."SalesDetail" ADD CONSTRAINT "SalesDetail_sales_id_fkey" FOREIGN KEY (sales_id) REFERENCES public."Sales"(id);