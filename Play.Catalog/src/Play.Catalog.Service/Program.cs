using Play.Catalog.Service.Entities;
using Play.Common.MassTransit;
using Play.Common.MongoDB;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddMongo(builder.Configuration)
    .AddMongoRepository<Item>("items")
    .AddMassTransitWithRabbitMQ(builder.Configuration);

// Add CORS services
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:*"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .SetIsOriginAllowedToAllowWildcardSubdomains();
    });
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

    // Use CORS middleware com política permissiva em desenvolvimento
    app.UseCors("AllowFrontend");

    // Em desenvolvimento, não redirecionar para HTTPS para evitar problemas de CORS
    // app.UseHttpsRedirection(); // Comentado em desenvolvimento
}
else
{
    // Redirecionamento HTTPS apenas em produção
    app.UseHttpsRedirection();
}

app.MapControllers();

app.Run();
