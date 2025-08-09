using Play.Catalog.Service.Entities;
using Play.Common.MongoDB;

var builder = WebApplication.CreateBuilder(args);

// Add MongoDB services
builder.Services.AddMongo(builder.Configuration);
// Add repositories
builder.Services.AddMongoRepository<Item>("items");

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
