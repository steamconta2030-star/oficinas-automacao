import { getSupabaseClient, supabaseConfigurado } from '../lib/supabase'
import type { Cliente, ItemAtendido, Orcamento, OrcamentoItem, OrdemServico } from '../domain/entities'
import {
  criarOrdemDemo,
  enviarOrcamentoDemo,
  listarOrdensDemo,
  obterOrdemDemo,
  salvarOrcamentoDemo,
} from './demo-store'

export type NovaOrdemInput = {
  clienteNome: string
  telefone: string
  tipo: ItemAtendido['tipo']
  identificacao: string
  descricao: string
  problema: string
}

export type OrdemCompleta = {
  ordem: OrdemServico
  cliente?: Cliente
  item?: ItemAtendido
  orcamento?: Orcamento
}

type OrdemRow = {
  id: string
  numero: number | string
  cliente_id: string
  item_id: string
  problema_relatado: string
  status: OrdemServico['status']
  tecnico_id: string | null
  created_at: string
  updated_at: string
  clientes?: { id: string; nome: string; telefone: string; email: string | null; created_at: string } | null
  itens_atendidos?: { id: string; cliente_id: string; tipo: ItemAtendido['tipo']; identificacao: string; descricao: string } | null
}

type OrcamentoPayload = {
  id: string
  ordem_servico_id: string
  status: Orcamento['status']
  token_publico: string
  enviado_em: string | null
  decidido_em: string | null
  itens: Array<{
    id: string
    tipo: OrcamentoItem['tipo']
    descricao: string
    quantidade: number | string
    valor_unitario: number | string
  }>
}

export const modoDados = supabaseConfigurado() ? 'supabase' : 'demo'

function mapOrdem(row: OrdemRow): OrdemCompleta {
  return {
    ordem: {
      id: row.id,
      numero: Number(row.numero),
      clienteId: row.cliente_id,
      itemId: row.item_id,
      problemaRelatado: row.problema_relatado,
      status: row.status,
      tecnicoId: row.tecnico_id ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    },
    cliente: row.clientes ? {
      id: row.clientes.id,
      nome: row.clientes.nome,
      telefone: row.clientes.telefone,
      email: row.clientes.email ?? undefined,
      createdAt: row.clientes.created_at,
    } : undefined,
    item: row.itens_atendidos ? {
      id: row.itens_atendidos.id,
      clienteId: row.itens_atendidos.cliente_id,
      tipo: row.itens_atendidos.tipo,
      identificacao: row.itens_atendidos.identificacao,
      descricao: row.itens_atendidos.descricao,
    } : undefined,
  }
}

function mapOrcamento(payload: OrcamentoPayload | null): Orcamento | undefined {
  if (!payload) return undefined
  return {
    id: payload.id,
    ordemServicoId: payload.ordem_servico_id,
    status: payload.status,
    tokenPublico: payload.token_publico,
    enviadoEm: payload.enviado_em ?? undefined,
    decididoEm: payload.decidido_em ?? undefined,
    itens: (payload.itens ?? []).map((item) => ({
      id: item.id,
      tipo: item.tipo,
      descricao: item.descricao,
      quantidade: Number(item.quantidade),
      valorUnitario: Number(item.valor_unitario),
    })),
  }
}

export async function listarOrdens(): Promise<OrdemCompleta[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return listarOrdensDemo()

  const { data, error } = await supabase
    .from('ordens_servico')
    .select('id,numero,cliente_id,item_id,problema_relatado,status,tecnico_id,created_at,updated_at,clientes(id,nome,telefone,email,created_at),itens_atendidos(id,cliente_id,tipo,identificacao,descricao)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map((row) => mapOrdem(row as unknown as OrdemRow))
}

export async function listarClientes(): Promise<Cliente[]> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    const vistos = new Map<string, Cliente>()
    for (const { cliente } of listarOrdensDemo()) {
      if (cliente) vistos.set(cliente.id, cliente)
    }
    return [...vistos.values()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  }

  const { data, error } = await supabase
    .from('clientes')
    .select('id,nome,telefone,email,created_at')
    .order('nome')

  if (error) throw error
  return (data ?? []).map((row) => ({
    id: row.id,
    nome: row.nome,
    telefone: row.telefone,
    email: row.email ?? undefined,
    createdAt: row.created_at,
  }))
}

export async function obterOrcamento(ordemId: string): Promise<Orcamento | undefined> {
  const supabase = getSupabaseClient()
  if (!supabase) return obterOrdemDemo(ordemId)?.orcamento

  const { data, error } = await supabase.rpc('obter_orcamento_os', { p_ordem_id: ordemId })
  if (error) throw error
  return mapOrcamento(data as OrcamentoPayload | null)
}

export async function obterOrdem(id: string): Promise<OrdemCompleta | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return obterOrdemDemo(id) ?? null

  const { data, error } = await supabase
    .from('ordens_servico')
    .select('id,numero,cliente_id,item_id,problema_relatado,status,tecnico_id,created_at,updated_at,clientes(id,nome,telefone,email,created_at),itens_atendidos(id,cliente_id,tipo,identificacao,descricao)')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const registro = mapOrdem(data as unknown as OrdemRow)
  registro.orcamento = await obterOrcamento(id)
  return registro
}

export async function criarOrdem(input: NovaOrdemInput): Promise<OrdemCompleta> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    const ordem = criarOrdemDemo(input)
    const registro = obterOrdemDemo(ordem.id)
    if (!registro) throw new Error('A ordem criada não pôde ser carregada.')
    return registro
  }

  const { data, error } = await supabase.rpc('criar_ordem_servico', {
    p_cliente_nome: input.clienteNome.trim(),
    p_telefone: input.telefone.trim(),
    p_tipo: input.tipo,
    p_identificacao: input.identificacao.trim(),
    p_descricao: input.descricao.trim(),
    p_problema: input.problema.trim(),
  })

  if (error) throw error
  const primeiraLinha = Array.isArray(data) ? data[0] : data
  const id = typeof primeiraLinha === 'string' ? primeiraLinha : primeiraLinha?.ordem_id ?? primeiraLinha?.id
  if (!id) throw new Error('A ordem foi criada, mas o identificador não foi retornado.')

  const criada = await obterOrdem(id)
  if (!criada) throw new Error('A ordem criada não pôde ser carregada.')
  return criada
}

export async function salvarOrcamento(ordemId: string, itens: OrcamentoItem[]) {
  const supabase = getSupabaseClient()
  if (!supabase) return salvarOrcamentoDemo(ordemId, itens)

  const { error } = await supabase.rpc('salvar_orcamento_os', {
    p_ordem_id: ordemId,
    p_itens: itens.map((item) => ({
      tipo: item.tipo,
      descricao: item.descricao,
      quantidade: item.quantidade,
      valor_unitario: item.valorUnitario,
    })),
  })
  if (error) throw error

  const salvo = await obterOrcamento(ordemId)
  if (!salvo) throw new Error('O orçamento salvo não pôde ser recarregado.')
  return salvo
}

export async function enviarOrcamento(ordemId: string) {
  const supabase = getSupabaseClient()
  if (!supabase) return enviarOrcamentoDemo(ordemId)

  const { error } = await supabase.rpc('enviar_orcamento_os', { p_ordem_id: ordemId })
  if (error) throw error

  const enviado = await obterOrcamento(ordemId)
  if (!enviado) throw new Error('O orçamento enviado não pôde ser recarregado.')
  return enviado
}
