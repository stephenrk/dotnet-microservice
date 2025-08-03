using MongoDB.Driver;
using Play.Catalog.Service.Entities;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;

namespace Play.Catalog.Service.Repositories
{
    public class ItemsRepository
    {
        private const string collectionName = "items";
        private readonly IMongoCollection<Item> collection;
        private readonly FilterDefinitionBuilder<Item> filterBuilder = Builders<Item>.Filter;

        public ItemsRepository()
        {
            // TODO: move connection string to configuration
            // and use dependency injection for MongoClient
            var client = new MongoClient("mongodb://localhost:27017");
            var database = client.GetDatabase("Catalog");
            collection = database.GetCollection<Item>(collectionName);
        }

        public async Task<IReadOnlyCollection<Item>> GetAllAsync()
        {
            return await collection.Find(filterBuilder.Empty).ToListAsync();
        }

        public async Task<Item> GetAsync(Guid id)
        {
            FilterDefinition<Item> filter = filterBuilder.Eq(i => i.Id, id);
            return await collection.Find(filter).SingleOrDefaultAsync();
        }

        public async Task CreateAsync(Item item)
        {
            if (item is null)
            {
                throw new ArgumentNullException(nameof(item));
            }
            await collection.InsertOneAsync(item);
        }

        public async Task UpdateAsync(Item item)
        {
            if (item is null)
            {
                throw new ArgumentNullException(nameof(item));
            }
            FilterDefinition<Item> filter = filterBuilder.Eq(i => i.Id, item.Id);
            await collection.ReplaceOneAsync(filter, item);
        }

        public async Task RemoveAsync(Guid id)
        {
            FilterDefinition<Item> filter = filterBuilder.Eq(i => i.Id, id);
            await collection.DeleteOneAsync(filter);
        }
    }
}