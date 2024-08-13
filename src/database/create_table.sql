drop table if exists customer;
drop table if exists customer_jwt;
create extension "uuid-ossp";

create table customer (
  id uuid primary key,
  first_name text not null,
  last_name text not null,
  cell_phone text not null,
  email text not null,
  password text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deactivated_at timestamptz null,
  blocked_at timestamptz null
);

create table customer_jwt (
  id serial primary key,
  customer_id uuid not null references customer (id),
  created_at timestamptz not null,
  device json not null,
  token text not null,
  issued_at timestamptz not null,
  exp_at timestamptz not null,
  refresh_token text not null,
  invalidated_at timestamptz null
);

create table message (
  id serial primary key,
  sender_id uuid not null references customer (id),
  receiver_id uuid not null references customer (id),
  created_at timestamptz not null,
  message text not null
)