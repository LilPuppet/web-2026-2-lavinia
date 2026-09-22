import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Settings, Save, CheckCircle2, Sliders, ShieldAlert, Building } from 'lucide-react';

export const AdminSettingsView: React.FC = () => {
  const { clinicConfig, updateClinicConfig } = useClinic();

  const [nome, setNome] = useState(clinicConfig.nome);
  const [slogan, setSlogan] = useState(clinicConfig.slogan);
  const [endereco, setEndereco] = useState(clinicConfig.endereco);
  const [telefone, setTelefone] = useState(clinicConfig.telefone);
  const [email, setEmail] = useState(clinicConfig.email);
  const [antecedenciaAgendamento, setAntecedenciaAgendamento] = useState(clinicConfig.antecedencia_minima_agendamento_horas);
  const [antecedenciaCancelamento, setAntecedenciaCancelamento] = useState(clinicConfig.antecedencia_minima_cancelamento_horas);
  const [descontoConsolacao, setDescontoConsolacao] = useState(clinicConfig.desconto_padrao_cancelamento_profissional);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateClinicConfig({
      ...clinicConfig,
      nome,
      slogan,
      endereco,
      telefone,
      email,
      antecedencia_minima_agendamento_horas: Number(antecedenciaAgendamento),
      antecedencia_minima_cancelamento_horas: Number(antecedenciaCancelamento),
      desconto_padrao_cancelamento_profissional: Number(descontoConsolacao)
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
          PARÂMETROS GLOBAIS DE OPERAÇÃO
        </span>
        <h2 className="text-2xl font-extrabold text-[#102b38] font-display mt-2">
          Configurações da Clínica & Regras Gerais
        </h2>
        <p className="text-xs text-slate-500">
          Ajuste as diretrizes institucionais, políticas de cancelamento e parâmetros de consolação.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6 text-xs">
        {/* Clinic Identity */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#102b38] border-b border-slate-100 pb-2">
            <Building className="w-4 h-4 text-[#176b63]" />
            <span>Identificação Institucional</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Nome da Clínica:</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-900 font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Slogan / Descrição:</label>
              <input
                type="text"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Endereço:</label>
              <input
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Telefone Principal:</label>
              <input
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">E-mail Institucional:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Business Rules Parameters */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-sm font-bold text-[#102b38] border-b border-slate-100 pb-2">
            <Sliders className="w-4 h-4 text-purple-600" />
            <span>Políticas e Regras de Negócio</span>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#f6f8fb] border border-slate-200 space-y-2">
              <label className="block text-slate-800 font-bold">
                 Antecedência Mínima para Marcação (Horas):
              </label>
              <input
                type="number"
                min={0}
                max={48}
                value={antecedenciaAgendamento}
                onChange={(e) => setAntecedenciaAgendamento(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg p-2 font-bold text-center text-[#176b63] text-sm bg-white"
              />
              <p className="text-[11px] text-slate-500 leading-tight">
                Impede que um paciente agende uma consulta com menos de X horas antes do atendimento.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#f6f8fb] border border-slate-200 space-y-2">
              <label className="block text-slate-800 font-bold">
                Antecedência Mínima para Cancelamento do Cliente (Horas):
              </label>
              <input
                type="number"
                min={1}
                max={72}
                value={antecedenciaCancelamento}
                onChange={(e) => setAntecedenciaCancelamento(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg p-2 font-bold text-center text-[#176b63] text-sm bg-white"
              />
              <p className="text-[11px] text-slate-500 leading-tight">
                Se o cliente tentar cancelar com menos antecedência, o sistema bloqueia para evitar ociosidade na agenda.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#f6f8fb] border border-slate-200 space-y-2">
              <label className="block text-slate-800 font-bold">
                Percentual de Desconto de Consolação (%):
              </label>
              <input
                type="number"
                min={5}
                max={50}
                value={descontoConsolacao}
                onChange={(e) => setDescontoConsolacao(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg p-2 font-bold text-center text-purple-700 text-sm bg-white"
              />
              <p className="text-[11px] text-slate-500 leading-tight">
                Desconto concedido automaticamente no voucher emitido ao cliente quando o médico desmarca.
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {savedSuccess ? (
            <span className="text-emerald-700 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Configurações atualizadas com sucesso!</span>
            </span>
          ) : (
            <span className="text-slate-400">Modificações salvas persistem localmente na sessão.</span>
          )}

          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-[#176b63] hover:bg-[#0d514b] text-white px-6 py-2.5 rounded-xl font-bold transition shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Parâmetros</span>
          </button>
        </div>
      </form>
    </div>
  );
};
