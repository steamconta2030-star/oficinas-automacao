import type { Cliente, ItemAtendido, Orcamento, OrcamentoItem, OrdemServico } from '../domain/entities'

const STORAGE_KEY = 'oficinas-automacao:demo:v1'

type DemoDatabase = {
  clientes: Cliente[]
  itens: ItemAtendido[]
  ordens: OrdemServico[]
  orcamentos: Orcamento[]
}

const emptyDatabase = (): DemoDatabase => ({ clientes: [], itens: [], ordens: [], orcamentos: [] })

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readDatabase(): DemoDatabase {
  if (!canUseStorage()) return emptyDatabase()
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return emptyDatabase()
  try {
    return { ...emptyDatabase(), ...JSON.parse(raw) } as DemoDatabase
  } catch {
    return emptyDatabase()
  }
}

function writeDatabase(database: DemoDatabase) {
  if (!canUseStorage()) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(database))
  window.dispatchEvent(new CustomEvent('oficinas-demo-change'))
}

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export type NovaOrdemInput = {
  clienteNome: string
  telefone: string
  tipo: ItemAtendido['tipo']
  identificacao: string
  descricao: string
  problema: string
}

export function criarOrdemDemo(input: NovaOrdemInput) {
  const db = readDatabase()
  const now = new Date().toISOString()
  const cliente: Cliente = { id: newId(), nome: input.clienteNome.trim(), telefone: input.telefone.trim(), createdAt: now }
  const item: ItemAtendido = { id: newId(), clienteId: cliente.id, tipo: input.tipo, identificacao: input.identificacao.trim(), descricao: input.descricao.trim() }
  const ordem: OrdemServico = {
    id: newId(),
    numero: Math.max(0, ...db.ordens.map((os) => os.numero)) + 1,
    clienteId: cliente.id,
    itemId: item.id,
    problemaRelatado: input.problema.trim(),
    status: 'aguardando_avaliacao',
    createdAt: now,
    updatedAt: now,
  }
  db.clientes.push(cliente)
  db.itens.push(item)
  db.ordens.push(ordem)
  writeDatabase(db)
  return ordem
}

export function listarOrdensDemo() {
  const db = readDatabase()
  return db.ordens
    .map((ordem) => ({ ordem, cliente: db.clientes.find((c) => c.id === ordem.clienteId), item: db.itens.find((i) => i.id === ordem.itemId) }))
    .sort((a, b) => b.ordem.numero - a.ordem.numero)
}

export function obterOrdemDemo(id: string) {
  const db = readDatabase()
  const ordem = db.ordens.find((os) => os.id === id)
  if (!ordem) return null
  return {
    ordem,
    cliente: db.clientes.find((c) => c.id === ordem.clienteId),
    item: db.itens.find((i) => i.id === ordem.itemId),
    orcamento: db.orcamentos.find((o) => o.ordemServicoId === ordem.id),
  }
}

export function salvarOrcamentoDemo(ordemServicoId: string, itens: OrcamentoItem[]) {
  const db = readDatabase()
  const existente = db.orcamentos.find((o) => o.ordemServicoId === ordemServicoId)
  if (existente && existente.status !== 'rascunho') throw new Error('Este orçamento já foi enviado e não pode ser alterado.')
  const orcamento: Orcamento = existente ?? {
    id: newId(), ordemServicoId, itens: [], status: 'rascunho', tokenPublico: newId(),
  }
  orcamento.itens = itens.map((item) => ({ ...item, id: item.id || newId() }))
  if (!existente) db.orcamentos.push(orcamento)
  writeDatabase(db)
  return orcamento
}

export function enviarOrcamentoDemo(ordemServicoId: string) {
  const db = readDatabase()
  const orcamento = db.orcamentos.find((o) => o.ordemServicoId === ordemServicoId)
  const ordem = db.ordens.find((o) => o.id === ordemServicoId)
  if (!orcamento || !ordem) throw new Error('Orçamento ou OS não encontrado.')
  if (!orcamento.itens.length) throw new Error('Adicione itens antes de enviar o orçamento.')
  if (orcamento.status !== 'rascunho') return orcamento
  orcamento.status = 'enviado'
  orcamento.enviadoEm = new Date().toISOString()
  ordem.status = 'orcamento_enviado'
  ordem.updatedAt = new Date().toISOString()
  writeDatabase(db)
  return orcamento
}

export function obterOrcamentoPublicoDemo(token: string) {
  const db = readDatabase()
  const orcamento = db.orcamentos.find((o) => o.tokenPublico === token)
  if (!orcamento) return null
  const ordem = db.ordens.find((o) => o.id === orcamento.ordemServicoId)
  const cliente = ordem ? db.clientes.find((c) => c.id === ordem.clienteId) : undefined
  const item = ordem ? db.itens.find((i) => i.id === ordem.itemId) : undefined
  return { orcamento, ordem, cliente, item }
}

export function decidirOrcamentoDemo(token: string, decisao: 'aprovado' | 'recusado') {
  const db = readDatabase()
  const orcamento = db.orcamentos.find((o) => o.tokenPublico === token)
  if (!orcamento) throw new Error('Orçamento não encontrado.')
  if (orcamento.status !== 'enviado') throw new Error('Este orçamento já foi decidido ou não está disponível.')
  orcamento.status = decisao
  orcamento.decididoEm = new Date().toISOString()
  const ordem = db.ordens.find((o) => o.id === orcamento.ordemServicoId)
  if (ordem && decisao === 'aprovado') {
    ordem.status = 'aprovado'
    ordem.updatedAt = new Date().toISOString()
  }
  writeDatabase(db)
  return orcamento
}

export function assinarMudancasDemo(listener: () => void) {
  if (typeof window === 'undefined') return () => undefined
  const handler = () => listener()
  window.addEventListener('oficinas-demo-change', handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener('oficinas-demo-change', handler)
    window.removeEventListener('storage', handler)
  }
}
