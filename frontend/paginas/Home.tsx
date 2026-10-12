import "../css/paginas/home.css";

const CASAL = {
  pessoa1: "Nome",
  pessoa2: "Nome",
  data: "01 · 09 · 2027",
};

export function Home() {
  return (
    <>
      <section className="hero" aria-labelledby="titulo-casal">
        <div className="hero-ornamento hero-ornamento--esquerda" aria-hidden="true" />
        <div className="hero-ornamento hero-ornamento--direita" aria-hidden="true" />

        <div className="hero-conteudo">
          <p className="hero-sobretitulo">Estamos nos casando</p>

          <h1 id="titulo-casal" className="hero-titulo">
            {CASAL.pessoa1}
            <span className="hero-e"> & </span>
            {CASAL.pessoa2}
          </h1>

          <div className="hero-divisor" aria-hidden="true">
            <span />
            <b>❦</b>
            <span />
          </div>

          <p className="hero-data">{CASAL.data}</p>

          <p className="hero-mensagem">
            Entre flores, histórias e pessoas queridas, queremos dividir com você
            um dos capítulos mais bonitos da nossa vida.
          </p>

          <div className="hero-acoes">
            <a className="botao botao--primario" href="#confirmacao">
              Confirmar presença
            </a>

            <a className="botao botao--secundario" href="#presentes">
              Ver lista de presentes
            </a>
          </div>
        </div>
      </section>

      <section id="historia" className="secao secao--historia">
        <div className="secao-cabecalho">
          <span className="secao-etiqueta">De onde viemos</span>
          <h2>Nossa história</h2>
          <p>
            Aqui entra a história deles — do primeiro encontro aos pequenos
            momentos que fizeram o caminho chegar até o altar.
          </p>
        </div>

        <div className="historia-cartao">
          <p>
            Este espaço pode receber uma fotografia, um texto pessoal ou até uma
            pequena linha do tempo. Por enquanto ele funciona como nosso primeiro
            bloco editorial para sentirmos o ritmo visual da página.
          </p>
        </div>
      </section>

      <section id="evento" className="secao secao--evento">
        <div className="secao-cabecalho">
          <span className="secao-etiqueta">Reserve a data</span>
          <h2>O grande dia</h2>
        </div>

        <div className="eventos-grade">
          <article className="evento-cartao">
            <span className="evento-icone" aria-hidden="true">✦</span>
            <p className="evento-tipo">Cerimônia</p>
            <h3>Um lugar especial</h3>
            <p>16:00 · endereço e orientações entram aqui.</p>
          </article>

          <article className="evento-cartao">
            <span className="evento-icone" aria-hidden="true">❦</span>
            <p className="evento-tipo">Recepção</p>
            <h3>Depois, vamos celebrar</h3>
            <p>18:00 · informações da recepção entram aqui.</p>
          </article>
        </div>
      </section>

      <section id="presentes" className="secao secao--convite">
        <div>
          <span className="secao-etiqueta">Com carinho</span>
          <h2>Lista de presentes</h2>
          <p>
            A presença de vocês já faz o dia especial. Para quem quiser contribuir
            com um pedacinho dessa nova fase, preparamos uma lista com carinho.
          </p>
        </div>

        <a className="botao botao--claro" href="#presentes">
          Conhecer a lista
        </a>
      </section>

      <section id="confirmacao" className="secao secao--confirmacao">
        <div className="confirmacao-conteudo">
          <span className="secao-etiqueta">Esperamos você</span>
          <h2>Confirme sua presença</h2>
          <p>
            Sua resposta ajuda a gente a preparar cada detalhe com todo o cuidado.
          </p>

          <button className="botao botao--primario" type="button">
            Quero confirmar
          </button>
        </div>
      </section>
    </>
  );
}
