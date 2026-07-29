create extension if not exists "pgcrypto";
create extension if not exists "citext";

create type listing_status as enum ('draft','pending','verified','published','rejected','archived');
create type listing_type   as enum ('sale','rent');
create type listing_source as enum ('owner_form','stella_inventory','import');
create type location_area  as enum ('north_coast','ain_sokhna');
create type property_type  as enum ('chalet','villa','townhouse','twin_house','penthouse','duplex','apartment','studio');
create type finishing_kind as enum ('fully','semi','core_shell');
create type payment_kind   as enum ('cash','installments');
create type view_kind      as enum ('sea','pool','lagoon','golf','garden','side');
create type rental_period  as enum ('daily','weekly','monthly','seasonal','annual');
create type sale_kind      as enum ('developer_contract','resale');
create type delivery_kind  as enum ('ready','under_construction');
create type lead_status    as enum ('new','contacted','qualified','won','lost','spam');
create type lead_source    as enum ('whatsapp','call','form','import');
create type admin_role     as enum ('admin','moderator');
create type report_status  as enum ('open','reviewed','resolved','dismissed');
