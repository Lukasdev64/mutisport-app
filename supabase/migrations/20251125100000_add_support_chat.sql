-- Create support_conversations table
create table if not exists public.support_conversations (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete set null,
    status text default 'active' check (status in ('active', 'closed', 'human_requested')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create support_messages table
create table if not exists public.support_messages (
    id uuid default gen_random_uuid() primary key,
    conversation_id uuid references public.support_conversations(id) on delete cascade not null,
    role text check (role in ('user', 'assistant', 'system')) not null,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.support_conversations enable row level security;
alter table public.support_messages enable row level security;

-- Policies for conversations
create policy "Users can view their own conversations"
    on public.support_conversations for select
    using (auth.uid() = user_id);

create policy "Users can insert their own conversations"
    on public.support_conversations for insert
    with check (auth.uid() = user_id);

-- Policies for messages
create policy "Users can view messages in their conversations"
    on public.support_messages for select
    using (
        exists (
            select 1 from public.support_conversations
            where id = support_messages.conversation_id
            and user_id = auth.uid()
        )
    );

create policy "Users can insert messages in their conversations"
    on public.support_messages for insert
    with check (
        exists (
            select 1 from public.support_conversations
            where id = support_messages.conversation_id
            and user_id = auth.uid()
        )
    );

-- Realtime
alter publication supabase_realtime add table public.support_messages;
