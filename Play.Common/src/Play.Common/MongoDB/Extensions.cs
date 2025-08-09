using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;
using Play.Common.Settings;

namespace Play.Common.MongoDB
{
    public static class Extensions
    {
        public static IServiceCollection AddMongo(this IServiceCollection services, IConfiguration configuration)
        {
            // Add MongoDB services
            services.AddSingleton<IMongoClient>(sp =>
            {
                var mongoDbSettings = configuration.GetSection(nameof(MongoDbSettings)).Get<MongoDbSettings>();

                if (mongoDbSettings is null || string.IsNullOrEmpty(mongoDbSettings.Host))
                {
                    throw new InvalidOperationException("MongoDbSettings section is not configured.");
                }

                return new MongoClient(mongoDbSettings.ConnectionString);
            });

            services.AddSingleton<IMongoDatabase>(sp =>
            {
                var serviceSettings = configuration.GetSection(nameof(ServiceSettings)).Get<ServiceSettings>();
                if (serviceSettings is null || string.IsNullOrEmpty(serviceSettings.ServiceName))
                {
                    throw new InvalidOperationException("ServiceSettings section is not configured.");
                }

                var client = sp.GetRequiredService<IMongoClient>();
                return client.GetDatabase(serviceSettings.ServiceName);
            });

            return services;
        }

        public static IServiceCollection AddMongoRepository<T>(this IServiceCollection services, string collectionName) where T : IEntity
        {
            services.AddSingleton<IRepository<T>>(sp =>
            {
                var database = sp.GetRequiredService<IMongoDatabase>();
                return new MongoRepository<T>(database, collectionName);
            });

            return services;
        }
    }
}