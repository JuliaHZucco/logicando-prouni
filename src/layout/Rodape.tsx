export default function Rodape() {
  return (
    <footer className="app-rodape">
      <div className="container py-4">
        <div className="rodape-barra">
          <div className="rodape-logicando">
            <div className="rodape-logicando-icone-wrap">
              <img
                src="/logo-logicando.png"
                alt="Logo do projeto Logicando"
                className="rodape-logicando-icone"
              />
            </div>

            <div className="rodape-logicando-texto">
              <span className="rodape-logicando-label">Projeto de extensão</span>
              <a
                href="https://projetos.feevale.br/logicando/"
                target="_blank"
                rel="noreferrer"
                className="rodape-logicando-link"
              >
                Logicando
              </a>
              <p className="mb-0">
                Iniciativa de extensão que promove aprendizagem criativa e tecnológica.
              </p>
            </div>
          </div>

          <div className="rodape-contatos">
            <div className="rodape-contato-item">
              <i className="bi bi-telephone" aria-hidden="true" />
              <span>(51) 3586-8800</span>
            </div>
            <div className="rodape-contato-item">
              <i className="bi bi-headset" aria-hidden="true" />
              <span>Ramal do Núcleo de Apoio ao Estudante: 6545 / 9587</span>
            </div>
            <div className="rodape-contato-item">
              <i className="bi bi-instagram" aria-hidden="true" />
              <a href="https://www.instagram.com/feevale/" target="_blank" rel="noreferrer">
                @feevale
              </a>
            </div>
            <div className="rodape-contato-item">
              <i className="bi bi-music-note-beamed" aria-hidden="true" />
              <a href="https://www.tiktok.com/@feevale" target="_blank" rel="noreferrer">
                @feevale
              </a>
            </div>
            <div className="rodape-contato-item">
              <i className="bi bi-envelope" aria-hidden="true" />
              <a href="mailto:falecomafeevale@feevale.br">falecomafeevale@feevale.br</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
