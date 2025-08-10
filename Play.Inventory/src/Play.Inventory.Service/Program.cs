using Play.Common.MassTransit;
using Play.Common.MongoDB;
using Play.Inventory.Service.Entities;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddMongo(builder.Configuration);
// Add repositories
builder.Services
    .AddMongoRepository<InventoryItem>("inventoryitems")
    .AddMongoRepository<CatalogItem>("catalogitems")
    .AddMassTransitWithRabbitMQ(builder.Configuration);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
{
    policy
        .SetIsOriginAllowed(origin =>
            origin.StartsWith("http://localhost:") ||
            origin.StartsWith("https://localhost:")
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
});
});

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors("AllowFrontend");
}
else
{
    app.UseHttpsRedirection();
}


app.MapControllers();

app.Run();




// Example of how to configure the catalog client with Polly
// static void NewMethod(WebApplicationBuilder builder)
// {
//     Random jittered = new();

//     builder.Services.AddHttpClient<CatalogClient>(client =>
//     {
//         client.BaseAddress = new Uri("https://localhost:7224");
//     })
//     .AddTransientHttpErrorPolicy(policyBuilder => policyBuilder.Or<TimeoutRejectedException>().WaitAndRetryAsync(
//         5,
//         retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)) + TimeSpan.FromMilliseconds(jittered.Next(0, 1000)),
//         onRetry: (outcome, timespan, retryAttempt) =>
//         {
//             var serviceProvider = builder.Services.BuildServiceProvider();
//             serviceProvider.GetService<ILogger<CatalogClient>>()?
//                 .LogWarning($"Delaying for {timespan} seconds, then making retry {retryAttempt} of 5.");
//             //Console.WriteLine($"Delaying for {timespan} seconds, then making retry {retryAttempt} of 5.");
//         }
//     ))
//     .AddTransientHttpErrorPolicy(policyBuilder => policyBuilder.Or<TimeoutRejectedException>().CircuitBreakerAsync(
//         3,
//         TimeSpan.FromSeconds(10),
//         onBreak: (outcome, timespan) =>
//         {
//             var serviceProvider = builder.Services.BuildServiceProvider();
//             serviceProvider.GetService<ILogger<CatalogClient>>()?
//                 .LogWarning($"Opening the circuit for {timespan.TotalSeconds} seconds...");
//         },
//         onReset: () =>
//         {
//             var serviceProvider = builder.Services.BuildServiceProvider();
//             serviceProvider.GetService<ILogger<CatalogClient>>()?
//                 .LogWarning("Closing the circuit...");
//         }
//     ))
//     .AddPolicyHandler(Policy.TimeoutAsync<HttpResponseMessage>(1));
// }