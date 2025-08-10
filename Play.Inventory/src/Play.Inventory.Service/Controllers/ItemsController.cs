using Microsoft.AspNetCore.Mvc;
using Play.Common;
using Play.Inventory.Service.Clients;
using Play.Inventory.Service.Entities;

namespace Play.Inventory.Service.Controllers
{
    [ApiController]
    [Route("items")]
    public class ItemsController : ControllerBase
    {
        private readonly IRepository<InventoryItem> inventoryRepository;
        private readonly IRepository<CatalogItem> catalogItemRepository;

        public ItemsController(IRepository<InventoryItem> inventoryRepository, IRepository<CatalogItem> catalogItemRepository)
        {
            this.inventoryRepository = inventoryRepository;
            this.catalogItemRepository = catalogItemRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<InventoryItemDto>>> GetAsync(Guid userId)
        {
            if (userId == Guid.Empty)
            {
                return BadRequest();
            }

            var inventoryItems = await inventoryRepository.GetAllAsync(item => item.UserId == userId);
            var catalogItemIds = inventoryItems.Select(item => item.CatalogItemId);
            var catalogItems = await catalogItemRepository.GetAllAsync(item => catalogItemIds.Contains(item.Id));

            var inventoryItemDtos = inventoryItems.Select(item =>
            {
                var catalogItem = catalogItems.First(catalogItem => catalogItem.Id == item.CatalogItemId);
                return item.AsDto(catalogItem.Name, catalogItem.Description);
            });

            return Ok(inventoryItemDtos);
        }

        [HttpPost]
        public async Task<ActionResult> PostAsync(GrantItemsDto grantItemsDto)
        {
            var inventoryItem = await inventoryRepository.GetAsync(item => item.UserId == grantItemsDto.UserId && item.CatalogItemId == grantItemsDto.CatalogItemId);

            if (inventoryItem == null)
            {
                inventoryItem = new InventoryItem
                {
                    UserId = grantItemsDto.UserId,
                    CatalogItemId = grantItemsDto.CatalogItemId,
                    Quantity = grantItemsDto.Quantity,
                    AcquiredDate = DateTimeOffset.UtcNow
                };
                await inventoryRepository.CreateAsync(inventoryItem);
            }
            else
            {
                inventoryItem.Quantity += grantItemsDto.Quantity;
                await inventoryRepository.UpdateAsync(inventoryItem);
            }

            return Ok();
        }
    }
}