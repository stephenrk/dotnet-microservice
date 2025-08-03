using Microsoft.AspNetCore.Mvc;

namespace Play.Catalog.Service.Controllers
{
    [ApiController]
    [Route("items")]
    public class ItemsController : ControllerBase
    {
        private static readonly List<ItemDto> items =
        [
            new(Guid.NewGuid(), "Potion", "Restores a small amount of HP", 10.99m, DateTimeOffset.UtcNow),
            new(Guid.NewGuid(), "Antidote", "Cures poison", 20.99m, DateTimeOffset.UtcNow),
            new(Guid.NewGuid(), "Bronze sword", "Deals a small amount of damage", 30.99m, DateTimeOffset.UtcNow)
        ];

        [HttpGet]
        public IEnumerable<ItemDto> Get()
        {
            return items;
        }

        // GET /items/{id}
        // Example: /items/123e4567-e89b-12d3-a456-426614174000
        [HttpGet("{id:guid}")]
        public ActionResult<ItemDto> GetById(Guid id)
        {
            var item = items.SingleOrDefault(i => i.Id == id);
            if (item is null)
            {
                return NotFound();
            }
            return item;
        }

        // POST /items
        [HttpPost]
        public ActionResult<ItemDto> Post(CreateItemDto createItemDto)
        {
            var item = new ItemDto(Guid.NewGuid(), createItemDto.Name, createItemDto.Description, createItemDto.Price, DateTimeOffset.UtcNow);
            items.Add(item);
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
        }

        // PUT /items/{id}
        [HttpPut("{id:guid}")]
        public ActionResult<ItemDto> Put(Guid id, UpdateItemDto updateItemDto)
        {
            var existingItem = items.SingleOrDefault(i => i.Id == id);
            if (existingItem is null)
            {
                return NotFound();
            }

            var updatedItem = existingItem with
            {
                Name = updateItemDto.Name,
                Description = updateItemDto.Description,
                Price = updateItemDto.Price,
            };
            var index = items.FindIndex(i => i.Id == id);
            items[index] = updatedItem;

            return Ok(updatedItem);
        }

        // DELETE /items/{id}
        [HttpDelete("{id:guid}")]
        public ActionResult Delete(Guid id)
        {
            var index = items.FindIndex(i => i.Id == id);
            if (index < 0)
            {
                return NotFound();
            }

            items.RemoveAt(index);
            return NoContent();
        }
    }
}