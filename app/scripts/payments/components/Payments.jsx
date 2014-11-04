"use strict";

var _ = require('lodash');
var React = require('react');
var ButtonToolbar = require('react-bootstrap').ButtonToolbar;
var BootstrapButton = require('react-bootstrap').Button;
var PaymentActions = require('../actions.js');
var CurrentPath = require('react-router').CurrentPath;
var url = require('url');

var PaymentItem = require('./payment.jsx');

var Collection = require('../collections/payments.js');
var collection = new Collection();

var getStateFromStores = function(store) {
  return {
    payments: store
  };
};

var Payments = React.createClass({
  mixins: [CurrentPath],

  getInitialState: function() {
    //return getStateFromStores(collection);
    return { payments: []};
  },

  componentDidMount: function() {
    collection.on("sync", this.handleCollectionChange);
    PaymentActions.updateUrl(this.getCurrentPath());
  },

  handleCollectionChange: function(collection) {
    this.setState({
      payments: collection
    });
  },

  componentWillUnmount: function() {
    collection.off("change");
  },

  handleClick: function(e) {
    PaymentActions.delete(e.id);
  },

  render: function() {

    var paymentItems = this.state.payments.map(function(model) {
      console.log("map items", model);
      var id = model.get('id');

      return (
          <PaymentItem
            key={id}
            timeStamp={moment(model.get("createdAt")).format('MMM D, YYYY HH:mm z')}
            sourceAddress={model.get("from_issuer")}
            currency={model.get("from_currency")}
            amount={model.get("from_amount")}
            onClick={this.handleClick.bind(this, "foo")}
          />);
    }, this);

    return (
      <div>
        <h1>Payments here</h1>
        {paymentItems}
      </div>
    );
  }
});

module.exports = Payments;