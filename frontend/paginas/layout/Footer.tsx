import { MarcaFloral } from "../../javascript/componentes/marca/MarcaFloral";

import "../../css/layout/footer.css";

export function Footer() {
  return (
    <footer className="rodape-principal">
      <div className="rodape-marca-visual" aria-hidden="true">
        <MarcaFloral
          className="rodape-marca-imagem"
          variante="rodape"
        />
      </div>

      <p className="rodape-frase">
        Feito com carinho para celebrar um dia que merece ser lembrado.
      </p>

      <p className="rodape-marca">Casados &amp; Enrolados</p>
      <p className="rodape-submarca">Noemi &amp; Maurício · 16 de Maio de 2027</p>
    </footer>
  );
}
