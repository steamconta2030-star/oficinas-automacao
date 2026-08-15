-- Onda 2: perfis internos e políticas RLS.
-- Mantém o acesso público ao orçamento fora das tabelas diretas; o link público
-- será servido por função controlada em uma etapa posterior.

create table public.perfis (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  papel public.user_role not null default 'tecnico',
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.perfis enable row level security;

create or replace function public.papel_usuario()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select papel
  from public.perfis
  where user_id = auth.uid() and ativo = true
  limit 1;
$$;

revoke all on function public.papel_usuario() from public;
grant execute on function public.papel_usuario() to authenticated;

create policy "perfil_le_proprio"
on public.perfis for select
to authenticated
using (user_id = auth.uid() or public.papel_usuario() = 'dono');

create policy "dono_gerencia_perfis"
on public.perfis for all
to authenticated
using (public.papel_usuario() = 'dono')
with check (public.papel_usuario() = 'dono');

create policy "equipe_le_clientes"
on public.clientes for select
to authenticated
using (public.papel_usuario() is not null);

create policy "recepcao_dono_gerencia_clientes"
on public.clientes for all
to authenticated
using (public.papel_usuario() in ('dono', 'recepcao'))
with check (public.papel_usuario() in ('dono', 'recepcao'));

create policy "equipe_le_itens"
on public.itens_atendidos for select
to authenticated
using (public.papel_usuario() is not null);

create policy "recepcao_dono_gerencia_itens"
on public.itens_atendidos for all
to authenticated
using (public.papel_usuario() in ('dono', 'recepcao'))
with check (public.papel_usuario() in ('dono', 'recepcao'));

create policy "equipe_le_os"
on public.ordens_servico for select
to authenticated
using (
  public.papel_usuario() in ('dono', 'recepcao')
  or (public.papel_usuario() = 'tecnico' and tecnico_id = auth.uid())
);

create policy "recepcao_dono_cria_os"
on public.ordens_servico for insert
to authenticated
with check (public.papel_usuario() in ('dono', 'recepcao'));

create policy "equipe_atualiza_os_permitida"
on public.ordens_servico for update
to authenticated
using (
  public.papel_usuario() in ('dono', 'recepcao')
  or (public.papel_usuario() = 'tecnico' and tecnico_id = auth.uid())
)
with check (
  public.papel_usuario() in ('dono', 'recepcao')
  or (public.papel_usuario() = 'tecnico' and tecnico_id = auth.uid())
);

create policy "equipe_le_historico"
on public.os_status_historico for select
to authenticated
using (
  exists (
    select 1 from public.ordens_servico os
    where os.id = ordem_servico_id
      and (
        public.papel_usuario() in ('dono', 'recepcao')
        or (public.papel_usuario() = 'tecnico' and os.tecnico_id = auth.uid())
      )
  )
);

create policy "equipe_registra_historico"
on public.os_status_historico for insert
to authenticated
with check (
  alterado_por = auth.uid()
  and exists (
    select 1 from public.ordens_servico os
    where os.id = ordem_servico_id
      and (
        public.papel_usuario() in ('dono', 'recepcao')
        or (public.papel_usuario() = 'tecnico' and os.tecnico_id = auth.uid())
      )
  )
);

create policy "equipe_le_orcamentos"
on public.orcamentos for select
to authenticated
using (
  exists (
    select 1 from public.ordens_servico os
    where os.id = ordem_servico_id
      and (
        public.papel_usuario() in ('dono', 'recepcao')
        or (public.papel_usuario() = 'tecnico' and os.tecnico_id = auth.uid())
      )
  )
);

create policy "recepcao_dono_gerencia_orcamentos"
on public.orcamentos for all
to authenticated
using (public.papel_usuario() in ('dono', 'recepcao'))
with check (public.papel_usuario() in ('dono', 'recepcao'));

create policy "equipe_le_itens_orcamento"
on public.orcamento_itens for select
to authenticated
using (
  exists (
    select 1
    from public.orcamentos o
    join public.ordens_servico os on os.id = o.ordem_servico_id
    where o.id = orcamento_id
      and (
        public.papel_usuario() in ('dono', 'recepcao')
        or (public.papel_usuario() = 'tecnico' and os.tecnico_id = auth.uid())
      )
  )
);

create policy "recepcao_dono_gerencia_itens_orcamento"
on public.orcamento_itens for all
to authenticated
using (public.papel_usuario() in ('dono', 'recepcao'))
with check (public.papel_usuario() in ('dono', 'recepcao'));
