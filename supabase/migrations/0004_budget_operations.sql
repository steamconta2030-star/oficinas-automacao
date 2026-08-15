-- Operações de orçamento vinculadas à OS, mantendo edição bloqueada após envio.

create or replace function public.obter_orcamento_os(p_ordem_id uuid)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'id', o.id,
    'ordem_servico_id', o.ordem_servico_id,
    'status', o.status,
    'token_publico', o.token_publico,
    'enviado_em', o.enviado_em,
    'decidido_em', o.decidido_em,
    'itens', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', oi.id,
        'tipo', oi.tipo,
        'descricao', oi.descricao,
        'quantidade', oi.quantidade,
        'valor_unitario', oi.valor_unitario
      ) order by oi.created_at nulls last, oi.id)
      from public.orcamento_itens oi
      where oi.orcamento_id = o.id
    ), '[]'::jsonb)
  )
  from public.orcamentos o
  where o.ordem_servico_id = p_ordem_id;
$$;

revoke all on function public.obter_orcamento_os(uuid) from public;
grant execute on function public.obter_orcamento_os(uuid) to authenticated;

create or replace function public.salvar_orcamento_os(
  p_ordem_id uuid,
  p_itens jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_orcamento_id uuid;
  v_status public.orcamento_status;
  v_item jsonb;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if not public.is_operacao() then raise exception 'permission denied'; end if;

  select id, status into v_orcamento_id, v_status
  from public.orcamentos
  where ordem_servico_id = p_ordem_id
  for update;

  if v_orcamento_id is null then
    insert into public.orcamentos(ordem_servico_id)
    values (p_ordem_id)
    returning id, status into v_orcamento_id, v_status;
  end if;

  if v_status <> 'rascunho' then
    raise exception 'quote is not editable';
  end if;

  delete from public.orcamento_itens where orcamento_id = v_orcamento_id;

  for v_item in select * from jsonb_array_elements(coalesce(p_itens, '[]'::jsonb))
  loop
    if coalesce(trim(v_item->>'descricao'), '') = '' then raise exception 'invalid description'; end if;
    if coalesce((v_item->>'quantidade')::numeric, 0) <= 0 then raise exception 'invalid quantity'; end if;
    if coalesce((v_item->>'valor_unitario')::numeric, -1) < 0 then raise exception 'invalid unit price'; end if;

    insert into public.orcamento_itens(orcamento_id, tipo, descricao, quantidade, valor_unitario)
    values (
      v_orcamento_id,
      v_item->>'tipo',
      trim(v_item->>'descricao'),
      (v_item->>'quantidade')::numeric,
      (v_item->>'valor_unitario')::numeric
    );
  end loop;

  return v_orcamento_id;
end;
$$;

revoke all on function public.salvar_orcamento_os(uuid,jsonb) from public;
grant execute on function public.salvar_orcamento_os(uuid,jsonb) to authenticated;

create or replace function public.enviar_orcamento_os(p_ordem_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_orcamento public.orcamentos%rowtype;
  v_qtd integer;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if not public.is_operacao() then raise exception 'permission denied'; end if;

  select * into v_orcamento
  from public.orcamentos
  where ordem_servico_id = p_ordem_id
  for update;

  if not found or v_orcamento.status <> 'rascunho' then raise exception 'quote unavailable'; end if;

  select count(*) into v_qtd from public.orcamento_itens where orcamento_id = v_orcamento.id;
  if v_qtd = 0 then raise exception 'quote needs at least one item'; end if;

  update public.orcamentos
  set status = 'enviado', enviado_em = now()
  where id = v_orcamento.id;

  update public.ordens_servico
  set status = 'orcamento_enviado', updated_at = now()
  where id = p_ordem_id;

  insert into public.os_status_historico(ordem_servico_id, status, alterado_por)
  values (p_ordem_id, 'orcamento_enviado', auth.uid());

  return jsonb_build_object(
    'status', 'enviado',
    'token_publico', v_orcamento.token_publico,
    'enviado_em', now()
  );
end;
$$;

revoke all on function public.enviar_orcamento_os(uuid) from public;
grant execute on function public.enviar_orcamento_os(uuid) to authenticated;
