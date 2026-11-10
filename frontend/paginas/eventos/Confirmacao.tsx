import {
  FloraisDesabrochandoConteudo,
} from "../../javascript/componentes/animacoes/FlorDesabrochando";

import {
  MolduraFloral,
  OrnamentoFloral,
} from "../../javascript/componentes/molduras/Floral";
import { MarcaFloral } from "../../javascript/componentes/marca/MarcaFloral";

import convidadosCerimonia from "../../recursos/publico/imagens/convidados/convidados-cerimonia.webp";

import "../../css/paginas/eventos/confirmacao.css";

export function Confirmacao() {
  function impedirEnvio(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
  }

  return (
    <div className="pagina-confirmacao">
      <section className="confirmacao-hero">
        <img
          className="confirmacao-hero-imagem"
          src={convidadosCerimonia}
          alt=""
          aria-hidden="true"
        />

        <div
          className="confirmacao-hero-overlay"
          aria-hidden="true"
        />

        <FloraisDesabrochandoConteudo
          className="confirmacao-hero-florais-vivos florais-conteudo--hero"
          quantidade={2}
          tamanho={176}
          delayMs={100}
          variante="fundo"
        />

        <div className="confirmacao-hero-conteudo">
          <span className="secao-etiqueta">Esperamos você</span>
          <h1>Confirme sua presença</h1>

          <OrnamentoFloral />

          <p>
            Cada resposta ajuda a preparar o grande dia com carinho, cuidado e
            lugar à mesa para todo mundo.
          </p>
        </div>
      </section>

      <section className="secao confirmacao-area">
        <MolduraFloral
          className="confirmacao-moldura"
          variante="destaque"
        >
          <div className="confirmacao-cartao">
            <div className="confirmacao-cartao-cabecalho">
              <span className="secao-etiqueta">Seu convite</span>
              <h2>Vamos encontrar você na lista?</h2>
              <p>
                Digite o código recebido junto ao convite. Depois, cada pessoa do
                grupo poderá responder separadamente.
              </p>
            </div>

            <form
              className="confirmacao-formulario"
              onSubmit={impedirEnvio}
            >
              <label htmlFor="codigo-convite">
                Código do convite
              </label>

              <div className="confirmacao-busca">
                <input
                  id="codigo-convite"
                  name="codigoConvite"
                  type="text"
                  placeholder="Ex.: familia-silva-2027"
                  autoComplete="off"
                />

                <button
                  className="botao botao--primario"
                  type="submit"
                >
                  Encontrar convite
                </button>
              </div>

              <p className="confirmacao-ajuda">
                Nesta etapa estamos fechando a experiência visual. A busca será
                ligada ao convite real quando conectarmos esta página ao backend.
              </p>
            </form>
          </div>
        </MolduraFloral>

        <aside className="confirmacao-explicacao">
          <span className="secao-etiqueta">Como vai funcionar</span>
          <h2>Uma resposta simples, sem formulário infinito.</h2>

          <div className="confirmacao-passos">
            <div className="confirmacao-passo">
              <FloraisDesabrochandoConteudo
                className="confirmacao-passo-flor-viva"
                quantidade={1}
                tamanho={82}
                delayMs={120}
              />

              <MarcaFloral
                className="confirmacao-passo-marca"
                variante="card"
              />

              <span>01</span>
              <div>
                <h3>Encontre o convite</h3>
                <p>
                  O código identifica o grupo ou família convidada.
                </p>
              </div>
            </div>

            <div className="confirmacao-passo">
              <FloraisDesabrochandoConteudo
                className="confirmacao-passo-flor-viva"
                quantidade={1}
                tamanho={82}
                delayMs={170}
              />

              <MarcaFloral
                className="confirmacao-passo-marca"
                variante="card"
              />

              <span>02</span>
              <div>
                <h3>Escolha quem vai</h3>
                <p>
                  Cada convidado poderá confirmar ou recusar individualmente.
                </p>
              </div>
            </div>

            <div className="confirmacao-passo">
              <FloraisDesabrochandoConteudo
                className="confirmacao-passo-flor-viva"
                quantidade={1}
                tamanho={82}
                delayMs={220}
              />

              <MarcaFloral
                className="confirmacao-passo-marca"
                variante="card"
              />

              <span>03</span>
              <div>
                <h3>Pronto</h3>
                <p>
                  A resposta ficará registrada para cerimônia e recepção.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
