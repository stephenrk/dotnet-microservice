using Play.Common.MongoDB;
using Play.Inventory.Service.Entities;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddMongo(builder.Configuration);
// Add repositories
builder.Services.AddMongoRepository<InventoryItem>("inventoryitems");

builder.Services.AddControllers();

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
