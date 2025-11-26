-- Enable pgvector extension
create extension if not exists vector;

-- Create a table to store your documents
create table if not exists public.documents (
  id bigserial primary key,
  content text, -- The text content (e.g. a paragraph of your documentation)
  metadata jsonb, -- Extra info (e.g. source url, title)
  embedding vector(1536) -- OpenAI text-embedding-3-small output size
);

-- Create a function to search for documents
create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
end;
$$;
