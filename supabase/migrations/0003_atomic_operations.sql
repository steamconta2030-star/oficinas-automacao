-- Operações transacionais e acesso público controlado.

create or replace function public.criar_ordem_servico(
  p_cliente_nome text,
  p_telefone text,
  p_tipo public.item_tipo,
  p_identificacao text,
  p_descricao text,
  p_problema text
)
returns table(ordem_id uuid, cliente_id uuid, item_id uuid, numero bigint)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_cliente_id uuid;
  v_item_id uuid;
  v_ordem_id uuid;
  v_numero bigint;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if not public.is_operacao() then raise exception 'permission denied'; end if;

  insert into public.clientes(nome, telefone)
  values (trim(p_cliente_nome), trim(p_telefone))
  returning id into v_cliente_id;

  insert into public.itens_atendidos(cliente_id, tipo, identificacao, descricao)
  values (v_cliente_id, p_tipo, trim(p_identificacao), trim(p_descricao))
  returning id into v_item_id;

  insert into public.ordens_servico(cliente_id, item_id, problema_relatado)
  values (v_cliente_id, v_item_id, trim(p_problema))
  returning id, ordens_servico.numero into v_ordem_id, v_numero;

  insert into public.os_status_historico(ordem_servico_id, status, alterado_por)
  values (v_ordem_id, 'aguardando_avaliacao', auth.uid());

  return query select v_ordem_id, v_cliente_id, v_item_id, v_numero;
end;
$$;

revoke all on function public.criar_ordem_servico(text,text,public.item_tipo,text,text,text) from public;
grant execute on function public.criar_ordem_servico(text,text,public.item_tipo,text,text,text) to authenticated;

-- O cliente final nunca recebe SELECT direto nas tabelas internas.
-- A função expõe somente o orçamento associado ao token aleatório.
create or replace function public.obter_orcamento_publico(p_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'ordem', jsonb_build_object('numero', os.numero),
    'cliente', jsonb_build_object('nome', c.nome),
    'item', jsonb_build_object('descricao', ia.descricao, 'identificacao', ia.identificacao),
    'orcamento', jsonb_build_object(
      'status', o.status,
      'decidido_em', o.decidido_em,
      'itens', coalesce((
        select jsonb_agg(jsonb_build_object(
          'id', oi.id,
          'tipo', oi.tipo,
          'descricao', oi.descricao,
          'quantidade', oi.quantidade,
          'valor_unitario', oi.valor_unitario
        ) order by oi.id)
        from public.orcamento_itens oi
        where oi.orcamento_id = o.id
      ), '[]'::jsonb)
    )
  )
  from public.orcamentos o
  join public.ordens_servico os on os.id = o.ordem_servico_id
  join public.clientes c on c.id = os.cliente_id
  join public.itens_atendidos ia on ia.id = os.item_id
  where o.token_publico = p_token and o.status <> 'rascunho';
$$;

revoke all on function public.obter_orcamento_publico(uuid) from public;
grant execute on function public.obter_orcamento_publico(uuid) to anon, authenticated;

create or replace function public.decidir_orcamento_publico(p_token uuid, p_decisao public.orcamento_status)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_orcamento public.orcamentos%rowtype;
begin
  if p_decisao not in ('aprovado', 'recusado') then raise exception 'invalid decision'; end if;

  select * into v_orcamento
  from public.orcamentos
  where token_publico = p_token
  for update;

  if not found or v_orcamento.status <> 'enviado' then raise exception 'quote unavailable'; end if;

  update public.orcamentos
  set status = p_decisao, decidido_em = now()
  where id = v_orcamento.id;

  if p_decisao = 'aprovado' then
    update public.ordens_servico set status = 'aprovado', updated_at = now() where id = v_orcamento.ordem_servico_id;
    insert into public.os_status_historico(ordem_servico_id, status, alterado_por)
    values (v_orcamento.ordem_servico_id, 'aprovado', null);
  end if;

  return jsonb_build_object('status', p_decisao, 'decidido_em', now());
end;
$$;

revoke all on function public.decidir_orcamento_publico(uuid,public.orcamento_status) from public;
grant execute on function public.decidir_orcamento_publico(uuid,public.orcamento_status) to anon, authenticated;
