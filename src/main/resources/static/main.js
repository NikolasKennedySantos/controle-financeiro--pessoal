const API = "https://controle-financeiro-pessoal-production.up.railway.app/transacoes";

// ── ESTADO ──
let todasTransacoes = [];
let filtroAtual = "todas";

// ── ELEMENTOS ──
const modalOverlay     = document.getElementById("modalOverlay");
const formTransacao    = document.getElementById("formTransacao");
const btnNovaTransacao = document.getElementById("btnNovaTransacao");
const btnFecharModal   = document.getElementById("btnFecharModal");
const btnCancelar      = document.getElementById("btnCancelar");
const tabelaBody       = document.getElementById("tabelaTransacoes");
const emptyState       = document.getElementById("emptyState");
const modalTitle       = document.getElementById("modalTitle");

// ── INICIALIZAÇÃO ──
document.addEventListener("DOMContentLoaded", () => {
  carregarTransacoes();
  definirDataHoje();
  configurarFiltros();
  configurarNavegacao();
});

// ── API: CARREGAR ──
async function carregarTransacoes() {
  try {
    const res = await fetch(API);
    todasTransacoes = await res.json();
    renderizarTabela();
    atualizarResumo();
  } catch (err) {
    mostrarToast("Erro ao conectar com o servidor.", "error");
  }
}

// ── API: SALVAR ──
async function salvarTransacao(dados) {
  const id = document.getElementById("transacaoId").value;
  const metodo = id ? "PUT" : "POST";
  const url = id ? `${API}/${id}` : API;

  try {
    const res = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(id ? { ...dados, id: Number(id) } : dados),
    });
    if (!res.ok) throw new Error();
    fecharModal();
    await carregarTransacoes();
    mostrarToast(id ? "Transação atualizada!" : "Transação salva!", "success");
  } catch {
    mostrarToast("Erro ao salvar transação.", "error");
  }
}

// ── API: DELETAR ──
async function deletarTransacao(id) {
  try {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    await carregarTransacoes();
    mostrarToast("Transação removida.", "success");
  } catch {
    mostrarToast("Erro ao remover transação.", "error");
  }
}

// ── RENDERIZAR TABELA ──
function renderizarTabela() {
  const filtradas = filtroAtual === "todas"
    ? todasTransacoes
    : todasTransacoes.filter(t => t.tipo === filtroAtual);

  // remove linhas antigas mas mantém emptyState
  Array.from(tabelaBody.querySelectorAll("tr:not(#emptyState)")).forEach(r => r.remove());

  if (filtradas.length === 0) {
    emptyState.style.display = "";
    return;
  }
  emptyState.style.display = "none";

  filtradas
    .slice()
    .sort((a, b) => new Date(b.data) - new Date(a.data))
    .forEach(t => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${t.descricao}</td>
        <td>
          <span class="badge badge--${t.tipo.toLowerCase()}">
            ${t.tipo === "RECEITA" ? "↑" : "↓"} ${t.tipo}
          </span>
        </td>
        <td>${formatarData(t.data)}</td>
        <td class="valor-${t.tipo.toLowerCase()}">
          ${t.tipo === "RECEITA" ? "+" : "-"} ${formatarMoeda(t.valor)}
        </td>
        <td>
          <div class="action-btns">
            <button class="action-btn action-btn--edit" title="Editar" onclick="abrirEdicao(${JSON.stringify(t).replace(/"/g, '&quot;')})">
              <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="action-btn action-btn--delete" title="Remover" onclick="deletarTransacao(${t.id})">
              <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </button>
          </div>
        </td>
      `;
      tabelaBody.appendChild(tr);
    });
}

// ── RESUMO ──
function atualizarResumo() {
  const receitas  = todasTransacoes.filter(t => t.tipo === "RECEITA").reduce((s, t) => s + t.valor, 0);
  const despesas  = todasTransacoes.filter(t => t.tipo === "DESPESA").reduce((s, t) => s + t.valor, 0);
  const saldo     = receitas - despesas;

  document.getElementById("totalReceitas").textContent = formatarMoeda(receitas);
  document.getElementById("totalDespesas").textContent = formatarMoeda(despesas);
  document.getElementById("saldoTotal").textContent    = formatarMoeda(saldo);

  const pct = receitas > 0 ? Math.min((saldo / receitas) * 100, 100) : 0;
  document.getElementById("saldoBar").style.width = Math.max(pct, 0) + "%";
}

// ── MODAL ──
btnNovaTransacao.addEventListener("click", () => {
  modalTitle.textContent = "Nova Transação";
  formTransacao.reset();
  document.getElementById("transacaoId").value = "";
  abrirModal();
});

function abrirEdicao(transacao) {
  modalTitle.textContent = "Editar Transação";
  document.getElementById("transacaoId").value = transacao.id;
  document.getElementById("descricao").value   = transacao.descricao;
  document.getElementById("valor").value       = transacao.valor;
  document.getElementById("data").value        = transacao.data;
  document.querySelector(`input[value="${transacao.tipo}"]`).checked = true;
  abrirModal();
}

function abrirModal()  { modalOverlay.classList.add("active"); }
function fecharModal() { modalOverlay.classList.remove("active"); }

btnFecharModal.addEventListener("click", fecharModal);
btnCancelar.addEventListener("click", fecharModal);
modalOverlay.addEventListener("click", e => { if (e.target === modalOverlay) fecharModal(); });

formTransacao.addEventListener("submit", e => {
  e.preventDefault();
  const tipo = document.querySelector('input[name="tipo"]:checked');
  if (!tipo) { mostrarToast("Selecione o tipo da transação.", "error"); return; }
  salvarTransacao({
    descricao: document.getElementById("descricao").value,
    valor:     parseFloat(document.getElementById("valor").value),
    data:      document.getElementById("data").value,
    tipo:      tipo.value,
  });
});

// ── FILTROS ──
function configurarFiltros() {
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      filtroAtual = btn.dataset.filter;
      renderizarTabela();
    });
  });
}

// ── NAVEGAÇÃO ──
function configurarNavegacao() {
  document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", e => {
      e.preventDefault();
      document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
      item.classList.add("active");
    });
  });
}

// ── TOAST ──
function mostrarToast(msg, tipo = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = `toast ${tipo} show`;
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// ── UTILITÁRIOS ──
function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(data) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function definirDataHoje() {
  const hoje = new Date().toISOString().split("T")[0];
  document.getElementById("data").value = hoje;
}