import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Service } from '../../types';
import {
  CalendarCheck,
  Clock,
  Plus,
  Power,
  PowerOff,
  Edit,
  DollarSign,
  Tag,
  AlertCircle
} from 'lucide-react';

export const AdminServicesView: React.FC = () => {
  const {
    services,
    addService,
    updateService,
    toggleServiceStatus,
    getProfessionalsForService
  } = useClinic();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [duracao, setDuracao] = useState<number>(45);
  const [preco, setPreco] = useState<number>(180);
  const [categoria, setCategoria] = useState('Consultas');

  const handleOpenAdd = () => {
    setEditingService(null);
    setNome('');
    setDescricao('');
    setDuracao(30);
    setPreco(150);
    setCategoria('Consultas');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (srv: Service) => {
    setEditingService(srv);
    setNome(srv.nome);
    setDescricao(srv.descricao);
    setDuracao(srv.duracao_minutos);
    setPreco(srv.preco);
    setCategoria(srv.categoria);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingService) {
      updateService({
        ...editingService,
        nome,
        descricao,
        duracao_minutos: Number(duracao),
        preco: Number(preco),
        categoria
      });
    } else {
      addService({
        nome,
        descricao,
        duracao_minutos: Number(duracao),
        preco: Number(preco),
        categoria
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
            GESTÃO DE CATÁLOGO CLÍNICO
          </span>
          <h2 className="text-2xl font-extrabold text-[#102b38] font-display mt-2">
            Serviços & Procedimentos
          </h2>
          <p className="text-xs text-slate-500">
            Duração definida em minutos para cálculo de blocos e desativação lógica.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-[#176b63] hover:bg-[#0d514b] text-white px-4 py-2.5 rounded-xl font-bold text-xs transition self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Serviço</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((srv) => {
          const linkedProfs = getProfessionalsForService(srv.id);

          return (
            <div
              key={srv.id}
              className={`bg-white rounded-2xl p-6 border transition flex flex-col justify-between space-y-4 ${
                srv.ativo
                  ? 'border-slate-200 shadow-xs hover:border-[#176b63]'
                  : 'border-slate-200 bg-slate-50 opacity-70'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {srv.categoria}
                  </span>
                  <span
                    className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      srv.ativo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {srv.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-[#102b38] font-display">
                    {srv.nome}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                    {srv.descricao}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Duração:</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#176b63]" />
                      {srv.duracao_minutos} minutos
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Valor Consulta:</span>
                    <span className="font-bold text-[#102b38]">
                      R$ {srv.preco.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 pt-1">
                  <strong>{linkedProfs.length}</strong> {linkedProfs.length === 1 ? 'médico habilitado' : 'médicos habilitados'}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleOpenEdit(srv)}
                  className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>

                <button
                  onClick={() => toggleServiceStatus(srv.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                    srv.ativo
                      ? 'border border-amber-300 text-amber-800 hover:bg-amber-50'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                  title={srv.ativo ? 'Desativar serviço' : 'Reativar serviço'}
                >
                  {srv.ativo ? (
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
          );
        })}
      </div>

      {/* SERVICE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-[#102b38] font-display">
                {editingService ? 'Editar Serviço Clínico' : 'Novo Serviço Clínico'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nome do Procedimento / Consulta:</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  placeholder="Ex: Consulta Pediátrica, Eletrocardiograma..."
                  className="w-full border border-slate-300 rounded-lg p-2 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Categoria:</label>
                <input
                  type="text"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  required
                  placeholder="Ex: Consultas, Exames, Procedimentos"
                  className="w-full border border-slate-300 rounded-lg p-2 font-semibold"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Duração em Minutos (&gt; 0):
                  </label>
                  <input
                    type="number"
                    min={10}
                    step={5}
                    value={duracao}
                    onChange={(e) => setDuracao(Number(e.target.value))}
                    required
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold text-[#176b63]"
                  />
                  <span className="text-[10px] text-slate-400">Ex: 30, 45, 60 min</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Valor (R$):</label>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={preco}
                    onChange={(e) => setPreco(Number(e.target.value))}
                    required
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Descrição / Instruções ao Paciente:</label>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={3}
                  placeholder="Descreva orientações, jejum se necessário, e objetivos clínicos..."
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#176b63] hover:bg-[#0d514b] text-white rounded-xl font-bold transition"
                >
                  {editingService ? 'Salvar Serviço' : 'Cadastrar Serviço'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
