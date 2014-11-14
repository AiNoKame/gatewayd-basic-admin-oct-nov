'use strict';

var React = require('react');
var Row = require('react-bootstrap').Row;
var Col = require('react-bootstrap').Col;
var Label = require('react-bootstrap').Label;
var Input = require('react-bootstrap').Input;
var Button = require('react-bootstrap').Button;
var ProgressBar = require('react-bootstrap').ProgressBar;
var LoadingBar = require('../../../shared/components/loading-bar/components/loading-bar.jsx');
var loadingBarActions = require('../../../shared/components/loading-bar/actions');
var paymentActions = require('../actions');

var PaymentCreate = React.createClass({
  validationMap: {
    valid: 'success',
    invalid: 'warning'
  },

  showFieldValidationResult: function(isValid, fieldName, errorMessage) {
    if (isValid) {
      var validField = {};

      validField[fieldName] = {isValid: 'valid'};

      this.setState(validField);
    } else {
      var invalidField = {};

      invalidField[fieldName] = {
        isValid: 'invalid',
        errorMessage: errorMessage
      };

      this.setState(invalidField);
    }

    this.setState({
      disableAddressField: false,
      disableSubmitButton: false
    });
  },

  validateAddress: function() {
    var addressFieldValue = this.formatInput(this.refs.address, 'string');

    this.setState({
      address: {}
    });

    if (addressFieldValue !== null) {
      this.setState({
        disableAddressField: true,
        disableSubmitButton: true
      });

      this.props.model.validateAddress(addressFieldValue);
    }
  },

  validateAmount: function() {
    this.setState({
      amount: {}
    });

    this.props.model.validateField('amount', this.formatInput(this.refs.amount, 'number'));
  },

  validateCurrency: function() {
    this.setState({
      currency: {}
    });

    this.props.model.validateField('currency', this.formatInput(this.refs.currency, 'string'));
  },

  validateDestinationTag: function() {
    this.setState({
      destinationTag: {}
    });

    this.props.model.validateField('destinationTag', this.formatInput(this.refs.destinationTag, 'number'));
  },

  validateSourceTag: function() {
    this.setState({
      sourceTag: {}
    });

    this.props.model.validateField('sourceTag', this.formatInput(this.refs.sourceTag, 'number'));
  },

  validateInvoiceId: function() {
    this.setState({
      invoiceId: {}
    });

    this.props.model.validateField('invoiceId', this.formatInput(this.refs.invoiceId, 'string'));
  },

  validateMemo: function() {
    this.setState({
      memo: {}
    });

    this.props.model.validateField('memo', this.formatInput(this.refs.memo, 'string'));
  },

  formatInput: function(rawInputRef, type) {
    var formattedInput = rawInputRef.getValue().trim();

    if (!formattedInput) {
      return null;
    }

    return type === 'number' ? formattedInput * 1 : formattedInput;
  },

  handleSubmit: function(e) {
    e.preventDefault();

    var _this = this;
    var payment = {
      address: this.formatInput(this.refs.address, 'string'),
      amount: this.formatInput(this.refs.amount, 'number'),
      currency: this.formatInput(this.refs.currency, 'string'),
      destinationTag: this.formatInput(this.refs.destinationTag, 'number'),
      sourceTag: this.formatInput(this.refs.sourceTag, 'number'), // not implemented yet
      invoiceId: this.formatInput(this.refs.invoiceId, 'string'), // not implemented yet
      memo: this.formatInput(this.refs.memo, 'string') // not implemented yet
    };

    this.setState({
      disableForm: true,
      submitButtonLabel: 'Sending Payment...',
      progressBarLabel: '',
      progressBarPercentage: 0,
      showProgressBar: true
    });

    loadingBarActions.start();

    console.log('attempting to send payment', payment);
    paymentActions.sendPaymentAttempt(payment);
  },

  handleSuccess: function(payment) {
    this.setState({
      submitButtonLabel: 'Payment Successfully Sent',
      progressBarPercentage: 100,
      progressBarStyle: 'success'
    });
  },

  handleError: function(errorMessage) {
    this.setState({
      disableForm: false,
      submitButtonLabel: 'Re-Submit Payment?',
      progressBarLabel: 'Error: ' + errorMessage,
      progressBarPercentage: 100,
      progressBarStyle: 'warning'
    });
  },

  dispatchSendPaymentComplete: function(model, data) {
    console.log('we have liftoff', arguments);

    // this.setState({
    //   showGraphLink: true,
    //   graphUrl: this.state.graphUrl + payment.transaction_hash
    // });

    paymentActions.sendPaymentComplete(data.payment);
  },

  handlePolling: function() {
    this.advanceProgressBar(25);
  },

  handleInvalid: function() {
    console.log('bad validation', arguments);

    // split error messages by ',' === errorMessages = [message1, ..., message n]
    // split each message by ' ' and save element 0 === fieldNames = ['address', etc.]
    // for each fieldName, showFieldValidationResult(false, fieldNameIndex, errorMessageIndex)
  },

  handleClose: function() {
    this.props.onSubmitSuccess();
  },

  getInitialState: function() {
    return {
      address: {},
      amount: {},
      currency: {},
      destinationTag: {},
      sourceTag: {},
      invoiceId: {},
      memo: {},
      disableForm: false,
      submitButtonLabel: 'Submit Payment',
      showProgressBar: false,
      progressBarLabel: '',
      progressBarPercentage: 0,
      progressBarStyle: 'primary',
      showGraphLink: false,
      graphUrl: 'http://www.ripple.com/graph/'
    };
  },


  componentDidMount: function() {
    this.props.model.on('validationComplete', this.showFieldValidationResult);
    this.props.model.on('invalid', this.handleInvalid);
    this.props.model.on('sync', this.dispatchSendPaymentComplete);
    this.props.model.on('error', this.handleError);
    // this.props.model.on('sendPaymentSuccess', this.handleSuccess);
    // this.props.model.on('sendPaymentComplete', this.dispatchSendPaymentComplete);
    // this.props.model.on('pollingPaymentState', this.handlePolling);
  },

  componentWillUnmount: function() {
    this.props.model.off('validationComplete');
    this.props.model.off('invalid');
    this.props.model.off('sync');
    this.props.model.off('error');
    // this.props.model.off('sendPaymentSuccess');
    // this.props.model.off('sendPaymentComplete');
    // this.props.model.off('pollingPaymentState');
  },

  render: function() {
    var graphLink = (
      <a href={this.state.graphUrl}>
        See this transaction in action: Ripple Graph
      </a>
    );
    var progressBar = (
      <div>
        <LoadingBar />
        {this.state.showGraphLink ? graphLink : null}
      </div>
    );

    return (
      <div>
        <h2>Send Payment</h2>
        <form onSubmit={this.handleSubmit}>

          <Input type="text" ref="address"
            label={<div><Label bsStyle="info">Required</Label> Destination Address: </div>}
            bsStyle={this.validationMap[this.state.address.isValid]}
            disabled={this.state.disableForm || this.state.disableAddressField}
            autoFocus={true} onBlur={this.validateAddress} />
          <Label bsStyle="warning">{this.state.address.errorMessage}</Label>
          <Row>
            <Col xs={6}>

              <Input type="tel" ref="amount"
                label={<div><Label bsStyle="info">Required</Label> Amount: </div>}
                bsStyle={this.validationMap[this.state.amount.isValid]}
                disabled={this.state.disableForm} onBlur={this.validateAmount} />
              <Label bsStyle="warning">{this.state.amount.errorMessage}</Label>
            </Col>
            <Col xs={6}>
              <Input type="text" ref="currency"
                label={<div><Label bsStyle="info">Required</Label> Currency: </div>}
                bsStyle={this.validationMap[this.state.currency.isValid]}
                disabled={this.state.disableForm} onBlur={this.validateCurrency} />
              <Label bsStyle="warning">{this.state.currency.errorMessage}</Label>
            </Col>
          </Row>
          <Row>
            <Col xs={6}>
              <Input type="tel" ref="destinationTag"
                label="Destination Tag:"
                bsStyle={this.validationMap[this.state.destinationTag.isValid]}
                disabled={this.state.disableForm} onBlur={this.validateDestinationTag} />
              <Label bsStyle="warning">{this.state.destinationTag.errorMessage}</Label>
            </Col>
            <Col xs={6}>
              <Input type="tel" ref="sourceTag"
                label="Source Tag:"
                bsStyle={this.validationMap[this.state.sourceTag.isValid]}
                disabled={this.state.disableForm} onBlur={this.validateSourceTag} />
              <Label bsStyle="warning">{this.state.sourceTag.errorMessage}</Label>
            </Col>
          </Row>
          <Input type="text" ref="invoiceId"
            label="Invoice Id:"
            bsStyle={this.validationMap[this.state.invoiceId.isValid]}
            disabled={this.state.disableForm} onBlur={this.validateInvoiceId} />
          <Label bsStyle="warning">{this.state.invoiceId.errorMessage}</Label>
          <Input type="textarea" ref="memo"
            label="Memo:"
            bsStyle={this.validationMap[this.state.memo.isValid]}
            disabled={this.state.disableForm} onBlur={this.validateMemo} />
          <Label bsStyle="warning">{this.state.memo.errorMessage}</Label>
          <Button className="pull-right" bsStyle="primary" bsSize="large" type="submit"
            disabled={this.state.disableForm || this.state.disableSubmitButton}
            block>
            {this.state.submitButtonLabel}
          </Button>
          <br />
          <br />
          <br />
          {this.state.showProgressBar ? progressBar : null}
        </form>
      </div>
    );
  }
});

module.exports = PaymentCreate;
