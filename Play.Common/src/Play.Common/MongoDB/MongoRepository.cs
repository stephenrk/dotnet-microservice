using System.Linq.Expressions;
using MongoDB.Driver;

namespace Play.Common.MongoDB
{
    public class MongoRepository<T> : IRepository<T> where T : IEntity
    {
        private readonly IMongoCollection<T> collection;
        private readonly FilterDefinitionBuilder<T> filterBuilder = Builders<T>.Filter;

        public MongoRepository(IMongoDatabase database, string collectionName)
        {
            collection = database.GetCollection<T>(collectionName);
        }

        public async Task<IReadOnlyCollection<T>> GetAllAsync()
        {
            return await collection.Find(filterBuilder.Empty).ToListAsync();
        }

        public async Task<IReadOnlyCollection<T>> GetAllAsync(Expression<Func<T, bool>> predicate)
        {
            return await collection.Find(predicate).ToListAsync();
        }

        public async Task<T> GetAsync(Guid id)
        {
            FilterDefinition<T> filter = filterBuilder.Eq(i => i.Id, id);
            return await collection.Find(filter).SingleOrDefaultAsync();
        }

        public async Task<T> GetAsync(Expression<Func<T, bool>> predicate)
        {
            return await collection.Find(predicate).SingleOrDefaultAsync();
        }

        public async Task CreateAsync(T item)
        {
            if (item is null)
            {
                throw new ArgumentNullException(nameof(item));
            }
            await collection.InsertOneAsync(item);
        }

        public async Task UpdateAsync(T item)
        {
            if (item is null)
            {
                throw new ArgumentNullException(nameof(item));
            }
            FilterDefinition<T> filter = filterBuilder.Eq(i => i.Id, item.Id);
            await collection.ReplaceOneAsync(filter, item);
        }

        public async Task RemoveAsync(Guid id)
        {
            FilterDefinition<T> filter = filterBuilder.Eq(i => i.Id, id);
            await collection.DeleteOneAsync(filter);
        }




    }
}