# CliniFlow — Sistema de Gestão e Agendamento para Clínicas

> Projeto desenvolvido para a disciplina de **Desenvolvimento Web (2026.2)** da **UFERSA** (Universidade Federal Rural do Semi-Árido).  
> **Autora:** Lavinia Dantas (laviniadantass@gmail.com)  
> **GitHub:** [LilPuppet / web-2026-2-lavinia](https://github.com/LilPuppet/web-2026-2-lavinia)  
> **Referência:** [zangado.web.ufersa.dev.br](https://zangado.web.ufersa.dev.br/)

---

## 🚀 Como Executar o Projeto Localmente

### 1. Pré-requisitos
- **Node.js**: v18+ ou v20+
- **NPM**: v9+

### 2. Instalação das Dependências
Clone o repositório ou descompacte o projeto e execute:
```bash
npm install
```

As dependências principais já inclusas no `package.json`:
- `react` e `react-dom` (v19)
- `vite` (v6)
- `@tailwindcss/vite` e `tailwindcss` (v4)
- `lucide-react` (ícones clínicos e de navegação)
- `motion` (animações e transições)

### 3. Executando em Modo de Desenvolvimento
```bash
npm run dev
```
O Vite iniciará o servidor local em `http://localhost:3000` (ou na porta configurada).

### 4. Build de Produção
```bash
npm run build
```
Os arquivos otimizados serão gerados no diretório `/dist`.

---

## 🏗️ Arquitetura do Sistema

O CliniFlow foi planejado com base em microsserviços serverless na **AWS (Amazon Web Services)**:
- **DNS**: Amazon Route 53 (`zangado.web.ufersa.dev.br`)
- **Frontend**: AWS Amplify (SPA React + Vite + Tailwind CSS v4)
- **Autenticação**: Amazon Cognito (JWT, perfis Cliente, Profissional e Admin)
- **API**: Amazon API Gateway (HTTPS REST)
- **Computação**: AWS Lambda (Execução e validação das 16 regras de negócio)
- **Banco de Dados**: Amazon RDS (PostgreSQL / MySQL)
- **Monitoramento**: Amazon CloudWatch (Logs de auditoria e métricas)

> 🔗 **Estimativa de Custos AWS:** [Calculadora AWS](https://calculator.aws/#/estimate?id=e6d4104e09c66de29b93e96fdc7dfd5e94385fc4)

---

## 📋 Regras de Negócio Implementadas (RN01 a RN16)

O sistema possui um motor de validação rigoroso ativo no frontend com persistência em `localStorage`:

1. **RN01 - Consulta Pública de Disponibilidade**: Visitantes consultam especialidades, profissionais e horários sem necessidade de login.
2. **RN02 - Unicidade de E-mail Cadastral**: Bloqueio de e-mails duplicados no cadastro de pacientes e médicos.
3. **RN03 - Agendamento Restrito à Disponibilidade**: Vagas geradas estritamente dentro da grade semanal de trabalho do médico.
4. **RN04 - Prevenção de Conflitos de Horário**: Proibição de sobreposição com outras consultas já marcadas.
5. **RN05 - Atendimento em Blocos de Tempo**: Grade organizada em blocos com intervalos de almoço e descanso.
6. **RN06 - Duração Mínima do Atendimento**: Duração definida por serviço em minutos inteiros maiores que zero.
7. **RN07 - Bloqueio de Horários pelo Profissional**: Registro de pausas, licenças e congressos que tornam horários indisponíveis.
8. **RN08 - Antecedência Mínima para Agendamento**: Impede marcações no passado ou com menos de 2h de antecedência.
9. **RN09 - Cancelamento pelo Cliente com Antecedência**: Pacientes só podem cancelar com no mínimo 4h de antecedência.
10. **RN10 - Cancelamento pelo Profissional & Consolação**: Cancela com registro do médico e emite cupom de desconto de 20% para compensar o paciente.
11. **RN11 - Reagendamento Flexível**: Permite trocar data/horário sem perder dados do agendamento original.
12. **RN12 - Prevenção de Agendamentos Simultâneos**: Bloqueio de dupla marcação no mesmo minuto.
13. **RN13 - Associação Obrigatória Serviço-Profissional**: Apenas especialistas formalmente habilitados atendem o serviço.
14. **RN14 - Desativação Suave (Soft Delete)**: Médicos ou serviços inativados não recebem novas consultas, preservando o histórico.
15. **RN15 - Preservação do Histórico de Alterações**: Auditoria completa de quem alterou, quando e por quê.
16. **RN16 - Notificação e Confirmação de Agendamento**: Resumo completo com protocolo gerado imediatamente.

---

## 👥 Perfis de Acesso (RBAC)

- **Visitante**: Navega pela landing page, busca médicos e horários livres.
- **Cliente**: Agenda consultas, visualiza atendimentos ativos/histórico, reagenda e utiliza cupons de consolação.
- **Profissional**: Visualiza sua agenda do dia, conclui atendimentos, cancela com justificativa médica e gerencia seus bloqueios semanais.
- **Administrador**: Gerencia o corpo clínico, tabela de serviços e preços, monitora todas as consultas e configura parâmetros da clínica.
