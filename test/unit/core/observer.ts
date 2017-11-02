import * as sinon from 'sinon';
import Search from '../../../src/core/adapters/search';
import Events from '../../../src/core/events';
import Observer from '../../../src/core/observer';
import suite from '../_suite';

suite('Observer', ({ expect, spy, stub }) => {
  describe('listener()', () => {
    it('should return a function that calls listen', () => {
      const store: any = { c: 'd' };
      const flux: any = { x: 'y' };
      const response = { a: 'b' };
      const listener = Observer.listener(flux);
      const listen = stub(Observer, 'listen').returns(response);

      expect(listener(store)).to.eql(response);
      expect(listen).to.be.calledWith(flux, store);
    });
  });

  describe('listen()', () => {
    it('should return a function', () => {
      const store: any = { getState: () => null };
      const observer = Observer.listen(<any>{}, store);

      expect(observer).to.be.a('function');
    });

    it('should call store.getState()', () => {
      const getState = spy();
      const store: any = { getState };
      const observer = Observer.listen(<any>{}, store);

      observer();

      expect(getState).to.be.called;
    });

    it('should call Observer.resolve()', () => {
      const newState = { a: 'b' };
      const flux: any = {};
      const resolve = stub(Observer, 'resolve');
      const create = stub(Observer, 'create');
      const store: any = { getState: () => undefined };
      const observer = Observer.listen(flux, store);
      store.getState = () => newState;

      observer();

      expect(resolve).to.be.calledWith(undefined, newState);
      expect(create).to.be.calledWith(flux);
    });
  });

  describe('resolve()', () => {
    it('should not call the observer if no changes', () => {
      const observer = spy();

      Observer.resolve(undefined, undefined, observer, '');

      expect(observer).to.not.be.called;
    });

    it('should not call the observer if not a function', () => {
      expect(() => Observer.resolve(1, 2, {}, '')).to.not.throw();
    });

    it('should call the observer with the updated node', () => {
      const observer = spy();
      const path = 'my.node.path';

      Observer.resolve(1, 2, (...args) => observer(...args), path);

      expect(observer).to.be.calledWith(1, 2, path);
    });

    it('should call resolve() on subtrees', () => {
      const observer1 = spy();
      const observer2 = spy();
      const observer3 = spy();
      const observer4 = spy();
      const observers = Object.assign((...args) => observer1(...args), {
        a: Object.assign((...args) => observer2(...args), {
          x: (...args) => observer3(...args),
        }),
        b: (...args) => observer4(...args),
      });
      const oldState = { a: { x: 1 } };
      const newState = { b: 2 };

      Observer.resolve(oldState, newState, observers, '');

      expect(observer1).to.be.calledWith(oldState, newState);
      expect(observer2).to.be.calledWith({ x: 1 }, undefined);
      expect(observer3).to.be.calledWith(1, undefined);
      expect(observer4).to.be.calledWith(undefined, 2);
    });

    it('should call resolve() when oldState is not defined', () => {
      const observer1 = spy();
      const observers = Object.assign((...args) => observer1(...args), {
        b: (...args) => observer1(...args),
      });
      const newState = { b: 2 };

      Observer.resolve(undefined, newState, observers, '');

      expect(observer1).to.be.calledWith(undefined, newState);
    });

    it('should not call resolve() on equal subtrees', () => {
      const observer1 = spy();
      const observer2 = spy();
      const observer3 = spy();
      const observers = Object.assign((...args) => observer1(...args), {
        a: (...args) => observer2(...args),
        b: (...args) => observer3(...args),
      });
      const oldState = {};
      const newState = {};

      Observer.resolve(oldState, newState, observers, '');

      expect(observer1).to.be.calledWith(oldState, newState);
      expect(observer2).to.not.be.called;
      expect(observer3).to.not.be.called;
    });
  });

  describe('terminal()', () => {
    it('should call observer', () => {
      const oldState = { a: 'b' };
      const newState = { c: 'd' };
      const observer = spy();
      const path = '/stuffsidk';

      Observer.terminal(oldState, newState, observer, path);

      expect(observer).to.be.calledWith(oldState, newState, path);
    });

    it('should not call observer when states are equal', () => {
      const state = { a: 'b' };
      const observer = spy();
      const path = '/stuffsidk';

      Observer.terminal(state, state, observer, path);

      expect(observer).to.be.not.be.called;
    });
  });

  describe('indexed()', () => {
    it('should return an observer for each key in newState', () => {
      const oldState = { a: 'b', c: 'f' };
      const newState = { c: 'd', e: 'f' };
      const emit = spy();
      const path = '/stuffsidk';
      const terminal = stub(Observer, 'terminal');
      const indexed = Observer.indexed(emit);

      indexed(oldState, newState, path);

      expect(terminal).to.be.calledWith(oldState['c'], newState['c'], emit, '/stuffsidk.c');
      expect(terminal).to.be.calledWith(oldState['e'], newState['e'], emit, '/stuffsidk.e');
    });
  });

  describe('create()', () => {
    it('should return an observer tree', () => {
      const observers = Observer.create(<any>{});
      const { ui, isRunning, session, data: { present } } = observers;

      expect(observers).to.be.an('object');
      expect(isRunning).to.be.a('function');
      expect(ui).to.be.a('function');
      expect(session).to.be.an('object');
      expect(session.location).to.be.a('function');
      expect(session.searchId).to.be.a('function');
      expect(session.recallId).to.be.a('function');
      expect(present).to.be.an('object');
      expect(present.autocomplete).to.be.a('function');
      expect(present.collections).to.be.an('object');
      expect(present.collections.byId).to.be.a('function');
      expect(present.collections.selected).to.be.a('function');
      expect(present.details).to.be.an('object');
      expect(present.details.data).to.be.a('function');
      expect(present.details.product).to.be.a('function');
      expect(present.navigations).to.be.a('function');
      expect(present.page).to.be.a('function');
      expect(present.page.current).to.be.a('function');
      expect(present.page.sizes).to.be.a('function');
      expect(present.products).to.be.a('function');
      expect(present.query).to.be.an('object');
      expect(present.query.corrected).to.be.a('function');
      expect(present.query.didYouMean).to.be.a('function');
      expect(present.query.original).to.be.a('function');
      expect(present.query.related).to.be.a('function');
      expect(present.query.rewrites).to.be.a('function');
      expect(present.recommendations).to.be.an('object');
      expect(present.recommendations.suggested).to.be.an('object');
      expect(present.recommendations.suggested.products).to.be.a('function');
      expect(present.redirect).to.be.a('function');
      expect(present.sorts).to.be.a('function');
      expect(present.template).to.be.a('function');
    });

    describe('data', () => {
      const testObject = { a: 'b' };
      const path = '.search.whatever.stuff';
      let emit;
      let observers;

      beforeEach(() => {
        emit = spy();
        observers = Observer.create(<any>{ emit });
      });

      describe('autocomplete()', () => {
        it('should not emit update if state identical to old state', () => {
          const state = 'state';

          observers.data.present.autocomplete(<any>state, <any>state, path);

          expect(emit).to.not.be.called;
        });

        it('should emit AUTOCOMPLETE_SUGGESTIONS_UPDATED event when suggestions differ', () => {
          const oldState = { suggestions: 'idk' };
          const newState = { suggestions: 'im different o wow' };

          observers.data.present.autocomplete(oldState, newState, path);

          expect(emit).to.be.calledWith(Events.AUTOCOMPLETE_SUGGESTIONS_UPDATED);
        });

        it('should emit AUTOCOMPLETE_SUGGESTIONS_UPDATED event when categories differ', () => {
          const oldState = { category: 'idk' };
          const newState = { category: 'im different o wow' };

          observers.data.present.autocomplete(oldState, newState, path);

          expect(emit).to.be.calledWith(Events.AUTOCOMPLETE_SUGGESTIONS_UPDATED);
        });

        it('should emit AUTOCOMPLETE_SUGGESTIONS_UPDATED event when navigations differ', () => {
          const oldState = { navigations: 'idk' };
          const newState = { navigations: 'im different o wow' };

          observers.data.present.autocomplete(oldState, newState, path);

          expect(emit).to.be.calledWith(Events.AUTOCOMPLETE_SUGGESTIONS_UPDATED);
        });

        it('should emit AUTOCOMPLETE_QUERY_UPDATED event when queries differ', () => {
          const oldState = { query: 'idk' };
          const newState = { query: 'im different o wow' };

          observers.data.present.autocomplete(oldState, newState, path);

          expect(emit).to.be.calledWith(Events.AUTOCOMPLETE_QUERY_UPDATED);
        });

        it('should emit AUTOCOMPLETE_PRODUCTS_UPDATED event when products differ', () => {
          const oldState = { products: 'idk' };
          const newState = { products: 'im different o wow' };
          const products = { a: 'b' };
          const extractedData = stub(Search, 'extractData').returns(products);

          observers.data.present.autocomplete(oldState, newState, path);

          expect(emit).to.be.calledWith(Events.AUTOCOMPLETE_PRODUCTS_UPDATED);
          expect(extractedData).to.be.calledWithExactly(oldState.products);
          expect(extractedData).to.be.calledWithExactly(newState.products);
        });

        it('should emit AUTOCOMPLETE_TEMPLATE_UPDATED event when templates differ', () => {
          const oldState = { template: 'idk' };
          const newState = { template: 'im different o wow' };

          observers.data.present.autocomplete(oldState, newState, path);

          expect(emit).to.be.calledWith(Events.AUTOCOMPLETE_TEMPLATE_UPDATED);
        });
      });

      describe('collections', () => {
        it('should emit COLLECTION_UPDATED event', () => {
          const indexed = stub(Observer, 'indexed').returns('eyy');
          observers = Observer.create(<any>{ emit });
          const byId = observers.data.present.collections.byId;

          expect(byId).to.eq('eyy');
          expect(indexed).to.be.calledWith(sinon.match.func);
        });

        it('should emit SELECTED_COLLECTION_UPDATED event', () => {
          observers.data.present.collections.selected(undefined, testObject);

          expect(emit).to.be.calledWith(Events.SELECTED_COLLECTION_UPDATED, testObject);
        });
      });

      describe('details', () => {
        it('should emit DETAILS_UPDATED event', () => {
          observers.data.present.details.data(undefined, testObject);

          expect(emit).to.be.calledWith(Events.DETAILS_UPDATED, testObject);
        });

        it('should emit DETAILS_PRODUCT_UPDATED event', () => {
          observers.data.present.details.product(undefined, testObject);

          expect(emit).to.be.calledWith(Events.DETAILS_PRODUCT_UPDATED, testObject);
        });
      });

      describe('navigations', () => {
        it('should emit NAVIGATIONS_UPDATED event', () => {
          const newNavigations = { allIds: ['c', 'd'] };
          observers.data.present.navigations({ allIds: ['a', 'b'] }, newNavigations);

          expect(emit).to.be.calledWith(Events.NAVIGATIONS_UPDATED, newNavigations);
        });

        it('should emit SELECTED_REFINEMENTS_UPDATED event when selected changes', () => {
          const allIds = ['a', 'b', 'c'];
          const oldNavigations = {
            allIds,
            byId: { a: {}, b: {}, c: { selected: [] } }
          };
          const newNavigations = {
            allIds,
            byId: { a: {}, b: {}, c: { selected: [] } }
          };
          observers.data.present.navigations(oldNavigations, newNavigations);

          expect(emit).to.be.calledWith(`${Events.SELECTED_REFINEMENTS_UPDATED}:c`, newNavigations.byId.c);
        });

        it('should emit SELECTED_REFINEMENTS_UPDATED event when refinements change', () => {
          const allIds = ['a', 'b', 'c'];
          const oldNavigations = {
            allIds,
            byId: { a: {}, b: {}, c: { refinements: [] } }
          };
          const newNavigations = {
            allIds,
            byId: { a: {}, b: {}, c: { refinements: [] } }
          };
          observers.data.present.navigations(oldNavigations, newNavigations);

          expect(emit).to.be.calledWith(`${Events.SELECTED_REFINEMENTS_UPDATED}:c`, newNavigations.byId.c);
        });
      });

      describe('page', () => {
        it('should emit PAGE_UPDATED event', () => {
          observers.data.present.page(undefined, testObject);

          expect(emit).to.be.calledWith(Events.PAGE_UPDATED, testObject);
        });

        it('should emit CURRENT_PAGE_UPDATED event', () => {
          observers.data.present.page.current(undefined, testObject);

          expect(emit).to.be.calledWith(Events.CURRENT_PAGE_UPDATED, testObject);
        });

        it('should emit PAGE_SIZE_UPDATED event', () => {
          observers.data.present.page.sizes(undefined, testObject);

          expect(emit).to.be.calledWith(Events.PAGE_SIZE_UPDATED, testObject);
        });
      });

      describe('products', () => {
        it('should emit PRODUCTS_UPDATED event', () => {
          const newProducts = [];
          observers.data.present.products([], newProducts);

          expect(emit).to.be.calledWith(Events.PRODUCTS_UPDATED, newProducts);
        });

        it('should emit PRODUCTS_UPDATED event', () => {
          const newProducts = ['a', 'b'];
          observers.data.present.products(['a'], newProducts);

          expect(emit).to.be.calledWith(Events.MORE_PRODUCTS_ADDED, ['b']);
        });
      });

      describe('query', () => {
        it('should emit CORRECTED_QUERY_UPDATED event', () => {
          observers.data.present.query.corrected(undefined, testObject);

          expect(emit).to.be.calledWith(Events.CORRECTED_QUERY_UPDATED, testObject);
        });

        it('should emit DID_YOU_MEANS_UPDATED event', () => {
          observers.data.present.query.didYouMean(undefined, testObject);

          expect(emit).to.be.calledWith(Events.DID_YOU_MEANS_UPDATED, testObject);
        });

        it('should emit ORIGINAL_QUERY_UPDATED event', () => {
          observers.data.present.query.original(undefined, testObject);

          expect(emit).to.be.calledWith(Events.ORIGINAL_QUERY_UPDATED, testObject);
        });

        it('should emit RELATED_QUERIES_UPDATED event', () => {
          observers.data.present.query.related(undefined, testObject);

          expect(emit).to.be.calledWith(Events.RELATED_QUERIES_UPDATED, testObject);
        });

        it('should emit QUERY_REWRITES_UPDATED event', () => {
          observers.data.present.query.rewrites(undefined, testObject);

          expect(emit).to.be.calledWith(Events.QUERY_REWRITES_UPDATED, testObject);
        });
      });

      describe('recommendations', () => {
        it('should emit RECOMMENDATIONS_PRODUCTS_UPDATED event', () => {
          const products = { a: 'b' };
          const extractData = stub(Search, 'extractData').returns(products);
          observers.data.present.recommendations.suggested.products(undefined, testObject);

          expect(emit).to.be.calledWith(Events.RECOMMENDATIONS_PRODUCTS_UPDATED, testObject);
          expect(extractData).to.be.calledWithExactly(undefined);
          expect(extractData).to.be.calledWithExactly(testObject);
        });
      });

      describe('redirect', () => {
        it('should emit REDIRECT event', () => {
          observers.data.present.redirect(undefined, testObject);

          expect(emit).to.be.calledWith(Events.REDIRECT, testObject);
        });
      });

      describe('sorts', () => {
        it('should emit SORTS_UPDATED event', () => {
          observers.data.present.sorts(undefined, testObject);

          expect(emit).to.be.calledWith(Events.SORTS_UPDATED, testObject);
        });
      });

      describe('template', () => {
        it('should emit TEMPLATE_UPDATED event', () => {
          observers.data.present.template(undefined, testObject);

          expect(emit).to.be.calledWith(Events.TEMPLATE_UPDATED, testObject);
        });
      });
    });

    describe('isRunning', () => {
      let emit;
      let observers;

      beforeEach(() => {
        emit = spy();
        observers = Observer.create(<any>{ emit });
      });

      it('should emit APP_STARTED event', () => {
        observers.isRunning(undefined, true);

        expect(emit).to.be.calledWith(Events.APP_STARTED, true);
      });

      it('should emit APP_KILLED event', () => {
        observers.isRunning(true, false);

        expect(emit).to.be.calledWith(Events.APP_KILLED, false);
      });
      it('should emit nothing if neither value passed is true', () => {
        observers.isRunning(false, false);

        expect(emit).to.not.be.called;
      });
    });
  });

  describe('session', () => {
    const testObject = { a: 'b' };
    let emit;
    let observers;

    beforeEach(() => {
      emit = spy();
      observers = Observer.create(<any>{ emit });
    });

    describe('recallId', () => {
      it('should emit RECALL_CHANGED event', () => {
        observers.session.recallId(undefined, testObject);

        expect(emit).to.be.calledWith(Events.RECALL_CHANGED, testObject);
      });
    });

    describe('searchId', () => {
      it('should emit SORTS_UPDATED event', () => {
        observers.session.searchId(undefined, testObject);

        expect(emit).to.be.calledWith(Events.SEARCH_CHANGED, testObject);
      });
    });

    describe('location', () => {
      it('should emit LOCATION_UPDATED event', () => {
        observers.session.location(undefined, testObject);

        expect(emit).to.be.calledWith(Events.LOCATION_UPDATED, testObject);
      });
    });
  });

  describe('ui', () => {
    let emit;
    let observers;

    beforeEach(() => {
      emit = spy();
      observers = Observer.create(<any>{ emit });
    });

    it('should emit UI_UPDATED event', () => {
      const tagName = 'Main';
      const id = 'brand';
      const testObject = { [tagName]: { [id]: { isActive: false } } };
      observers.ui({}, testObject);

      expect(emit).to.be.calledWith(`${Events.UI_UPDATED}:${tagName}:${id}`, testObject[tagName][id]);
    });

    it('should emit nothing if states same', () => {
      observers.ui(false, false);

      expect(emit).to.not.be.called;
    });

    it('should not emit UI_UPDATED event if oldTagState and newTagState same', () => {
      const tagName = 'Main';
      const id = 'brand';
      const testObject = { [tagName]: { [id]: true } };

      observers.ui({ [tagName]: { [id]: true } }, testObject);

      expect(emit).to.not.be.calledWith(`${Events.UI_UPDATED}:${tagName}:${id}`, testObject[tagName][id]);
    });
  });
});
