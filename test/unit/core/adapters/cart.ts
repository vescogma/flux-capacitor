import Adapter from '../../../../src/core/adapters/cart';
import suite from '../../_suite';

suite('Cart Adapter', ({ expect }) => {
  describe('findItems()', () => {
    it('should throw if sku field does not exist', () => {
      const stateItems: any = [{
        noSku: '123',
        quantity: 3,
        title: 'cat'
      }, {
        sku: '456',
        quantity: 2,
        title: 'fan'
      }];

      const item: any = {
        sku: '123',
        quantity: 2,
        title: 'cat'
      };

      expect(() => Adapter.findItems(stateItems, item)).to.throw('The field sku does not exist!');
    });

    it('should return items with same sku', () => {
      const stateItems: any = [{
        sku: '123',
        quantity: 3,
        title: 'cat'
      }, {
        sku: '456',
        quantity: 2,
        title: 'fan'
      }];

      const item: any = {
        sku: '123',
        quantity: 2,
        title: 'cat'
      };

      const result = Adapter.findItems(stateItems, item);

      expect(result).to.eql({
        sku: '123',
        quantity: 3,
        title: 'cat'
      });
    });

    it('should return null if same item is not found', () => {
      const stateItems: any = [{
        sku: '123',
        quantity: 3,
        title: 'cat'
      }, {
        sku: '456',
        quantity: 2,
        title: 'fan'
      }];

      const item = <any>{
        sku: '789',
        quantity: 2,
        title: 'hand lotion'
      };

      const result = Adapter.findItems(stateItems, item);

      expect(result).to.be.undefined;
    });
  });

  describe('combineLikeItems()', () => {
    it('should combine items if like items are found', () => {
      const stateItems = <any>[{
        sku: '123',
        quantity: 3,
        title: 'cat'
      }, {
        sku: '456',
        quantity: 2,
        title: 'fan'
      }];
      const item = <any>{
        sku: '123',
        quantity: 2,
        title: 'cat'
      };
      const expected = [{
        sku: '123',
        quantity: 5,
        title: 'cat'
      }, {
        sku: '456',
        quantity: 2,
        title: 'fan'
      }];

      const result = Adapter.combineLikeItems(stateItems, item);

      expect(result).to.eql(expected);
    });

    it('should return items with new product if no like items found', () => {
      const stateItems = <any>[{
        sku: '123',
        quantity: 3,
        title: 'cat'
      },
      {
        sku: '456',
        quantity: 2,
        title: 'fan'
      }];
      const item = <any>{
        sku: 'unique',
        quantity: 2,
        title: 'unique cat'
      };
      const expected = [{
        sku: '123',
        quantity: 3,
        title: 'cat'
      },
      {
        sku: '456',
        quantity: 2,
        title: 'fan'
      },
      {
        sku: 'unique',
        quantity: 2,
        title: 'unique cat'
      }];

      const result = Adapter.combineLikeItems(stateItems, item);

      expect(result).to.eql(expected);
    });
  });

  describe('calculateTotalQuantity()', () => {
    it('should calculate the total quantity of the cart', () => {
      const items = <any>[{
        sku: '123',
        quantity: 3,
        title: 'cat'
      }, {
        sku: '456',
        quantity: 2,
        title: 'fan'
      }];
      const result = Adapter.calculateTotalQuantity(items);

      expect(result).to.eq(5);
    });
  });

  describe('changeItemQuantity()', () => {
    it('should return items with updated quantities', () => {
      const stateItems = <any>[{
        sku: '123',
        quantity: 3,
        title: 'cat'
      }, {
        sku: '456',
        quantity: 5,
        title: 'fan'
      }];

      const item = <any>{
        sku: '456',
        quantity: 3,
        title: 'fan'
      };

      const result = Adapter.changeItemQuantity(stateItems, item, 1);

      expect(result).to.eql([{
        sku: '123',
        quantity: 3,
        title: 'cat'
      }, {
        sku: '456',
        quantity: 1,
        title: 'fan'
      }]);
    });
  });

  describe('removeItem', () => {
    const stateItems = <any>[{
      sku: '123',
      quantity: 3,
      title: 'cat'
    }, {
      sku: '456',
      quantity: 5,
      title: 'fan'
    }];

    const item = <any>{
      sku: '456',
      quantity: 3,
      title: 'fan'
    };

    const result = Adapter.removeItem(stateItems, item);

    expect(result).to.eql([{
      sku: '123',
      quantity: 3,
      title: 'cat'
    }]);
  });
});
