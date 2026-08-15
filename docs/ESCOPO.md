# Automação de Processos para Pequenas Oficinas

## Escopo técnico v0.1

### Visão
Sistema web PWA enxuto para pequenas oficinas, organizado em torno da Ordem de Serviço (OS). O fluxo principal é: agendamento → diagnóstico/orçamento → aprovação → execução → baixa de estoque → cobrança.

### Princípios
- A OS é a entidade central.
- Não virar ERP genérico.
- Poucos cliques na operação diária.
- Aprovação do cliente deve gerar evidência de data/hora.
- Estoque do MVP é deliberadamente simples.
- Evolução por ondas e validação com uso real.

### Personas
- Dono/gestor: visão operacional e financeira.
- Técnico/mecânico: OS atribuídas, peças usadas e mudança de status.
- Cliente: status, aprovação de orçamento e pagamento Pix.

### Estados da OS
1. Aguardando avaliação
2. Orçamento enviado
3. Aprovado
4. Em execução
5. Aguardando peça
6. Pronto
7. Entregue

Toda mudança deve gerar histórico com timestamp e usuário responsável quando aplicável.

### MVP — Onda 1
- Cadastro de cliente
- Cadastro do item atendido (veículo, móvel, equipamento)
- Ordem de Serviço
- Problema relatado + fotos opcionais
- Orçamento com peças e serviços
- Link público único para aprovação/recusa sem login
- Registro imutável da decisão do cliente
- Cobrança Pix ao concluir a OS
- Pago/pendente

### Onda 2 — Operação diária
- Agenda por técnico/box
- Estoque simples
- Baixa de peça vinculada à OS
- Ponto de reposição e alertas
- Dashboard consolidado

### Onda 3 — Refinamento
- Autoagendamento público
- Notificações de status via WhatsApp
- Relatório financeiro por período

### Onda 4 — Validação
- Piloto com oficina real
- Ajustes baseados em uso real

### Fora do MVP
- Filiais
- Fornecedores e compras
- Contabilidade/NF
- App nativo
- Múltiplos idiomas

### Stack alvo
- React 19 + TypeScript strict
- TanStack Start + TanStack Router
- TanStack Query
- Tailwind CSS 4
- Supabase: Postgres + Auth + Storage
- PWA
- Pix QR Code
- Vercel

### Modelo de dados de alto nível
- `clientes`
- `itens`
- `ordens_servico`
- `historico_os`
- `orcamentos`
- `orcamento_itens`
- `pecas`
- `os_pecas`
- `cobrancas`
- `usuarios`

### Regra de produto
Qualquer funcionalidade nova deve responder a uma dor observável da oficina. Recursos administrativos complexos só entram após validação de demanda real.
