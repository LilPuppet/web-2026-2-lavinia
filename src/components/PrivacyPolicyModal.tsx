import React from 'react';
import { X, Download, Shield } from 'lucide-react';

interface Props {
  onClose: () => void;
}

// Abre a janela de impressão do browser — o usuário pode salvar como PDF
const handlePrint = () => {
  const content = document.getElementById('privacy-policy-content');
  if (!content) return;

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) return;

  printWindow.document.write(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Política de Privacidade — CliniFlow</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.7;
      color: #1e293b;
      background: #fff;
      padding: 48px 64px;
      max-width: 800px;
      margin: 0 auto;
    }
    header {
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 2px solid #176b63;
      padding-bottom: 20px;
      margin-bottom: 32px;
    }
    header .logo {
      background: #176b63;
      color: #fff;
      font-weight: 900;
      font-size: 18pt;
      width: 44px; height: 44px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 10px;
    }
    header h1 { font-size: 14pt; font-weight: 700; color: #102b38; }
    header p  { font-size: 9pt; color: #64748b; margin-top: 2px; }
    h2 {
      font-size: 11pt;
      font-weight: 700;
      color: #176b63;
      margin: 28px 0 8px;
      padding-bottom: 4px;
      border-bottom: 1px solid #e2f2ef;
    }
    p  { margin-bottom: 10px; text-align: justify; }
    ul { margin: 8px 0 10px 20px; }
    li { margin-bottom: 5px; }
    .badge {
      display: inline-block;
      background: #e2f2ef;
      color: #176b63;
      font-weight: 700;
      font-size: 8pt;
      padding: 2px 8px;
      border-radius: 99px;
      margin-bottom: 24px;
    }
    footer {
      margin-top: 48px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      font-size: 8.5pt;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
    }
    @media print {
      body { padding: 20mm 25mm; }
      @page { margin: 0; }
    }
  </style>
</head>
<body>
  <header>
    <div class="logo">✚</div>
    <div>
      <h1>Política de Privacidade</h1>
      <p>CliniFlow — Sistema de Gestão e Agendamento para Clínicas</p>
    </div>
  </header>

  <span class="badge">Versão 1.0 — Setembro de 2026</span>

  <p>
    A presente Política de Privacidade descreve como o <strong>CliniFlow</strong> coleta, utiliza,
    armazena e protege as informações pessoais dos usuários que acessam a plataforma de gestão
    e agendamento clínico. Ao criar uma conta ou utilizar os serviços disponíveis, o usuário
    declara que leu, compreendeu e concorda com os termos aqui estabelecidos.
  </p>

  <h2>1. Responsável pelo Tratamento dos Dados</h2>
  <p>
    O responsável pelo tratamento dos dados pessoais coletados nesta plataforma é o administrador
    da clínica cadastrada no sistema CliniFlow. Em caso de dúvidas, entre em contato pelo
    e-mail institucional disponível na página da clínica.
  </p>

  <h2>2. Dados Coletados</h2>
  <p>Para a criação e utilização da conta, coletamos as seguintes informações:</p>
  <ul>
    <li><strong>Nome completo</strong> — para identificação e personalização do atendimento.</li>
    <li><strong>Endereço de e-mail</strong> — para autenticação, comunicações e recuperação de acesso.</li>
    <li><strong>Número de telefone (WhatsApp)</strong> — para contato relacionado aos agendamentos.</li>
    <li><strong>Senha</strong> — armazenada exclusivamente como hash criptográfico (SHA-256); nunca em texto simples.</li>
    <li><strong>Data de cadastro</strong> — para fins de auditoria e controle de acesso.</li>
    <li><strong>Dados de agendamento</strong> — serviço solicitado, profissional, data, horário e status do atendimento.</li>
  </ul>

  <h2>3. Finalidade do Tratamento</h2>
  <p>Os dados coletados são utilizados exclusivamente para:</p>
  <ul>
    <li>Autenticar o usuário e controlar o acesso à plataforma.</li>
    <li>Realizar e gerenciar agendamentos de serviços clínicos.</li>
    <li>Comunicar informações relevantes sobre atendimentos (confirmações, cancelamentos, reagendamentos).</li>
    <li>Permitir que o administrador da clínica gerencie as contas e os agendamentos conforme necessário.</li>
    <li>Manter registros históricos de atendimentos para fins de auditoria e segurança.</li>
  </ul>

  <h2>4. Compartilhamento de Dados</h2>
  <p>
    Os dados pessoais <strong>não são comercializados, alugados nem transferidos a terceiros</strong>
    para fins publicitários ou quaisquer outros fins não relacionados ao funcionamento da plataforma.
    O acesso às informações é restrito aos seguintes agentes:
  </p>
  <ul>
    <li><strong>O próprio usuário</strong> — que visualiza e gerencia seus próprios dados e agendamentos.</li>
    <li><strong>Profissionais de saúde vinculados</strong> — que visualizam apenas os dados necessários para o atendimento.</li>
    <li><strong>O administrador da clínica</strong> — que possui acesso gerencial para fins operacionais.</li>
  </ul>

  <h2>5. Segurança das Informações</h2>
  <p>
    Adotamos medidas técnicas para proteger os dados dos usuários:
  </p>
  <ul>
    <li>Senhas armazenadas como hash criptográfico irreversível, nunca em texto simples.</li>
    <li>Controle de acesso baseado em perfis (RBAC), impedindo que um usuário acesse dados de outro.</li>
    <li>Verificação de propriedade de recursos em todas as operações sensíveis.</li>
    <li>Dados armazenados localmente no navegador do usuário (localStorage) durante esta fase do projeto.</li>
  </ul>

  <h2>6. Retenção de Dados</h2>
  <p>
    Os dados são mantidos enquanto a conta estiver ativa no sistema. Registros de agendamentos,
    mesmo cancelados, são preservados para fins de histórico e auditoria, conforme boas práticas
    de gestão clínica. A exclusão definitiva da conta pode ser solicitada ao administrador da clínica.
  </p>

  <h2>7. Direitos do Usuário</h2>
  <p>Em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018), o usuário tem direito a:</p>
  <ul>
    <li>Acessar os dados pessoais armazenados em seu perfil.</li>
    <li>Solicitar a correção de dados incompletos ou desatualizados.</li>
    <li>Solicitar a exclusão de sua conta e dos dados associados, observadas as obrigações legais de retenção.</li>
    <li>Revogar o consentimento a qualquer momento, mediante contato com a administração da clínica.</li>
    <li>Obter informações sobre o compartilhamento de seus dados.</li>
  </ul>

  <h2>8. Cookies e Armazenamento Local</h2>
  <p>
    Esta plataforma utiliza o <strong>armazenamento local do navegador (localStorage)</strong> para manter
    a sessão do usuário ativa e preservar as preferências de uso. Nenhum cookie de rastreamento
    ou publicidade é utilizado.
  </p>

  <h2>9. Menores de Idade</h2>
  <p>
    A plataforma não é direcionada a menores de 18 anos. O cadastro de um menor deve ser
    realizado com consentimento e supervisão de um responsável legal, que assume responsabilidade
    pelas informações fornecidas.
  </p>

  <h2>10. Alterações nesta Política</h2>
  <p>
    Esta Política de Privacidade pode ser atualizada periodicamente. Alterações relevantes serão
    comunicadas aos usuários cadastrados. O uso contínuo da plataforma após a publicação de
    alterações implica a aceitação da nova versão.
  </p>

  <h2>11. Contato</h2>
  <p>
    Para exercer seus direitos, esclarecer dúvidas ou apresentar solicitações relacionadas ao
    tratamento de dados, entre em contato com a administração da clínica pelo e-mail
    institucional disponível na plataforma.
  </p>

  <footer>
    <span>CliniFlow — Sistema de Gestão e Agendamento Clínico</span>
    <span>Versão 1.0 | Setembro de 2026 | UFERSA — Pau dos Ferros, RN</span>
  </footer>
</body>
</html>
  `);

  printWindow.document.close();
  printWindow.focus();

  // Pequena espera para garantir que a página carregou antes de imprimir
  setTimeout(() => {
    printWindow.print();
  }, 400);
};

export const PrivacyPolicyModal: React.FC<Props> = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Política de Privacidade"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#e2f2ef] text-[#176b63] flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Política de Privacidade</h2>
              <p className="text-[11px] text-slate-500">CliniFlow · Versão 1.0 · Setembro de 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#176b63] hover:bg-[#0d514b] text-white text-xs font-bold transition"
              title="Baixar / Imprimir como PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div id="privacy-policy-content" className="overflow-y-auto flex-1 px-6 py-5 space-y-5 text-xs text-slate-700 leading-relaxed">

          <p className="text-slate-600">
            A presente Política de Privacidade descreve como o <strong>CliniFlow</strong> coleta, utiliza,
            armazena e protege as informações pessoais dos usuários. Ao criar uma conta, você declara
            que leu, compreendeu e concorda com estes termos.
          </p>

          {[
            {
              title: '1. Responsável pelo Tratamento',
              content: 'O responsável pelo tratamento dos dados pessoais é o administrador da clínica cadastrada no CliniFlow. Em caso de dúvidas, utilize o e-mail institucional disponível na plataforma.',
            },
            {
              title: '2. Dados Coletados',
              items: [
                'Nome completo — para identificação e personalização do atendimento.',
                'E-mail — para autenticação, comunicações e recuperação de acesso.',
                'Telefone (WhatsApp) — para contato relacionado aos agendamentos.',
                'Senha — armazenada exclusivamente como hash criptográfico irreversível, nunca em texto simples.',
                'Data de cadastro — para auditoria e controle de acesso.',
                'Dados de agendamento — serviço, profissional, data, horário e status.',
              ],
            },
            {
              title: '3. Finalidade do Tratamento',
              items: [
                'Autenticar o usuário e controlar o acesso à plataforma.',
                'Realizar e gerenciar agendamentos de serviços clínicos.',
                'Comunicar confirmações, cancelamentos e reagendamentos.',
                'Permitir gestão administrativa das contas e dos atendimentos.',
                'Manter registros históricos para auditoria e segurança.',
              ],
            },
            {
              title: '4. Compartilhamento de Dados',
              content: 'Os dados não são comercializados nem transferidos a terceiros para fins publicitários. O acesso é restrito ao próprio usuário, aos profissionais de saúde vinculados ao atendimento e ao administrador da clínica para fins operacionais.',
            },
            {
              title: '5. Segurança das Informações',
              items: [
                'Senhas armazenadas como hash criptográfico irreversível (SHA-256).',
                'Controle de acesso baseado em perfis (RBAC) com verificação de propriedade.',
                'Dados mantidos localmente no navegador (localStorage) nesta fase do projeto.',
              ],
            },
            {
              title: '6. Retenção de Dados',
              content: 'Os dados são mantidos enquanto a conta estiver ativa. Registros de agendamentos são preservados para fins de histórico e auditoria. A exclusão da conta pode ser solicitada ao administrador da clínica.',
            },
            {
              title: '7. Seus Direitos (LGPD — Lei nº 13.709/2018)',
              items: [
                'Acessar os dados pessoais armazenados em seu perfil.',
                'Solicitar a correção de dados incompletos ou desatualizados.',
                'Solicitar a exclusão da conta, observadas as obrigações legais.',
                'Revogar o consentimento a qualquer momento.',
                'Obter informações sobre o compartilhamento dos seus dados.',
              ],
            },
            {
              title: '8. Armazenamento Local (localStorage)',
              content: 'Esta plataforma utiliza o armazenamento local do navegador para manter a sessão ativa. Nenhum cookie de rastreamento ou publicidade é utilizado.',
            },
            {
              title: '9. Menores de Idade',
              content: 'A plataforma não é direcionada a menores de 18 anos. O cadastro de um menor deve ser realizado com consentimento e supervisão de um responsável legal.',
            },
            {
              title: '10. Alterações nesta Política',
              content: 'Esta política pode ser atualizada periodicamente. Alterações relevantes serão comunicadas aos usuários. O uso contínuo da plataforma implica aceitação da versão vigente.',
            },
          ].map(section => (
            <div key={section.title} className="space-y-2">
              <h3 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-1">
                {section.title}
              </h3>
              {'content' in section && section.content && (
                <p>{section.content}</p>
              )}
              {'items' in section && section.items && (
                <ul className="space-y-1 pl-4">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[#176b63] font-bold mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 text-center">
            CliniFlow · Versão 1.0 · Setembro de 2026 · UFERSA — Pau dos Ferros, RN
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#176b63] hover:bg-[#0d514b] text-white font-bold text-sm transition"
          >
            Entendi e Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
