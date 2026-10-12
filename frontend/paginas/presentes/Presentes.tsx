import {
  OrnamentoFloral,
  RamoFloral,
} from "../../javascript/componentes/Floral";

import "../../css/paginas/presentes/presentes.css";

const presentes = [
  {
    id: 1,
    categoria: "Casa nova",
    nome: "Jantar especial a dois",
    descricao:
      "Uma ajudinha para inaugurar a casa com uma noite gostosa e sem louça para lavar.",
    valor: "R$ 180,00",
  },
  {
    id: 2,
    categoria: "Lua de mel",
    nome: "Café da manhã com vista",
    descricao:
      "Porque acordar cedo fica consideravelmente mais fácil quando existe viagem e croissant.",
    valor: "R$ 120,00",
  },
  {
    id: 3,
    categoria: "Casa nova",
    nome: "Air fryer da paz doméstica",
    descricao:
      "Tecnologia de ponta para impedir discussões sobre quem vai fritar a batata.",
    valor: "R$ 520,00",
  },
  {
    id: 4,
    categoria: "Lua de mel",
    nome: "Passeio inesquecível",
    descricao:
      "Uma contribuição para uma experiência que vai virar história por muitos anos.",
    valor: "R$ 250,00",
  },
  {
    id: 5,
    categoria: "Pequenos luxos",
    nome: "Primeiro brinde em casa",
    descricao:
      "Taças, bebida e uma boa desculpa para comemorar a vida nova mais uma vez.",
    valor: "R$ 160,00",
  },
  {
    id: 6,
    categoria: "Lua de mel",
    nome: "Cota para a viagem",
    descricao:
      "Para participar um pouquinho da aventura mesmo sem caber na mala.",
    valor: "R$ 100,00",
  },
];

export function Presentes() {
  return (
    <div className="pagina-presentes">
      <section className="presentes-hero">
        <RamoFloral className="presentes-hero-floral presentes-hero-floral--esquerda" />
        <RamoFloral className="presentes-hero-floral presentes-hero-floral--direita" />

        <div className="presentes-hero-conteudo">
          <span className="secao-etiqueta">Com carinho</span>
          <h1>Lista de presentes</h1>

          <OrnamentoFloral />

          <p>
            O maior presente é celebrar esse dia juntos. Para quem quiser deixar
            mais um carinho, reunimos algumas ideias para a nova fase.
          </p>
        </div>
      </section>

      <section
        className="secao presentes-lista"
        aria-labelledby="titulo-presentes"
      >
        <div className="presentes-introducao">
          <div>
            <span className="secao-etiqueta">Escolha com calma</span>
            <h2 id="titulo-presentes">
              Um pedacinho da nossa história
            </h2>
          </div>

          <p>
            Estes itens ainda são exemplos visuais. Depois ligaremos cada card aos
            presentes reais cadastrados no banco.
          </p>
        </div>

        <div className="presentes-grade">
          {presentes.map((presente) => (
            <article
              className="presente-cartao"
              key={presente.id}
            >
              <RamoFloral className="presente-cartao-floral" />

              <div className="presente-cartao-conteudo">
                <span className="presente-categoria">
                  {presente.categoria}
                </span>

                <h3>{presente.nome}</h3>

                <p>{presente.descricao}</p>

                <div className="presente-cartao-rodape">
                  <strong>{presente.valor}</strong>

                  <button
                    className="botao botao--primario"
                    type="button"
                  >
                    Presentear
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="presentes-recado">
        <div>
          <span className="secao-etiqueta">Sem obrigação</span>
          <h2>Sua presença já é presente.</h2>
          <p>
            A lista existe para quem pediu uma ajudinha para escolher. O que a
            gente quer mesmo é dividir o dia com pessoas queridas.
          </p>
        </div>
      </section>
    </div>
  );
}
