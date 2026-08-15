# Oficinas Automação

PWA para automação dos processos essenciais de pequenas oficinas, com a **Ordem de Serviço (OS)** como núcleo do produto.

## Produto

Fluxo alvo:

`Agendamento → OS → Diagnóstico/Orçamento → Aprovação → Execução → Cobrança`

O projeto é deliberadamente enxuto. Não é um ERP genérico e funcionalidades fora desse fluxo só entram após validação real.

## Stack alvo

- React 19 + TypeScript strict
- TanStack Start + TanStack Router
- TanStack Query
- Tailwind CSS 4
- Supabase (Postgres, Auth e Storage)
- PWA
- Pix QR Code
- Vercel

## Ondas

1. **MVP:** cliente, item, OS, orçamento/aprovação e Pix
2. **Operação:** agenda, estoque enxuto e dashboard
3. **Refinamento:** autoagendamento, WhatsApp e relatórios
4. **Validação:** piloto em oficina real e ajustes por uso

## Documentação

- [`docs/ESCOPO.md`](docs/ESCOPO.md) — escopo oficial v0.1
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — limites de domínio, segurança e invariantes

## Desenvolvimento

```bash
npm install
npm run dev
```

Validação:

```bash
npm run lint
npm run build
```

## Estado atual

Fundação técnica em evolução. O domínio de Ordem de Serviço já está definido em `src/domain/service-order.ts`. O próximo marco é implementar o primeiro fluxo vertical completo do MVP e conectar o Supabase.
