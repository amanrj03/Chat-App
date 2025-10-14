-- Users
create table if not exists users (
  id text primary key,
  email text unique not null,
  google_id text unique not null,
  name text,
  age int,
  gender text,
  mobile text unique,
  public_key text,
  created_at timestamp with time zone default now()
);

-- Conversations
create table if not exists conversations (
  id text primary key,
  created_at timestamp with time zone default now()
);

create table if not exists conversation_members (
  conversation_id text not null references conversations(id) on delete cascade,
  user_id text not null references users(id) on delete cascade,
  primary key (conversation_id, user_id)
);

-- Messages (encrypted at rest)
create table if not exists messages (
  id text primary key,
  conversation_id text not null references conversations(id) on delete cascade,
  sender_id text not null references users(id) on delete cascade,
  ciphertext text not null,
  iv text not null,
  created_at timestamp with time zone default now()
);

create index if not exists idx_users_mobile on users(mobile);
create index if not exists idx_messages_convo on messages(conversation_id, created_at);
