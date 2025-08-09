using System.Reflection;
using MassTransit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Play.Common.MassTransit
{
    public static class Extensions
    {
        public static IServiceCollection AddMassTransitWithRabbitMQ(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddMassTransit(config =>
            {
                config.AddConsumers(Assembly.GetEntryAssembly());
                config.UsingRabbitMq((context, configurator) =>
                {
                    configurator.Host(configuration["RabbitMQSettings:Host"]);
                    configurator.ConfigureEndpoints(context, new KebabCaseEndpointNameFormatter(configuration["ServiceSettings:ServiceName"], false));
                });
            });

            return services;
        }
    }
}