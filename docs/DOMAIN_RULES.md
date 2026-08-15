# Regras de domínio — Ordem de Serviço

Este documento registra regras puras que podem ser validadas antes da integração com Supabase e antes de qualquer efeito colateral.

## Transições de status

Fluxo principal:

`awaiting_evaluation → quote_sent → approved → in_progress → ready → delivered`

Desvios operacionais permitidos:

- `quote_sent → awaiting_evaluation`: orçamento precisa ser revisto.
- `in_progress → waiting_for_part`: execução bloqueada por peça.
- `waiting_for_part → in_progress`: peça disponível e execução retomada.
- `ready → in_progress`: retrabalho identificado antes da entrega.

`delivered` é terminal no fluxo operacional normal. Reabertura futura deve criar uma nova OS ou uma regra explícita de reabertura, nunca alterar silenciosamente o histórico.

## Validações mínimas

Cliente:

- identificador obrigatório;
- nome obrigatório;
- telefone obrigatório;
- e-mail opcional, mas não vazio quando informado.

Ordem de Serviço:

- identificador obrigatório;
- cliente obrigatório;
- item obrigatório;
- problema relatado obrigatório;
- datas de criação e atualização obrigatórias.

## Persistência futura

Ao conectar o Supabase:

1. validar a entrada;
2. verificar autorização/RLS;
3. validar a transição de estado;
4. persistir OS e histórico na mesma operação lógica;
5. nunca depender apenas da interface para proteger regras de negócio.

As funções em `src/domain` devem permanecer puras sempre que possível. A camada de persistência pode consumi-las, mas não deve duplicar suas regras.
