const {
  run
} = Ember;

import {
  subscribe,
  unsubscribe
} from 'ember-data/system/debug/instrumentation';

let App, store, adapter;

module("Store instrumentation", {
  setup: function() {
    run(() => {
      App = Ember.Application.create();
      App.StoreService = DS.Store.extend({});
      App.ApplicationAdapter = DS.Adapter.extend({
        shouldBackgroundReloadRecord: () => false
      });
      App.Post = DS.Model.extend({
        title: DS.attr('string')
      });
    });

    store = App.__container__.lookup('service:store');
    adapter = App.__container__.lookup('adapter:application');
  },
  teardown: function() {
    run(App, App.destroy);
  }
});

test("find instrumentation", function() {
  expect(2);
  store.adapterFor('post').reopen({
    findRecord: function() {
      return {
        id: '1',
        title: 'Post Title'
      };
    }
  });
  let id;

  let handle = subscribe('store.operation.find', {
    before: function(name, time, { operationId }) {
      ok(operationId);
      id = operationId;
    },
    after: function(name, time, { operationId }) {
      equal(id, operationId);
    }
  });

  return run(() => {
    return store.findRecord('post', 1).finally(() => {
      unsubscribe(handle);
    });
  });
});
