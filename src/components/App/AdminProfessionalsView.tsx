import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Professional } from '../../types';
import {
  Stethoscope,
  Plus,
  Power,
  PowerOff,
  Check,
  AlertCircle,
  ShieldCheck,
  Edit
} from 'lucide-react';

export const AdminProfessionalsView: React.FC = () => {
  const {
    professionals,
    services,
    addProfessional,
    updateProfessional,
    toggleProfessionalStatus
  } = useClinic();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProf, setEditingProf] = useState<Professional | null>(null);

  // Form State
  const [nome, setNome] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [registro, setRegistro] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const handleOpenAdd = () => {
    setNome('');
    setEspecialidade('Clínica Geral');
    setRegistro('CRM/RN 12345');
    setEmail(`dr.${Date.now().toString().slice(-4)}@cliniflow.com.br`);
    setTelefone('(84) 99888-7766');
    setBio('Médico especialista dedicado ao atendimento humanizado.');
    setAvatar('https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300');
    setSelectedServices(services.slice(0, 2).map(s => s.id));
    setEditingProf(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (prof: Professional) => {
    setEditingProf(prof);
    setNome(prof.nome);
    setEspecialidade(prof.especialidade);
    setRegistro(prof.registro_profissional);
    setEmail(prof.email);
    setTelefone(prof.telefone);
    setBio(prof.bio || '');
    setAvatar(prof.avatar || '');
    setSelectedServices(prof.servicos_ids);
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingProf) {
      updateProfessional({
        ...editingProf,
        nome,
        especialidade,
        registro_profissional: registro,
        email,
        telefone,
        bio,
        avatar,
        servicos_ids: selectedServices
      });
    } else {
      addProfessional({
        nome,
        especialidade,
        registro_profissional: registro,
        email,
        telefone,
        bio,
        avatar,
        servicos_ids: selectedServices
      });
    }

    setIsAddModalOpen(false);
  };

  const toggleService = (srvId: string) => {
    if (selectedServices.includes(srvId)) {
      setSelectedServices(selectedServices.filter(id => id !== srvId));
    } else {
      setSelectedServices([...selectedServices, srvId]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
            GESTÃO DE CORPO CLÍNICO
          </span>
          <h2 className="text-2xl font-extrabold text-[#102b38] font-display mt-2">
            Profissionais de Saúde
          </h2>
          <p className="text-xs text-slate-500">
            Associação a serviços clínicos e política de desativação lógica suave.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-[#176b63] hover:bg-[#0d514b] text-white px-4 py-2.5 rounded-xl font-bold text-xs transition self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Profissional</span>
        </button>
      </div>

      {/* List Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {professionals.map((prof) => (
          <div
            key={prof.id}
            className={`bg-white rounded-2xl p-6 border transition flex flex-col justify-between space-y-4 ${
              prof.ativo
                ? 'border-slate-200 shadow-xs hover:border-[#176b63]'
                : 'border-slate-200 bg-slate-50 opacity-70'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={prof.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'}
                    alt={prof.nome}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-bold text-base text-[#102b38] font-display">
                      {prof.nome}
                    </h3>
                    <div className="text-xs font-semibold text-[#176b63]">
                      {prof.especialidade}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      {prof.registro_profissional}
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    prof.ativo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {prof.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              {prof.bio && (
                <p className="text-xs text-slate-600 line-clamp-2">
                  {prof.bio}
                </p>
              )}

              {/* Associated Services */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Serviços Habilitados ({prof.servicos_ids.length}):
                </span>
                <div className="flex flex-wrap gap-1">
                  {prof.servicos_ids.map((srvId) => {
                    const s = services.find(serv => serv.id === srvId);
                    return (
                      <span
                        key={srvId}
                        className="text-[10px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-md"
                      >
                        {s?.nome || srvId}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => handleOpenEdit(prof)}
                className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-semibold"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Editar</span>
              </button>

              <button
                onClick={() => toggleProfessionalStatus(prof.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                  prof.ativo
                    ? 'border border-amber-300 text-amber-800 hover:bg-amber-50'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
                title={prof.ativo ? 'Desativar profissional' : 'Reativar profissional'}
              >
                {prof.ativo ? (
                  <>
                    <PowerOff className="w-3.5 h-3.5 text-amber-600" />
                    <span>Desativar</span>
                  </>
                ) : (
                  <>
                    <Power className="w-3.5 h-3.5" />
                    <span>Reativar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADD / EDIT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-[#102b38] font-display">
                {editingProf ? 'Editar Cadastro do Profissional' : 'Cadastrar Novo Profissional'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nome Completo:</label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    className="w-full border border-slate-300 rounded-lg p-2 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Especialidade Clínica:</label>
                  <input
                    type="text"
                    value={especialidade}
                    onChange={(e) => setEspecialidade(e.target.value)}
                    required
                    className="w-full border border-slate-300 rounded-lg p-2 font-semibold"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Registro (CRM / CRO):</label>
                  <input
                    type="text"
                    value={registro}
                    onChange={(e) => setRegistro(e.target.value)}
                    required
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Telefone:</label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    required
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">E-mail Profissional:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Foto / URL do Avatar:</label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Resumo Profissional / Bio:</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              {/* Service Association*/}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-slate-800 font-bold">
                  Associar a Serviços Clínicos (Obrigatório ao menos um):
                </label>
                <div className="grid sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-[#f6f8fb] rounded-xl border border-slate-200">
                  {services.map((srv) => {
                    const isChecked = selectedServices.includes(srv.id);
                    return (
                      <label
                        key={srv.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition text-xs ${
                          isChecked ? 'bg-white border-[#176b63] font-bold text-[#176b63]' : 'border-slate-200 bg-white/60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleService(srv.id)}
                          className="rounded text-[#176b63]"
                        />
                        <span>{srv.nome}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={selectedServices.length === 0}
                  className="px-5 py-2 bg-[#176b63] hover:bg-[#0d514b] disabled:bg-slate-200 text-white rounded-xl font-bold transition"
                >
                  {editingProf ? 'Salvar Alterações' : 'Cadastrar Profissional'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
