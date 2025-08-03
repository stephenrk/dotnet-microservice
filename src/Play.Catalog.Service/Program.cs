using MongoDB.Driver;
using Play.Catalog.Service.Entities;
using Play.Catalog.Service.Repositories;
using Play.Catalog.Service.Settings;

var builder = WebApplication.CreateBuilder(args);

// Add MongoDB services
builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var mongoDbSettings = builder.Configuration.GetSection(nameof(MongoDbSettings)).Get<MongoDbSettings>();
    
    if (mongoDbSettings is null || string.IsNullOrEmpty(mongoDbSettings.Host))
    {
        throw new InvalidOperationException("MongoDbSettings section is not configured.");
    }

    return new MongoClient(mongoDbSettings.ConnectionString);
});

builder.Services.AddSingleton<IMongoDatabase>(sp =>
{
    var serviceSettings = builder.Configuration.GetSection(nameof(ServiceSettings)).Get<ServiceSettings>();
    if (serviceSettings is null || string.IsNullOrEmpty(serviceSettings.ServiceName))
    {
        throw new InvalidOperationException("ServiceSettings section is not configured.");
    }

    var client = sp.GetRequiredService<IMongoClient>();
    return client.GetDatabase(serviceSettings.ServiceName);
});

// Add repositories
builder.Services.AddSingleton<IRepository<Item>>(serviceProvider =>
{
    var database = serviceProvider.GetRequiredService<IMongoDatabase>();
    return new MongoRepository<Item>(database, "items");
});

// Add services to the container.
builder.Services.AddControllers(options =>
{
    options.SuppressAsyncSuffixInActionNames = false; // Keep the async suffix in action names
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapControllers();

app.Run();
