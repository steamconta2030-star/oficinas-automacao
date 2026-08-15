create extension if not exists pgcrypto;

create type public.user_role as enum ('dono', 'recepcao', 'tecnico');
create type public.item_tipo as enum ('veiculo', 'movel', 'equipamento', 'outro');
create type public.os_status as enum ('aguardando_avaliacao', 'orcamento_enviado', 'aprovado', 'em_execucao', 'aguardando_peca', 'pronto', 'entregue');
create type public.orcamento_status as enum ('rascunho', 'enviado', 'aprovado', 'recusado');

create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text not null,
  email text,
  created_at timestamptz not null default now()
);

create table public.itens_atendidos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  tipo public.item_tipo not null,
  identificacao text not null,
  descricao text not null,
  created_at timestamptz not null default now()
);

create table public.ordens_servico (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity unique,
  cliente_id uuid not null references public.clientes(id),
  item_id uuid not null references public.itens_atendidos(id),
  problema_relatado text not null,
  status public.os_status not null default 'aguardando_avaliacao',
  tecnico_id uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.os_status_historico (
  id uuid primary key default gen_random_uuid(),
  ordem_servico_id uuid not null references public.ordens_servico(id) on delete cascade,
  status public.os_status not null,
  alterado_por uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.orcamentos (
  id uuid primary key default gen_random_uuid(),
  ordem_servico_id uuid not null unique references public.ordens_servico(id) on delete cascade,
  status public.orcamento_status not null default 'rascunho',
  token_publico uuid not null default gen_random_uuid() unique,
  enviado_em timestamptz,
  decidido_em timestamptz,
  created_at timestamptz not null default now()
);

create table public.orcamento_itens (
  id uuid primary key default gen_random_uuid(),
  orcamento_id uuid not null references public.orcamentos(id) on delete cascade,
  tipo text not null check (tipo in ('peca', 'servico')),
  descricao text not null,
  quantidade numeric(12,3) not null check (quantidade > 0),
  valor_unitario numeric(12,2) not null check (valor_unitario >= 0)
);

create index idx_itens_cliente on public.itens_atendidos(cliente_id);
create index idx_os_cliente on public.ordens_servico(cliente_id);
create index idx_os_status on public.ordens_servico(status);
create index idx_os_historico on public.os_status_historico(ordem_servico_id, created_at);

alter table public.clientes enable row level security;
alter table public.itens_atendidos enable row level security;
alter table public.ordens_servico enable row level security;
alter table public.os_status_historico enable row level security;
alter table public.orcamentos enable row level security;
alter table public.orcamento_itens enable row level security;

-- Policies serão adicionadas quando os papéis internos estiverem ligados ao Supabase Auth.
-- Até lá, RLS habilitado significa acesso negado por padrão para clientes da API.
