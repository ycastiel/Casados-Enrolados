import { CampoEstrelado } from "../../javascript/componentes/animacoes/CampoEstrelado";
import { FlorDesabrochando } from "../../javascript/componentes/animacoes/FlorDesabrochando";
import { EspacoImagem } from "../../javascript/componentes/imagens/EspacoImagem";

import {
  MolduraFloral,
  OrnamentoFloral,
  RamoFloral,
} from "../../javascript/componentes/molduras/Floral";

import "../../css/paginas/eventos/confirmacao.css";

export function Confirmacao() {
  function impedirEnvio(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
  }

  return (
    <div className="pagina-confirmacao ds-page">
      <section className="confirmacao-hero">
        <CampoEstrelado
          className="confirmacao-hero-estrelas"
          quantidade={12}
          intensidade="sutil"
          semente={931}
        />

        <FlorDesabrochando
          className="confirmacao-hero-flor-viva"
          variante="fundo"
          tamanho={190}
        />

        <RamoFloral className="confirmacao-hero-floral confirmacao-hero-floral--esquerda" />
        <RamoFloral className="confirmacao-hero-floral confirmacao-hero-floral--direita" />

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
          <div className="confirmacao-cartao ds-surface ds-surface--papel">
            <div className="confirmacao-cartao-cabecalho">
              <span className="secao-etiqueta">Seu convite</span>
              <h2>Vamos encontrar você na lista?</h2>
              <p>
                Digite o código recebido junto ao convite. Depois, cada pessoa do
                grupo poderá responder separadamente.
              </p>
            </div>

            <form
              className="confirmacao-formulario ds-form"
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
            <FlorDesabrochando
              className="confirmacao-cartao-flor-viva"
              variante="card"
              tamanho={120}
              delayMs={360}
            />
          </div>
        </MolduraFloral>

        <aside className="confirmacao-explicacao">
          <span className="secao-etiqueta">Como vai funcionar</span>
          <h2>Uma resposta simples, sem formulário infinito.</h2>

          <EspacoImagem
            className="confirmacao-imagem-placeholder"
            proporcao="paisagem"
          >
            Uma fotografia do casal ou do convite pode entrar aqui
          </EspacoImagem>

          <div className="confirmacao-passos">
            <div className="confirmacao-passo">
              <span>01</span>
              <div>
                <h3>Encontre o convite</h3>
                <p>
                  O código identifica o grupo ou família convidada.
                </p>
              </div>
            </div>

            <div className="confirmacao-passo">
              <span>02</span>
              <div>
                <h3>Escolha quem vai</h3>
                <p>
                  Cada convidado poderá confirmar ou recusar individualmente.
                </p>
              </div>
            </div>

            <div className="confirmacao-passo">
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
