# Arquitetura — Oficinas Automação

## Centro do domínio

`OrdemServico` é o agregado principal. Cliente e item existem independentemente, mas orçamento, histórico operacional, peças utilizadas e cobrança devem apontar para uma OS.

## Limites de domínio

### Atendimento
Clientes, itens atendidos e abertura da OS.

### Execução
Status, técnico responsável, histórico e evidências/fotos.

### Comercial
Orçamento, itens do orçamento e aprovação pública.

### Estoque
Peças e movimentações causadas pelo uso em OS. No MVP não inclui compras/fornecedores.

### Financeiro enxuto
Cobrança da OS e estado pago/pendente. Não é contabilidade.

## Segurança
- Área interna protegida por Supabase Auth.
- Papéis: `owner`, `reception`, `technician`.
- Links públicos de orçamento usam token aleatório não sequencial.
- Aprovação/recusa registra timestamp e snapshot do orçamento aprovado.
- Storage separa anexos internos e arquivos acessíveis por link assinado.
- RLS no Supabase será obrigatória antes de dados reais.

## Regras de consistência
- Mudança de status sempre gera `historico_os`.
- Orçamento aprovado não deve ser silenciosamente alterado; revisão gera nova versão.
- Baixa de estoque é transacional e vinculada à OS.
- Uma cobrança pertence a uma OS e seu valor deve ser derivável do orçamento aprovado/ajustes autorizados.

## UX operacional
A tela do técnico prioriza uso em celular: alvos grandes, contraste alto, poucas ações primárias e mínimo de digitação.

## Estratégia de entrega
Construir verticalmente: primeiro um fluxo completo cliente → item → OS → orçamento → aprovação → cobrança. Agenda e estoque entram depois que esse fluxo estiver utilizável.
