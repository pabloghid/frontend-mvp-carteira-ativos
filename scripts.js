/*
  --------------------------------------------------------------------------------------
  Get Ativos e Posições
  --------------------------------------------------------------------------------------
*/
const loadAtivos = async () => {
  try {
      const response = await fetch("http://localhost:5000/ativos");
      const data = await response.json();

      const select = document.getElementById("ativoSelect");

      data.ativos.forEach(ativo => {
        const option = document.createElement("option");
        option.value = ativo.id;
        option.textContent = `${ativo.codigo_negociacao} - ${ativo.nome}`;
        select.appendChild(option);
      });
    }
    catch (error) {
      console.error('Error:', error);
    };
}

const getPosicoes = async () => {
  try {
    const response = await fetch("http://localhost:5000/posicoes");
    const data = await response.json();

    const tbody = document.querySelector("#tabela-posicoes tbody");
    tbody.innerHTML = "";
    console.log(data)
    data.posicoes.forEach(posicao => {
      const row = `
        <tr id="posicao-row-${posicao.id}">
          <td>${posicao.nome}</td>
          <td>${posicao.codigo_negociacao}</td>
          <td class="right quantidade">${posicao.quantidade}</td>
          <td class="right precoMedio">${posicao.preco_medio}</td>
          <td class="right totalInvestido">${posicao.total_investido}</td>
          <td>${posicao.dt_atualizacao || "-"}</td>
          <td>
            <div class="td-acoes acoes">
              <span style="cursor:pointer;" onclick="enableEditPosicao(${posicao.id})">📝</span>
              <span style="cursor:pointer;" onclick="deletePosicao(${posicao.id})">❌</span>
            </div>
          </td>
        </tr>
      `;
      tbody.innerHTML += row;
    });
    }
        catch (error) {
        console.error('Error:', error);
    };
}

/*
  --------------------------------------------------------------------------------------
  Chamada da função para carregamento inicial dos dados
  --------------------------------------------------------------------------------------
*/
document.addEventListener("DOMContentLoaded", () => {
  loadAtivos();
  getPosicoes();
});


/*
  --------------------------------------------------------------------------------------
  Post Posição
  --------------------------------------------------------------------------------------
*/
const postPosicao = async (ativoId, quantidade, precoMedio, totalInvestido) => {
  const formData = new FormData();
  formData.append('ativo_id', ativoId);
  formData.append('quantidade', quantidade);
  formData.append('preco_medio', precoMedio);
  formData.append('total_investido', totalInvestido);

  let url = 'http://127.0.0.1:5000/posicao';
  return fetch(url, {
    method: 'post',
    body: formData
  })

  .then((response) => {
      if (!response.ok) {
        return response.json().then(err => { throw err });
      }
      return response.json();
    })
  .then((data) => {
    alert("Posição inserida com sucesso!");
    console.log('Posição adicionada:', data);
  })
  .catch((error) => {
    console.error('Erro ao adicionar posição:', error);
    alert(`Erro: ${error.message || "Não foi possível inserir a posição"}`);
  });
}


const addPosicao = async () => {
  const ativoId = document.getElementById('ativoSelect').value;
  const quantidade = document.getElementById('quantidade').value;
  const precoMedio = document.getElementById('precoMedio').value;
  const totalInvestido = document.getElementById('totalInvestido').value;

  if (!ativoId || !quantidade || !precoMedio || !totalInvestido) {
    alert("Preencha todos os campos!");
    return;
  }

  await postPosicao(ativoId, quantidade, precoMedio, totalInvestido);
  await getPosicoes();
}

/*
  --------------------------------------------------------------------------------------
  Edit Posição
  --------------------------------------------------------------------------------------
*/

const editPosicao = async (posicaoId) => {
  try {
    const quantidade = document.getElementById(`quantidade-input-${posicaoId}`).value;
    const preco_medio = document.getElementById(`preco-input-${posicaoId}`).value;
    const total_investido = document.getElementById(`totalInvestido-input-${posicaoId}`).value;

    const formData = new FormData();
    formData.append('quantidade', quantidade);
    formData.append('preco_medio', preco_medio);
    formData.append('total_investido', total_investido);

    const url = `http://127.0.0.1:5000/posicao/${posicaoId}`;

    const response = await fetch(url, {
      method: 'PUT',
      body: formData
    });

    if (!response.ok) {
      const err = await response.json();
      throw err;
    }

    const result = await response.json();
    alert("Posição atualizada com sucesso!");
    console.log("Posição atualizada:", result);

    await getPosicoes();

  } catch (error) {
      console.error('Erro ao atualizar posição:', error);
      alert(`Erro: ${error.message || "Não foi possível atualizar a posição"}`);
    }
}

const enableEditPosicao = (posicaoId) => {
  const row = document.getElementById(`posicao-row-${posicaoId}`);
  
  const quantidadeCell = row.querySelector('.quantidade');
  const precoCell = row.querySelector('.precoMedio');
  const totalInvesidoCell = row.querySelector('.totalInvestido');

  const quantidadeValue = quantidadeCell.textContent;
  const precoValue = precoCell.textContent;
  const totalInvesidoValue = totalInvesidoCell.textContent;

  quantidadeCell.innerHTML = `<input class="form-control" type="number" value="${quantidadeValue}" id="quantidade-input-${posicaoId}">`;
  precoCell.innerHTML = `<input class="form-control" type="number" step="0.01" value="${precoValue}" id="preco-input-${posicaoId}">`;
  totalInvesidoCell.innerHTML = `<input class="form-control" type="number" step="0.01" value="${totalInvesidoValue}" id="totalInvestido-input-${posicaoId}">`;

  const acoesCell = row.querySelector('.acoes');
  acoesCell.innerHTML = `
    <span style="cursor:pointer;" onclick="editPosicao(${posicaoId})">💾</span>
    <span style="cursor:pointer;" onclick="getPosicoes()">❌</span>
  `;
}

/*
  --------------------------------------------------------------------------------------
  Delete Posição
  --------------------------------------------------------------------------------------
*/
const deletePosicao = (id) => {
  if (!confirm("Tem certeza que deseja excluir esta posição?")) {
    return; 
  }
  let url = 'http://127.0.0.1:5000/posicao/' + id;
  fetch(url, {
    method: 'delete'
  })
  .then((response) => {
      if (!response.ok) {
        return response.json().then(err => { throw err });
      }
      return response.json();
    })
  .then((data) => {
    alert("Posição excluída com sucesso!");
    console.log('Posição excluída:', data);
    getPosicoes();
  })
  .catch((error) => {
    console.error('Erro ao excluir posição:', error);
    alert(`Erro: ${error.message || "Não foi possível excluir a posição"}`);
  });
}
