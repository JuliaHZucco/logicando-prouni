namespace QuizProuni.Testes.Suporte;

public class FabricaComEncerradorDePerguntas : FabricaDaApi
{
    protected override bool EncerradorDePerguntasVencidasAtivo => true;
}
