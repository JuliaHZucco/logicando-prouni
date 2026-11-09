using System.Threading.Channels;
using QuizProuni.Api.Dados.Entidades;

namespace QuizProuni.Api.Compartilhado.Logs;

public class FilaDeLogs
{
    private const int Capacidade = 5000;

    private readonly Channel<RegistroDeLog> canal = Channel.CreateBounded<RegistroDeLog>(
        new BoundedChannelOptions(Capacidade)
        {
            FullMode = BoundedChannelFullMode.DropOldest,
            SingleReader = true
        });

    public ChannelReader<RegistroDeLog> Leitor => canal.Reader;

    public void Enfileirar(RegistroDeLog registro)
    {
        canal.Writer.TryWrite(registro);
    }
}
