export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans p-8 selection:bg-emerald-500/30">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold text-zinc-100">Políticas de Privacidade</h1>
          <a href="/" className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 rounded-lg transition-colors">Voltar ao Início</a>
        </div>
        
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-emerald-500">1. Coleta de Dados</h2>
          <p>
            Esta versão open-source não inclui autenticação, pagamentos ou banco de dados. O texto enviado para geração é processado pela API configurada no servidor local ou no seu ambiente de deploy.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-emerald-500">2. Uso das Informações</h2>
          <p>
            As informações inseridas no formulário são usadas apenas para gerar o roteiro, o layout e as imagens do carrossel durante a sessão de uso.
          </p>
        </section>
        
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-emerald-500">3. Compartilhamento</h2>
          <p>
            Não há compartilhamento comercial de dados nesta versão. O único provedor externo necessário é o serviço de IA configurado por quem executa o projeto.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-emerald-500">4. Contato</h2>
          <p className="border-l-4 border-emerald-500 pl-4 py-1">
            Para dúvidas, exclusão de dados ou esclarecimentos sobre privacidade, entre em contato: <a href="mailto:melfernandes@mapmed.com.br" className="text-emerald-400 font-medium hover:underline">melfernandes@mapmed.com.br</a>
          </p>
        </section>
      </div>
    </div>
  );
}
