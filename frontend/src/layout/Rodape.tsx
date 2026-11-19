import { Link } from "react-router-dom";

export default function Rodape() {
  return (
    <footer className="app-rodape">
      <div className="container">
        <div className="rodape-colunas">
          <section aria-label="Projeto de extensão">
            <h2 className="rodape-titulo-coluna">Projeto de extensão</h2>
            <div className="rodape-logicando">
              <img
                src="/logo-logicando.png"
                alt="Logo do projeto Logicando"
                className="rodape-logicando-icone"
              />
              <div className="rodape-logicando-texto">
                <a
                  href="https://projetos.feevale.br/logicando/"
                  target="_blank"
                  rel="noreferrer"
                  className="rodape-logicando-link"
                >
                  Logicando
                </a>
                <p>Iniciativa de extensão que promove aprendizagem criativa e tecnológica.</p>
              </div>
            </div>
          </section>

          <section aria-label="Contatos">
            <h2 className="rodape-titulo-coluna">Contatos</h2>
            <ul className="rodape-lista">
              <li className="rodape-contato-item">
                <i className="bi bi-telephone" aria-hidden="true" />
                <span>(51) 3586-8800</span>
              </li>
              <li className="rodape-contato-item">
                <i className="bi bi-headset" aria-hidden="true" />
                <span>Ramal do Núcleo de Apoio ao Estudante: 6545 / 9587</span>
              </li>
              <li className="rodape-contato-item">
                <i className="bi bi-chat-dots" aria-hidden="true" />
                <a href="https://feevale.apprbs.com.br/atendimentos/login" target="_blank" rel="noreferrer">
                  Atendimento Feevale
                </a>
              </li>
            </ul>
          </section>

          <section aria-label="Redes sociais">
            <h2 className="rodape-titulo-coluna">Redes sociais</h2>
            <ul className="rodape-lista rodape-lista-redes">
              <li className="rodape-contato-item">
                <i className="bi bi-instagram" aria-hidden="true" />
                <a href="https://www.instagram.com/feevale/" target="_blank" rel="noreferrer">
                  @feevale
                </a>
              </li>
              <li className="rodape-contato-item">
                <i className="bi bi-tiktok" aria-hidden="true" />
                <a href="https://www.tiktok.com/@feevale" target="_blank" rel="noreferrer">
                  @feevale
                </a>
              </li>
            </ul>
          </section>
        </div>

        <div className="rodape-base">
          <p className="rodape-autoria mb-0">Desenvolvimento: Júlia Hadassa Zucco</p>
          <Link to="/moderador/login" className="rodape-link-moderador">
            Área do moderador
          </Link>
        </div>
      </div>
    </footer>
  );
}
