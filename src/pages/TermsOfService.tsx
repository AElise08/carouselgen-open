export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans p-8 selection:bg-emerald-500/30">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold text-zinc-100">Termos de Serviço</h1>
          <a href="/" className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 rounded-lg transition-colors">Voltar ao Início</a>
        </div>
        
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-emerald-500">1. Aceitação</h2>
          <p>
            Ao utilizar o gerador de carrossel, você concorda com estes termos. O projeto destina-se a facilitar a ideação e criação de designs automatizados via inteligência artificial.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-emerald-500">2. Uso da Ferramenta</h2>
          <p>
            Esta versão open-source não possui cobrança, créditos, contas de usuário ou processamento de pagamentos. Os custos de API e infraestrutura dependem do ambiente onde você executar o projeto.
          </p>
        </section>
        
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-emerald-500">3. Responsabilidade</h2>
          <p className="border-l-4 border-emerald-500 pl-4 py-1">
            Revise os textos e imagens gerados antes de publicar. Resultados de IA podem conter imprecisões, conteúdo inadequado ou escolhas visuais que exigem curadoria humana.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-emerald-500">4. Garantias</h2>
          <p>
            Esta plataforma é fornecida "como está". Nós nos isentamos de qualquer garantia direta por eventuais oscilações nas Inteligências Artificiais e infraestrutura relacionadas a provedores de parceiros externos.
          </p>
        </section>

      </div>
    </div>
  );
}
