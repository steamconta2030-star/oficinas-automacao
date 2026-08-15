# Onda 1 — Núcleo seguro da Ordem de Serviço

## Objetivo

Construir a fundação da vertical Cliente → Item → OS → Orçamento → Aprovação sem acoplar o projeto a integrações externas antes da validação.

## Entregue nesta branch

- entidades TypeScript do núcleo;
- máquina de transições permitidas da OS;
- regras de integridade do orçamento;
- schema inicial do Supabase;
- RLS habilitado desde a primeira migration;
- token público imprevisível para orçamento;
- índices essenciais para consultas operacionais.

## Decisões de segurança

1. A branch `main` não recebe alterações desta onda até revisão.
2. O schema não cria políticas permissivas temporárias. Com RLS sem policies, o acesso pela API fica negado por padrão.
3. Aprovação pública não será implementada como acesso direto às tabelas. A decisão deverá passar por função de servidor que valide token e estado atual.
4. Orçamento deixa de ser editável depois do envio. Alterações futuras deverão gerar revisão/versionamento explícito.
5. Mudanças de status passam por transições permitidas, evitando saltos acidentais no fluxo.

## Próxima etapa da Onda 1

- estruturar TanStack Start e rotas reais;
- tela de listagem de OS;
- criação de cliente/item/OS;
- detalhe da OS e editor de orçamento;
- rota pública de orçamento somente leitura;
- testes das regras de domínio;
- validação de build/lint antes de qualquer merge.

## Ainda não conectar

- Pix real;
- WhatsApp real;
- Supabase de produção;
- baixa de estoque;
- agenda.

Essas integrações entram somente depois que a vertical principal estiver estável.
