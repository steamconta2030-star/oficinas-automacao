import { getSupabaseClient, supabaseConfigurado } from '../lib/supabase'
import type { Cliente, ItemAtendido, OrdemServico } from '../domain/entities'
import { criarOrdemDemo, listarOrdensDemo, obterOrdemDemo } from './demo-store'

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

export async function obterOrdem(id: string): Promise<OrdemCompleta | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return obterOrdemDemo(id) ?? null

  const { data, error } = await supabase
    .from('ordens_servico')
    .select('id,numero,cliente_id,item_id,problema_relatado,status,tecnico_id,created_at,updated_at,clientes(id,nome,telefone,email,created_at),itens_atendidos(id,cliente_id,tipo,identificacao,descricao)')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data ? mapOrdem(data as unknown as OrdemRow) : null
}

export async function criarOrdem(input: NovaOrdemInput): Promise<OrdemCompleta> {
  const supabase = getSupabaseClient()
  if (!supabase) return criarOrdemDemo(input)

  const { data, error } = await supabase.rpc('criar_ordem_servico', {
    p_cliente_nome: input.clienteNome.trim(),
    p_telefone: input.telefone.trim(),
    p_tipo: input.tipo,
    p_identificacao: input.identificacao.trim(),
    p_descricao: input.descricao.trim(),
    p_problema: input.problema.trim(),
  })

  if (error) throw error
  const id = typeof data === 'string' ? data : data?.id
  if (!id) throw new Error('A ordem foi criada, mas o identificador não foi retornado.')

  const criada = await obterOrdem(id)
  if (!criada) throw new Error('A ordem criada não pôde ser carregada.')
  return criada
}
