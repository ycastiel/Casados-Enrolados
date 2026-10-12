import "../../css/layout/header.css";

export function Header() {
  return (
    <header className="cabecalho-principal">
      <a className="marca" href="/" aria-label="Casados & Enrolados — início">
        <span className="marca-simbolo" aria-hidden="true">
          ❦
        </span>
        <span>Casados & Enrolados</span>
      </a>

      <nav className="navegacao-principal" aria-label="Navegação principal">
        <a href="#historia">Nossa história</a>
        <a href="#evento">O grande dia</a>
        <a href="#presentes">Presentes</a>
        <a className="navegacao-destaque" href="#confirmacao">
          Confirmar presença
        </a>
      </nav>
    </header>
  );
}
