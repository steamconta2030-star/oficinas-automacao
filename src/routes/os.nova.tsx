import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/os/nova')({ component: NovaOS })

function NovaOS() {
  return (
    <>
      <header className="page-header"><div><span className="eyebrow">NOVA ORDEM</span><h1>Abertura de OS</h1><p>Fluxo curto para recepção: cliente, item e problema relatado.</p></div></header>
      <form className="form-card" onSubmit={(event) => event.preventDefault()}>
        <fieldset><legend>1. Cliente</legend><div className="form-grid"><label>Nome<input name="clienteNome" placeholder="Nome do cliente" /></label><label>WhatsApp<input name="telefone" inputMode="tel" placeholder="(31) 99999-9999" /></label></div></fieldset>
        <fieldset><legend>2. Item atendido</legend><div className="form-grid"><label>Tipo<select name="tipo" defaultValue="veiculo"><option value="veiculo">Veículo</option><option value="movel">Móvel</option><option value="equipamento">Equipamento</option><option value="outro">Outro</option></select></label><label>Identificação<input name="identificacao" placeholder="Placa, modelo ou nº de série" /></label><label className="full-field">Descrição<input name="descricao" placeholder="Ex.: Fiat Strada 1.3 2023" /></label></div></fieldset>
        <fieldset><legend>3. Problema relatado</legend><label>Relato do cliente<textarea name="problema" rows={5} placeholder="Registre com as palavras do cliente o motivo da entrada." /></label></fieldset>
        <div className="form-footer"><span>Salvar será habilitado após a conexão segura com o Supabase.</span><button type="submit" disabled>Criar ordem de serviço</button></div>
      </form>
    </>
  )
}
